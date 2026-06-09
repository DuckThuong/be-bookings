import { BadRequestException } from '@nestjs/common';

export const VEHICLE_LAYOUT_PRESETS = [
  'SLEEPER_38',
  'LIMOUSINE',
  'COACH',
  'CUSTOM_SIMPLE',
] as const;

export type VehicleLayoutPreset = (typeof VEHICLE_LAYOUT_PRESETS)[number];
export type LayoutCellType = 'seat' | 'aisle' | 'empty';

export interface VehicleLayoutConfig {
  preset: VehicleLayoutPreset;
  floorCount: 1 | 2;
  rowsPerFloor: number;
  columns: number;
  aisleColumns: number[];
  lastRowSeatCount: number;
  seatType: string;
}

export interface LayoutSeatCell {
  type: 'seat';
  floor: number;
  row: number;
  column: number;
  ordinal: number;
  label: string;
}

export interface LayoutNonSeatCell {
  type: 'aisle' | 'empty';
  floor: number;
  row: number;
  column: number;
}

export type LayoutCell = LayoutSeatCell | LayoutNonSeatCell;

export interface LayoutRow {
  row: number;
  cells: LayoutCell[];
}

export interface LayoutFloor {
  floor: number;
  label: string;
  rows: LayoutRow[];
}

export interface BuiltVehicleLayout {
  config: VehicleLayoutConfig;
  floors: LayoutFloor[];
  seatCells: LayoutSeatCell[];
  seatCount: number;
}

type LayoutInput = Partial<VehicleLayoutConfig> & {
  preset?: string;
};

const PRESET_DEFAULTS: Record<VehicleLayoutPreset, VehicleLayoutConfig> = {
  SLEEPER_38: {
    preset: 'SLEEPER_38',
    floorCount: 2,
    rowsPerFloor: 9,
    columns: 3,
    aisleColumns: [1],
    lastRowSeatCount: 3,
    seatType: 'BED',
  },
  LIMOUSINE: {
    preset: 'LIMOUSINE',
    floorCount: 1,
    rowsPerFloor: 5,
    columns: 4,
    aisleColumns: [2],
    lastRowSeatCount: 4,
    seatType: 'SEAT',
  },
  COACH: {
    preset: 'COACH',
    floorCount: 1,
    rowsPerFloor: 11,
    columns: 5,
    aisleColumns: [2],
    lastRowSeatCount: 5,
    seatType: 'SEAT',
  },
  CUSTOM_SIMPLE: {
    preset: 'CUSTOM_SIMPLE',
    floorCount: 1,
    rowsPerFloor: 5,
    columns: 3,
    aisleColumns: [1],
    lastRowSeatCount: 3,
    seatType: 'SEAT',
  },
};

export function isVehicleLayoutPreset(
  value?: string,
): value is VehicleLayoutPreset {
  return VEHICLE_LAYOUT_PRESETS.includes(value as VehicleLayoutPreset);
}

export function getDefaultLayoutConfig(
  preset: VehicleLayoutPreset,
): VehicleLayoutConfig {
  return cloneConfig(PRESET_DEFAULTS[preset]);
}

export function normalizeVehicleLayoutConfig(
  input?: LayoutInput | null,
  fallback?: {
    preset?: string;
    seatType?: string;
    seatCount?: number;
    vehicleType?: string;
  },
): VehicleLayoutConfig {
  const preset = resolvePreset(input?.preset, fallback);
  const base =
    preset === 'CUSTOM_SIMPLE'
      ? buildCustomSimpleDefault(fallback?.seatCount)
      : getDefaultLayoutConfig(preset);
  const source = preset === 'CUSTOM_SIMPLE' ? input : undefined;

  const config: VehicleLayoutConfig = {
    ...base,
    ...(source?.floorCount !== undefined
      ? { floorCount: toFloorCount(source.floorCount) }
      : {}),
    ...(source?.rowsPerFloor !== undefined
      ? { rowsPerFloor: toInt(source.rowsPerFloor, 'rowsPerFloor') }
      : {}),
    ...(source?.columns !== undefined
      ? { columns: toInt(source.columns, 'columns') }
      : {}),
    ...(source?.aisleColumns !== undefined
      ? { aisleColumns: normalizeAisleColumns(source.aisleColumns) }
      : {}),
    ...(source?.lastRowSeatCount !== undefined
      ? {
          lastRowSeatCount: toInt(
            source.lastRowSeatCount,
            'lastRowSeatCount',
          ),
        }
      : {}),
    seatType: normalizeSeatType(input?.seatType ?? fallback?.seatType),
    preset,
  };

  validateLayoutConfig(config);
  return config;
}

export function buildVehicleLayout(config: VehicleLayoutConfig): BuiltVehicleLayout {
  validateLayoutConfig(config);

  const floors: LayoutFloor[] = [];
  const seatCells: LayoutSeatCell[] = [];
  let ordinal = 1;

  for (let floor = 1; floor <= config.floorCount; floor++) {
    const rows: LayoutRow[] = [];

    for (let row = 1; row <= config.rowsPerFloor; row++) {
      const lastRow = row === config.rowsPerFloor;
      const seatColumns = resolveSeatColumns(config, lastRow);
      const cells: LayoutCell[] = [];

      for (let column = 0; column < config.columns; column++) {
        if (seatColumns.has(column)) {
          const seatCell: LayoutSeatCell = {
            type: 'seat',
            floor,
            row,
            column,
            ordinal,
            label: buildSeatLabel(floor, ordinal, config.floorCount),
          };
          cells.push(seatCell);
          seatCells.push(seatCell);
          ordinal++;
          continue;
        }

        cells.push({
          type: config.aisleColumns.includes(column) ? 'aisle' : 'empty',
          floor,
          row,
          column,
        });
      }

      rows.push({ row, cells });
    }

    floors.push({
      floor,
      label: config.floorCount > 1 ? `Tầng ${floor}` : 'Tầng 1',
      rows,
    });
  }

  return {
    config,
    floors,
    seatCells,
    seatCount: seatCells.length,
  };
}

export function countLayoutSeats(config: VehicleLayoutConfig): number {
  return buildVehicleLayout(config).seatCount;
}

export function layoutPresetToClientVehicleType(
  preset?: string,
  fallbackSeatCount = 0,
  fallbackType?: string,
): string {
  if (preset === 'LIMOUSINE') return '16';
  if (preset === 'SLEEPER_38') return '36';
  if (preset === 'COACH') return '45';

  const normalized = fallbackType?.trim();
  if (normalized && ['16', '36', '45'].includes(normalized)) {
    return normalized;
  }
  if (fallbackSeatCount <= 18) return '16';
  if (fallbackSeatCount <= 40) return '36';
  return '45';
}

export function parseStoredLayoutConfig(
  value: unknown,
): VehicleLayoutConfig | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  try {
    return normalizeVehicleLayoutConfig(value as LayoutInput);
  } catch {
    return undefined;
  }
}

export function resolveVehicleLayoutConfig(
  layoutConfigRaw: unknown,
  fallback?: {
    preset?: string;
    seatType?: string;
    seatCount?: number;
    vehicleType?: string;
  },
): VehicleLayoutConfig {
  if (layoutConfigRaw && typeof layoutConfigRaw === 'object') {
    try {
      return normalizeVehicleLayoutConfig(
        layoutConfigRaw as LayoutInput,
        fallback,
      );
    } catch {
      return normalizeVehicleLayoutConfig(undefined, fallback);
    }
  }

  return normalizeVehicleLayoutConfig(undefined, fallback);
}

function resolvePreset(
  requested?: string,
  fallback?: { preset?: string; seatCount?: number; vehicleType?: string },
): VehicleLayoutPreset {
  if (isVehicleLayoutPreset(requested)) return requested;
  if (isVehicleLayoutPreset(fallback?.preset)) return fallback.preset;

  const vehicleType = fallback?.vehicleType?.toUpperCase();
  if (vehicleType === 'LIMOUSINE') return 'LIMOUSINE';
  if (vehicleType === 'COACH') return 'COACH';
  if (vehicleType === 'SLEEPER') return 'SLEEPER_38';

  const seatCount = Number(fallback?.seatCount ?? 0);
  if (seatCount > 0 && seatCount <= 18) return 'LIMOUSINE';
  if (seatCount === 38) return 'SLEEPER_38';
  if (seatCount === 45 || seatCount > 40) return 'COACH';
  if (seatCount > 0) return 'CUSTOM_SIMPLE';
  return 'SLEEPER_38';
}

function buildCustomSimpleDefault(seatCount?: number): VehicleLayoutConfig {
  const totalSeats = Math.max(1, Math.floor(Number(seatCount) || 0));
  const columns = totalSeats <= 18 ? 3 : 4;
  const aisleColumns = columns === 3 ? [1] : [2];
  const normalSeatsPerRow = columns - aisleColumns.length;
  const rowsPerFloor = Math.max(1, Math.ceil(totalSeats / normalSeatsPerRow));
  const remainder = totalSeats % normalSeatsPerRow;

  return {
    preset: 'CUSTOM_SIMPLE',
    floorCount: 1,
    rowsPerFloor,
    columns,
    aisleColumns,
    lastRowSeatCount: remainder === 0 ? normalSeatsPerRow : remainder,
    seatType: 'SEAT',
  };
}

function validateLayoutConfig(config: VehicleLayoutConfig): void {
  if (!isVehicleLayoutPreset(config.preset)) {
    throw new BadRequestException('Preset sơ đồ ghế không hợp lệ');
  }
  if (![1, 2].includes(config.floorCount)) {
    throw new BadRequestException('Số tầng phải là 1 hoặc 2');
  }
  if (config.rowsPerFloor < 1) {
    throw new BadRequestException('Số hàng mỗi tầng phải lớn hơn 0');
  }
  if (config.columns < 1) {
    throw new BadRequestException('Số cột phải lớn hơn 0');
  }
  if (config.columns > 8) {
    throw new BadRequestException('Số cột không được vượt quá 8');
  }
  if (config.rowsPerFloor > 30) {
    throw new BadRequestException('Số hàng mỗi tầng không được vượt quá 30');
  }
  if (config.lastRowSeatCount < 1 || config.lastRowSeatCount > config.columns) {
    throw new BadRequestException('Số ghế hàng cuối không hợp lệ');
  }
  if (config.aisleColumns.some((col) => col < 0 || col >= config.columns)) {
    throw new BadRequestException('Cột lối đi không hợp lệ');
  }

  const totalSeats = estimateSeatCount(config);
  if (totalSeats < 1 || totalSeats > 100) {
    throw new BadRequestException('Tổng số ghế phải nằm trong khoảng 1..100');
  }
}

function estimateSeatCount(config: VehicleLayoutConfig): number {
  const normalSeatsPerRow = config.columns - config.aisleColumns.length;
  const normalRows = Math.max(0, config.rowsPerFloor - 1);
  return (
    config.floorCount *
    (normalRows * normalSeatsPerRow + config.lastRowSeatCount)
  );
}

function resolveSeatColumns(
  config: VehicleLayoutConfig,
  lastRow: boolean,
): Set<number> {
  if (!lastRow) {
    return new Set(
      Array.from({ length: config.columns }, (_, column) => column).filter(
        (column) => !config.aisleColumns.includes(column),
      ),
    );
  }

  return new Set(
    Array.from(
      { length: Math.min(config.lastRowSeatCount, config.columns) },
      (_, column) => column,
    ),
  );
}

function buildSeatLabel(
  floor: number,
  ordinal: number,
  floorCount: number,
): string {
  const prefix = floorCount > 1 ? String.fromCharCode(64 + floor) : 'S';
  return `${prefix}${String(ordinal).padStart(2, '0')}`;
}

function toFloorCount(value: unknown): 1 | 2 {
  const floorCount = toInt(value, 'floorCount');
  if (floorCount === 1 || floorCount === 2) return floorCount;
  throw new BadRequestException('Số tầng phải là 1 hoặc 2');
}

function toInt(value: unknown, field: string): number {
  const num = Math.floor(Number(value));
  if (!Number.isFinite(num)) {
    throw new BadRequestException(`${field} không hợp lệ`);
  }
  return num;
}

function normalizeAisleColumns(value: unknown): number[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException('Cột lối đi không hợp lệ');
  }
  return [...new Set(value.map((item) => toInt(item, 'aisleColumns')))].sort(
    (a, b) => a - b,
  );
}

function normalizeSeatType(value?: string): string {
  const trimmed = value?.trim();
  return trimmed || 'SEAT';
}

function cloneConfig(config: VehicleLayoutConfig): VehicleLayoutConfig {
  return {
    ...config,
    aisleColumns: [...config.aisleColumns],
  };
}

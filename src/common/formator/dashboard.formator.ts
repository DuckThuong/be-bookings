export function formatTrendPercent(
  current: number,
  previous: number,
): { trend: string; trendDir: 'up' | 'down' } {
  if (previous <= 0) {
    if (current <= 0) {
      return { trend: '0%', trendDir: 'up' };
    }
    return { trend: '+100%', trendDir: 'up' };
  }
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(delta * 10) / 10;
  return {
    trend: `${rounded >= 0 ? '+' : ''}${rounded}%`,
    trendDir: rounded >= 0 ? 'up' : 'down',
  };
}

export function formatVndCompact(amount: number): string {
  const value = Number(amount) || 0;
  if (value >= 1_000_000_000) {
    return `₫${(value / 1_000_000_000).toFixed(2)} tỷ`;
  }
  if (value >= 1_000_000) {
    return `₫${Math.round(value / 1_000_000)} tr`;
  }
  return `${value.toLocaleString('vi-VN')}₫`;
}

export function formatVndShortMillion(amount: number): string {
  const value = Number(amount) || 0;
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}tr`;
  }
  return `${Math.round(value / 1_000)}k`;
}

export function formatDisplayDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatRelativeTimeVi(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

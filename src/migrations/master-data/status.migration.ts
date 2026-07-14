/**
 * Master Data Statuses - Migration
 * Seeds all status master data into tb_master_data table
 */

import { MigrationInterface, QueryRunner } from 'typeorm';
import { MasterDataType } from '../../assets/constants/company.constants';

export class MasterDataStatus1752000000000 implements MigrationInterface {
  name = 'MasterDataStatus1752000000000';

  // All master data statuses to seed
  private readonly SEEDS = [
    // Driver Status - match frontend code
    {
      type: MasterDataType.DRIVER_STATUS,
      code: 'ACTIVE',
      name: 'Sẵn sàng',
      rule: '#22c55e',
      sort: 1,
    },
    {
      type: MasterDataType.DRIVER_STATUS,
      code: 'ON_TRIP',
      name: 'Đang chạy tuyến',
      rule: '#3b82f6',
      sort: 2,
    },
    {
      type: MasterDataType.DRIVER_STATUS,
      code: 'OFF_DUTY',
      name: 'Ngoài ca',
      rule: '#f59e0b',
      sort: 3,
    },
    {
      type: MasterDataType.DRIVER_STATUS,
      code: 'MAINTENANCE',
      name: 'Bảo dưỡng',
      rule: '#ef4444',
      sort: 4,
    },

    // Driver License
    {
      type: MasterDataType.DRIVER_LICENSE,
      code: 'B2',
      name: 'B2',
      rule: null,
      sort: 1,
    },
    {
      type: MasterDataType.DRIVER_LICENSE,
      code: 'C',
      name: 'C',
      rule: null,
      sort: 2,
    },
    {
      type: MasterDataType.DRIVER_LICENSE,
      code: 'D',
      name: 'D',
      rule: null,
      sort: 3,
    },
    {
      type: MasterDataType.DRIVER_LICENSE,
      code: 'E',
      name: 'E',
      rule: null,
      sort: 4,
    },

    {
      type: MasterDataType.VEHICLE_STATUS,
      code: 'READY',
      name: 'Sẵn sàng',
      rule: '#22c55e',
      sort: 1,
    },
    {
      type: MasterDataType.VEHICLE_STATUS,
      code: 'IN_SERVICE',
      name: 'Đang khai thác',
      rule: '#3b82f6',
      sort: 2,
    },
    {
      type: MasterDataType.VEHICLE_STATUS,
      code: 'MAINTENANCE',
      name: 'Bảo dưỡng',
      rule: '#ef4444',
      sort: 3,
    },
    {
      type: MasterDataType.VEHICLE_STATUS,
      code: 'IDLE',
      name: 'Chờ phân công',
      rule: '#f59e0b',
      sort: 4,
    },

    // Vehicle Type
    {
      type: MasterDataType.VEHICLE_TYPE,
      code: 'SLEEPER',
      name: 'Xe giường nằm',
      rule: null,
      sort: 1,
    },
    {
      type: MasterDataType.VEHICLE_TYPE,
      code: 'LIMOUSINE',
      name: 'Xe Limousine',
      rule: null,
      sort: 2,
    },
    {
      type: MasterDataType.VEHICLE_TYPE,
      code: 'COACH',
      name: 'Xe Khách',
      rule: null,
      sort: 3,
    },

    // Route Status - match frontend code
    {
      type: MasterDataType.ROUTE_STATUS,
      code: 'ACTIVE',
      name: 'Đang khai thác',
      rule: '#22c55e',
      sort: 1,
    },
    {
      type: MasterDataType.ROUTE_STATUS,
      code: 'INACTIVE',
      name: 'Tạm dừng',
      rule: '#64748b',
      sort: 2,
    },

    // Customer Status
    {
      type: MasterDataType.CUSTOMER_STATUS,
      code: 'ACTIVE',
      name: 'Đang hoạt động',
      rule: '#22c55e',
      sort: 1,
    },
    {
      type: MasterDataType.CUSTOMER_STATUS,
      code: 'AT_RISK',
      name: 'Cần chăm sóc',
      rule: '#f97316',
      sort: 2,
    },
    {
      type: MasterDataType.CUSTOMER_STATUS,
      code: 'INACTIVE',
      name: 'Ngừng giao dịch',
      rule: '#64748b',
      sort: 3,
    },

    // Customer Tier
    {
      type: MasterDataType.CUSTOMER_TIER,
      code: 'VIP',
      name: 'VIP',
      rule: null,
      sort: 1,
    },
    {
      type: MasterDataType.CUSTOMER_TIER,
      code: 'THAN_THIET',
      name: 'Thân thiết',
      rule: null,
      sort: 2,
    },
    {
      type: MasterDataType.CUSTOMER_TIER,
      code: 'PHO_THONG',
      name: 'Phổ thông',
      rule: null,
      sort: 3,
    },

    // Report Status
    {
      type: MasterDataType.REPORT_STATUS,
      code: 'READY',
      name: 'Sẵn sàng',
      rule: '#22c55e',
      sort: 1,
    },
    {
      type: MasterDataType.REPORT_STATUS,
      code: 'PROCESSING',
      name: 'Đang tạo',
      rule: '#f59e0b',
      sort: 2,
    },
    {
      type: MasterDataType.REPORT_STATUS,
      code: 'SCHEDULED',
      name: 'Lên lịch',
      rule: '#3b82f6',
      sort: 3,
    },

    // Report Type
    {
      type: MasterDataType.REPORT_TYPE,
      code: 'OPERATIONS',
      name: 'Vận hành',
      rule: null,
      sort: 1,
    },
    {
      type: MasterDataType.REPORT_TYPE,
      code: 'FINANCE',
      name: 'Tài chính',
      rule: null,
      sort: 2,
    },
    {
      type: MasterDataType.REPORT_TYPE,
      code: 'CUSTOMER',
      name: 'Khách hàng',
      rule: null,
      sort: 3,
    },
    {
      type: MasterDataType.REPORT_TYPE,
      code: 'COMPLIANCE',
      name: 'Tuân thủ',
      rule: null,
      sort: 4,
    },

    // Seat Type
    {
      type: MasterDataType.SEAT_TYPE,
      code: 'BED',
      name: 'Giường nằm',
      rule: null,
      sort: 1,
    },
    {
      type: MasterDataType.SEAT_TYPE,
      code: 'SEAT',
      name: 'Ghế ngồi',
      rule: null,
      sort: 2,
    },
    {
      type: MasterDataType.SEAT_TYPE,
      code: 'STANDARD',
      name: 'Tiêu chuẩn',
      rule: null,
      sort: 3,
    },

    // Trip Status (operation status for trips)
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'SCHEDULED',
      name: 'Đã lên lịch',
      rule: '#3b82f6',
      sort: 1,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'PREPARING',
      name: 'Chuẩn bị khởi hành',
      rule: '#8b5cf6',
      sort: 2,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'BOARDING',
      name: 'Đang đón khách',
      rule: '#f59e0b',
      sort: 3,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'DEPARTED',
      name: 'Đã khởi hành',
      rule: '#0ea5e9',
      sort: 4,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'APPROACHING',
      name: 'Sắp đến điểm đón',
      rule: '#a855f7',
      sort: 5,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'MOVING',
      name: 'Đang di chuyển',
      rule: '#14b8a6',
      sort: 6,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'ARRIVED',
      name: 'Đã đến điểm đón',
      rule: '#22c55e',
      sort: 7,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'COMPLETED',
      name: 'Hoàn thành',
      rule: '#10b981',
      sort: 8,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'CANCELLED',
      name: 'Đã hủy',
      rule: '#ef4444',
      sort: 9,
    },
    {
      type: MasterDataType.TRIP_STATUS,
      code: 'DELAYED',
      name: 'Trễ chuyến',
      rule: '#f97316',
      sort: 10,
    },

    // Registration Status
    {
      type: MasterDataType.REGISTRATION_STATUS,
      code: 'PENDING',
      name: 'Chờ phê duyệt',
      rule: '#f59e0b',
      sort: 1,
    },
    {
      type: MasterDataType.REGISTRATION_STATUS,
      code: 'APPROVED',
      name: 'Đã phê duyệt',
      rule: '#22c55e',
      sort: 2,
    },
    {
      type: MasterDataType.REGISTRATION_STATUS,
      code: 'REJECTED',
      name: 'Đã từ chối',
      rule: '#ef4444',
      sort: 3,
    },

    // Booking Status
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'CONFIRMED',
      name: 'Đã xác nhận',
      rule: '#22c55e',
      sort: 1,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'PENDING',
      name: 'Chờ xác nhận',
      rule: '#3b82f6',
      sort: 2,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'UNPAID',
      name: 'Chưa thanh toán',
      rule: '#f97316',
      sort: 3,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'CANCELLED',
      name: 'Đã hủy',
      rule: '#ef4444',
      sort: 4,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'WAITING',
      name: 'Chờ khởi hành',
      rule: '#eab308',
      sort: 5,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'PREPARING',
      name: 'Chuẩn bị khởi hành',
      rule: '#8b5cf6',
      sort: 6,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'BOARDING',
      name: 'Đang đón khách',
      rule: '#f59e0b',
      sort: 7,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'DEPARTED',
      name: 'Đã khởi hành',
      rule: '#0ea5e9',
      sort: 8,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'APPROACHING',
      name: 'Sắp đến điểm đón',
      rule: '#a855f7',
      sort: 9,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'MOVING',
      name: 'Đang di chuyển',
      rule: '#14b8a6',
      sort: 10,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'ARRIVED',
      name: 'Đã đến điểm đón',
      rule: '#22c55e',
      sort: 11,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'COMPLETED',
      name: 'Hoàn thành',
      rule: '#10b981',
      sort: 12,
    },
    {
      type: MasterDataType.BOOKING_STATUS,
      code: 'REFUNDING',
      name: 'Chờ hoàn tiền',
      rule: '#8b5cf6',
      sort: 13,
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const seed of this.SEEDS) {
      await queryRunner.query(
        `INSERT INTO \`tb_master_data\` (\`type\`, \`code\`, \`name\`, \`rule\`, \`sort\`)
         VALUES (?, ?, ?, ?, ?)`,
        [seed.type, seed.code, seed.name, seed.rule, seed.sort],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const types = [...new Set(this.SEEDS.map((s) => s.type))];
    const placeholders = types.map(() => '?').join(', ');

    await queryRunner.query(
      `DELETE FROM \`tb_master_data\` WHERE \`type\` IN (${placeholders})`,
      types,
    );
  }
}

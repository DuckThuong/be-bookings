import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780342307175 implements MigrationInterface {
    name = 'Migration1780342307175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tb_vehicle\` ADD \`layout_config\` json NULL COMMENT 'Cấu hình ma trận ghế/lối đi'`);
        await queryRunner.query(`ALTER TABLE \`tb_ticket\` CHANGE \`tripId\` \`tripId\` int NOT NULL COMMENT 'ID chuyến (tb_trip)'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`tripId\` \`tripId\` int NOT NULL COMMENT 'Trip ID (tb_trip)'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`companyId\` \`companyId\` int NOT NULL COMMENT 'Company ID (tb_company)'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`statDate\` \`statDate\` date NOT NULL COMMENT 'Stat date'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`ticketCount\` \`ticketCount\` int NOT NULL COMMENT 'Paid ticket count' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`seatSold\` \`seatSold\` int NOT NULL COMMENT 'Total sold seats' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`grossRevenue\` \`grossRevenue\` decimal(14,2) NOT NULL COMMENT 'Gross revenue' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`discountTotal\` \`discountTotal\` decimal(14,2) NOT NULL COMMENT 'Total discount amount' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`netRevenue\` \`netRevenue\` decimal(14,2) NOT NULL COMMENT 'Net revenue' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`refundTotal\` \`refundTotal\` decimal(14,2) NOT NULL COMMENT 'Total refund amount' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`cancelledCount\` \`cancelledCount\` int NOT NULL COMMENT 'Cancelled ticket count' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`occupancyRate\` \`occupancyRate\` decimal(5,2) NOT NULL COMMENT 'Occupancy rate (%)' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT 'Created date' DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT 'Updated date' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tb_refund\` CHANGE \`tripId\` \`tripId\` int NOT NULL COMMENT 'ID chuyến (tb_trip)'`);
        await queryRunner.query(`ALTER TABLE \`tb_payment\` CHANGE \`tripId\` \`tripId\` int NOT NULL COMMENT 'ID chuyến (tb_trip)'`);
        await queryRunner.query(`ALTER TABLE \`tb_booking\` CHANGE \`tripId\` \`tripId\` int NOT NULL COMMENT 'ID chuyến (tb_trip)'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tb_booking\` CHANGE \`tripId\` \`tripId\` int NOT NULL COMMENT 'ID chuyến mẫu (tb_trip)'`);
        await queryRunner.query(`ALTER TABLE \`tb_payment\` CHANGE \`tripId\` \`tripId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tb_refund\` CHANGE \`tripId\` \`tripId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT 'Ngày cập nhật' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT 'Ngày tạo' DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`occupancyRate\` \`occupancyRate\` decimal(5,2) NOT NULL COMMENT 'Tỷ lệ lấp đầy ghế (%)' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`cancelledCount\` \`cancelledCount\` int NOT NULL COMMENT 'Số vé hủy' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`refundTotal\` \`refundTotal\` decimal(14,2) NOT NULL COMMENT 'Tổng tiền hoàn' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`netRevenue\` \`netRevenue\` decimal(14,2) NOT NULL COMMENT 'Doanh thu ròng (đã thu - hoàn)' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`discountTotal\` \`discountTotal\` decimal(14,2) NOT NULL COMMENT 'Tổng tiền giảm giá' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`grossRevenue\` \`grossRevenue\` decimal(14,2) NOT NULL COMMENT 'Doanh thu gộp (trước giảm giá)' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`seatSold\` \`seatSold\` int NOT NULL COMMENT 'Tổng số ghế bán' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`ticketCount\` \`ticketCount\` int NOT NULL COMMENT 'Số vé đã thanh toán' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`statDate\` \`statDate\` date NOT NULL COMMENT 'Ngày thống kê'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`companyId\` \`companyId\` int NOT NULL COMMENT 'ID công ty (tb_company)'`);
        await queryRunner.query(`ALTER TABLE \`tb_trip_stat\` CHANGE \`tripId\` \`tripId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`tb_ticket\` CHANGE \`tripId\` \`tripId\` int NOT NULL COMMENT 'ID chuyến mẫu (tb_trip)'`);
        await queryRunner.query(`ALTER TABLE \`tb_vehicle\` DROP COLUMN \`layout_config\``);
    }

}

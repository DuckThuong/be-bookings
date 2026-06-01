import { Injectable } from '@nestjs/common';
import {
  CmsReportItemDto,
  CmsReportListQueryDto,
  CmsReportListResponseDto,
  CmsReportStatus,
  CmsReportType,
} from '../../dtos/CMS/CMS_report.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { DashboardScope } from '../../common/helpers/dashboard-scope.helper';
import { formatDisplayDate } from '../../common/formator/dashboard.formator';
import { TbPayment } from '../../entities/sales/payment.entity';
import { PaymentStatus } from '../../assets/constants/sales.constants';
import { CompanyAccessService } from '../company-access.service';
import { RevenueRepository } from '../../repositories/revenue.repository';

@Injectable()
export class CMSReportService {
  constructor(
    private readonly companyAccess: CompanyAccessService,
    private readonly revenueRepository: RevenueRepository,
  ) {}

  async list(
    user: UserDecoratorDtoResponse,
    query: CmsReportListQueryDto,
  ): Promise<CmsReportListResponseDto> {
    const scope = await this.companyAccess.resolveDashboardScope(
      user,
      query.companyId,
    );
    const items = await this.buildReportCatalog(scope);
    const filtered = this.applyFilters(items, query);

    return {
      scope: scope.type,
      companyId: scope.companyId,
      items: filtered,
      total: filtered.length,
      summary: this.buildSummary(filtered),
    };
  }

  private async buildReportCatalog(
    scope: DashboardScope,
  ): Promise<CmsReportItemDto[]> {
    const payments = await this.revenueRepository.findPayments(scope);
    const reports: CmsReportItemDto[] = [];
    const now = new Date();

    const financeReports = this.buildFinanceReports(payments, now);
    reports.push(...financeReports);

    const operationsReport = this.buildOperationsReport(payments, now);
    if (operationsReport) {
      reports.push(operationsReport);
    }

    const customerReport = this.buildCustomerReport(payments, now);
    if (customerReport) {
      reports.push(customerReport);
    }

    reports.push(this.buildComplianceReport(now));

    return reports.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  private buildFinanceReports(
    payments: TbPayment[],
    now: Date,
  ): CmsReportItemDto[] {
    const successPayments = payments.filter(
      (p) => p.status === PaymentStatus.SUCCESS,
    );
    const byMonth = new Map<string, TbPayment[]>();

    for (const payment of successPayments) {
      const date =
        payment.createdAt instanceof Date
          ? payment.createdAt
          : new Date(payment.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const list = byMonth.get(key) ?? [];
      list.push(payment);
      byMonth.set(key, list);
    }

    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return [...byMonth.entries()].map(([monthKey, list]) => {
      const [year, month] = monthKey.split('-');
      const isCurrentMonth = monthKey === currentKey;
      const total = list.reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        key: `report-finance-${monthKey}`,
        id: `RPT-FIN-${monthKey.replace('-', '')}`,
        name: `Báo cáo doanh thu tháng ${month}/${year}`,
        type: 'finance' as CmsReportType,
        period: `01/${month}/${year} - ${this.lastDayOfMonth(Number(year), Number(month))}/${month}/${year}`,
        createdBy: 'Kế toán tổng hợp',
        createdAt: this.formatDateTime(
          list[list.length - 1]?.createdAt ?? now,
        ),
        status: (isCurrentMonth ? 'processing' : 'ready') as CmsReportStatus,
        fileSize: isCurrentMonth ? 'Đang tạo' : this.estimateFileSize(list.length),
        description: `Tổng hợp ${list.length} giao dịch thành công, doanh thu ${total.toLocaleString('vi-VN')}₫.`,
      };
    });
  }

  private buildOperationsReport(
    payments: TbPayment[],
    now: Date,
  ): CmsReportItemDto | null {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekPayments = payments.filter((p) => {
      const created =
        p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt);
      return created >= weekAgo;
    });

    if (weekPayments.length === 0) {
      return null;
    }

    const from = formatDisplayDate(weekAgo);
    const to = formatDisplayDate(now);

    return {
      key: `report-ops-${to.replace(/\//g, '')}`,
      id: `RPT-OPS-${to.replace(/\//g, '')}`,
      name: 'Báo cáo hiệu suất vận hành tuần',
      type: 'operations',
      period: `${from} - ${to}`,
      createdBy: 'Điều phối vận hành',
      createdAt: this.formatDateTime(now),
      status: 'ready',
      fileSize: this.estimateFileSize(weekPayments.length),
      description: `Tổng hợp ${weekPayments.length} giao dịch trong 7 ngày qua, theo dõi sản lượng và đối soát chuyến.`,
    };
  }

  private buildCustomerReport(
    payments: TbPayment[],
    now: Date,
  ): CmsReportItemDto | null {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPayments = payments.filter((p) => {
      const created =
        p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt);
      return created >= monthStart;
    });

    const customers = new Set(monthPayments.map((p) => p.customerId));
    if (customers.size === 0) {
      return null;
    }

    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    return {
      key: `report-cus-${year}${month}`,
      id: `RPT-CUS-${year}${month}`,
      name: 'Báo cáo khách hàng tháng',
      type: 'customer',
      period: `Tháng ${month}/${year}`,
      createdBy: 'CRM Lead',
      createdAt: this.formatDateTime(now),
      status: 'ready',
      fileSize: this.estimateFileSize(customers.size),
      description: `Danh sách ${customers.size} khách hàng có giao dịch trong tháng ${month}/${year}.`,
    };
  }

  private buildComplianceReport(now: Date): CmsReportItemDto {
    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 7);

    return {
      key: 'report-compliance-next',
      id: 'RPT-COM-QUARTER',
      name: 'Báo cáo tuân thủ bảo dưỡng xe',
      type: 'compliance',
      period: `Quý ${Math.ceil((now.getMonth() + 1) / 3)}/${now.getFullYear()}`,
      createdBy: 'Quản lý đội xe',
      createdAt: this.formatDateTime(nextRun),
      status: 'scheduled',
      fileSize: 'Lên lịch',
      description:
        'Theo dõi xe đến hạn bảo dưỡng, kiểm định và hồ sơ pháp lý nhà xe.',
    };
  }

  private applyFilters(items: CmsReportItemDto[], query: CmsReportListQueryDto) {
    let result = items;
    const keyword = query.search?.trim().toLowerCase();
    if (keyword) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.id.toLowerCase().includes(keyword) ||
          item.createdBy.toLowerCase().includes(keyword),
      );
    }
    if (query.type && query.type !== 'all') {
      result = result.filter((item) => item.type === query.type);
    }
    if (query.status && query.status !== 'all') {
      result = result.filter((item) => item.status === query.status);
    }
    return result;
  }

  private buildSummary(items: CmsReportItemDto[]) {
    return [
      {
        key: 'reports',
        label: 'Tổng báo cáo',
        color: '#3b82f6',
        value: items.length,
      },
      {
        key: 'ready',
        label: 'Sẵn sàng',
        color: '#22c55e',
        value: items.filter((item) => item.status === 'ready').length,
      },
      {
        key: 'processing',
        label: 'Đang tạo',
        color: '#f97316',
        value: items.filter((item) => item.status === 'processing').length,
      },
      {
        key: 'scheduled',
        label: 'Lên lịch',
        color: '#a855f7',
        value: items.filter((item) => item.status === 'scheduled').length,
      },
    ];
  }

  private estimateFileSize(recordCount: number) {
    if (recordCount <= 0) return '—';
    const kb = Math.max(320, recordCount * 48);
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${kb} KB`;
  }

  private lastDayOfMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
  }

  private formatDateTime(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}

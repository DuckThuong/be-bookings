export interface PromoSeed {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discount: string;
  expiry: string;
  bg: string;
  textColor: string;
}

export const MASTER_DATA_TYPE_PROMO = 'PROMO';

export const PROMOS: PromoSeed[] = [
  {
    id: 'p1',
    title: 'Giảm ngay 50K',
    subtitle: 'Cho chuyến xe đầu tiên trong tháng',
    code: 'GORIDE50',
    discount: '50.000đ',
    expiry: '31/05/2026',
    bg: '#0a0e1a',
    textColor: '#fff',
  },
  {
    id: 'p2',
    title: 'Ưu đãi cuối tuần',
    subtitle: 'Giảm 20% toàn bộ vé xe khách',
    code: 'WEEKEND20',
    discount: '20%',
    expiry: 'Mỗi T7 & CN',
    bg: '#f5a623',
    textColor: '#0a0e1a',
  },
  {
    id: 'p3',
    title: 'Combo Hà Nội – HCM',
    subtitle: 'Vé + Khách sạn chỉ từ 990K',
    code: 'COMBO990',
    discount: '990.000đ',
    expiry: '30/06/2026',
    bg: '#1a3a2a',
    textColor: '#fff',
  },
];

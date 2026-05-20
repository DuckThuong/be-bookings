export interface OperatorSeed {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviews: number;
  routes: string;
  badge?: string;
}

export const MASTER_DATA_TYPE_OPERATOR = 'OPERATOR';

export const OPERATORS: OperatorSeed[] = [
  {
    id: 'o1',
    name: 'Phương Trang',
    logo: 'PT',
    rating: 4.8,
    reviews: 12400,
    routes: 'Hà Nội · HCM · Đà Nẵng',
    badge: 'Top #1',
  },
  {
    id: 'o2',
    name: 'Thành Bưởi',
    logo: 'TB',
    rating: 4.7,
    reviews: 8900,
    routes: 'HCM · Đà Lạt · Nha Trang',
    badge: 'Top #2',
  },
  {
    id: 'o3',
    name: 'Hoàng Long',
    logo: 'HL',
    rating: 4.6,
    reviews: 7300,
    routes: 'Hà Nội · Vinh · Huế',
    badge: 'Top #3',
  },
  {
    id: 'o4',
    name: 'Kumho Samco',
    logo: 'KS',
    rating: 4.6,
    reviews: 6100,
    routes: 'HCM · Vũng Tàu · Cần Thơ',
  },
  {
    id: 'o5',
    name: 'Xe Canh Thịnh',
    logo: 'CT',
    rating: 4.5,
    reviews: 4200,
    routes: 'Hà Nội · Hải Phòng · QN',
  },
];

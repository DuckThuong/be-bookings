export interface ServiceSeed {
  id: string;
  icon: string;
  label: string;
  desc: string;
  tag?: string;
  tagColor?: string;
}

export const MASTER_DATA_TYPE_SERVICE = 'SERVICE';

export const SERVICES: ServiceSeed[] = [
  { id: 's1', icon: '🚌', label: 'Xe khách giường nằm', desc: 'Liên tỉnh' },
  {
    id: 's2',
    icon: '🚌',
    label: 'Xe khách 45 chỗ',
    desc: 'Liên tỉnh',
    tag: 'Hot',
    tagColor: 'red',
  },
  { id: 's3', icon: '🚗', label: 'Xe hợp đồng', desc: 'Theo ngày' },
  {
    id: 's4',
    icon: '🚐',
    label: 'Xe đưa đón',
    desc: 'Sân bay',
    tag: 'Mới',
    tagColor: 'green',
  },
  { id: 's5', icon: '🚐', label: 'Xe limousine', desc: 'Liên tỉnh' },
];

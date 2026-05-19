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
  { id: 's1', icon: '🚌', label: 'Xe khách', desc: 'Liên tỉnh' },
  {
    id: 's2',
    icon: '🛵',
    label: 'Xe máy',
    desc: 'Nội thành',
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
  { id: 's5', icon: '🚂', label: 'Tàu hoả', desc: 'Liên tỉnh' },
  {
    id: 's6',
    icon: '✈️',
    label: 'Vé máy bay',
    desc: 'Nội địa',
    tag: 'Sale',
    tagColor: 'amber',
  },
  { id: 's7', icon: '🏨', label: 'Khách sạn', desc: 'Combo tiết kiệm' },
  { id: 's8', icon: '🗺️', label: 'Tour du lịch', desc: 'Khám phá' },
];

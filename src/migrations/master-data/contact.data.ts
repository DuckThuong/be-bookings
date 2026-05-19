export interface ContactSeed {
  id: string;
  label: string;
  value: string;
  note: string;
}

export const MASTER_DATA_TYPE_CONTACT = 'CONTACT';

export const CONTACTS: ContactSeed[] = [
  {
    id: 'c1',
    label: 'Hotline 24/7',
    value: '1900 1234',
    note: 'Phí 1.000đ/phút',
  },
  {
    id: 'c2',
    label: 'Email hỗ trợ',
    value: 'support@goride.vn',
    note: 'Phản hồi trong 2h',
  },
  {
    id: 'c3',
    label: 'Live chat',
    value: 'Chat trong ứng dụng',
    note: '08:00 - 22:00',
  },
];

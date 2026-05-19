export interface FaqSeed {
  id: string;
  q: string;
  a: string;
}

export const MASTER_DATA_TYPE_FAQ = 'FAQ';

export const FAQS: FaqSeed[] = [
  {
    id: 'f1',
    q: 'Làm sao để đổi lịch chuyến đi?',
    a: 'Bạn vào Chi tiết đơn hàng, chọn Đổi lịch. Hệ thống sẽ hiển thị các chuyến có thể đổi.',
  },
  {
    id: 'f2',
    q: 'Khi nào tôi nhận được hoàn tiền?',
    a: 'Hoàn tiền thường trong 3-5 ngày làm việc, tuỳ ngân hàng hoặc phương thức thanh toán.',
  },
  {
    id: 'f3',
    q: 'Tôi quên mã đặt chỗ thì làm gì?',
    a: 'Vào mục Chuyến đi của tôi hoặc liên hệ tổng đài với số điện thoại đã đặt vé.',
  },
];

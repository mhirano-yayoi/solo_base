export const ACCOUNTS = [
  '現金',
  '普通預金',
  '売掛金',
  '売上',
  '主な経費',
  '事業主貸',
  '事業主借',
] as const;

export type Account = (typeof ACCOUNTS)[number];

export type Category = '売上' | '経費';

export type PaymentMethod = '現金' | '普通預金' | '個人';

export function accountForPaymentMethod(
  method: PaymentMethod,
  category: Category,
): Account {
  switch (method) {
    case '現金':
      return '現金';
    case '普通預金':
      return '普通預金';
    case '個人':
      return category === '経費' ? '事業主借' : '事業主貸';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function categoryAccount(category: Category): Account {
  switch (category) {
    case '売上':
      return '売上';
    case '経費':
      return '主な経費';
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

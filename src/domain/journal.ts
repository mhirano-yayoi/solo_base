import {
  accountForPaymentMethod,
  categoryAccount,
  type Account,
  type Category,
  type PaymentMethod,
} from './accounts';
import { isValidJournalDate } from './dates';

export type JournalLine = {
  account: Account;
  debit: number;
  credit: number;
};

export type JournalEntryInput = {
  id: string;
  date: string;
  amount: number;
  partnerName: string;
  category: Category;
  paymentMethod: PaymentMethod;
  memo: string;
};

export type JournalEntry = JournalEntryInput & {
  lines: JournalLine[];
};

export function buildBalancedLines(
  amount: number,
  category: Category,
  paymentMethod: PaymentMethod,
): JournalLine[] {
  const moneyAccount = accountForPaymentMethod(paymentMethod, category);
  const opposite = categoryAccount(category);

  if (category === '経費') {
    return [
      { account: opposite, debit: amount, credit: 0 },
      { account: moneyAccount, debit: 0, credit: amount },
    ];
  }

  return [
    { account: moneyAccount, debit: amount, credit: 0 },
    { account: opposite, debit: 0, credit: amount },
  ];
}

export function createIssueJournal(input: {
  id: string;
  date: string;
  amountInclusive: number;
  partnerName: string;
  memo: string;
}): JournalEntry {
  if (!isValidJournalDate(input.date)) {
    throw new Error('日付は 2026-01-01 以降である必要があります');
  }
  if (input.amountInclusive <= 0) {
    throw new Error('金額は正の数である必要があります');
  }

  return {
    id: input.id,
    date: input.date,
    amount: input.amountInclusive,
    partnerName: input.partnerName,
    category: '売上',
    paymentMethod: '普通預金',
    memo: input.memo,
    lines: [
      { account: '売掛金', debit: input.amountInclusive, credit: 0 },
      { account: '売上', debit: 0, credit: input.amountInclusive },
    ],
  };
}

export function createPaymentJournal(input: {
  id: string;
  date: string;
  inclusiveTotal: number;
  withholdingTax: number;
  partnerName: string;
  memo: string;
}): JournalEntry {
  if (!isValidJournalDate(input.date)) {
    throw new Error('日付は 2026-01-01 以降である必要があります');
  }
  const deposit = input.inclusiveTotal - input.withholdingTax;
  if (deposit < 0) {
    throw new Error('天引き額が税込合計を超えています');
  }

  return {
    id: input.id,
    date: input.date,
    amount: input.inclusiveTotal,
    partnerName: input.partnerName,
    category: '売上',
    paymentMethod: '普通預金',
    memo: input.memo,
    lines: [
      { account: '普通預金', debit: deposit, credit: 0 },
      ...(input.withholdingTax > 0
        ? [{ account: '事業主貸' as Account, debit: input.withholdingTax, credit: 0 }]
        : []),
      { account: '売掛金', debit: 0, credit: input.inclusiveTotal },
    ],
  };
}

export function createJournalEntry(input: JournalEntryInput): JournalEntry {
  if (!isValidJournalDate(input.date)) {
    throw new Error('日付は 2026-01-01 以降である必要があります');
  }
  if (input.amount <= 0) {
    throw new Error('金額は正の数である必要があります');
  }

  const lines = buildBalancedLines(
    input.amount,
    input.category,
    input.paymentMethod,
  );
  assertBalanced(lines);

  return { ...input, lines };
}

export function assertBalanced(lines: JournalLine[]): void {
  const debit = lines.reduce((sum, line) => sum + line.debit, 0);
  const credit = lines.reduce((sum, line) => sum + line.credit, 0);
  if (debit !== credit) {
    throw new Error('借方と貸方が一致しません');
  }
}

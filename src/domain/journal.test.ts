import { describe, expect, it } from 'vitest';
import {
  assertBalanced,
  createIssueJournal,
  createJournalEntry,
  createPaymentJournal,
} from './journal';

describe('createJournalEntry', () => {
  it('経費・現金の貸借が一致する', () => {
    const entry = createJournalEntry({
      id: 'j1',
      date: '2026-02-01',
      amount: 1200,
      partnerName: 'ロフト',
      category: '経費',
      paymentMethod: '現金',
      memo: '消耗品',
    });

    expect(entry.lines).toEqual([
      { account: '主な経費', debit: 1200, credit: 0 },
      { account: '現金', debit: 0, credit: 1200 },
    ]);
  });

  it('個人での支出は事業主借になる', () => {
    const entry = createJournalEntry({
      id: 'j2',
      date: '2026-02-01',
      amount: 3000,
      partnerName: '書店',
      category: '経費',
      paymentMethod: '個人',
      memo: '書籍',
    });

    expect(entry.lines[1]?.account).toBe('事業主借');
  });

  it('2026-01-01 より前の日付を拒否する', () => {
    expect(() =>
      createJournalEntry({
        id: 'j3',
        date: '2025-12-31',
        amount: 100,
        partnerName: 'A',
        category: '売上',
        paymentMethod: '現金',
        memo: '',
      }),
    ).toThrow(/2026-01-01/);
  });
});

describe('issue and payment journals', () => {
  it('発行は売掛金と売上の 1 本', () => {
    const entry = createIssueJournal({
      id: 'iss1',
      date: '2026-03-01',
      amountInclusive: 110000,
      partnerName: '顧問先',
      memo: '請求発行',
    });
    expect(entry.lines).toEqual([
      { account: '売掛金', debit: 110000, credit: 0 },
      { account: '売上', debit: 0, credit: 110000 },
    ]);
  });

  it('入金は普通預金・事業主貸・売掛金', () => {
    const entry = createPaymentJournal({
      id: 'pay1',
      date: '2026-03-15',
      inclusiveTotal: 110000,
      withholdingTax: 10210,
      partnerName: '顧問先',
      memo: '入金',
    });
    assertBalanced(entry.lines);
    expect(entry.lines).toEqual([
      { account: '普通預金', debit: 99790, credit: 0 },
      { account: '事業主貸', debit: 10210, credit: 0 },
      { account: '売掛金', debit: 0, credit: 110000 },
    ]);
  });
});

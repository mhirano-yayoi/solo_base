import { describe, expect, it } from 'vitest';
import { createDemoState } from './demoData';
import {
  answerChatQuestion,
  countPendingStatements,
  countUnlinkedEvidences,
  countUnpaidInvoices,
  summarizePeriod,
} from './queries';

describe('queries', () => {
  it('デモの件数を返す', () => {
    const state = createDemoState();
    expect(countPendingStatements(state)).toBe(3);
    expect(countUnpaidInvoices(state)).toBe(1);
    expect(countUnlinkedEvidences(state)).toBe(3);
  });

  it('集計期間の売上・経費・利益を返す', () => {
    const state = createDemoState();
    const summary = summarizePeriod(state);
    expect(summary.sales).toBeGreaterThan(0);
    expect(summary.expenses).toBeGreaterThan(0);
    expect(summary.profit).toBe(summary.sales - summary.expenses);
  });

  it('未入金の質問に件数で答える', () => {
    const state = createDemoState();
    expect(answerChatQuestion(state, '未入金は何件？')).toBe(
      '未入金の請求は 1 件です。',
    );
  });
});

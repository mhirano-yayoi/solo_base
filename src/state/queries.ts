import type { AppState } from './types';

export type PeriodSummary = {
  sales: number;
  expenses: number;
  profit: number;
};

export function summarizePeriod(state: AppState): PeriodSummary {
  const { periodStart, periodEnd } = state.settings;
  let sales = 0;
  let expenses = 0;

  for (const journal of state.journals) {
    if (journal.date < periodStart || journal.date > periodEnd) {
      continue;
    }
    if (journal.category === '売上') {
      sales += journal.amount;
    } else {
      expenses += journal.amount;
    }
  }

  return { sales, expenses, profit: sales - expenses };
}

export function countPendingStatements(state: AppState): number {
  return state.pendingStatements.length;
}

export function countUnpaidInvoices(state: AppState): number {
  return state.documents.filter(
    (doc) => doc.kind === 'invoice' && doc.status === 'unpaid',
  ).length;
}

export function countUnlinkedEvidences(state: AppState): number {
  return state.evidences.filter((ev) => ev.journalIds.length === 0).length;
}

export function answerChatQuestion(state: AppState, question: string): string {
  const q = question.trim();
  const unpaid = countUnpaidInvoices(state);
  const pending = countPendingStatements(state);
  const unlinked = countUnlinkedEvidences(state);
  const summary = summarizePeriod(state);

  if (/未入金/.test(q)) {
    return `未入金の請求は ${unpaid} 件です。`;
  }
  if (/未承認/.test(q)) {
    return `未承認の明細は ${pending} 件です。`;
  }
  if (/証憑|紐付/.test(q)) {
    return `未紐付けの証憑は ${unlinked} 件です。`;
  }
  if (/売上|経費|利益/.test(q)) {
    return `集計期間の売上は ${summary.sales.toLocaleString('ja-JP')} 円、経費は ${summary.expenses.toLocaleString('ja-JP')} 円、利益は ${summary.profit.toLocaleString('ja-JP')} 円です。`;
  }

  return [
    `未承認の明細 ${pending} 件、未入金の請求 ${unpaid} 件、未紐付けの証憑 ${unlinked} 件。`,
    `売上 ${summary.sales.toLocaleString('ja-JP')} 円、経費 ${summary.expenses.toLocaleString('ja-JP')} 円、利益 ${summary.profit.toLocaleString('ja-JP')} 円。`,
  ].join('\n');
}

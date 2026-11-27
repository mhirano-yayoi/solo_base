import type { PendingStatement } from '@/state/types';

export function parseStatementText(text: string): PendingStatement[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: PendingStatement[] = [];
  for (const line of lines) {
    const parts = line.includes(',')
      ? line.split(',').map((p) => p.trim())
      : line.split(/\s+/);
    if (parts.length < 3) {
      continue;
    }
    const [date, memo, amountRaw] = parts;
    if (!date || !memo || amountRaw == null) {
      continue;
    }
    if (/日付|date/i.test(date)) {
      continue;
    }
    const amount = Number(amountRaw.replace(/,/g, ''));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(amount)) {
      continue;
    }
    rows.push({
      id: `ps-${crypto.randomUUID().slice(0, 8)}`,
      date,
      memo,
      amount,
    });
  }
  return rows;
}

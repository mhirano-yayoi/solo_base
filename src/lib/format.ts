export function formatYen(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}円`;
}

export function formatDateJa(date: string): string {
  const [y, m, d] = date.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

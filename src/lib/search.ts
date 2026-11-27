import type {
  DocumentRecord,
  EvidenceRecord,
  PendingStatement,
} from '@/state/types';
import type { JournalEntry } from '@/domain';

export function matchesJournal(query: string, journal: JournalEntry): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    journal.date.includes(q) ||
    journal.partnerName.toLowerCase().includes(q) ||
    String(journal.amount).includes(q)
  );
}

export function matchesDocument(query: string, doc: DocumentRecord): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const amount = doc.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPriceInclusive,
    0,
  );
  return (
    doc.partnerName.toLowerCase().includes(q) ||
    doc.number.toLowerCase().includes(q) ||
    String(amount).includes(q)
  );
}

export function matchesEvidence(query: string, evidence: EvidenceRecord): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    evidence.date.includes(q) ||
    evidence.partnerName.toLowerCase().includes(q) ||
    String(evidence.amount).includes(q)
  );
}

export function matchesPending(query: string, row: PendingStatement): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    row.date.includes(q) ||
    row.memo.toLowerCase().includes(q) ||
    String(row.amount).includes(q)
  );
}

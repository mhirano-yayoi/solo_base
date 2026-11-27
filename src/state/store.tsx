import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addOneMonth,
  calculateInvoiceTax,
  createIssueJournal,
  createJournalEntry,
  createPaymentJournal,
  type Category,
  type PaymentMethod,
  type RoundingMode,
  type TaxRate,
  type WithholdingBase,
} from '@/domain';
import { createDemoState } from './demoData';
import { answerChatQuestion } from './queries';
import type {
  AppState,
  BusinessSettings,
  ChatThread,
  DocumentKind,
  DocumentLine,
  DocumentRecord,
  EvidenceRecord,
  PendingStatement,
  QuickEntryInput,
} from './types';

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

type StoreValue = {
  state: AppState;
  resetDemo: () => void;
  updateSettings: (patch: Partial<BusinessSettings>) => void;
  addJournal: (input: QuickEntryInput) => string;
  updateJournal: (
    id: string,
    input: QuickEntryInput,
  ) => void;
  deleteJournal: (id: string) => void;
  importStatements: (rows: PendingStatement[]) => void;
  approveStatement: (
    id: string,
    choice: 'business' | 'personal',
  ) => void;
  saveDocument: (doc: DocumentRecord) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => string;
  convertDocument: (id: string, kind: DocumentKind) => string;
  issueDocument: (id: string) => void;
  payDocument: (
    id: string,
    input: { date: string; withholdingTax: number },
  ) => void;
  saveEvidence: (evidence: EvidenceRecord) => void;
  linkEvidenceToJournal: (evidenceId: string, journalId: string) => void;
  createJournalForEvidence: (
    evidenceId: string,
    input: QuickEntryInput,
  ) => string;
  askChat: (question: string) => void;
  newChat: () => void;
  openChat: (id: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createDemoState());

  const resetDemo = useCallback(() => {
    setState(createDemoState());
  }, []);

  const updateSettings = useCallback((patch: Partial<BusinessSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const addJournal = useCallback((input: QuickEntryInput) => {
    const id = newId('j');
    const entry = createJournalEntry({ id, ...input });
    setState((prev) => ({ ...prev, journals: [entry, ...prev.journals] }));
    return id;
  }, []);

  const updateJournal = useCallback((id: string, input: QuickEntryInput) => {
    const entry = createJournalEntry({ id, ...input });
    setState((prev) => ({
      ...prev,
      journals: prev.journals.map((j) => (j.id === id ? entry : j)),
    }));
  }, []);

  const deleteJournal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      journals: prev.journals.filter((j) => j.id !== id),
      evidences: prev.evidences.map((ev) => ({
        ...ev,
        journalIds: ev.journalIds.filter((jid) => jid !== id),
      })),
    }));
  }, []);

  const importStatements = useCallback((rows: PendingStatement[]) => {
    setState((prev) => ({
      ...prev,
      pendingStatements: [...rows, ...prev.pendingStatements],
    }));
  }, []);

  const approveStatement = useCallback(
    (id: string, choice: 'business' | 'personal') => {
      setState((prev) => {
        const row = prev.pendingStatements.find((p) => p.id === id);
        if (!row) {
          return prev;
        }

        const amount = Math.abs(row.amount);
        const isIncome = row.amount > 0;
        let category: Category = isIncome ? '売上' : '経費';
        let paymentMethod: PaymentMethod = '普通預金';

        if (choice === 'personal') {
          category = isIncome ? '売上' : '経費';
          paymentMethod = '個人';
        }

        const entry = createJournalEntry({
          id: newId('j'),
          date: row.date,
          amount,
          partnerName: row.memo,
          category,
          paymentMethod,
          memo: row.memo,
        });

        return {
          ...prev,
          pendingStatements: prev.pendingStatements.filter((p) => p.id !== id),
          journals: [entry, ...prev.journals],
        };
      });
    },
    [],
  );

  const saveDocument = useCallback((doc: DocumentRecord) => {
    setState((prev) => {
      const exists = prev.documents.some((d) => d.id === doc.id);
      return {
        ...prev,
        documents: exists
          ? prev.documents.map((d) => (d.id === doc.id ? doc : d))
          : [doc, ...prev.documents],
      };
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
  }, []);

  const duplicateDocument = useCallback((id: string) => {
    const nextId = newId('doc');
    setState((prev) => {
      const source = prev.documents.find((d) => d.id === id);
      if (!source) {
        return prev;
      }
      const prefix =
        source.kind === 'invoice'
          ? 'INV'
          : source.kind === 'quote'
            ? 'Q'
            : 'D';
      const copy: DocumentRecord = {
        ...source,
        id: nextId,
        status: 'draft',
        number: `${prefix}-${Date.now().toString().slice(-6)}`,
        issueDate: addOneMonth(source.issueDate),
        dueDate: addOneMonth(source.dueDate),
        lines: source.lines.map((line) => ({ ...line, id: newId('dl') })),
        bakedInclusiveTotal: undefined,
        bakedWithholdingTax: undefined,
        bakedByRate: undefined,
        issueJournalId: undefined,
        paymentJournalId: undefined,
      };
      return { ...prev, documents: [copy, ...prev.documents] };
    });
    return nextId;
  }, []);

  const convertDocument = useCallback((id: string, kind: DocumentKind) => {
    const nextId = newId('doc');
    setState((prev) => {
      const source = prev.documents.find((d) => d.id === id);
      if (!source) {
        return prev;
      }
      const prefix = kind === 'invoice' ? 'INV' : kind === 'quote' ? 'Q' : 'D';
      const partner = prev.partners.find((p) => p.id === source.partnerId);
      const converted: DocumentRecord = {
        ...source,
        id: nextId,
        kind,
        status: 'draft',
        number: `${prefix}-${Date.now().toString().slice(-6)}`,
        issueDate: source.issueDate,
        dueDate: source.dueDate,
        lines: source.lines.map((line) => ({ ...line, id: newId('dl') })),
        applyWithholding: partner?.withholding ?? false,
        bakedInclusiveTotal: undefined,
        bakedWithholdingTax: undefined,
        bakedByRate: undefined,
        issueJournalId: undefined,
        paymentJournalId: undefined,
      };
      return { ...prev, documents: [converted, ...prev.documents] };
    });
    return nextId;
  }, []);

  const issueDocument = useCallback((id: string) => {
    setState((prev) => {
      const doc = prev.documents.find((d) => d.id === id);
      if (!doc || doc.kind !== 'invoice' || doc.status !== 'draft') {
        return prev;
      }

      const tax = calculateInvoiceTax(
        doc.lines.map((line) => ({
          amountInclusive: line.quantity * line.unitPriceInclusive,
          taxRate: line.taxRate,
        })),
        {
          rounding: doc.rounding,
          withholdingBase: doc.withholdingBase,
          applyWithholding: doc.applyWithholding,
        },
      );

      const journalId = newId('j');
      const journal = createIssueJournal({
        id: journalId,
        date: doc.issueDate,
        amountInclusive: tax.inclusiveTotal,
        partnerName: doc.partnerName,
        memo: `${doc.number} 発行`,
      });

      return {
        ...prev,
        journals: [journal, ...prev.journals],
        documents: prev.documents.map((d) =>
          d.id === id
            ? {
                ...d,
                status: 'unpaid' as const,
                bakedInclusiveTotal: tax.inclusiveTotal,
                bakedWithholdingTax: tax.withholdingTax,
                bakedByRate: tax.byRate,
                issueJournalId: journalId,
              }
            : d,
        ),
      };
    });
  }, []);

  const payDocument = useCallback(
    (id: string, input: { date: string; withholdingTax: number }) => {
      setState((prev) => {
        const doc = prev.documents.find((d) => d.id === id);
        if (!doc || doc.status !== 'unpaid' || doc.bakedInclusiveTotal == null) {
          return prev;
        }

        const journalId = newId('j');
        const journal = createPaymentJournal({
          id: journalId,
          date: input.date,
          inclusiveTotal: doc.bakedInclusiveTotal,
          withholdingTax: input.withholdingTax,
          partnerName: doc.partnerName,
          memo: `${doc.number} 入金`,
        });

        return {
          ...prev,
          journals: [journal, ...prev.journals],
          documents: prev.documents.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: 'paid' as const,
                  paymentJournalId: journalId,
                }
              : d,
          ),
        };
      });
    },
    [],
  );

  const saveEvidence = useCallback((evidence: EvidenceRecord) => {
    setState((prev) => {
      const exists = prev.evidences.some((e) => e.id === evidence.id);
      return {
        ...prev,
        evidences: exists
          ? prev.evidences.map((e) => (e.id === evidence.id ? evidence : e))
          : [evidence, ...prev.evidences],
      };
    });
  }, []);

  const linkEvidenceToJournal = useCallback(
    (evidenceId: string, journalId: string) => {
      setState((prev) => ({
        ...prev,
        evidences: prev.evidences.map((ev) =>
          ev.id === evidenceId && !ev.journalIds.includes(journalId)
            ? { ...ev, journalIds: [...ev.journalIds, journalId] }
            : ev,
        ),
      }));
    },
    [],
  );

  const createJournalForEvidence = useCallback(
    (evidenceId: string, input: QuickEntryInput) => {
      const journalId = newId('j');
      const entry = createJournalEntry({ id: journalId, ...input });
      setState((prev) => ({
        ...prev,
        journals: [entry, ...prev.journals],
        evidences: prev.evidences.map((ev) =>
          ev.id === evidenceId
            ? { ...ev, journalIds: [...ev.journalIds, journalId] }
            : ev,
        ),
      }));
      return journalId;
    },
    [],
  );

  const askChat = useCallback((question: string) => {
    setState((prev) => {
      const answer = answerChatQuestion(prev, question);
      let threads = prev.chatThreads;
      let activeChatId = prev.activeChatId;

      if (!activeChatId) {
        activeChatId = newId('chat');
        const thread: ChatThread = {
          id: activeChatId,
          title: question.slice(0, 20) || '新しい会話',
          messages: [],
        };
        threads = [thread, ...threads];
      }

      threads = threads.map((thread) => {
        if (thread.id !== activeChatId) {
          return thread;
        }
        return {
          ...thread,
          title: thread.messages.length === 0 ? question.slice(0, 20) : thread.title,
          messages: [
            ...thread.messages,
            { id: newId('m'), role: 'user', text: question },
            { id: newId('m'), role: 'assistant', text: answer },
          ],
        };
      });

      return { ...prev, chatThreads: threads, activeChatId };
    });
  }, []);

  const newChat = useCallback(() => {
    setState((prev) => ({ ...prev, activeChatId: null }));
  }, []);

  const openChat = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeChatId: id }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      resetDemo,
      updateSettings,
      addJournal,
      updateJournal,
      deleteJournal,
      importStatements,
      approveStatement,
      saveDocument,
      deleteDocument,
      duplicateDocument,
      convertDocument,
      issueDocument,
      payDocument,
      saveEvidence,
      linkEvidenceToJournal,
      createJournalForEvidence,
      askChat,
      newChat,
      openChat,
    }),
    [
      state,
      resetDemo,
      updateSettings,
      addJournal,
      updateJournal,
      deleteJournal,
      importStatements,
      approveStatement,
      saveDocument,
      deleteDocument,
      duplicateDocument,
      convertDocument,
      issueDocument,
      payDocument,
      saveEvidence,
      linkEvidenceToJournal,
      createJournalForEvidence,
      askChat,
      newChat,
      openChat,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error('StoreProvider がありません');
  }
  return value;
}

export function createEmptyDocument(input: {
  kind: DocumentKind;
  settings: BusinessSettings;
  partnerId: string;
  partnerName: string;
  applyWithholding: boolean;
  defaultTaxRate: TaxRate;
}): DocumentRecord {
  const prefix =
    input.kind === 'invoice' ? 'INV' : input.kind === 'quote' ? 'Q' : 'D';
  const today = '2026-11-15';
  return {
    id: newId('doc'),
    kind: input.kind,
    status: 'draft',
    number: `${prefix}-${Date.now().toString().slice(-6)}`,
    partnerId: input.partnerId,
    partnerName: input.partnerName,
    issueDate: today,
    dueDate: addOneMonth(today),
    lines: [
      {
        id: newId('dl'),
        name: '',
        quantity: 1,
        unitPriceInclusive: 0,
        taxRate: input.defaultTaxRate,
      },
    ],
    withholdingBase: input.settings.withholdingBase,
    rounding: input.settings.rounding,
    applyWithholding: input.applyWithholding,
  };
}

export function documentLineAmount(line: DocumentLine): number {
  return line.quantity * line.unitPriceInclusive;
}

export type { RoundingMode, TaxRate, WithholdingBase };

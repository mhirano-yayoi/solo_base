import type {
  Category,
  JournalEntry,
  PaymentMethod,
  RoundingMode,
  TaxRate,
  WithholdingBase,
} from '@/domain';

export type Partner = {
  id: string;
  name: string;
  withholding: boolean;
};

export type BusinessSettings = {
  name: string;
  registrationNumber: string;
  bankAccount: string;
  defaultTaxRate: TaxRate;
  withholdingBase: WithholdingBase;
  rounding: RoundingMode;
  periodStart: string;
  periodEnd: string;
  showUnimplemented: boolean;
};

export type DocumentKind = 'quote' | 'delivery' | 'invoice';

export type DocumentStatus = 'draft' | 'unpaid' | 'paid';

export type DocumentLine = {
  id: string;
  name: string;
  quantity: number;
  unitPriceInclusive: number;
  taxRate: TaxRate;
};

export type DocumentRecord = {
  id: string;
  kind: DocumentKind;
  status: DocumentStatus;
  number: string;
  partnerId: string;
  partnerName: string;
  issueDate: string;
  dueDate: string;
  lines: DocumentLine[];
  withholdingBase: WithholdingBase;
  rounding: RoundingMode;
  applyWithholding: boolean;
  bakedInclusiveTotal?: number;
  bakedWithholdingTax?: number;
  bakedByRate?: {
    taxRate: TaxRate;
    exclusive: number;
    tax: number;
    inclusive: number;
  }[];
  issueJournalId?: string;
  paymentJournalId?: string;
};

export type PendingStatement = {
  id: string;
  date: string;
  memo: string;
  amount: number;
};

export type EvidenceStatus = 'uploading' | 'ready' | 'failed';

export type EvidenceRecord = {
  id: string;
  partnerName: string;
  amount: number;
  date: string;
  category: Category;
  status: EvidenceStatus;
  journalIds: string[];
  previewUrl?: string;
  isSample: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

export type AppState = {
  settings: BusinessSettings;
  partners: Partner[];
  journals: JournalEntry[];
  documents: DocumentRecord[];
  pendingStatements: PendingStatement[];
  evidences: EvidenceRecord[];
  chatThreads: ChatThread[];
  activeChatId: string | null;
};

export type QuickEntryInput = {
  date: string;
  amount: number;
  partnerName: string;
  category: Category;
  paymentMethod: PaymentMethod;
  memo: string;
};

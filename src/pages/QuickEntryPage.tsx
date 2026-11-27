import { useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Category } from '@/domain';
import { useStore } from '@/state/store';

type LocationState = {
  evidenceId?: string;
  defaults?: {
    date?: string;
    amount?: number;
    partnerName?: string;
    category?: Category;
    memo?: string;
  };
};

export function QuickEntryPage() {
  const { addJournal, createJournalForEvidence } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [present] = useIonToast();
  const locationState = (location.state ?? undefined) as LocationState | undefined;
  const defaults = locationState?.defaults;
  const evidenceId = locationState?.evidenceId;

  const [date, setDate] = useState(defaults?.date ?? '2026-11-10');
  const [amount, setAmount] = useState(String(defaults?.amount ?? ''));
  const [partnerName, setPartnerName] = useState(defaults?.partnerName ?? '');
  const [category, setCategory] = useState<Category>(defaults?.category ?? '経費');
  const [memo, setMemo] = useState(defaults?.memo ?? '');
  const [continueInput, setContinueInput] = useState(false);

  const save = () => {
    try {
      const input = {
        date,
        amount: Number(amount),
        partnerName,
        category,
        paymentMethod: '現金' as const,
        memo,
      };
      if (evidenceId) {
        createJournalForEvidence(evidenceId, input);
        navigate(`/evidence/${evidenceId}`, { replace: true });
        return;
      }
      addJournal(input);
      if (continueInput) {
        setAmount('');
        setMemo('');
        present({ message: '保存しました', duration: 1200 });
      } else {
        navigate('/ledger', { replace: true });
      }
    } catch (error) {
      present({
        message: error instanceof Error ? error.message : '保存に失敗しました',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/ledger" />
          </IonButtons>
          <IonTitle>かんたん入力</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save}>保存</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonInput
            label="取引日"
            labelPlacement="stacked"
            type="date"
            value={date}
            onIonInput={(e) => setDate(e.detail.value ?? '')}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="金額"
            labelPlacement="stacked"
            type="number"
            value={amount}
            onIonInput={(e) => setAmount(e.detail.value ?? '')}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="取引先"
            labelPlacement="stacked"
            value={partnerName}
            onIonInput={(e) => setPartnerName(e.detail.value ?? '')}
          />
        </IonItem>
        <IonItem>
          <IonSelect
            label="区分"
            labelPlacement="stacked"
            value={category}
            onIonChange={(e) => setCategory(e.detail.value)}
          >
            <IonSelectOption value="売上">売上</IonSelectOption>
            <IonSelectOption value="経費">経費</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonInput label="取引手段" labelPlacement="stacked" value="現金" readonly />
        </IonItem>
        <IonItem>
          <IonInput
            label="摘要"
            labelPlacement="stacked"
            value={memo}
            onIonInput={(e) => setMemo(e.detail.value ?? '')}
          />
        </IonItem>
        {!evidenceId && (
          <IonItem>
            <IonToggle
              checked={continueInput}
              onIonChange={(e) => setContinueInput(e.detail.checked)}
            >
              続けて入力
            </IonToggle>
          </IonItem>
        )}
      </IonContent>
    </IonPage>
  );
}

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
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Category, PaymentMethod } from '@/domain';
import { useStore } from '@/state/store';

export function JournalEditPage() {
  const { id } = useParams<{ id: string }>();
  const { state, updateJournal } = useStore();
  const navigate = useNavigate();
  const [present] = useIonToast();
  const journal = state.journals.find((j) => j.id === id);

  const [date, setDate] = useState(journal?.date ?? '2026-11-01');
  const [amount, setAmount] = useState(String(journal?.amount ?? ''));
  const [partnerName, setPartnerName] = useState(journal?.partnerName ?? '');
  const [category, setCategory] = useState<Category>(journal?.category ?? '経費');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    journal?.paymentMethod ?? '現金',
  );
  const [memo, setMemo] = useState(journal?.memo ?? '');

  if (!journal) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/ledger" />
            </IonButtons>
            <IonTitle>仕訳の編集</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">見つかりません</IonContent>
      </IonPage>
    );
  }

  const save = () => {
    if (!id) {
      return;
    }
    try {
      updateJournal(id, {
        date,
        amount: Number(amount),
        partnerName,
        category,
        paymentMethod,
        memo,
      });
      navigate(-1);
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
            <IonBackButton defaultHref={`/ledger/journals/${id}`} />
          </IonButtons>
          <IonTitle>仕訳の編集</IonTitle>
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
          <IonSelect
            label="取引手段"
            labelPlacement="stacked"
            value={paymentMethod}
            onIonChange={(e) => setPaymentMethod(e.detail.value)}
          >
            <IonSelectOption value="現金">現金</IonSelectOption>
            <IonSelectOption value="普通預金">普通預金</IonSelectOption>
            <IonSelectOption value="個人">個人</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonInput
            label="摘要"
            labelPlacement="stacked"
            value={memo}
            onIonInput={(e) => setMemo(e.detail.value ?? '')}
          />
        </IonItem>
      </IonContent>
    </IonPage>
  );
}

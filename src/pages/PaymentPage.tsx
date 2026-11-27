import { useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatYen } from '@/lib/format';
import { useStore } from '@/state/store';

export function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { state, payDocument } = useStore();
  const navigate = useNavigate();
  const [present] = useIonToast();
  const doc = state.documents.find((d) => d.id === id);

  const inclusive = doc?.bakedInclusiveTotal ?? 0;
  const [date, setDate] = useState('2026-11-20');
  const [withholdingTax, setWithholdingTax] = useState(
    String(doc?.bakedWithholdingTax ?? 0),
  );

  if (!doc || doc.status !== 'unpaid') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/documents" />
            </IonButtons>
            <IonTitle>入金</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">入金できる請求がありません</IonContent>
      </IonPage>
    );
  }

  const withholding = Number(withholdingTax) || 0;
  const deposit = inclusive - withholding;

  const save = () => {
    try {
      payDocument(doc.id, { date, withholdingTax: withholding });
      navigate(`/documents/${doc.id}`, { replace: true });
    } catch (error) {
      present({
        message: error instanceof Error ? error.message : '入金に失敗しました',
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
            <IonBackButton defaultHref={`/documents/${doc.id}`} />
          </IonButtons>
          <IonTitle>入金</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save}>保存</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonLabel>
              <p>対象の請求</p>
              <h2>
                {doc.partnerName} {doc.number}
              </h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonInput
              label="入金日"
              labelPlacement="stacked"
              type="date"
              value={date}
              onIonInput={(e) => setDate(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>税込合計</p>
              <h2>{formatYen(inclusive)}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonInput
              label="天引き額"
              labelPlacement="stacked"
              type="number"
              value={withholdingTax}
              onIonInput={(e) => setWithholdingTax(e.detail.value ?? '0')}
            />
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>入金額</p>
              <h2>{formatYen(deposit)}</h2>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}

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
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Category } from '@/domain';
import { useStore } from '@/state/store';

export function EvidenceReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { state, saveEvidence } = useStore();
  const navigate = useNavigate();
  const evidence = state.evidences.find((e) => e.id === id);

  const [date, setDate] = useState(evidence?.date ?? '2026-11-10');
  const [amount, setAmount] = useState(String(evidence?.amount ?? 0));
  const [partnerName, setPartnerName] = useState(evidence?.partnerName ?? '');
  const [category, setCategory] = useState<Category>(evidence?.category ?? '経費');

  if (!evidence) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/evidence" />
            </IonButtons>
            <IonTitle>証憑の確認</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">見つかりません</IonContent>
      </IonPage>
    );
  }

  const save = () => {
    saveEvidence({
      ...evidence,
      date,
      amount: Number(amount),
      partnerName,
      category,
      status: 'ready',
    });
    navigate('/evidence', { replace: true });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/evidence" />
          </IonButtons>
          <IonTitle>証憑の確認</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save}>保存</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <p>見本の読み取り</p>
          <p>実在の書類は入れないでください。</p>
          {evidence.previewUrl && (
            <img
              src={evidence.previewUrl}
              alt="証憑プレビュー"
              style={{ width: '100%', borderRadius: 8 }}
            />
          )}
        </div>
        <IonList inset>
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
              label="取引先名"
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
            <IonLabel>
              <p>紐付け</p>
              <h2>
                {evidence.journalIds.length > 0
                  ? `${evidence.journalIds.length} 件`
                  : '未紐付け'}
              </h2>
            </IonLabel>
          </IonItem>
        </IonList>
        <div className="ion-padding" style={{ display: 'grid', gap: 8 }}>
          <IonButton
            expand="block"
            onClick={() =>
              navigate('/ledger/quick', {
                state: {
                  evidenceId: evidence.id,
                  defaults: {
                    date,
                    amount: Number(amount),
                    partnerName,
                    category,
                    memo: partnerName,
                  },
                },
              })
            }
          >
            追加（かんたん入力）
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => navigate(`/evidence/${evidence.id}/link`)}
          >
            紐付け（登録済みの仕訳）
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

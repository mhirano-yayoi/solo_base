import { useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { parseStatementText } from '@/lib/csv';
import { useStore } from '@/state/store';

const SAMPLE = `2026-11-12,コンビニ,-520
2026-11-13,時間単価合同会社,11000`;

export function ImportPage() {
  const { importStatements } = useStore();
  const navigate = useNavigate();
  const [present] = useIonToast();
  const [text, setText] = useState(SAMPLE);

  const importRows = () => {
    const rows = parseStatementText(text);
    if (rows.length === 0) {
      present({
        message: '日付・摘要・金額の行がありません',
        duration: 2000,
        color: 'danger',
      });
      return;
    }
    importStatements(rows);
    navigate('/ledger/pending', { replace: true });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/ledger" />
          </IonButtons>
          <IonTitle>明細の取込</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={importRows}>取り込む</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <p>列は日付・摘要・金額（入金はプラス、出金はマイナス）です。</p>
        </div>
        <IonItem>
          <IonTextarea
            label="貼り付け / CSV"
            labelPlacement="stacked"
            autoGrow
            value={text}
            onIonInput={(e) => setText(e.detail.value ?? '')}
          />
        </IonItem>
        <div className="ion-padding">
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv,text/csv,text/plain';
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) {
                  return;
                }
                setText(await file.text());
              };
              input.click();
            }}
          >
            CSV ファイルを選ぶ
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatYen } from '@/lib/format';
import { useStore } from '@/state/store';

export function JournalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, deleteJournal } = useStore();
  const navigate = useNavigate();
  const journal = state.journals.find((j) => j.id === id);

  if (!journal) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/ledger" />
            </IonButtons>
            <IonTitle>仕訳詳細</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">見つかりません</IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/ledger" />
          </IonButtons>
          <IonTitle>仕訳詳細</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => navigate(`/ledger/journals/${id}/edit`)}
            >
              編集
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonLabel>
              <p>取引日</p>
              <h2>{journal.date}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>金額</p>
              <h2>{formatYen(journal.amount)}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>取引先</p>
              <h2>{journal.partnerName}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>区分</p>
              <h2>{journal.category}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>取引手段</p>
              <h2>{journal.paymentMethod}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>摘要</p>
              <h2>{journal.memo || '—'}</h2>
            </IonLabel>
          </IonItem>
        </IonList>
        <IonList inset>
          {journal.lines.map((line, index) => (
            <IonItem key={`${line.account}-${index}`}>
              <IonLabel>
                <h2>{line.account}</h2>
                <p>
                  借方 {formatYen(line.debit)} / 貸方 {formatYen(line.credit)}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <div className="ion-padding">
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            onClick={() => {
              deleteJournal(journal.id);
              navigate('/ledger', { replace: true });
            }}
          >
            この仕訳を削除
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

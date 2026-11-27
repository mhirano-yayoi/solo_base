import { useState } from 'react';
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
import { SearchBar } from '@/components/SearchBar';
import { formatYen } from '@/lib/format';
import { matchesPending } from '@/lib/search';
import { useStore } from '@/state/store';

export function PendingStatementsPage() {
  const { state, approveStatement } = useStore();
  const [query, setQuery] = useState('');
  const rows = state.pendingStatements.filter((row) =>
    matchesPending(query, row),
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/ledger" />
          </IonButtons>
          <IonTitle>未承認の明細</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <SearchBar value={query} onChange={setQuery} placeholder="日付・摘要・金額" />
        <IonList>
          {rows.map((row) => (
            <IonItem key={row.id}>
              <IonLabel>
                <h2>
                  {row.date} {row.memo}
                </h2>
                <p>{formatYen(row.amount)}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <IonButton
                    size="small"
                    onClick={() => approveStatement(row.id, 'business')}
                  >
                    事業用
                  </IonButton>
                  <IonButton
                    size="small"
                    fill="outline"
                    onClick={() => approveStatement(row.id, 'personal')}
                  >
                    私用
                  </IonButton>
                </div>
              </IonLabel>
            </IonItem>
          ))}
          {rows.length === 0 && (
            <IonItem>
              <IonLabel>未承認の明細はありません</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
}

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { formatShortDate } from '@/domain';
import { formatYen } from '@/lib/format';
import {
  countPendingStatements,
  countUnlinkedEvidences,
  countUnpaidInvoices,
  summarizePeriod,
} from '@/state/queries';
import { useStore } from '@/state/store';

export function HomePage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const summary = summarizePeriod(state);
  const pending = countPendingStatements(state);
  const unpaid = countUnpaidInvoices(state);
  const unlinked = countUnlinkedEvidences(state);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{state.settings.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              aria-label="設定"
              onClick={() => navigate('/settings')}
            >
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <p>
            {formatShortDate(state.settings.periodStart)} –{' '}
            {formatShortDate(state.settings.periodEnd)}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              marginTop: 12,
            }}
          >
            <div>
              <div>売上</div>
              <strong>{formatYen(summary.sales)}</strong>
            </div>
            <div>
              <div>経費</div>
              <strong>{formatYen(summary.expenses)}</strong>
            </div>
            <div>
              <div>利益</div>
              <strong>{formatYen(summary.profit)}</strong>
            </div>
          </div>
        </div>
        <IonList inset>
          <IonItem button detail onClick={() => navigate('/ledger/pending')}>
            <IonLabel>
              <h2>未承認の明細</h2>
              <p>タップで記帳へ</p>
            </IonLabel>
            <IonLabel slot="end">{pending}</IonLabel>
          </IonItem>
          <IonItem button detail onClick={() => navigate('/documents')}>
            <IonLabel>
              <h2>未入金の請求</h2>
              <p>タップで書類へ</p>
            </IonLabel>
            <IonLabel slot="end">{unpaid}</IonLabel>
          </IonItem>
          <IonItem button detail onClick={() => navigate('/evidence')}>
            <IonLabel>
              <h2>未紐付けの証憑</h2>
              <p>タップで証憑へ</p>
            </IonLabel>
            <IonLabel slot="end">{unlinked}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}

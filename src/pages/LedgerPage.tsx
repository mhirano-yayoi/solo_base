import { useState } from 'react';
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
  IonPopover,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { ellipsisHorizontal } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { formatYen } from '@/lib/format';
import { matchesJournal } from '@/lib/search';
import { useStore } from '@/state/store';

export function LedgerPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingCount = state.pendingStatements.length;

  const journals = state.journals.filter((j) => matchesJournal(query, j));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>記帳</IonTitle>
          <IonButtons slot="end">
            <IonButton id="ledger-menu-button" onClick={() => setMenuOpen(true)}>
              <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <SearchBar value={query} onChange={setQuery} placeholder="取引日・金額・取引先" />
        <IonList>
          {journals.map((journal) => (
            <IonItem
              key={journal.id}
              button
              detail
              onClick={() => navigate(`/ledger/journals/${journal.id}`)}
            >
              <IonLabel>
                <h2>
                  {journal.date} {journal.partnerName}
                </h2>
                <p>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: 8,
                      background:
                        journal.category === '売上' ? '#1b4d3e' : '#b45309',
                      marginRight: 6,
                    }}
                  />
                  {journal.category}
                </p>
              </IonLabel>
              <IonLabel slot="end">{formatYen(journal.amount)}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      <IonPopover
        isOpen={menuOpen}
        trigger="ledger-menu-button"
        onDidDismiss={() => setMenuOpen(false)}
        showBackdrop={false}
      >
        <IonList>
          <IonItem
            button
            onClick={() => {
              setMenuOpen(false);
              navigate('/ledger/quick');
            }}
          >
            かんたん入力
          </IonItem>
          <IonItem
            button
            onClick={() => {
              setMenuOpen(false);
              navigate('/ledger/import');
            }}
          >
            明細を取り込む
          </IonItem>
          <IonItem
            button
            onClick={() => {
              setMenuOpen(false);
              navigate('/ledger/pending');
            }}
          >
            未承認の明細{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </IonItem>
        </IonList>
      </IonPopover>
    </IonPage>
  );
}

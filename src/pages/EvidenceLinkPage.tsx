import { useState } from 'react';
import {
  IonBackButton,
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
import { SearchBar } from '@/components/SearchBar';
import { formatYen } from '@/lib/format';
import { matchesJournal } from '@/lib/search';
import { useStore } from '@/state/store';

export function EvidenceLinkPage() {
  const { id } = useParams<{ id: string }>();
  const { state, linkEvidenceToJournal } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const journals = state.journals.filter((j) => matchesJournal(query, j));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/evidence/${id}`} />
          </IonButtons>
          <IonTitle>仕訳に紐付け</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <SearchBar value={query} onChange={setQuery} placeholder="取引日・金額・取引先" />
        <IonList>
          {journals.map((journal) => (
            <IonItem
              key={journal.id}
              button
              onClick={() => {
                if (!id) {
                  return;
                }
                linkEvidenceToJournal(id, journal.id);
                navigate(`/evidence/${id}`, { replace: true });
              }}
            >
              <IonLabel>
                <h2>
                  {journal.date} {journal.partnerName}
                </h2>
                <p>{journal.category}</p>
              </IonLabel>
              <IonLabel slot="end">{formatYen(journal.amount)}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}

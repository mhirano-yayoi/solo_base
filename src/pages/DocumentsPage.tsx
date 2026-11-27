import { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { formatYen } from '@/lib/format';
import { matchesDocument } from '@/lib/search';
import type { DocumentKind } from '@/state/types';
import { useStore } from '@/state/store';

const KIND_LABEL: Record<DocumentKind, string> = {
  invoice: '請求書',
  quote: '見積書',
  delivery: '納品書',
};

const STATUS_LABEL = {
  draft: '下書き',
  unpaid: '未入金',
  paid: '入金済み',
} as const;

export function DocumentsPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [kind, setKind] = useState<DocumentKind>('invoice');
  const [query, setQuery] = useState('');

  const docs = state.documents
    .filter((doc) => doc.kind === kind)
    .filter((doc) => matchesDocument(query, doc));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>書類</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => navigate(`/documents/new?kind=${kind}`)}
            >
              新規
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={kind}
            onIonChange={(e) => setKind(e.detail.value as DocumentKind)}
          >
            <IonSegmentButton value="quote">
              <IonLabel>見積書</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="delivery">
              <IonLabel>納品書</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="invoice">
              <IonLabel>請求書</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <SearchBar value={query} onChange={setQuery} placeholder="取引先・番号・金額" />
        <IonList>
          {docs.map((doc) => {
            const amount = doc.bakedInclusiveTotal ??
              doc.lines.reduce(
                (sum, line) => sum + line.quantity * line.unitPriceInclusive,
                0,
              );
            return (
              <IonItem
                key={doc.id}
                button
                detail
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <IonLabel>
                  <h2>
                    {doc.number} {doc.partnerName}
                  </h2>
                  <p>
                    {KIND_LABEL[doc.kind]} · {STATUS_LABEL[doc.status]} ·{' '}
                    {doc.issueDate}
                  </p>
                </IonLabel>
                <IonLabel slot="end">{formatYen(amount)}</IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
}

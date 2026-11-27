import { useRef, useState } from 'react';
import {
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
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { formatYen } from '@/lib/format';
import { matchesEvidence } from '@/lib/search';
import type { EvidenceRecord } from '@/state/types';
import { useStore } from '@/state/store';

const SAMPLE_READ = {
  partnerName: 'ロフト',
  amount: 2180,
  date: '2026-11-10',
  category: '経費' as const,
};

export function EvidencePage() {
  const { state, saveEvidence } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const evidences = state.evidences.filter((ev) => matchesEvidence(query, ev));

  const capture = () => {
    inputRef.current?.click();
  };

  const onFile = (file: File | undefined) => {
    if (!file) {
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    const evidence: EvidenceRecord = {
      id: `ev-${crypto.randomUUID().slice(0, 8)}`,
      partnerName: SAMPLE_READ.partnerName,
      amount: SAMPLE_READ.amount,
      date: SAMPLE_READ.date,
      category: SAMPLE_READ.category,
      status: 'ready',
      journalIds: [],
      previewUrl,
      isSample: true,
    };
    saveEvidence(evidence);
    navigate(`/evidence/${evidence.id}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>証憑</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={capture}>撮影・添付</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <p>実在の書類は入れないでください。見本の読み取りのみです。</p>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="取引日・金額・取引先" />
        <IonList>
          {evidences.map((evidence) => (
            <IonItem
              key={evidence.id}
              button
              detail
              onClick={() => navigate(`/evidence/${evidence.id}`)}
            >
              <div
                slot="start"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: '#d7ddd8',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                }}
              >
                {evidence.status === 'uploading'
                  ? '…'
                  : evidence.status === 'failed'
                    ? '!'
                    : '📷'}
              </div>
              <IonLabel>
                <h2>{evidence.partnerName}</h2>
                <p>
                  {evidence.date} ·{' '}
                  {evidence.journalIds.length > 0
                    ? `紐付け ${evidence.journalIds.length}`
                    : '未紐付け'}
                </p>
              </IonLabel>
              <IonLabel slot="end">{formatYen(evidence.amount)}</IonLabel>
            </IonItem>
          ))}
        </IonList>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </IonContent>
    </IonPage>
  );
}

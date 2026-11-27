import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import {
  chatbubbleOutline,
  documentTextOutline,
  homeOutline,
  imagesOutline,
  listOutline,
} from 'ionicons/icons';

import { ChatHistoryPage } from './pages/ChatHistoryPage';
import { ChatPage } from './pages/ChatPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { DocumentEditPage } from './pages/DocumentEditPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { EvidenceLinkPage } from './pages/EvidenceLinkPage';
import { EvidencePage } from './pages/EvidencePage';
import { EvidenceReviewPage } from './pages/EvidenceReviewPage';
import { HomePage } from './pages/HomePage';
import { ImportPage } from './pages/ImportPage';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { JournalEditPage } from './pages/JournalEditPage';
import { LedgerPage } from './pages/LedgerPage';
import { PaymentPage } from './pages/PaymentPage';
import { PendingStatementsPage } from './pages/PendingStatementsPage';
import { QuickEntryPage } from './pages/QuickEntryPage';
import { SettingsPage } from './pages/SettingsPage';
import { StoreProvider } from './state/store';

export default function App() {
  return (
    <StoreProvider>
      <IonApp>
        <IonReactHashRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route path="/home" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              <Route path="/ledger" element={<LedgerPage />} />
              <Route path="/ledger/quick" element={<QuickEntryPage />} />
              <Route path="/ledger/import" element={<ImportPage />} />
              <Route path="/ledger/pending" element={<PendingStatementsPage />} />
              <Route path="/ledger/journals/:id" element={<JournalDetailPage />} />
              <Route
                path="/ledger/journals/:id/edit"
                element={<JournalEditPage />}
              />

              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/new" element={<DocumentEditPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route path="/documents/:id/edit" element={<DocumentEditPage />} />
              <Route path="/documents/:id/payment" element={<PaymentPage />} />

              <Route path="/evidence" element={<EvidencePage />} />
              <Route path="/evidence/:id" element={<EvidenceReviewPage />} />
              <Route path="/evidence/:id/link" element={<EvidenceLinkPage />} />

              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/history" element={<ChatHistoryPage />} />

              <Route path="/" element={<Navigate to="/home" replace />} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon icon={homeOutline} />
                <IonLabel>ホーム</IonLabel>
              </IonTabButton>
              <IonTabButton tab="ledger" href="/ledger">
                <IonIcon icon={listOutline} />
                <IonLabel>記帳</IonLabel>
              </IonTabButton>
              <IonTabButton tab="documents" href="/documents">
                <IonIcon icon={documentTextOutline} />
                <IonLabel>書類</IonLabel>
              </IonTabButton>
              <IonTabButton tab="evidence" href="/evidence">
                <IonIcon icon={imagesOutline} />
                <IonLabel>証憑</IonLabel>
              </IonTabButton>
              <IonTabButton tab="chat" href="/chat">
                <IonIcon icon={chatbubbleOutline} />
                <IonLabel>チャット</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactHashRouter>
      </IonApp>
    </StoreProvider>
  );
}

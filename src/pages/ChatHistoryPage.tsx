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
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';

export function ChatHistoryPage() {
  const { state, openChat } = useStore();
  const navigate = useNavigate();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/chat" />
          </IonButtons>
          <IonTitle>履歴</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {state.chatThreads.length === 0 && (
            <IonItem>
              <IonLabel>会話がありません</IonLabel>
            </IonItem>
          )}
          {state.chatThreads.map((thread) => (
            <IonItem
              key={thread.id}
              button
              onClick={() => {
                openChat(thread.id);
                navigate('/chat', { replace: true });
              }}
            >
              <IonLabel>{thread.title}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}

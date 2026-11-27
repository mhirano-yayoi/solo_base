import { useRef, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';

export function ChatPage() {
  const { state, askChat, newChat } = useStore();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const active = state.chatThreads.find((t) => t.id === state.activeChatId);

  const send = () => {
    const question = text.trim();
    if (!question) {
      return;
    }
    askChat(question);
    setText('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => navigate('/chat/history')}>履歴</IonButton>
          </IonButtons>
          <IonTitle>チャット</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={newChat}>新規</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {(active?.messages ?? []).map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent:
                message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 12px',
                borderRadius: 14,
                background:
                  message.role === 'user' ? '#1b4d3e' : '#ffffff',
                color: message.role === 'user' ? '#fff' : '#1a1f1c',
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        {!active && (
          <p>未入金の件数や売上など、メモリ上のデータについて聞けます。</p>
        )}
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton aria-label="添付" onClick={() => fileRef.current?.click()}>
              <IonIcon slot="icon-only" icon={addOutline} />
            </IonButton>
          </IonButtons>
          <IonItem lines="none">
            <IonInput
              placeholder="質問を書く"
              value={text}
              onIonInput={(e) => setText(e.detail.value ?? '')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  send();
                }
              }}
            />
          </IonItem>
          <IonButtons slot="end">
            <IonButton onClick={send}>送る</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
      <input ref={fileRef} type="file" hidden />
    </IonPage>
  );
}

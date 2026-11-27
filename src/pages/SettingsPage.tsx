import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import type { RoundingMode, TaxRate, WithholdingBase } from '@/domain';
import { useStore } from '@/state/store';

const UNIMPLEMENTED = [
  { name: 'e-Tax 送信', reason: 'データを外部へ送らないため' },
  { name: '確定申告書', reason: '申告書の作成は今回の範囲外のため' },
  { name: '銀行 API', reason: '外部サーバーと連携しないため' },
  { name: '列マッピング', reason: 'CSV の列を日付・摘要・金額に固定するため' },
  { name: '帳票と決算書', reason: '仕訳帳・元帳・試算表を作らないため' },
  { name: '源泉の年間一覧', reason: '年間の集計は申告の範囲のため' },
  { name: '100 万円超の源泉', reason: 'デモの請求は税込 100 万円以下のため' },
  {
    name: '証憑の解像度チェックとタイムスタンプ',
    reason: '見本の読み取りだけを置くため',
  },
  { name: '在庫', reason: '在庫を持たない業種を対象にするため' },
  { name: '部門', reason: '一人事業で部門を分けないため' },
  { name: '給与', reason: '従業員を雇わないため' },
  { name: '法人税', reason: '個人事業主を対象にするため' },
];

export function SettingsPage() {
  const { state, updateSettings, resetDemo } = useStore();
  const navigate = useNavigate();
  const { settings, partners } = state;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>設定</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonListHeader>
            <IonLabel>事業者</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonInput
              label="事業者名"
              labelPlacement="stacked"
              value={settings.name}
              onIonInput={(e) =>
                updateSettings({ name: e.detail.value ?? '' })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="登録番号"
              labelPlacement="stacked"
              value={settings.registrationNumber}
              onIonInput={(e) =>
                updateSettings({
                  registrationNumber: e.detail.value ?? '',
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="振込先"
              labelPlacement="stacked"
              value={settings.bankAccount}
              onIonInput={(e) =>
                updateSettings({ bankAccount: e.detail.value ?? '' })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="集計開始日"
              labelPlacement="stacked"
              type="date"
              value={settings.periodStart}
              onIonInput={(e) =>
                updateSettings({ periodStart: e.detail.value ?? '' })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="集計終了日"
              labelPlacement="stacked"
              type="date"
              value={settings.periodEnd}
              onIonInput={(e) =>
                updateSettings({ periodEnd: e.detail.value ?? '' })
              }
            />
          </IonItem>
        </IonList>

        <IonList inset>
          <IonListHeader>
            <IonLabel>取引先</IonLabel>
          </IonListHeader>
          {partners.map((partner) => (
            <IonItem key={partner.id}>
              <IonLabel>
                <h2>{partner.name}</h2>
                <p>{partner.withholding ? '源泉あり' : '源泉なし'}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonList inset>
          <IonListHeader>
            <IonLabel>税の既定値</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonSelect
              label="初期税率"
              labelPlacement="stacked"
              value={settings.defaultTaxRate}
              onIonChange={(e) =>
                updateSettings({
                  defaultTaxRate: e.detail.value as TaxRate,
                })
              }
            >
              <IonSelectOption value={10}>10%</IonSelectOption>
              <IonSelectOption value={8}>8%</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonSelect
              label="源泉の基準"
              labelPlacement="stacked"
              value={settings.withholdingBase}
              onIonChange={(e) =>
                updateSettings({
                  withholdingBase: e.detail.value as WithholdingBase,
                })
              }
            >
              <IonSelectOption value="exclusive">税抜</IonSelectOption>
              <IonSelectOption value="inclusive">税込</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonSelect
              label="消費税の端数"
              labelPlacement="stacked"
              value={settings.rounding}
              onIonChange={(e) =>
                updateSettings({
                  rounding: e.detail.value as RoundingMode,
                })
              }
            >
              <IonSelectOption value="floor">切捨て</IonSelectOption>
              <IonSelectOption value="round">四捨五入</IonSelectOption>
              <IonSelectOption value="ceil">切上げ</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonToggle
              checked={settings.showUnimplemented}
              onIonChange={(e) =>
                updateSettings({ showUnimplemented: e.detail.checked })
              }
            >
              未実装の機能
            </IonToggle>
          </IonItem>
        </IonList>

        {settings.showUnimplemented && (
          <IonList inset>
            <IonListHeader>
              <IonLabel>未実装の機能</IonLabel>
            </IonListHeader>
            {UNIMPLEMENTED.map((item) => (
              <IonItem key={item.name}>
                <IonLabel>
                  <h2>{item.name}</h2>
                  <p>{item.reason}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        <div className="ion-padding">
          <IonButton
            expand="block"
            color="medium"
            onClick={() => {
              resetDemo();
              navigate('/home', { replace: true });
            }}
          >
            デモに戻す
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

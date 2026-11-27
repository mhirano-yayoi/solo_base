import { useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonPopover,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { ellipsisHorizontal } from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { calculateInvoiceTax } from '@/domain';
import { formatYen } from '@/lib/format';
import type { DocumentKind } from '@/state/types';
import { useStore } from '@/state/store';

const CONVERT_OPTIONS: Record<DocumentKind, DocumentKind[]> = {
  quote: ['delivery', 'invoice'],
  delivery: ['invoice'],
  invoice: ['quote'],
};

const KIND_LABEL: Record<DocumentKind, string> = {
  invoice: '請求書',
  quote: '見積書',
  delivery: '納品書',
};

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    issueDocument,
    deleteDocument,
    duplicateDocument,
    convertDocument,
  } = useStore();
  const navigate = useNavigate();
  const [present] = useIonToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [issueMenuOpen, setIssueMenuOpen] = useState(false);
  const doc = state.documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/documents" />
            </IonButtons>
            <IonTitle>書類</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">見つかりません</IonContent>
      </IonPage>
    );
  }

  const tax =
    doc.bakedByRate != null
      ? {
          byRate: doc.bakedByRate,
          inclusiveTotal: doc.bakedInclusiveTotal ?? 0,
          withholdingTax: doc.bakedWithholdingTax ?? 0,
          netPayable:
            (doc.bakedInclusiveTotal ?? 0) - (doc.bakedWithholdingTax ?? 0),
        }
      : calculateInvoiceTax(
          doc.lines.map((line) => ({
            amountInclusive: line.quantity * line.unitPriceInclusive,
            taxRate: line.taxRate,
          })),
          {
            rounding: doc.rounding,
            withholdingBase: doc.withholdingBase,
            applyWithholding: doc.applyWithholding,
          },
        );

  const shareOrDownload = async (mode: 'download' | 'share') => {
    const body = [
      `${KIND_LABEL[doc.kind]} ${doc.number}`,
      `宛名: ${doc.partnerName}`,
      `税込合計: ${formatYen(tax.inclusiveTotal)}`,
      ...(doc.applyWithholding
        ? [`源泉: ${formatYen(tax.withholdingTax)}`, `差引: ${formatYen(tax.netPayable)}`]
        : []),
    ].join('\n');
    const blob = new Blob([body], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    if (mode === 'download') {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.number}.pdf`;
      a.click();
    } else if (navigator.share) {
      await navigator.share({
        title: doc.number,
        text: body,
      });
    } else {
      present({ message: '共有に対応していません。ダウンロードを使ってください', duration: 2000 });
    }
    URL.revokeObjectURL(url);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/documents" />
          </IonButtons>
          <IonTitle>{KIND_LABEL[doc.kind]}</IonTitle>
          <IonButtons slot="end">
            <IonButton id="doc-menu" onClick={() => setMenuOpen(true)}>
              <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonLabel>
              <p>番号</p>
              <h2>{doc.number}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>宛名</p>
              <h2>{doc.partnerName}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>状態</p>
              <h2>
                {doc.status === 'draft'
                  ? '下書き'
                  : doc.status === 'unpaid'
                    ? '未入金'
                    : '入金済み'}
              </h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>日付</p>
              <h2>
                {doc.issueDate} / 期限 {doc.dueDate}
              </h2>
            </IonLabel>
          </IonItem>
          {doc.kind === 'invoice' && (
            <IonItem>
              <IonLabel>
                <p>発行者</p>
                <h2>{state.settings.name}</h2>
                <p>{state.settings.registrationNumber}</p>
                <p>{state.settings.bankAccount}</p>
              </IonLabel>
            </IonItem>
          )}
        </IonList>
        <IonList inset>
          {doc.lines.map((line) => (
            <IonItem key={line.id}>
              <IonLabel>
                <h2>{line.name || '（品名なし）'}</h2>
                <p>
                  {line.quantity} × {formatYen(line.unitPriceInclusive)} ·{' '}
                  {line.taxRate}%
                  {line.taxRate === 8 ? '（軽減税率）' : ''}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonList inset>
          {tax.byRate.map((row) => (
            <IonItem key={row.taxRate}>
              <IonLabel>
                <h2>{row.taxRate}%</h2>
                <p>
                  税抜 {formatYen(row.exclusive)} / 税 {formatYen(row.tax)} /
                  税込 {formatYen(row.inclusive)}
                </p>
              </IonLabel>
            </IonItem>
          ))}
          <IonItem>
            <IonLabel>
              <h2>税込合計 {formatYen(tax.inclusiveTotal)}</h2>
              {doc.applyWithholding && (
                <p>
                  源泉 {formatYen(tax.withholdingTax)} / 差引{' '}
                  {formatYen(tax.netPayable)}
                </p>
              )}
            </IonLabel>
          </IonItem>
        </IonList>
        {doc.status === 'draft' && (
          <div className="ion-padding">
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => navigate(`/documents/${doc.id}/edit`)}
            >
              編集
            </IonButton>
          </div>
        )}
        {doc.status === 'unpaid' && (
          <div className="ion-padding">
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => navigate(`/documents/${doc.id}/payment`)}
            >
              入金
            </IonButton>
          </div>
        )}
      </IonContent>

      {doc.kind === 'invoice' && doc.status === 'draft' && (
        <IonFooter>
          <IonToolbar>
            <IonButton
              id="issue-menu"
              expand="block"
              className="ion-margin"
              onClick={() => setIssueMenuOpen(true)}
            >
              発行
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}

      <IonPopover
        isOpen={menuOpen}
        trigger="doc-menu"
        onDidDismiss={() => setMenuOpen(false)}
        showBackdrop={false}
      >
        <IonList>
          <IonItem
            button
            onClick={() => {
              setMenuOpen(false);
              const nextId = duplicateDocument(doc.id);
              navigate(`/documents/${nextId}`);
            }}
          >
            複製
          </IonItem>
          {CONVERT_OPTIONS[doc.kind].map((kind) => (
            <IonItem
              key={kind}
              button
              onClick={() => {
                setMenuOpen(false);
                const nextId = convertDocument(doc.id, kind);
                navigate(`/documents/${nextId}`);
              }}
            >
              {KIND_LABEL[kind]}へ変換
            </IonItem>
          ))}
          <IonItem
            button
            onClick={() => {
              setMenuOpen(false);
              deleteDocument(doc.id);
              navigate('/documents', { replace: true });
            }}
          >
            削除
          </IonItem>
        </IonList>
      </IonPopover>

      <IonPopover
        isOpen={issueMenuOpen}
        trigger="issue-menu"
        onDidDismiss={() => setIssueMenuOpen(false)}
        showBackdrop={false}
      >
        <IonList>
          <IonItem
            button
            onClick={async () => {
              setIssueMenuOpen(false);
              issueDocument(doc.id);
              await shareOrDownload('download');
              present({ message: '発行しました（PDFをダウンロード）', duration: 1600 });
            }}
          >
            PDFをダウンロード
          </IonItem>
          <IonItem
            button
            onClick={async () => {
              setIssueMenuOpen(false);
              issueDocument(doc.id);
              await shareOrDownload('share');
              present({ message: '発行しました', duration: 1600 });
            }}
          >
            アプリで共有
          </IonItem>
        </IonList>
      </IonPopover>
    </IonPage>
  );
}

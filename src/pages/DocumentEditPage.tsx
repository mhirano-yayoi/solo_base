import { useMemo, useState } from 'react';
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
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { calculateInvoiceTax, type RoundingMode, type TaxRate, type WithholdingBase } from '@/domain';
import { formatYen } from '@/lib/format';
import type { DocumentKind, DocumentLine, DocumentRecord } from '@/state/types';
import { createEmptyDocument, useStore } from '@/state/store';

function parseKind(search: string): DocumentKind {
  const value = new URLSearchParams(search).get('kind');
  if (value === 'quote' || value === 'delivery' || value === 'invoice') {
    return value;
  }
  return 'invoice';
}

export function DocumentEditPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = id === 'new' || !id;
  const { state, saveDocument } = useStore();
  const navigate = useNavigate();
  const [present] = useIonToast();

  const initial = useMemo(() => {
    if (!isNew) {
      return state.documents.find((d) => d.id === id) ?? null;
    }
    const kind = parseKind(location.search);
    const partner = state.partners[0];
    return createEmptyDocument({
      kind,
      settings: state.settings,
      partnerId: partner?.id ?? '',
      partnerName: partner?.name ?? '',
      applyWithholding: partner?.withholding ?? false,
      defaultTaxRate: state.settings.defaultTaxRate,
    });
  }, [id, isNew, location.search, state.documents, state.partners, state.settings]);

  const [doc, setDoc] = useState<DocumentRecord | null>(initial);

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

  if (doc.status !== 'draft') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={`/documents/${doc.id}`} />
            </IonButtons>
            <IonTitle>編集不可</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          発行済みの書類は編集できません。
        </IonContent>
      </IonPage>
    );
  }

  const tax = calculateInvoiceTax(
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

  const updateLine = (lineId: string, patch: Partial<DocumentLine>) => {
    setDoc({
      ...doc,
      lines: doc.lines.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line,
      ),
    });
  };

  const save = () => {
    try {
      saveDocument(doc);
      navigate(`/documents/${doc.id}`, { replace: true });
    } catch (error) {
      present({
        message: error instanceof Error ? error.message : '保存に失敗しました',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  const title =
    doc.kind === 'invoice'
      ? '請求書'
      : doc.kind === 'quote'
        ? '見積書'
        : '納品書';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/documents" />
          </IonButtons>
          <IonTitle>{isNew ? `${title}の作成` : `${title}の編集`}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save}>保存</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonInput
              label="番号"
              labelPlacement="stacked"
              value={doc.number}
              onIonInput={(e) => setDoc({ ...doc, number: e.detail.value ?? '' })}
            />
          </IonItem>
          <IonItem>
            <IonSelect
              label="宛名"
              labelPlacement="stacked"
              value={doc.partnerId}
              onIonChange={(e) => {
                const partner = state.partners.find((p) => p.id === e.detail.value);
                if (!partner) {
                  return;
                }
                setDoc({
                  ...doc,
                  partnerId: partner.id,
                  partnerName: partner.name,
                  applyWithholding: partner.withholding,
                });
              }}
            >
              {state.partners.map((partner) => (
                <IonSelectOption key={partner.id} value={partner.id}>
                  {partner.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonInput
              label={doc.kind === 'delivery' ? '納品日' : '取引年月日'}
              labelPlacement="stacked"
              type="date"
              value={doc.issueDate}
              onIonInput={(e) =>
                setDoc({ ...doc, issueDate: e.detail.value ?? '' })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              label={doc.kind === 'quote' ? '有効期限' : '支払期限'}
              labelPlacement="stacked"
              type="date"
              value={doc.dueDate}
              onIonInput={(e) =>
                setDoc({ ...doc, dueDate: e.detail.value ?? '' })
              }
            />
          </IonItem>
          {doc.kind === 'invoice' && (
            <IonItem>
              <IonLabel>
                <p>発行者 / 登録番号 / 振込先</p>
                <h2>{state.settings.name}</h2>
                <p>{state.settings.registrationNumber}</p>
                <p>{state.settings.bankAccount}</p>
              </IonLabel>
            </IonItem>
          )}
        </IonList>

        {!isNew && (
          <IonList inset>
            <IonListHeader>
              <IonLabel>この書類だけの上書き</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonSelect
                label="源泉の基準"
                labelPlacement="stacked"
                value={doc.withholdingBase}
                onIonChange={(e) =>
                  setDoc({
                    ...doc,
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
                label="端数処理"
                labelPlacement="stacked"
                value={doc.rounding}
                onIonChange={(e) =>
                  setDoc({ ...doc, rounding: e.detail.value as RoundingMode })
                }
              >
                <IonSelectOption value="floor">切捨て</IonSelectOption>
                <IonSelectOption value="round">四捨五入</IonSelectOption>
                <IonSelectOption value="ceil">切上げ</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        )}

        <IonList inset>
          <IonListHeader>
            <IonLabel>品目</IonLabel>
          </IonListHeader>
          {doc.lines.map((line) => (
            <div key={line.id}>
              <IonItem>
                <IonInput
                  label="品名"
                  labelPlacement="stacked"
                  value={line.name}
                  onIonInput={(e) =>
                    updateLine(line.id, { name: e.detail.value ?? '' })
                  }
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="数量"
                  labelPlacement="stacked"
                  type="number"
                  value={String(line.quantity)}
                  onIonInput={(e) =>
                    updateLine(line.id, {
                      quantity: Number(e.detail.value ?? 0),
                    })
                  }
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="単価（税込）"
                  labelPlacement="stacked"
                  type="number"
                  value={String(line.unitPriceInclusive)}
                  onIonInput={(e) =>
                    updateLine(line.id, {
                      unitPriceInclusive: Number(e.detail.value ?? 0),
                    })
                  }
                />
              </IonItem>
              <IonItem>
                <IonSelect
                  label="税率"
                  labelPlacement="stacked"
                  value={line.taxRate}
                  onIonChange={(e) =>
                    updateLine(line.id, {
                      taxRate: e.detail.value as TaxRate,
                    })
                  }
                >
                  <IonSelectOption value={10}>10%</IonSelectOption>
                  <IonSelectOption value={8}>8%（軽減税率）</IonSelectOption>
                </IonSelect>
              </IonItem>
              {line.taxRate === 8 && (
                <IonItem>
                  <IonLabel color="medium">軽減税率の対象です</IonLabel>
                </IonItem>
              )}
            </div>
          ))}
          <IonItem
            button
            onClick={() =>
              setDoc({
                ...doc,
                lines: [
                  ...doc.lines,
                  {
                    id: `dl-${crypto.randomUUID().slice(0, 8)}`,
                    name: '',
                    quantity: 1,
                    unitPriceInclusive: 0,
                    taxRate: state.settings.defaultTaxRate,
                  },
                ],
              })
            }
          >
            品目を追加
          </IonItem>
        </IonList>

        <IonList inset>
          <IonListHeader>
            <IonLabel>税の内訳</IonLabel>
          </IonListHeader>
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
      </IonContent>
    </IonPage>
  );
}

export type TaxRate = 10 | 8;

export type RoundingMode = 'floor' | 'round' | 'ceil';

export type WithholdingBase = 'exclusive' | 'inclusive';

export const WITHHOLDING_RATE = 0.1021;

export type LineInput = {
  amountInclusive: number;
  taxRate: TaxRate;
};

export type TaxBreakdownRow = {
  taxRate: TaxRate;
  exclusive: number;
  tax: number;
  inclusive: number;
};

export type InvoiceTaxResult = {
  byRate: TaxBreakdownRow[];
  exclusiveTotal: number;
  taxTotal: number;
  inclusiveTotal: number;
  withholdingBaseAmount: number;
  withholdingTax: number;
  netPayable: number;
};

function applyRounding(value: number, mode: RoundingMode): number {
  switch (mode) {
    case 'floor':
      return Math.floor(value);
    case 'round':
      return Math.round(value);
    case 'ceil':
      return Math.ceil(value);
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export function splitInclusive(
  amountInclusive: number,
  taxRate: TaxRate,
  rounding: RoundingMode,
): { exclusive: number; tax: number; inclusive: number } {
  const taxRaw = (amountInclusive * taxRate) / (100 + taxRate);
  const tax = applyRounding(taxRaw, rounding);
  const exclusive = amountInclusive - tax;
  return { exclusive, tax, inclusive: amountInclusive };
}

export function calculateInvoiceTax(
  lines: LineInput[],
  options: {
    rounding: RoundingMode;
    withholdingBase: WithholdingBase;
    applyWithholding: boolean;
  },
): InvoiceTaxResult {
  const rates: TaxRate[] = [10, 8];
  const byRate: TaxBreakdownRow[] = [];

  for (const taxRate of rates) {
    const inclusive = lines
      .filter((line) => line.taxRate === taxRate)
      .reduce((sum, line) => sum + line.amountInclusive, 0);
    if (inclusive === 0) {
      continue;
    }
    const split = splitInclusive(inclusive, taxRate, options.rounding);
    byRate.push({
      taxRate,
      exclusive: split.exclusive,
      tax: split.tax,
      inclusive: split.inclusive,
    });
  }

  const exclusiveTotal = byRate.reduce((sum, row) => sum + row.exclusive, 0);
  const taxTotal = byRate.reduce((sum, row) => sum + row.tax, 0);
  const inclusiveTotal = byRate.reduce((sum, row) => sum + row.inclusive, 0);

  const withholdingBaseAmount =
    options.withholdingBase === 'exclusive' ? exclusiveTotal : inclusiveTotal;
  const withholdingTax = options.applyWithholding
    ? applyRounding(withholdingBaseAmount * WITHHOLDING_RATE, options.rounding)
    : 0;

  return {
    byRate,
    exclusiveTotal,
    taxTotal,
    inclusiveTotal,
    withholdingBaseAmount,
    withholdingTax,
    netPayable: inclusiveTotal - withholdingTax,
  };
}

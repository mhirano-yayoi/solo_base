import { describe, expect, it } from 'vitest';
import { calculateInvoiceTax } from './tax';

describe('calculateInvoiceTax', () => {
  it('税率ごとに税抜・消費税・税込を出す（切捨て）', () => {
    const result = calculateInvoiceTax(
      [
        { amountInclusive: 11000, taxRate: 10 },
        { amountInclusive: 5400, taxRate: 8 },
      ],
      {
        rounding: 'floor',
        withholdingBase: 'exclusive',
        applyWithholding: false,
      },
    );

    expect(result.byRate).toEqual([
      { taxRate: 10, exclusive: 10000, tax: 1000, inclusive: 11000 },
      { taxRate: 8, exclusive: 5000, tax: 400, inclusive: 5400 },
    ]);
    expect(result.inclusiveTotal).toBe(16400);
    expect(result.withholdingTax).toBe(0);
  });

  it('源泉を税抜基準で計算する', () => {
    const result = calculateInvoiceTax(
      [{ amountInclusive: 110000, taxRate: 10 }],
      {
        rounding: 'floor',
        withholdingBase: 'exclusive',
        applyWithholding: true,
      },
    );

    expect(result.exclusiveTotal).toBe(100000);
    expect(result.withholdingTax).toBe(10210);
    expect(result.netPayable).toBe(99790);
  });

  it('源泉を税込基準で計算する', () => {
    const result = calculateInvoiceTax(
      [{ amountInclusive: 110000, taxRate: 10 }],
      {
        rounding: 'floor',
        withholdingBase: 'inclusive',
        applyWithholding: true,
      },
    );

    expect(result.withholdingBaseAmount).toBe(110000);
    expect(result.withholdingTax).toBe(11231);
  });
});

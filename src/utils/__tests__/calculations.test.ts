import { describe, it, expect } from 'vitest';
import { 
  calculateDaysIdle, 
  evaluateStockEngine, 
  generateOwnerReport, 
  formatCurrency 
} from '../calculations';
import { StockItem, RulesConfig } from '../../types';
import { AMBATTUR_FABRICATION_SAMPLE, DEFAULT_RULES } from '../../data/initialData';

describe('Factory Inventory Calculations Engine', () => {
  describe('calculateDaysIdle', () => {
    it('calculates days between asOfDate and lastMovement accurately', () => {
      const days = calculateDaysIdle('2026-10-01', '2026-09-01');
      expect(days).toBe(30);
    });

    it('returns 0 if last movement is same day or future date', () => {
      expect(calculateDaysIdle('2026-10-01', '2026-10-01')).toBe(0);
      expect(calculateDaysIdle('2026-10-01', '2026-10-05')).toBe(0);
    });

    it('handles leap year calculations correctly', () => {
      // 2024 was a leap year (Feb 29)
      const days = calculateDaysIdle('2024-03-01', '2024-02-01');
      expect(days).toBe(29);
    });

    it('returns 0 when dates are missing or invalid', () => {
      expect(calculateDaysIdle('', '2026-09-01')).toBe(0);
      expect(calculateDaysIdle('2026-10-01', '')).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats INR using traditional Indian comma numbering system', () => {
      expect(formatCurrency(645650, 'INR')).toBe('₹6,45,650');
      expect(formatCurrency(12500000, 'INR')).toBe('₹1,25,00,000');
      expect(formatCurrency(0, 'INR')).toBe('₹0');
    });

    it('handles null and NaN gracefully', () => {
      expect(formatCurrency(NaN, 'INR')).toBe('₹0');
    });
  });

  describe('evaluateStockEngine - Core Logic & Excel Parity', () => {
    const testRules: RulesConfig = {
      asOfDate: '2026-10-01',
      deadThresholdDays: 180,
      slowThresholdDays: 90,
      classACutoff: 80,
      classBCutoff: 95,
      holdingCostPercent: 18,
    };

    const mockItems: StockItem[] = [
      {
        id: '1',
        itemCode: 'ITEM-A',
        itemName: 'High Value Moving',
        category: 'Raw Material',
        qtyOnHand: 100,
        costRate: 1000, // closingValue = 100,000
        lastMovement: '2026-09-15', // ~16 days -> Moving
      },
      {
        id: '2',
        itemCode: 'ITEM-B',
        itemName: 'Medium Value Slow',
        category: 'Finished Goods',
        qtyOnHand: 200,
        costRate: 100, // closingValue = 20,000
        lastMovement: '2026-06-01', // ~122 days -> Slow
      },
      {
        id: '3',
        itemCode: 'ITEM-C',
        itemName: 'Low Value Dead',
        category: 'Spares',
        qtyOnHand: 50,
        costRate: 100, // closingValue = 5,000
        lastMovement: '2025-10-01', // 365 days -> Dead
      },
    ];

    it('accurately computes closingValue as qtyOnHand * costRate', () => {
      const evaluated = evaluateStockEngine(mockItems, testRules);
      expect(evaluated.find(i => i.id === '1')?.closingValue).toBe(100000);
      expect(evaluated.find(i => i.id === '2')?.closingValue).toBe(20000);
      expect(evaluated.find(i => i.id === '3')?.closingValue).toBe(5000);
    });

    it('classifies stock status strictly according to thresholds', () => {
      const evaluated = evaluateStockEngine(mockItems, testRules);
      expect(evaluated.find(i => i.id === '1')?.status).toBe('Moving');
      expect(evaluated.find(i => i.id === '2')?.status).toBe('Slow');
      expect(evaluated.find(i => i.id === '3')?.status).toBe('Dead');
    });

    it('assigns Pareto ABC classes based on descending value rank and cumulative %', () => {
      const evaluated = evaluateStockEngine(mockItems, testRules);
      // Total = 125,000
      // Item 1: 100,000 = 80.0% -> Class A
      // Item 2: 20,000 = +16% -> 96.0% -> Class B
      // Item 3: 5,000 = +4% -> 100.0% -> Class C
      expect(evaluated.find(i => i.id === '1')?.abcClass).toBe('A');
      expect(evaluated.find(i => i.id === '2')?.abcClass).toBe('B');
      expect(evaluated.find(i => i.id === '3')?.abcClass).toBe('C');
    });

    it('generates exact industrial action sentences matching operational rules', () => {
      const evaluated = evaluateStockEngine(mockItems, testRules);
      expect(evaluated.find(i => i.id === '1')?.action).toBe('Protect it, do not stock out.');
      expect(evaluated.find(i => i.id === '2')?.action).toBe('Freeze purchase.');
      expect(evaluated.find(i => i.id === '3')?.action).toBe('Stop buying. Liquidate or write off.');
    });
  });

  describe('generateOwnerReport - Executive Summary Invariants', () => {
    it('verifies mathematical conservation: deadCash + slowCash + movingCash === totalStockValue', () => {
      const report = generateOwnerReport(AMBATTUR_FABRICATION_SAMPLE, DEFAULT_RULES);
      expect(report.totalStockValue).toBe(report.deadCash + report.slowCash + report.movingCash);
    });

    it('verifies item count conservation: dead + slow + moving === total items', () => {
      const report = generateOwnerReport(AMBATTUR_FABRICATION_SAMPLE, DEFAULT_RULES);
      expect(report.totalItemCount).toBe(
        report.deadItemCount + report.slowItemCount + report.movingItemCount
      );
    });

    it('verifies ageing buckets sum to totalStockValue', () => {
      const report = generateOwnerReport(AMBATTUR_FABRICATION_SAMPLE, DEFAULT_RULES);
      const ageingSum = 
        report.ageingBreakdown.range0_30 + 
        report.ageingBreakdown.range31_89 + 
        report.ageingBreakdown.range90_179 + 
        report.ageingBreakdown.range180_plus;
      expect(ageingSum).toBe(report.totalStockValue);
    });

    it('calculates annual holding burn correctly as deadCash * holdingCostRate', () => {
      const report = generateOwnerReport(AMBATTUR_FABRICATION_SAMPLE, DEFAULT_RULES);
      const expectedBurn = Math.round(report.deadCash * (DEFAULT_RULES.holdingCostPercent / 100));
      expect(report.annualHoldingBurn).toBe(expectedBurn);
    });

    it('handles empty inventory array without throwing error', () => {
      const emptyReport = generateOwnerReport([], DEFAULT_RULES);
      expect(emptyReport.totalStockValue).toBe(0);
      expect(emptyReport.deadCash).toBe(0);
      expect(emptyReport.totalItemCount).toBe(0);
      expect(emptyReport.deadCashPercent).toBe(0);
    });
  });
});

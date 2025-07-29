# 07 - Advanced Calculator

## Advanced Calculator Features
Implement sophisticated calculation features to enhance the project cost calculator with advanced business logic and analytics.

## Multi-Currency Support
### Real-time Currency Conversion
- **Live Exchange Rates**: Integration with currency APIs
- **Base Currency**: USD as default, configurable per project
- **Conversion History**: Track rate changes over time
- **Offline Support**: Cached rates for offline calculations

### Implementation
```typescript
interface CurrencyConfig {
  baseCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
  lastUpdated: Date;
  source: string;
}

class AdvancedCurrencyService {
  private ratesCache: Map<string, CurrencyConfig> = new Map();
  private readonly UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

  async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const cacheKey = `${fromCurrency}-${toCurrency}`;
    const cached = this.ratesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.UPDATE_INTERVAL) {
      return cached.exchangeRate;
    }

    // Fetch from API
    const rate = await this.fetchLiveRate(fromCurrency, toCurrency);
    this.ratesCache.set(cacheKey, {
      baseCurrency: fromCurrency,
      targetCurrency: toCurrency,
      exchangeRate: rate,
      lastUpdated: new Date(),
      source: 'api'
    });

    return rate;
  }
}
```

## Tax Calculation Engine
### Advanced Tax Features
- **Multiple Tax Types**: VAT, GST, Sales Tax, Income Tax
- **Tax Brackets**: Progressive tax calculation
- **Tax Exemptions**: Configurable exemptions per role/category
- **Regional Tax Rules**: Country-specific tax calculations

### Implementation
```typescript
interface TaxConfig {
  type: 'vat' | 'gst' | 'sales_tax' | 'income_tax';
  rate: number;
  country: string;
  region?: string;
  exemptions: string[];
  brackets?: TaxBracket[];
}

interface TaxBracket {
  minAmount: number;
  maxAmount?: number;
  rate: number;
}

class TaxCalculator {
  private taxConfigs: Map<string, TaxConfig> = new Map();

  calculateTax(amount: number, country: string, taxType: string): number {
    const config = this.taxConfigs.get(`${country}-${taxType}`);
    if (!config) return 0;

    if (config.brackets) {
      return this.calculateProgressiveTax(amount, config.brackets);
    }

    return amount * (config.rate / 100);
  }

  private calculateProgressiveTax(amount: number, brackets: TaxBracket[]): number {
    let totalTax = 0;
    let remainingAmount = amount;

    for (const bracket of brackets) {
      if (remainingAmount <= 0) break;

      const bracketAmount = Math.min(
        remainingAmount,
        (bracket.maxAmount || Infinity) - bracket.minAmount
      );

      totalTax += bracketAmount * (bracket.rate / 100);
      remainingAmount -= bracketAmount;
    }

    return totalTax;
  }
}
```

## Discount System
### Flexible Discount Engine
- **Percentage Discounts**: Fixed percentage off total
- **Fixed Amount Discounts**: Specific amount reduction
- **Tiered Discounts**: Volume-based discounting
- **Time-based Discounts**: Seasonal or promotional discounts
- **Role-based Discounts**: Discounts for specific roles

### Implementation
```typescript
interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  conditions: DiscountCondition[];
  priority: number;
  validFrom: Date;
  validTo?: Date;
}

interface DiscountCondition {
  field: 'total_amount' | 'role_count' | 'project_duration' | 'client_type';
  operator: 'equals' | 'greater_than' | 'less_than' | 'in';
  value: any;
}

class DiscountCalculator {
  private discountRules: DiscountRule[] = [];

  calculateDiscounts(project: Project): DiscountResult[] {
    const applicableDiscounts = this.discountRules
      .filter(rule => this.isRuleApplicable(rule, project))
      .sort((a, b) => b.priority - a.priority);

    return applicableDiscounts.map(rule => ({
      ruleId: rule.id,
      ruleName: rule.name,
      discountAmount: this.calculateDiscountAmount(rule, project),
      type: rule.type
    }));
  }

  private calculateDiscountAmount(rule: DiscountRule, project: Project): number {
    const subtotal = project.totalCost;

    switch (rule.type) {
      case 'percentage':
        return subtotal * (rule.value / 100);
      case 'fixed':
        return Math.min(rule.value, subtotal);
      case 'tiered':
        return this.calculateTieredDiscount(rule, subtotal);
      default:
        return 0;
    }
  }
}
```

## Time Tracking Integration
### Advanced Time Features
- **Time Estimation**: AI-powered time estimates
- **Actual vs Estimated**: Track variance
- **Time Categories**: Billable vs non-billable hours
- **Overtime Calculation**: Premium rates for overtime
- **Time Zones**: Multi-timezone support

### Implementation
```typescript
interface TimeEntry {
  id: string;
  projectId: string;
  roleId: string;
  userId: string;
  date: Date;
  hours: number;
  billableHours: number;
  rate: number;
  timezone: string;
  description: string;
  category: 'development' | 'design' | 'meeting' | 'research';
}

class TimeTrackingService {
  async calculateActualCosts(projectId: string): Promise<TimeCostSummary> {
    const timeEntries = await this.getTimeEntries(projectId);
    
    const summary = timeEntries.reduce((acc, entry) => {
      const roleKey = entry.roleId;
      if (!acc.roles[roleKey]) {
        acc.roles[roleKey] = {
          totalHours: 0,
          billableHours: 0,
          totalCost: 0
        };
      }

      acc.roles[roleKey].totalHours += entry.hours;
      acc.roles[roleKey].billableHours += entry.billableHours;
      acc.roles[roleKey].totalCost += entry.billableHours * entry.rate;
      acc.totalCost += entry.billableHours * entry.rate;

      return acc;
    }, { roles: {}, totalCost: 0 });

    return summary;
  }
}
```

## Risk Assessment
### Project Risk Analysis
- **Cost Overrun Risk**: Probability and impact analysis
- **Schedule Risk**: Time estimation accuracy
- **Resource Risk**: Availability and skill gaps
- **Market Risk**: Currency and rate fluctuations

### Implementation
```typescript
interface RiskFactor {
  category: 'cost' | 'schedule' | 'resource' | 'market';
  probability: number; // 0-1
  impact: number; // 0-1
  description: string;
  mitigation: string;
}

class RiskAnalyzer {
  calculateProjectRisk(project: Project, riskFactors: RiskFactor[]): RiskAssessment {
    const riskScore = riskFactors.reduce((total, factor) => {
      return total + (factor.probability * factor.impact);
    }, 0) / riskFactors.length;

    return {
      overallRisk: riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      factors: riskFactors,
      recommendations: this.generateRecommendations(riskFactors)
    };
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 0.25) return 'low';
    if (score < 0.5) return 'medium';
    if (score < 0.75) return 'high';
    return 'critical';
  }
}
```

## Profitability Analysis
### Advanced Profit Calculations
- **Gross Profit Margin**: Revenue minus direct costs
- **Net Profit Margin**: After all expenses
- **Break-even Analysis**: Point of profitability
- **ROI Calculation**: Return on investment
- **Cash Flow Projection**: Future cash flow analysis

### Implementation
```typescript
interface ProfitabilityMetrics {
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  breakEvenPoint: number;
  roi: number;
  paybackPeriod: number;
}

class ProfitabilityAnalyzer {
  calculateProfitability(project: Project, expenses: Expense[]): ProfitabilityMetrics {
    const totalRevenue = project.totalCost;
    const directCosts = this.calculateDirectCosts(project);
    const indirectCosts = this.calculateIndirectCosts(expenses);
    
    const grossProfit = totalRevenue - directCosts;
    const grossMargin = (grossProfit / totalRevenue) * 100;
    
    const netProfit = grossProfit - indirectCosts;
    const netMargin = (netProfit / totalRevenue) * 100;
    
    const roi = ((netProfit - project.investment) / project.investment) * 100;
    const paybackPeriod = project.investment / netProfit;

    return {
      grossProfit,
      grossMargin,
      netProfit,
      netMargin,
      breakEvenPoint: this.calculateBreakEven(project, expenses),
      roi,
      paybackPeriod
    };
  }
}
```

## Reporting & Analytics
### Advanced Reporting Features
- **Custom Reports**: User-defined report templates
- **Data Visualization**: Charts and graphs
- **Trend Analysis**: Historical data analysis
- **Comparative Analysis**: Project-to-project comparison
- **Forecasting**: Predictive analytics

### Implementation
```typescript
interface ReportConfig {
  type: 'cost_breakdown' | 'profitability' | 'timeline' | 'comparison';
  filters: ReportFilter[];
  visualizations: ChartConfig[];
  exportFormats: ('pdf' | 'excel' | 'csv')[];
}

class ReportGenerator {
  async generateReport(config: ReportConfig, data: any): Promise<ReportResult> {
    const filteredData = this.applyFilters(data, config.filters);
    const charts = await this.generateCharts(filteredData, config.visualizations);
    
    return {
      data: filteredData,
      charts,
      summary: this.generateSummary(filteredData),
      exports: await this.generateExports(filteredData, config.exportFormats)
    };
  }
}
```

## Performance Optimization
- **Caching Strategy**: Intelligent data caching
- **Lazy Loading**: Load data on demand
- **Background Processing**: Heavy calculations in background
- **Memory Management**: Efficient data structures
- **Database Optimization**: Query optimization and indexing 

ChatGPT Prompt suggestion:
Add advanced calculator features:
- Multi-role selection and bulk member add
- Monthly planning: variable hours, ramp-up, milestones
- Cost analysis: margin per member, location impact, currency delta
- Reporting: dashboards, cost summaries, trends, comparisons
- Calculator templates for quick reuse

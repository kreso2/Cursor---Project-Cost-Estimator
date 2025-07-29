# 13 - Cost Analysis

## Cost Analysis Feature Overview
Implement comprehensive cost analysis functionality for project cost calculator with margin analysis, location impact, and currency delta calculations.

## Core Requirements
- Margin analysis per team member and role
- Location-based cost impact analysis
- Currency fluctuation impact analysis
- Cost breakdown by categories
- Profitability analysis
- Cost optimization recommendations

## Implementation Details

### Cost Analysis Data Structure
```typescript
interface CostAnalysis {
  id: string;
  projectId: string;
  analysisDate: Date;
  baseCurrency: string;
  totalCost: number;
  totalRevenue: number;
  grossMargin: number;
  grossMarginPercentage: number;
  breakdowns: CostBreakdown[];
  locationAnalysis: LocationAnalysis[];
  currencyAnalysis: CurrencyAnalysis[];
  recommendations: CostRecommendation[];
}

interface CostBreakdown {
  category: 'labor' | 'overhead' | 'materials' | 'travel' | 'software' | 'other';
  amount: number;
  percentage: number;
  details: CostDetail[];
}

interface CostDetail {
  item: string;
  amount: number;
  quantity: number;
  unitCost: number;
  margin: number;
  notes: string;
}

interface LocationAnalysis {
  location: string;
  teamMembers: LocationTeamMember[];
  totalCost: number;
  averageRate: number;
  costSavings: number;
  qualityScore: number;
}

interface LocationTeamMember {
  userId: string;
  roleName: string;
  hourlyRate: number;
  hours: number;
  totalCost: number;
  marketRate: number;
  rateDifference: number;
  costSavings: number;
}

interface CurrencyAnalysis {
  currency: string;
  baseAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  rateChange: number;
  impact: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface CostRecommendation {
  type: 'rate_optimization' | 'location_change' | 'currency_hedging' | 'resource_allocation';
  title: string;
  description: string;
  potentialSavings: number;
  implementationCost: number;
  roi: number;
  priority: 'high' | 'medium' | 'low';
  actions: string[];
}
```

### Cost Analysis Service
```typescript
class CostAnalysisService {
  async analyzeProjectCosts(project: Project): Promise<CostAnalysis> {
    const totalCost = this.calculateTotalCost(project);
    const totalRevenue = project.budget || 0;
    const grossMargin = totalRevenue - totalCost;
    const grossMarginPercentage = (grossMargin / totalRevenue) * 100;

    const breakdowns = this.calculateCostBreakdowns(project);
    const locationAnalysis = await this.analyzeLocationImpact(project);
    const currencyAnalysis = await this.analyzeCurrencyImpact(project);
    const recommendations = this.generateRecommendations(project, breakdowns, locationAnalysis, currencyAnalysis);

    return {
      id: Date.now().toString(),
      projectId: project.id,
      analysisDate: new Date(),
      baseCurrency: project.currency,
      totalCost,
      totalRevenue,
      grossMargin,
      grossMarginPercentage,
      breakdowns,
      locationAnalysis,
      currencyAnalysis,
      recommendations
    };
  }

  private calculateTotalCost(project: Project): number {
    return project.roles.reduce((total, role) => total + role.subtotal, 0);
  }

  private calculateCostBreakdowns(project: Project): CostBreakdown[] {
    const breakdowns: CostBreakdown[] = [
      { category: 'labor', amount: 0, percentage: 0, details: [] },
      { category: 'overhead', amount: 0, percentage: 0, details: [] },
      { category: 'materials', amount: 0, percentage: 0, details: [] },
      { category: 'travel', amount: 0, percentage: 0, details: [] },
      { category: 'software', amount: 0, percentage: 0, details: [] },
      { category: 'other', amount: 0, percentage: 0, details: [] }
    ];

    const totalCost = this.calculateTotalCost(project);

    // Categorize costs
    project.roles.forEach(role => {
      const laborBreakdown = breakdowns.find(b => b.category === 'labor');
      if (laborBreakdown) {
        laborBreakdown.amount += role.subtotal;
        laborBreakdown.details.push({
          item: role.roleName,
          amount: role.subtotal,
          quantity: role.hours,
          unitCost: role.hourlyRate,
          margin: this.calculateMargin(role.hourlyRate, role.subtotal),
          notes: ''
        });
      }
    });

    // Calculate percentages
    breakdowns.forEach(breakdown => {
      breakdown.percentage = totalCost > 0 ? (breakdown.amount / totalCost) * 100 : 0;
    });

    return breakdowns.filter(b => b.amount > 0);
  }

  private async analyzeLocationImpact(project: Project): Promise<LocationAnalysis[]> {
    const locations = ['US', 'Europe', 'Asia', 'Offshore'];
    const analysis: LocationAnalysis[] = [];

    for (const location of locations) {
      const marketRates = await this.getMarketRates(location);
      const teamMembers: LocationTeamMember[] = [];

      project.roles.forEach(role => {
        const marketRate = marketRates[role.roleName] || role.hourlyRate;
        const rateDifference = role.hourlyRate - marketRate;
        const costSavings = rateDifference * role.hours;

        teamMembers.push({
          userId: role.id,
          roleName: role.roleName,
          hourlyRate: role.hourlyRate,
          hours: role.hours,
          totalCost: role.subtotal,
          marketRate,
          rateDifference,
          costSavings
        });
      });

      const totalCost = teamMembers.reduce((sum, member) => sum + member.totalCost, 0);
      const averageRate = totalCost / teamMembers.reduce((sum, member) => sum + member.hours, 0);
      const totalSavings = teamMembers.reduce((sum, member) => sum + member.costSavings, 0);

      analysis.push({
        location,
        teamMembers,
        totalCost,
        averageRate,
        costSavings: totalSavings,
        qualityScore: this.calculateQualityScore(location)
      });
    }

    return analysis;
  }

  private async analyzeCurrencyImpact(project: Project): Promise<CurrencyAnalysis[]> {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    const analysis: CurrencyAnalysis[] = [];

    for (const currency of currencies) {
      if (currency === project.currency) continue;

      const currentRate = await this.getExchangeRate(project.currency, currency);
      const historicalRate = await this.getHistoricalRate(project.currency, currency, 30); // 30 days ago
      const rateChange = ((currentRate - historicalRate) / historicalRate) * 100;

      const baseAmount = this.calculateTotalCost(project);
      const convertedAmount = baseAmount * currentRate;
      const impact = baseAmount * (rateChange / 100);

      analysis.push({
        currency,
        baseAmount,
        convertedAmount,
        exchangeRate: currentRate,
        rateChange,
        impact,
        trend: rateChange > 1 ? 'increasing' : rateChange < -1 ? 'decreasing' : 'stable'
      });
    }

    return analysis;
  }

  private generateRecommendations(
    project: Project,
    breakdowns: CostBreakdown[],
    locationAnalysis: LocationAnalysis[],
    currencyAnalysis: CurrencyAnalysis[]
  ): CostRecommendation[] {
    const recommendations: CostRecommendation[] = [];

    // Rate optimization recommendations
    const highCostRoles = project.roles.filter(role => {
      const marketRate = this.getAverageMarketRate(role.roleName);
      return role.hourlyRate > marketRate * 1.2; // 20% above market
    });

    if (highCostRoles.length > 0) {
      const potentialSavings = highCostRoles.reduce((sum, role) => {
        const marketRate = this.getAverageMarketRate(role.roleName);
        return sum + (role.hourlyRate - marketRate) * role.hours;
      }, 0);

      recommendations.push({
        type: 'rate_optimization',
        title: 'Optimize High-Cost Roles',
        description: `Consider negotiating rates for ${highCostRoles.length} roles that are above market rates`,
        potentialSavings,
        implementationCost: 0,
        roi: potentialSavings > 0 ? (potentialSavings / 1) * 100 : 0,
        priority: 'high',
        actions: [
          'Review market rates for affected roles',
          'Negotiate with current team members',
          'Consider alternative candidates'
        ]
      });
    }

    // Location optimization recommendations
    const bestLocation = locationAnalysis.reduce((best, current) => 
      current.costSavings > best.costSavings ? current : best
    );

    if (bestLocation.costSavings > 0) {
      recommendations.push({
        type: 'location_change',
        title: `Consider ${bestLocation.location} Team`,
        description: `Moving team to ${bestLocation.location} could save ${bestLocation.costSavings.toLocaleString()}`,
        potentialSavings: bestLocation.costSavings,
        implementationCost: bestLocation.costSavings * 0.1, // 10% of savings
        roi: bestLocation.costSavings > 0 ? (bestLocation.costSavings / (bestLocation.costSavings * 0.1)) * 100 : 0,
        priority: 'medium',
        actions: [
          'Research local talent pool',
          'Evaluate quality and communication',
          'Plan transition timeline'
        ]
      });
    }

    // Currency hedging recommendations
    const volatileCurrencies = currencyAnalysis.filter(c => Math.abs(c.rateChange) > 5);
    
    if (volatileCurrencies.length > 0) {
      const totalImpact = volatileCurrencies.reduce((sum, c) => sum + Math.abs(c.impact), 0);
      
      recommendations.push({
        type: 'currency_hedging',
        title: 'Consider Currency Hedging',
        description: `${volatileCurrencies.length} currencies show significant volatility`,
        potentialSavings: totalImpact * 0.5, // 50% of potential impact
        implementationCost: totalImpact * 0.1, // 10% of impact
        roi: totalImpact > 0 ? (totalImpact * 0.5 / (totalImpact * 0.1)) * 100 : 0,
        priority: 'medium',
        actions: [
          'Monitor currency trends',
          'Consider forward contracts',
          'Diversify currency exposure'
        ]
      });
    }

    return recommendations.sort((a, b) => b.roi - a.roi);
  }

  private calculateMargin(hourlyRate: number, totalCost: number): number {
    // Simplified margin calculation
    const marketRate = hourlyRate * 0.8; // Assume 20% margin
    return ((hourlyRate - marketRate) / hourlyRate) * 100;
  }

  private async getMarketRates(location: string): Promise<Record<string, number>> {
    // Mock market rates - in real implementation, fetch from external API
    const rates: Record<string, Record<string, number>> = {
      'US': {
        'Senior Developer': 120,
        'Developer': 80,
        'Designer': 90,
        'Project Manager': 100
      },
      'Europe': {
        'Senior Developer': 90,
        'Developer': 60,
        'Designer': 70,
        'Project Manager': 80
      },
      'Asia': {
        'Senior Developer': 50,
        'Developer': 30,
        'Designer': 40,
        'Project Manager': 60
      },
      'Offshore': {
        'Senior Developer': 40,
        'Developer': 25,
        'Designer': 30,
        'Project Manager': 45
      }
    };

    return rates[location] || {};
  }

  private getAverageMarketRate(roleName: string): number {
    // Simplified average market rate calculation
    const rates = [120, 90, 50, 40]; // US, Europe, Asia, Offshore
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  private calculateQualityScore(location: string): number {
    // Mock quality scores
    const scores: Record<string, number> = {
      'US': 95,
      'Europe': 90,
      'Asia': 85,
      'Offshore': 75
    };
    return scores[location] || 80;
  }

  private async getExchangeRate(from: string, to: string): Promise<number> {
    // Mock exchange rate - in real implementation, fetch from API
    const rates: Record<string, Record<string, number>> = {
      'USD': { 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110, 'CAD': 1.25, 'AUD': 1.35 },
      'EUR': { 'USD': 1.18, 'GBP': 0.86, 'JPY': 129, 'CAD': 1.47, 'AUD': 1.59 },
      'GBP': { 'USD': 1.37, 'EUR': 1.16, 'JPY': 151, 'CAD': 1.71, 'AUD': 1.85 }
    };
    return rates[from]?.[to] || 1;
  }

  private async getHistoricalRate(from: string, to: string, daysAgo: number): Promise<number> {
    // Mock historical rate - in real implementation, fetch from API
    const currentRate = await this.getExchangeRate(from, to);
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    return currentRate * (1 + variation);
  }
}
```

### React Component Implementation
```typescript
// CostAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { CostAnalysisService } from '../lib/costAnalysisService';
import { Pie, Bar, Line } from 'react-chartjs-2';

export const CostAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'breakdown' | 'location' | 'currency' | 'recommendations'>('overview');

  const analysisService = new CostAnalysisService();

  useEffect(() => {
    // Mock project data - in real implementation, get from props or context
    const mockProject = {
      id: '1',
      budget: 100000,
      currency: 'USD',
      roles: [
        { id: '1', roleName: 'Senior Developer', hourlyRate: 120, hours: 160, subtotal: 19200 },
        { id: '2', roleName: 'Developer', hourlyRate: 80, hours: 200, subtotal: 16000 },
        { id: '3', roleName: 'Designer', hourlyRate: 90, hours: 120, subtotal: 10800 }
      ]
    };

    runAnalysis(mockProject);
  }, []);

  const runAnalysis = async (project: any) => {
    setLoading(true);
    try {
      const result = await analysisService.analyzeProjectCosts(project);
      setAnalysis(result);
    } catch (error) {
      console.error('Cost analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running cost analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return <div>No analysis data available</div>;
  }

  const costBreakdownData = {
    labels: analysis.breakdowns.map(b => b.category),
    datasets: [{
      data: analysis.breakdowns.map(b => b.amount),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
      ]
    }]
  };

  const locationData = {
    labels: analysis.locationAnalysis.map(l => l.location),
    datasets: [{
      label: 'Total Cost',
      data: analysis.locationAnalysis.map(l => l.totalCost),
      backgroundColor: '#3B82F6'
    }, {
      label: 'Cost Savings',
      data: analysis.locationAnalysis.map(l => l.costSavings),
      backgroundColor: '#10B981'
    }]
  };

  const currencyData = {
    labels: analysis.currencyAnalysis.map(c => c.currency),
    datasets: [{
      label: 'Rate Change (%)',
      data: analysis.currencyAnalysis.map(c => c.rateChange),
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.1
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cost Analysis</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded ${selectedView === 'overview' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('breakdown')}
            className={`px-4 py-2 rounded ${selectedView === 'breakdown' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Breakdown
          </button>
          <button
            onClick={() => setSelectedView('location')}
            className={`px-4 py-2 rounded ${selectedView === 'location' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Location
          </button>
          <button
            onClick={() => setSelectedView('currency')}
            className={`px-4 py-2 rounded ${selectedView === 'currency' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Currency
          </button>
          <button
            onClick={() => setSelectedView('recommendations')}
            className={`px-4 py-2 rounded ${selectedView === 'recommendations' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Recommendations
          </button>
        </div>
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-700">Total Cost</h3>
            <p className="text-2xl font-bold">${analysis.totalCost.toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-2xl font-bold">${analysis.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-gray-700">Gross Margin</h3>
            <p className={`text-2xl font-bold ${analysis.grossMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${analysis.grossMargin.toLocaleString()}
            </p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-gray-700">Margin %</h3>
            <p className={`text-2xl font-bold ${analysis.grossMarginPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analysis.grossMarginPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {selectedView === 'breakdown' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Pie data={costBreakdownData} />
            </div>
            <div className="space-y-4">
              {analysis.breakdowns.map(breakdown => (
                <div key={breakdown.category} className="border rounded p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold capitalize">{breakdown.category}</h4>
                    <span className="text-lg font-bold">${breakdown.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{breakdown.percentage.toFixed(1)}% of total</p>
                  <div className="mt-2 space-y-1">
                    {breakdown.details.map((detail, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{detail.item}</span>
                        <span>${detail.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Analysis */}
      {selectedView === 'location' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Location Impact Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Bar data={locationData} />
            </div>
            <div className="space-y-4">
              {analysis.locationAnalysis.map(location => (
                <div key={location.location} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{location.location}</h4>
                    <span className="text-lg font-bold">${location.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Rate:</span>
                      <span className="ml-2">${location.averageRate.toFixed(2)}/hr</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Savings:</span>
                      <span className="ml-2 text-green-600">${location.costSavings.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quality Score:</span>
                      <span className="ml-2">{location.qualityScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currency Analysis */}
      {selectedView === 'currency' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Currency Impact Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Line data={currencyData} />
            </div>
            <div className="space-y-4">
              {analysis.currencyAnalysis.map(currency => (
                <div key={currency.currency} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{currency.currency}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      currency.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                      currency.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currency.trend}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Rate Change:</span>
                      <span className={`ml-2 ${currency.rateChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {currency.rateChange.toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Impact:</span>
                      <span className={`ml-2 ${currency.impact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${Math.abs(currency.impact).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {selectedView === 'recommendations' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Optimization Recommendations</h3>
          <div className="space-y-4">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{recommendation.title}</h4>
                  <span className={`text-sm px-2 py-1 rounded ${
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {recommendation.priority} priority
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{recommendation.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-600">Potential Savings:</span>
                    <p className="font-semibold text-green-600">${recommendation.potentialSavings.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Implementation Cost:</span>
                    <p className="font-semibold">${recommendation.implementationCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">ROI:</span>
                    <p className="font-semibold">{recommendation.roi.toFixed(1)}%</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Recommended Actions:</span>
                  <ul className="mt-1 space-y-1">
                    {recommendation.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-sm flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Features
- **Cost Breakdown Analysis**: Categorize costs by type
- **Location Impact Analysis**: Compare costs across different locations
- **Currency Impact Analysis**: Monitor currency fluctuations
- **Margin Analysis**: Calculate margins per role and category
- **Optimization Recommendations**: AI-powered cost optimization suggestions
- **ROI Calculations**: Return on investment for recommendations
- **Trend Analysis**: Track cost trends over time

## Integration Points
- **Project Calculator**: Integrate with main calculator
- **Monthly Planning**: Use monthly breakdown data
- **Role Catalog**: Compare with market rates
- **Reporting**: Generate cost analysis reports
- **Export**: Export analysis to Excel/PDF

## Advanced Features
- **Market Rate Comparison**: Compare with industry benchmarks
- **Scenario Analysis**: Compare different cost scenarios
- **Risk Assessment**: Evaluate cost risks and uncertainties
- **Automated Alerts**: Notify when costs exceed thresholds
- **Historical Analysis**: Track cost changes over time 
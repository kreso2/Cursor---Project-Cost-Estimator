# 10 - Currency Conversion

## Currency Conversion Feature Overview
Implement live currency conversion functionality for the project cost calculator with real-time exchange rates.

## Core Requirements
- Live currency exchange rates from external API
- Multi-currency support for project costs
- Real-time conversion calculations
- Caching for performance optimization
- Fallback mechanisms for API failures

## Implementation Details

### Currency API Integration
- **Service**: ExchangeRate.host (free, no API key required)
- **Endpoint**: https://api.exchangerate.host/latest
- **Rate Limits**: 1000 requests per month
- **Supported Currencies**: 170+ currencies
- **Update Frequency**: Every hour

### Currency Service Implementation
```typescript
interface ExchangeRateResponse {
  success: boolean;
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface CurrencyRole {
  id: string;
  title: string;
  hourlyRate: number;
  hours: number;
  currency: string;
  convertedRate?: number;
  subtotal?: number;
}

interface CurrencyConversionResult {
  roles: CurrencyRole[];
  totalCost: number;
  targetCurrency: string;
  exchangeRates: Record<string, number>;
  lastUpdated: Date;
}

class CurrencyService {
  private cache: Map<string, { rates: Record<string, number>; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly API_BASE_URL = 'https://api.exchangerate.host';

  async fetchExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    // Check cache first
    const cached = this.cache.get(baseCurrency);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rates;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/latest?base=${baseCurrency}`);
      const data: ExchangeRateResponse = await response.json();

      if (data.success) {
        // Cache the result
        this.cache.set(baseCurrency, {
          rates: data.rates,
          timestamp: Date.now()
        });
        return data.rates;
      } else {
        throw new Error('Failed to fetch exchange rates');
      }
    } catch (error) {
      // Fallback to cached rates if available
      if (cached) {
        console.warn('Using cached exchange rates due to API failure');
        return cached.rates;
      }
      throw error;
    }
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number {
    if (fromCurrency === toCurrency) return amount;
    const rate = rates[toCurrency];
    if (!rate) throw new Error(`Exchange rate not found for ${toCurrency}`);
    return amount * rate;
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
    ];
  }
}
```

### React Component Implementation
```typescript
// CurrencyConversion.tsx
import React, { useState, useEffect } from 'react';
import { currencyService } from '../lib/currencyService';

export const CurrencyConversion: React.FC = () => {
  const [roles, setRoles] = useState<CurrencyRole[]>([]);
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(0);
  const [isGross, setIsGross] = useState(false);

  useEffect(() => {
    fetchExchangeRates();
  }, [targetCurrency]);

  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const rates = await currencyService.fetchExchangeRates(targetCurrency);
      setExchangeRates(rates);
      updateCalculations(rates);
    } catch (err) {
      setError('Failed to fetch exchange rates');
      console.error('Currency conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCalculations = (rates: Record<string, number>) => {
    const updatedRoles = roles.map(role => {
      const convertedRate = currencyService.convertCurrency(
        role.hourlyRate,
        role.currency,
        targetCurrency,
        rates
      );
      
      const subtotal = convertedRate * role.hours;
      
      return {
        ...role,
        convertedRate,
        subtotal
      };
    });
    
    setRoles(updatedRoles);
  };

  const addRole = () => {
    const newRole: CurrencyRole = {
      id: Date.now().toString(),
      title: '',
      hourlyRate: 0,
      hours: 0,
      currency: 'USD'
    };
    setRoles([...roles, newRole]);
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const updateRole = (id: string, updates: Partial<CurrencyRole>) => {
    setRoles(roles.map(role => 
      role.id === id ? { ...role, ...updates } : role
    ));
  };

  const calculateTotal = (): number => {
    const subtotal = roles.reduce((sum, role) => sum + (role.subtotal || 0), 0);
    const taxAmount = subtotal * (taxRate / 100);
    return isGross ? subtotal : subtotal + taxAmount;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Currency Conversion</h2>
        <div className="flex items-center space-x-4">
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="input-field"
            disabled={loading}
          >
            {currencyService.getSupportedCurrencies().map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Tax Rate (%):</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="input-field w-20"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Pricing:</label>
            <select
              value={isGross ? 'gross' : 'net'}
              onChange={(e) => setIsGross(e.target.value === 'gross')}
              className="input-field"
            >
              <option value="net">Net</option>
              <option value="gross">Gross</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {roles.map(role => (
          <div key={role.id} className="card p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                value={role.title}
                onChange={(e) => updateRole(role.id, { title: e.target.value })}
                placeholder="Role title"
                className="input-field"
              />
              
              <input
                type="number"
                value={role.hourlyRate}
                onChange={(e) => updateRole(role.id, { hourlyRate: parseFloat(e.target.value) || 0 })}
                placeholder="Hourly rate"
                className="input-field"
                min="0"
                step="0.01"
              />
              
              <select
                value={role.currency}
                onChange={(e) => updateRole(role.id, { currency: e.target.value })}
                className="input-field"
              >
                {currencyService.getSupportedCurrencies().map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                value={role.hours}
                onChange={(e) => updateRole(role.id, { hours: parseFloat(e.target.value) || 0 })}
                placeholder="Hours"
                className="input-field"
                min="0"
                step="0.5"
              />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {currencyService.formatCurrency(role.subtotal || 0, targetCurrency)}
                </span>
                <button
                  onClick={() => removeRole(role.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRole}
        className="btn-primary"
      >
        Add Role
      </button>

      <div className="card p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Total Cost</h3>
          <div className="text-3xl font-bold text-primary-600">
            {currencyService.formatCurrency(calculateTotal(), targetCurrency)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};
```

## UI Components
- **Currency Selector**: Dropdown for target currency selection
- **Role Management**: Add/edit/remove roles with different currencies
- **Real-time Conversion**: Automatic recalculation on currency change
- **Tax Toggle**: Net/gross pricing with tax calculation
- **Loading States**: Spinner during API calls
- **Error Handling**: Display API errors gracefully

## Features
- **Live Exchange Rates**: Real-time currency conversion
- **Multi-currency Support**: Support for 170+ currencies
- **Caching**: 5-minute cache for performance
- **Fallback**: Use cached rates if API fails
- **Tax Calculation**: Net/gross pricing options
- **Responsive Design**: Works on all device sizes

## Integration Points
- **Project Calculator**: Integrate with main calculator
- **Role Catalog**: Use predefined roles and rates
- **Project Management**: Save projects with currency preferences
- **Export Features**: Export costs in different currencies

## Error Handling
- **API Failures**: Graceful fallback to cached rates
- **Invalid Currencies**: Validation and error messages
- **Network Issues**: Retry logic and user feedback
- **Rate Limits**: Handle API rate limiting

## Performance Optimization
- **Caching Strategy**: Intelligent rate caching
- **Lazy Loading**: Load rates only when needed
- **Debounced Updates**: Prevent excessive API calls
- **Memory Management**: Efficient data structures

## Future Enhancements
- **Historical Rates**: Track rate changes over time
- **Rate Alerts**: Notify when rates change significantly
- **Bulk Conversion**: Convert multiple amounts at once
- **Custom Currencies**: Add custom currency definitions
- **Offline Support**: Work without internet connection 
interface ExchangeRateResponse {
  success: boolean
  rates?: Record<string, number>
  error?: string
}

interface CurrencyRole {
  id: string
  title: string
  hourlyRate: number
  hours: number
  currency: string
}

interface CurrencyConversionResult {
  roles: CurrencyRole[]
  totalCost: number
  selectedCurrency: string
  exchangeRates: Record<string, number>
  lastUpdated: Date
}

class CurrencyService {
  private cache: Record<string, { rates: Record<string, number>; timestamp: number }> = {}
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly API_BASE_URL = 'https://api.exchangerate.host'

  async fetchExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    const cacheKey = baseCurrency
    const now = Date.now()

    // Check cache first
    if (this.cache[cacheKey] && (now - this.cache[cacheKey].timestamp) < this.CACHE_DURATION) {
      return this.cache[cacheKey].rates
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/latest?base=${baseCurrency}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ExchangeRateResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch exchange rates')
      }

      if (!data.rates) {
        throw new Error('No exchange rates received')
      }

      // Cache the results
      this.cache[cacheKey] = {
        rates: data.rates,
        timestamp: now
      }

      return data.rates
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      
      // Return cached rates if available, even if expired
      if (this.cache[cacheKey]) {
        console.warn('Using cached exchange rates due to API error')
        return this.cache[cacheKey].rates
      }
      
      throw error
    }
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number {
    if (fromCurrency === toCurrency) {
      return amount
    }

    const rate = rates[toCurrency]
    if (!rate) {
      throw new Error(`Exchange rate not available for ${toCurrency}`)
    }

    return amount * rate
  }

  formatCurrency(amount: number, currency: string): string {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      JPY: '¥',
      SEK: 'kr',
      NOK: 'kr',
      DKK: 'kr',
      PLN: 'zł',
      CZK: 'Kč',
      HUF: 'Ft',
      RON: 'lei',
      BGN: 'лв',
      HRK: 'kn',
      RUB: '₽',
      CNY: '¥',
      INR: '₹',
      BRL: 'R$',
      MXN: '$',
      ZAR: 'R',
      TRY: '₺',
      KRW: '₩',
      SGD: 'S$',
      HKD: 'HK$',
      THB: '฿',
      MYR: 'RM',
      IDR: 'Rp',
      PHP: '₱',
      VND: '₫'
    }

    const symbol = currencySymbols[currency] || currency
    return `${symbol}${amount.toFixed(2)}`
  }

  getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
      { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
      { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
      { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
      { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
      { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
      { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
      { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
      { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
      { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
      { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
      { code: 'THB', name: 'Thai Baht', symbol: '฿' },
      { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
      { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
      { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' }
    ]
  }
}

export const currencyService = new CurrencyService()
export type { CurrencyRole, CurrencyConversionResult } 
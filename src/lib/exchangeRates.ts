export interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: number
  source: string
}

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  flag?: string
}

export interface ExchangeRateResponse {
  success: boolean
  rates: Record<string, number>
  base: string
  date: string
  timestamp: number
}

class ExchangeRateService {
  private cache: Map<string, ExchangeRate> = new Map()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes
  private readonly API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY || 'demo'
  private readonly BASE_URL = 'https://api.exchangerate-api.com/v4/latest'
  private readonly FALLBACK_URL = 'https://api.exchangerate.host/latest'

  // Supported currencies with metadata
  public readonly supportedCurrencies: CurrencyInfo[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  ]

  private getCacheKey(from: string, to: string): string {
    return `${from}_${to}`.toUpperCase()
  }

  private isCacheValid(rate: ExchangeRate): boolean {
    return Date.now() - rate.timestamp < this.cacheExpiry
  }

  private async fetchFromAPI(baseCurrency: string): Promise<ExchangeRateResponse> {
    const url = `${this.BASE_URL}/${baseCurrency}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProjectCostCalculator/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        rates: data.rates,
        base: data.base,
        date: data.date,
        timestamp: Date.now()
      }
    } catch (error) {
      console.warn('Primary API failed, trying fallback:', error)
      return this.fetchFromFallback(baseCurrency)
    }
  }

  private async fetchFromFallback(baseCurrency: string): Promise<ExchangeRateResponse> {
    const url = `${this.FALLBACK_URL}?base=${baseCurrency}`
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Fallback API failed! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: data.success,
        rates: data.rates,
        base: data.base,
        date: data.date,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Fallback API also failed:', error)
      throw new Error('Unable to fetch exchange rates from any source')
    }
  }

  public async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const cacheKey = this.getCacheKey(from, to)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isCacheValid(cached)) {
      return cached
    }

    // If same currency, return 1:1 rate
    if (from.toUpperCase() === to.toUpperCase()) {
      const rate: ExchangeRate = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate: 1,
        timestamp: Date.now(),
        source: 'local'
      }
      this.cache.set(cacheKey, rate)
      return rate
    }

    try {
      const response = await this.fetchFromAPI(from.toUpperCase())
      
      if (!response.success) {
        throw new Error('API returned unsuccessful response')
      }

      const rate = response.rates[to.toUpperCase()]
      if (!rate) {
        throw new Error(`Exchange rate not available for ${to.toUpperCase()}`)
      }

      const exchangeRate: ExchangeRate = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate,
        timestamp: response.timestamp,
        source: 'api'
      }

      this.cache.set(cacheKey, exchangeRate)
      return exchangeRate
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error)
      
      // Return cached data even if expired as fallback
      if (cached) {
        console.warn('Using expired cached rate as fallback')
        return cached
      }
      
      throw error
    }
  }

  public async getMultipleRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRate[]> {
    const rates: ExchangeRate[] = []
    
    try {
      const response = await this.fetchFromAPI(baseCurrency.toUpperCase())
      
      if (!response.success) {
        throw new Error('API returned unsuccessful response')
      }

      for (const targetCurrency of targetCurrencies) {
        const rate = response.rates[targetCurrency.toUpperCase()]
        if (rate) {
          const exchangeRate: ExchangeRate = {
            from: baseCurrency.toUpperCase(),
            to: targetCurrency.toUpperCase(),
            rate,
            timestamp: response.timestamp,
            source: 'api'
          }
          
          const cacheKey = this.getCacheKey(baseCurrency, targetCurrency)
          this.cache.set(cacheKey, exchangeRate)
          rates.push(exchangeRate)
        }
      }
    } catch (error) {
      console.error('Failed to fetch multiple rates:', error)
      throw error
    }

    return rates
  }

  public convertAmount(amount: number, fromCurrency: string, toCurrency: string, rate: number): number {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return amount
    }
    return amount * rate
  }

  public getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
    return this.supportedCurrencies.find(
      currency => currency.code.toUpperCase() === currencyCode.toUpperCase()
    )
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public getCacheStats(): { size: number; entries: Array<{ key: string; timestamp: number }> } {
    const entries = Array.from(this.cache.entries()).map(([key, rate]) => ({
      key,
      timestamp: rate.timestamp
    }))
    
    return {
      size: this.cache.size,
      entries
    }
  }
}

// Create singleton instance
export const exchangeRateService = new ExchangeRateService()

// Historical rate tracking (simplified implementation)
export class HistoricalRateTracker {
  private storage: Storage

  constructor() {
    this.storage = localStorage
  }

  public saveRate(rate: ExchangeRate): void {
    const key = `rate_history_${rate.from}_${rate.to}`
    const history = this.getRateHistory(rate.from, rate.to)
    
    history.push({
      rate: rate.rate,
      timestamp: rate.timestamp,
      source: rate.source
    })

    // Keep only last 30 days of data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    const filteredHistory = history.filter(entry => entry.timestamp > thirtyDaysAgo)
    
    this.storage.setItem(key, JSON.stringify(filteredHistory))
  }

  public getRateHistory(from: string, to: string): Array<{ rate: number; timestamp: number; source: string }> {
    const key = `rate_history_${from}_${to}`
    const data = this.storage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  public getAverageRate(from: string, to: string, days: number = 7): number {
    const history = this.getRateHistory(from, to)
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    const recentRates = history.filter(entry => entry.timestamp > cutoff)
    
    if (recentRates.length === 0) return 0
    
    const sum = recentRates.reduce((acc, entry) => acc + entry.rate, 0)
    return sum / recentRates.length
  }
}

export const historicalRateTracker = new HistoricalRateTracker() 
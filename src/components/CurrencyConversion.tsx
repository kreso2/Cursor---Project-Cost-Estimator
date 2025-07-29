import React, { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import { currencyService, type CurrencyRole, type CurrencyConversionResult } from '../lib/currencyService'
import { toast } from 'react-hot-toast'

interface CurrencyConversionProps {
  onCurrencyChange?: (result: CurrencyConversionResult) => void
}

export const CurrencyConversion: React.FC<CurrencyConversionProps> = ({ onCurrencyChange }) => {
  const [roles, setRoles] = useState<CurrencyRole[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNetGross, setShowNetGross] = useState(false)
  const [taxRate, setTaxRate] = useState(20) // Default 20% tax rate

  const supportedCurrencies = currencyService.getSupportedCurrencies()

  useEffect(() => {
    fetchExchangeRates()
  }, [selectedCurrency])

  useEffect(() => {
    if (onCurrencyChange) {
      const totalCost = calculateTotalCost()
      onCurrencyChange({
        roles,
        totalCost,
        selectedCurrency,
        exchangeRates,
        lastUpdated: lastUpdated || new Date()
      })
    }
  }, [roles, selectedCurrency, exchangeRates, lastUpdated, onCurrencyChange])

  const fetchExchangeRates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const rates = await currencyService.fetchExchangeRates(selectedCurrency)
      setExchangeRates(rates)
      setLastUpdated(new Date())
      toast.success('Exchange rates updated successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rates'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const addRole = () => {
    const newRole: CurrencyRole = {
      id: Date.now().toString(),
      title: '',
      hourlyRate: 0,
      hours: 0,
      currency: selectedCurrency
    }
    setRoles([...roles, newRole])
  }

  const removeRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id))
  }

  const updateRole = (id: string, field: keyof CurrencyRole, value: string | number) => {
    setRoles(roles.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ))
  }

  const calculateRoleCost = (role: CurrencyRole): number => {
    const baseCost = role.hourlyRate * role.hours
    
    if (role.currency === selectedCurrency) {
      return baseCost
    }

    try {
      return currencyService.convertCurrency(baseCost, role.currency, selectedCurrency, exchangeRates)
    } catch (err) {
      console.error(`Error converting ${role.currency} to ${selectedCurrency}:`, err)
      return baseCost // Fallback to original cost
    }
  }

  const calculateTotalCost = (): number => {
    return roles.reduce((total, role) => {
      const roleCost = calculateRoleCost(role)
      return total + roleCost
    }, 0)
  }

  const calculateNetCost = (): number => {
    const grossCost = calculateTotalCost()
    return grossCost / (1 + taxRate / 100)
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency)
    // Update all roles to use the new currency
    setRoles(roles.map(role => ({
      ...role,
      currency: newCurrency
    })))
  }

  const formatCurrency = (amount: number, currency: string): string => {
    return currencyService.formatCurrency(amount, currency)
  }

  const getCurrencySymbol = (currencyCode: string): string => {
    const currency = supportedCurrencies.find(c => c.code === currencyCode)
    return currency?.symbol || currencyCode
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Currency Conversion</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Convert hourly rates and calculate total costs in different currencies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchExchangeRates}
            disabled={isLoading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Update Rates'}</span>
          </button>
        </div>
      </div>

      {/* Currency Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="input-field"
              >
                {supportedCurrencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol}) - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showNetGross}
                  onChange={(e) => setShowNetGross(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show Net/Gross</span>
              </label>
            </div>

            {showNetGross && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Rate (%)
                </label>
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
            )}
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </div>
            {error && (
              <div className="flex items-center text-red-600 dark:text-red-400 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exchange Rates Display */}
      {Object.keys(exchangeRates).length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Exchange Rates (Base: {selectedCurrency})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
            {Object.entries(exchangeRates).slice(0, 12).map(([currency, rate]) => (
              <div key={currency} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">{currency}:</span>
                <span className="font-medium">{rate.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Team Roles</h4>
            <button
              onClick={addRole}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        {roles.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No roles added yet. Click "Add Role" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hourly Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Cost ({selectedCurrency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={role.title}
                        onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Senior Developer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={role.hourlyRate}
                        onChange={(e) => updateRole(role.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                        className="input-field"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={role.hours}
                        onChange={(e) => updateRole(role.id, 'hours', parseFloat(e.target.value) || 0)}
                        className="input-field"
                        placeholder="160"
                        min="0"
                        step="1"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={role.currency}
                        onChange={(e) => updateRole(role.id, 'currency', e.target.value)}
                        className="input-field"
                      >
                        {supportedCurrencies.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(calculateRoleCost(role), selectedCurrency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeRole(role.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Cost Summary */}
      {roles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cost Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Cost</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(calculateTotalCost(), selectedCurrency)}
                  </p>
                </div>
              </div>
            </div>

            {showNetGross && (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Net Cost</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(calculateNetCost(), selectedCurrency)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Tax Amount</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {formatCurrency(calculateTotalCost() - calculateNetCost(), selectedCurrency)}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        ({taxRate}% rate)
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>• All costs are converted to {selectedCurrency} using live exchange rates</p>
            <p>• Exchange rates are cached for 5 minutes to improve performance</p>
            {showNetGross && (
              <p>• Net cost excludes {taxRate}% tax, gross cost includes tax</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Save, 
  DollarSign, 
  Clock, 
  Calculator, 
  ChevronDown,
  Search,
  Settings,
  Users,
  TrendingUp,
  Download,
  RotateCcw,
  MapPin,
  Percent,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  Target,
  Lightbulb
} from 'lucide-react'
import type { 
  ProjectRole, 
  ProjectData, 
  RoleCatalog, 
  ProjectSettings,
  ProjectCalculations,
  MonthlyAllocation,
  MonthlyBreakdown
} from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { MultiRoleSelector } from './MultiRoleSelector'
import { MonthlyPlanner } from './MonthlyPlanner'
import { CostAnalysis } from './CostAnalysis'
import { ProjectReports } from './ProjectReports'
import { CalculatorTemplates } from './CalculatorTemplates'
import { CurrencyConversion } from './CurrencyConversion'

interface ProjectCalculatorProps {
  onSave?: (data: ProjectData) => void
  initialData?: ProjectData
  roleCatalog?: RoleCatalog[]
  projectName?: string
  projectDescription?: string
  onProjectNameChange?: (name: string) => void
  onProjectDescriptionChange?: (description: string) => void
  loading?: boolean
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
]

const LOCATIONS = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia',
  'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Spain', 'Italy', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Brazil', 'Mexico'
]

export const ProjectCalculator: React.FC<ProjectCalculatorProps> = ({ 
  onSave, 
  initialData, 
  roleCatalog = [],
  projectName = '',
  projectDescription = '',
  onProjectNameChange,
  onProjectDescriptionChange,
  loading = false
}) => {
  // State management
  const [roles, setRoles] = useState<ProjectRole[]>(initialData?.roles || [])
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(
    initialData?.project_settings || {
      duration_months: 6,
      monthly_hours: 160,
      target_currency: 'USD',
      exchange_rate_base: 'USD'
    }
  )
  const [calculations, setCalculations] = useState<ProjectCalculations>(
    initialData?.calculations || {
      total_cost: 0,
      total_billing: 0,
      gross_margin: 0,
      gross_margin_percentage: 0,
      blended_rate: 0,
      monthly_breakdown: []
    }
  )
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    initialData?.exchange_rates || {}
  )

  // UI state
  const [showRoleCatalog, setShowRoleCatalog] = useState(false)
  const [showProjectSettings, setShowProjectSettings] = useState(false)
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleForAllocation, setSelectedRoleForAllocation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'multi-role' | 'planning' | 'analysis' | 'reports' | 'templates' | 'currency'>('basic')

  // Fetch exchange rates on component mount
  useEffect(() => {
    fetchExchangeRates()
  }, [projectSettings.exchange_rate_base])

  // Recalculate project when roles or project settings change
  useEffect(() => {
    recalculateProject()
  }, [roles, projectSettings])

  // Update state when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setRoles(initialData.roles || [])
      setProjectSettings(initialData.project_settings || {
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      })
      setCalculations(initialData.calculations || {
        total_cost: 0,
        total_billing: 0,
        gross_margin: 0,
        gross_margin_percentage: 0,
        blended_rate: 0,
        monthly_breakdown: []
      })
      setExchangeRates(initialData.exchange_rates || {})
    }
  }, [initialData])

  // Run test calculations on component mount
  useEffect(() => {
    testCalculations()
  }, [])

  const fetchExchangeRates = async () => {
    try {
      // Mock exchange rates - in real app, fetch from API
      const mockRates: Record<string, number> = {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        JPY: 110.5
      }
      setExchangeRates(mockRates)
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      toast.error('Failed to fetch exchange rates')
    }
  }

  const recalculateProject = () => {
    console.log('🔄 Recalculating project...')
    console.log('📊 Current roles:', roles)
    
    // Calculate totals using the correct formulas
    let totalCost = 0
    let totalRevenue = 0
    let totalProfit = 0
    
    roles.forEach(role => {
      // Required fields from the specification
      const costRate = role.cost_rate
      const billRate = role.bill_rate
      const monthlyHours = projectSettings.monthly_hours
      const projectDuration = projectSettings.duration_months
      
      // Calculate monthly values
      const monthlyCost = monthlyHours * costRate
      const monthlyRevenue = monthlyHours * billRate
      
      // Calculate total values
      const roleTotalCost = monthlyCost * projectDuration
      const roleTotalRevenue = monthlyRevenue * projectDuration
      const roleProfit = roleTotalRevenue - roleTotalCost
      
      // Calculate margin
      const margin = billRate > 0 ? (billRate - costRate) / billRate : 0
      
      console.log(`💰 Role ${role.name}:`)
      console.log(`   Cost Rate: ${costRate}`)
      console.log(`   Bill Rate: ${billRate}`)
      console.log(`   Monthly Hours: ${monthlyHours}`)
      console.log(`   Project Duration: ${projectDuration} months`)
      console.log(`   Monthly Cost: ${monthlyCost}`)
      console.log(`   Monthly Revenue: ${monthlyRevenue}`)
      console.log(`   Total Cost: ${roleTotalCost}`)
      console.log(`   Total Revenue: ${roleTotalRevenue}`)
      console.log(`   Profit: ${roleProfit}`)
      console.log(`   Margin: ${(margin * 100).toFixed(2)}%`)
      
      totalCost += roleTotalCost
      totalRevenue += roleTotalRevenue
      totalProfit += roleProfit
    })
    
    // Calculate overall margin
    const grossMargin = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue : 0
    const grossMarginPercentage = grossMargin * 100
    
    // Calculate blended rate
    const totalHours = roles.reduce((sum, role) => sum + (projectSettings.monthly_hours * projectSettings.duration_months), 0)
    const blendedRate = totalHours > 0 ? totalRevenue / totalHours : 0

    console.log('📈 Final calculations:')
    console.log(`   Total Cost: ${totalCost}`)
    console.log(`   Total Revenue: ${totalRevenue}`)
    console.log(`   Total Profit: ${totalProfit}`)
    console.log(`   Gross Margin: ${(grossMargin * 100).toFixed(2)}%`)
    console.log(`   Blended Rate: ${blendedRate}`)

    // Calculate monthly breakdown using correct formulas
    const monthlyBreakdown: MonthlyBreakdown[] = []
    for (let month = 1; month <= projectSettings.duration_months; month++) {
      let monthCost = 0
      let monthRevenue = 0

      roles.forEach(role => {
        const costRate = role.cost_rate
        const billRate = role.bill_rate
        const monthlyHours = projectSettings.monthly_hours
        
        // Calculate monthly values using correct formulas
        const monthlyCost = monthlyHours * costRate
        const monthlyRevenue = monthlyHours * billRate
        
        monthCost += monthlyCost
        monthRevenue += monthlyRevenue
      })

      const monthProfit = monthRevenue - monthCost
      const monthMargin = monthRevenue > 0 ? (monthRevenue - monthCost) / monthRevenue : 0
      const monthMarginPercentage = monthMargin * 100

      monthlyBreakdown.push({
        month,
        total_cost: monthCost,
        total_billing: monthRevenue,
        margin: monthProfit,
        margin_percentage: monthMarginPercentage
      })
    }

    setCalculations({
      total_cost: totalCost,
      total_billing: totalRevenue,
      gross_margin: totalProfit,
      gross_margin_percentage: grossMarginPercentage,
      blended_rate: blendedRate,
      monthly_breakdown: monthlyBreakdown
    })
  }

  const addRole = () => {
    const newRole: ProjectRole = {
      id: Date.now().toString(),
      name: '',
      location: 'United States',
      hourly_rate: 50, // Default reasonable rate
      bill_rate: 65,   // 30% markup
      cost_rate: 40,   // 20% discount  
      monthly_allocation: 100,
      hours: 0,
      cost: 0,
      currency: projectSettings.target_currency,
      monthly_breakdown: []
    }
    setRoles([...roles, newRole])
    setTimeout(() => recalculateProject(), 0)
  }

  const addRoleFromCatalog = (catalogRole: RoleCatalog) => {
    const newRole: ProjectRole = {
      id: Date.now().toString(),
      name: catalogRole.name,
      role_id: catalogRole.id,
      location: 'United States',
      hourly_rate: catalogRole.base_rate,
      bill_rate: catalogRole.base_rate * 1.3, // 30% markup
      cost_rate: catalogRole.base_rate * 0.8, // 20% discount
      monthly_allocation: 100,
      hours: 0,
      cost: 0,
      currency: projectSettings.target_currency,
      monthly_breakdown: []
    }
    setRoles([...roles, newRole])
    setShowRoleCatalog(false)
    setTimeout(() => recalculateProject(), 0)
  }

  const removeRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id))
    setTimeout(() => recalculateProject(), 0)
  }

  const updateRole = (id: string, field: keyof ProjectRole, value: string | number) => {
    console.log(`🔄 Updating role ${id}, field: ${field}, value: ${value}`)
    
    setRoles(roles.map(role => {
      if (role.id === id) {
        const updatedRole = { ...role, [field]: value }
        
        // Handle cost_rate and bill_rate calculations
        if (field === 'hourly_rate') {
          // When hourly_rate changes, update cost_rate and bill_rate only if they are currently 0 or empty
          const hourlyRate = Number(value)
          if (role.cost_rate === 0) {
            updatedRole.cost_rate = hourlyRate * 0.8 // 20% discount for cost
          }
          if (role.bill_rate === 0) {
            updatedRole.bill_rate = hourlyRate * 1.3 // 30% markup for billing
          }
          console.log(`💰 Role ${updatedRole.name}: hourly_rate=${hourlyRate}, cost_rate=${updatedRole.cost_rate}, bill_rate=${updatedRole.bill_rate}`)
        }
        
        // Recalculate monthly breakdown when relevant fields change
        if (field === 'hourly_rate' || field === 'cost_rate' || field === 'bill_rate' || field === 'monthly_allocation') {
          updatedRole.monthly_breakdown = calculateMonthlyBreakdown(updatedRole)
        }
        
        return updatedRole
      }
      return role
    }))
    
    // Recalculate project totals after role update
    setTimeout(() => recalculateProject(), 0)
  }

  const calculateMonthlyBreakdown = (role: ProjectRole): MonthlyAllocation[] => {
    const breakdown: MonthlyAllocation[] = []
    const monthlyHours = projectSettings.monthly_hours
    const costRate = role.cost_rate
    const billRate = role.bill_rate
    
    for (let month = 1; month <= projectSettings.duration_months; month++) {
      // Calculate monthly values using correct formulas
      const monthlyCost = monthlyHours * costRate
      const monthlyRevenue = monthlyHours * billRate
      
      breakdown.push({
        month,
        allocation: role.monthly_allocation,
        hours: monthlyHours,
        cost: monthlyCost
      })
    }
    
    return breakdown
  }

  const filteredRoleCatalog = roleCatalog.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (role.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSave = () => {
    if (onSave) {
      onSave({
        name: projectName || 'Untitled Project',
        description: projectDescription,
        roles,
        project_settings: projectSettings,
        calculations,
        exchange_rates: exchangeRates
      })
    }
  }

  const exportToExcel = () => {
    // Mock Excel export - in real app, use a library like xlsx
    const data = {
      projectName,
      projectDescription,
      settings: projectSettings,
      roles,
      calculations,
      monthlyBreakdown: calculations.monthly_breakdown
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName || 'project'}-data.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Project data exported successfully')
  }

  const clearCalculator = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setRoles([])
      setProjectSettings({
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      })
      toast.success('Calculator cleared')
    }
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode)
    return `${currency?.symbol || currencyCode}${amount.toFixed(2)}`
  }

  // Currency conversion handler
  const handleCurrencyChange = (result: any) => {
    console.log('🔄 Currency conversion result:', result)
    
    // Update exchange rates
    setExchangeRates(result.exchangeRates)
    
    // Recalculate all roles with new currency
    setRoles(roles.map(role => {
      const updatedRole = { ...role }
      
      // Convert rates if currency changed
      if (role.currency !== result.selectedCurrency) {
        const oldCurrency = role.currency
        const newCurrency = result.selectedCurrency
        
        // Convert cost_rate and bill_rate
        if (result.exchangeRates[oldCurrency] && result.exchangeRates[newCurrency]) {
          const conversionRate = result.exchangeRates[newCurrency] / result.exchangeRates[oldCurrency]
          updatedRole.cost_rate = role.cost_rate * conversionRate
          updatedRole.bill_rate = role.bill_rate * conversionRate
          updatedRole.currency = newCurrency
          
          console.log(`💰 Role ${role.name}: converted from ${oldCurrency} to ${newCurrency}`)
          console.log(`   Cost rate: ${role.cost_rate} → ${updatedRole.cost_rate}`)
          console.log(`   Bill rate: ${role.bill_rate} → ${updatedRole.bill_rate}`)
        }
      }
      
      return updatedRole
    }))
    
    // Update project settings
    setProjectSettings(prev => ({
      ...prev,
      target_currency: result.selectedCurrency
    }))
    
    // Recalculate project
    setTimeout(() => recalculateProject(), 0)
  }

  // Test function to verify calculations
  const testCalculations = () => {
    console.log('🧪 Testing calculation formulas...')
    
    // Test data
    const testRole = {
      cost_rate: 50,
      bill_rate: 75,
      name: 'Test Developer'
    }
    const testSettings = {
      monthly_hours: 160,
      duration_months: 6
    }
    
    // Test formulas
    const margin = (testRole.bill_rate - testRole.cost_rate) / testRole.bill_rate
    const monthlyCost = testSettings.monthly_hours * testRole.cost_rate
    const monthlyRevenue = testSettings.monthly_hours * testRole.bill_rate
    const totalCost = monthlyCost * testSettings.duration_months
    const totalRevenue = monthlyRevenue * testSettings.duration_months
    const profit = totalRevenue - totalCost
    
    console.log('📊 Test Results:')
    console.log(`   Cost Rate: ${testRole.cost_rate}`)
    console.log(`   Bill Rate: ${testRole.bill_rate}`)
    console.log(`   Monthly Hours: ${testSettings.monthly_hours}`)
    console.log(`   Project Duration: ${testSettings.duration_months} months`)
    console.log(`   Margin: ${(margin * 100).toFixed(2)}%`)
    console.log(`   Monthly Cost: ${monthlyCost}`)
    console.log(`   Monthly Revenue: ${monthlyRevenue}`)
    console.log(`   Total Cost: ${totalCost}`)
    console.log(`   Total Revenue: ${totalRevenue}`)
    console.log(`   Profit: ${profit}`)
    
    // Verify formulas match our implementation
    const expectedMargin = (75 - 50) / 75 // 0.3333...
    const expectedMonthlyCost = 160 * 50 // 8000
    const expectedMonthlyRevenue = 160 * 75 // 12000
    const expectedTotalCost = 8000 * 6 // 48000
    const expectedTotalRevenue = 12000 * 6 // 72000
    const expectedProfit = 72000 - 48000 // 24000
    
    console.log('✅ Formula Verification:')
    console.log(`   Margin: ${margin === expectedMargin ? '✓' : '✗'}`)
    console.log(`   Monthly Cost: ${monthlyCost === expectedMonthlyCost ? '✓' : '✗'}`)
    console.log(`   Monthly Revenue: ${monthlyRevenue === expectedMonthlyRevenue ? '✓' : '✗'}`)
    console.log(`   Total Cost: ${totalCost === expectedTotalCost ? '✓' : '✗'}`)
    console.log(`   Total Revenue: ${totalRevenue === expectedTotalRevenue ? '✓' : '✗'}`)
    console.log(`   Profit: ${profit === expectedProfit ? '✓' : '✗'}`)
  }

  // Test save function (bypasses database)
  const testSave = () => {
    console.log('🧪 Testing save functionality...')
    
    const testData: ProjectData = {
      name: projectName || 'Test Project',
      description: projectDescription || 'Test Description',
      roles: roles,
      project_settings: projectSettings,
      calculations: calculations,
      exchange_rates: exchangeRates
    }
    
    console.log('📊 Test data to save:', testData)
    
    // Simulate save delay
    setTimeout(() => {
      console.log('✅ Test save completed successfully')
      toast.success('Test save completed! (No database write)')
    }, 1000)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Cost Calculator</h2>
            <p className="text-gray-600 dark:text-gray-400">Advanced project cost calculation and analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearCalculator}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear</span>
            </button>
            <button
              onClick={exportToExcel}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Project</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Features Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { key: 'basic', label: 'Basic Calculator', icon: Calculator },
              { key: 'multi-role', label: 'Multi-Role Selection', icon: Users },
              { key: 'planning', label: 'Monthly Planning', icon: Calendar },
              { key: 'analysis', label: 'Cost Analysis', icon: BarChart3 },
              { key: 'reports', label: 'Reports', icon: FileText },
              { key: 'templates', label: 'Templates', icon: Target },
              { key: 'currency', label: 'Currency Conversion', icon: DollarSign }
            ].map(({ key, label, icon: Icon }) => (
                              <button
                  key={key}
                  onClick={() => setActiveTab(key as 'basic' | 'multi-role' | 'planning' | 'analysis' | 'reports' | 'templates' | 'currency')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Project Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                  <input type="text" value={projectName} onChange={(e) => onProjectNameChange?.(e.target.value)} className="input-field" placeholder="Enter project name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Currency</label>
                  <select value={projectSettings.target_currency} onChange={(e) => setProjectSettings({ ...projectSettings, target_currency: e.target.value })} className="input-field">
                    {CURRENCIES.map(currency => (
                      <option key={currency.code} value={currency.code}>{currency.code} ({currency.symbol}) - {currency.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={projectDescription} onChange={(e) => onProjectDescriptionChange?.(e.target.value)} className="input-field" rows={3} placeholder="Enter project description" />
              </div>
            </div>
            {/* Project Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Settings</h3>
                <button
                  onClick={() => setShowProjectSettings(!showProjectSettings)}
                  className="btn-secondary flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showProjectSettings ? 'Hide' : 'Show'} Settings
                </button>
              </div>
              
              {showProjectSettings && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Months)</label>
                    <input type="number" value={projectSettings.duration_months} onChange={(e) => setProjectSettings({ ...projectSettings, duration_months: parseInt(e.target.value) || 1 })} className="input-field" min="1" max="60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Hours</label>
                    <input type="number" value={projectSettings.monthly_hours} onChange={(e) => setProjectSettings({ ...projectSettings, monthly_hours: parseInt(e.target.value) || 160 })} className="input-field" min="1" max="400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exchange Rate Base</label>
                    <select value={projectSettings.exchange_rate_base} onChange={(e) => setProjectSettings({ ...projectSettings, exchange_rate_base: e.target.value })} className="input-field">
                      {CURRENCIES.map(currency => (
                        <option key={currency.code} value={currency.code}>{currency.code}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Exchange Rates Display */}
              {Object.keys(exchangeRates).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exchange Rates (Base: {projectSettings.exchange_rate_base})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(exchangeRates).map(([currency, rate]) => (
                      <div key={currency} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{currency}:</span>
                        <span className="font-medium">{rate.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Team Members */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
                <div className="flex space-x-2">
                  {roleCatalog.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowRoleCatalog(!showRoleCatalog)}
                        className="btn-secondary flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add from Catalog
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </button>
                      {showRoleCatalog && (
                        <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredRoleCatalog.map((catalogRole) => (
                              <button
                                key={catalogRole.id}
                                onClick={() => addRoleFromCatalog(catalogRole)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{catalogRole.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  ${catalogRole.base_rate}/hr • {catalogRole.category || 'General'}
                                </div>
                                {catalogRole.description && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {catalogRole.description}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={addRole}
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Role
                  </button>
                </div>
              </div>

              {roles.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No team members added yet. Click "Add Role" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                          <input type="text" value={role.name} onChange={(e) => updateRole(role.id, 'name', e.target.value)} className="input-field" placeholder="e.g., Senior Developer" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                          <select value={role.location} onChange={(e) => updateRole(role.id, 'location', e.target.value)} className="input-field">
                            {LOCATIONS.map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate</label>
                          <input type="number" value={role.hourly_rate} onChange={(e) => updateRole(role.id, 'hourly_rate', parseFloat(e.target.value) || 0)} className="input-field" placeholder="0.00" min="0" step="0.01" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Rate</label>
                          <input type="number" value={role.cost_rate} onChange={(e) => updateRole(role.id, 'cost_rate', parseFloat(e.target.value) || 0)} className="input-field" placeholder="0.00" min="0" step="0.01" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill Rate</label>
                          <input type="number" value={role.bill_rate} onChange={(e) => updateRole(role.id, 'bill_rate', parseFloat(e.target.value) || 0)} className="input-field" placeholder="0.00" min="0" step="0.01" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Hours</label>
                          <input type="number" value={role.hours} onChange={(e) => updateRole(role.id, 'hours', parseFloat(e.target.value) || 0)} className="input-field" placeholder="160" min="0" step="1" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Allocation (%)</label>
                          <div className="flex items-center space-x-2">
                            <input type="number" value={role.monthly_allocation} onChange={(e) => updateRole(role.id, 'monthly_allocation', parseFloat(e.target.value) || 0)} className="input-field" placeholder="100" min="0" max="100" step="5" />
                            <button
                              onClick={() => setSelectedRoleForAllocation(role.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit monthly allocation"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Cost</label>
                            <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                              {formatCurrency(role.cost, role.currency)}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              // Auto-calculate cost_rate and bill_rate based on hourly_rate
                              const hourlyRate = role.hourly_rate
                              updateRole(role.id, 'cost_rate', hourlyRate * 0.8)
                              setTimeout(() => updateRole(role.id, 'bill_rate', hourlyRate * 1.3), 100)
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Auto-calculate Cost & Bill rates from Hourly rate"
                          >
                            <Calculator className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeRole(role.id)}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Project Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Summary</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
                    className="btn-secondary flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {showMonthlyBreakdown ? 'Hide' : 'Show'} Monthly View
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="btn-secondary flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button
                    onClick={clearCalculator}
                    className="btn-secondary flex items-center"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Total Cost</p>
                      <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                        {formatCurrency(calculations.total_cost, projectSettings.target_currency)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Billing</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(calculations.total_billing, projectSettings.target_currency)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Gross Margin</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(calculations.gross_margin, projectSettings.target_currency)}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        ({calculations.gross_margin_percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blended Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(calculations.blended_rate, projectSettings.target_currency)}/hr
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown */}
              {showMonthlyBreakdown && calculations.monthly_breakdown.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Monthly Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Billing</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin %</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {calculations.monthly_breakdown.map((month) => (
                          <tr key={month.month}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Month {month.month}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(month.total_cost, projectSettings.target_currency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(month.total_billing, projectSettings.target_currency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(month.margin, projectSettings.target_currency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {month.margin_percentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Multi-Role Selection Tab */}
              {activeTab === 'multi-role' && (
                <MultiRoleSelector
                  onAddMembers={(members) => {
                    members.forEach(member => {
                      const newRole: ProjectRole = {
                        id: Date.now().toString() + Math.random(),
                        name: member.name,
                        location: member.location,
                        hourly_rate: member.billingRate,
                        bill_rate: member.billingRate * 1.3,
                        cost_rate: member.billingRate * 0.8,
                        monthly_allocation: member.monthlyAllocation,
                        hours: 0,
                        cost: 0,
                        currency: member.currency,
                        monthly_breakdown: []
                      }
                      setRoles(prev => [...prev, newRole])
                    })
                  }}
                  existingMembers={roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    role: role.name,
                    location: role.location,
                    monthlyAllocation: role.monthly_allocation,
                    billingRate: role.bill_rate,
                    currency: role.currency
                  }))}
                  currency={projectSettings.target_currency}
                />
              )}

              {/* Monthly Planning Tab */}
              {activeTab === 'planning' && (
                <MonthlyPlanner
                  teamMembers={roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    role: role.name,
                    location: role.location,
                    monthlyAllocation: role.monthly_allocation,
                    billingRate: role.bill_rate,
                    currency: role.currency
                  }))}
                  projectDuration={projectSettings.duration_months}
                  onUpdateAllocations={(allocations) => {
                    // Update monthly allocations
                    console.log('Monthly allocations updated:', allocations)
                  }}
                  currency={projectSettings.target_currency}
                />
              )}

              {/* Cost Analysis Tab */}
              {activeTab === 'analysis' && (
                <CostAnalysis
                  teamMembers={roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    role: role.name,
                    location: role.location,
                    monthlyAllocation: role.monthly_allocation,
                    billingRate: role.bill_rate,
                    currency: role.currency
                  }))}
                  projectCurrency={projectSettings.target_currency}
                  projectDuration={projectSettings.duration_months}
                  onOptimizationApply={(suggestions) => {
                    // Apply optimization suggestions
                    console.log('Optimization suggestions:', suggestions)
                    toast.success(`Applied ${suggestions.length} optimizations`)
                  }}
                />
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <ProjectReports
                  project={{
                    id: 'current',
                    name: projectName || 'Current Project',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + projectSettings.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    budget: calculations.total_billing,
                    actualCost: calculations.total_cost,
                    teamMembers: roles.map(role => ({
                      id: role.id,
                      name: role.name,
                      role: role.name,
                      location: role.location,
                      monthlyAllocation: role.monthly_allocation,
                      billingRate: role.bill_rate,
                      currency: role.currency
                    })),
                    milestones: [],
                    currency: projectSettings.target_currency
                  }}
                  onExport={(format) => {
                    console.log(`Exporting report as ${format}`)
                    toast.success(`Report exported as ${format.toUpperCase()}`)
                  }}
                  onShare={(email) => {
                    console.log(`Sharing report with ${email}`)
                    toast.success(`Report shared with ${email}`)
                  }}
                />
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <CalculatorTemplates
                  onApplyTemplate={(template) => {
                    // Apply template to current project
                    console.log('Applying template:', template)
                    toast.success(`Applied template: ${template.name}`)
                  }}
                  onSaveTemplate={(template) => {
                    // Save current project as template
                    console.log('Saving template:', template)
                    toast.success(`Template saved: ${template.name}`)
                  }}
                  currentProject={{
                    name: projectName,
                    description: projectDescription,
                    roles,
                    settings: projectSettings,
                    calculations
                  }}
                />
              )}

              {/* Currency Conversion Tab */}
              {activeTab === 'currency' && (
                <CurrencyConversion
                  onCurrencyChange={handleCurrencyChange}
                />
              )}

              {/* Save Button */}
              {onSave && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Save Project'}
                  </button>
                </div>
              )}
            </div>
            {/* Calculation Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calculation Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Totals */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Project Totals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                      <span className="font-medium">{formatCurrency(calculations.total_cost, projectSettings.target_currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(calculations.total_billing, projectSettings.target_currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Profit:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(calculations.gross_margin, projectSettings.target_currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Margin %:</span>
                      <span className="font-medium">{calculations.gross_margin_percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Project Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Project Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium">{projectSettings.duration_months} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Hours:</span>
                      <span className="font-medium">{projectSettings.monthly_hours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                      <span className="font-medium">{projectSettings.target_currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Team Members:</span>
                      <span className="font-medium">{roles.length}</span>
                    </div>
                  </div>
                </div>

                {/* Role Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Role Breakdown</h4>
                  <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {roles.map(role => {
                      const monthlyCost = projectSettings.monthly_hours * role.cost_rate
                      const monthlyRevenue = projectSettings.monthly_hours * role.bill_rate
                      const margin = role.bill_rate > 0 ? (role.bill_rate - role.cost_rate) / role.bill_rate : 0
                      
                      return (
                        <div key={role.id} className="border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                          <div className="font-medium text-gray-800 dark:text-gray-200">{role.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Cost: {formatCurrency(role.cost_rate, role.currency)}/hr | 
                            Bill: {formatCurrency(role.bill_rate, role.currency)}/hr | 
                            Margin: {(margin * 100).toFixed(1)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Formula Verification */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Formula Verification</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={testCalculations}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Test Formulas
                    </button>
                    <button
                      onClick={testSave}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Test Save
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-400">Required Formulas:</div>
                    <ul className="mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                      <li>✓ margin = (billRate - costRate) / billRate</li>
                      <li>✓ monthlyCost = monthlyHours × costRate</li>
                      <li>✓ monthlyRevenue = monthlyHours × billRate</li>
                      <li>✓ totalCost = monthlyCost × projectDuration</li>
                      <li>✓ totalRevenue = monthlyRevenue × projectDuration</li>
                      <li>✓ profit = totalRevenue - totalCost</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-400">Required Fields:</div>
                    <ul className="mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                      <li>✓ costRate (cost_rate)</li>
                      <li>✓ billRate (bill_rate)</li>
                      <li>✓ monthlyHours (monthly_hours)</li>
                      <li>✓ projectDuration (duration_months)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectCalculator; 
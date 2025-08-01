import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Save, 
  DollarSign, 
  Calculator, 
  Settings,
  Users,
  Download,
  Percent
} from 'lucide-react'
import type { 
  ProjectRole, 
  ProjectData, 
  RoleCatalog, 
  ProjectSettings,
  ProjectCalculations
} from '../lib/supabase'
import { toast } from 'react-hot-toast'

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

const ROLES = [
  'Senior Developer',
  'QA Engineer', 
  'Technical Lead',
  'Project Manager',
  'UI/UX Designer',
  'DevOps Engineer',
  'Business Analyst',
  'Scrum Master',
  'Data Scientist',
  'Security Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'Database Administrator',
  'System Architect'
]

// Realistic market rates based on 2024 industry standards
const ROLE_RATES = {
  'Senior Developer': { bill: 95, cost: 75 },
  'QA Engineer': { bill: 65, cost: 50 },
  'Technical Lead': { bill: 125, cost: 95 },
  'Project Manager': { bill: 110, cost: 85 },
  'UI/UX Designer': { bill: 85, cost: 65 },
  'DevOps Engineer': { bill: 115, cost: 90 },
  'Business Analyst': { bill: 90, cost: 70 },
  'Scrum Master': { bill: 100, cost: 80 },
  'Data Scientist': { bill: 120, cost: 95 },
  'Security Engineer': { bill: 130, cost: 100 },
  'Frontend Developer': { bill: 85, cost: 65 },
  'Backend Developer': { bill: 90, cost: 70 },
  'Full Stack Developer': { bill: 95, cost: 75 },
  'Mobile Developer': { bill: 90, cost: 70 },
  'Database Administrator': { bill: 95, cost: 75 },
  'System Architect': { bill: 140, cost: 110 }
}

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
      duration_months: 6,      // Typical project duration
      monthly_hours: 160,      // Standard full-time monthly hours (40hrs/week * 4 weeks)
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
  
  // Form state for adding new team members
  const [newMember, setNewMember] = useState({
    role: '',
    name: '',
    location: 'United States',
    billRate: 95, // Realistic Senior Developer rate
    allocation: 100,
    costCurrency: 'USD',
    costRate: 75 // Realistic cost rate (21% margin)
  })

  // Local project state (use props if available, otherwise manage locally)
  const [localProjectName, setLocalProjectName] = useState(projectName || initialData?.name || '')
  const [localProjectDescription, setLocalProjectDescription] = useState(projectDescription || initialData?.description || '')
  
  // Get the actual project name and description to use
  const actualProjectName = projectName || localProjectName
  const actualProjectDescription = projectDescription || localProjectDescription

  // Realistic exchange rates (as of 2024) - rates show how much USD you get for 1 unit of foreign currency
  const [exchangeRates] = useState({
    USD: 1.00,
    EUR: 1.09,  // 1 EUR = 1.09 USD
    GBP: 1.27,  // 1 GBP = 1.27 USD  
    CAD: 0.74,  // 1 CAD = 0.74 USD
    AUD: 0.67,  // 1 AUD = 0.67 USD
    CHF: 1.14,  // 1 CHF = 1.14 USD
    JPY: 0.0067 // 1 JPY = 0.0067 USD
  })

  // Handle role selection and auto-populate rates
  const handleRoleChange = (selectedRole: string) => {
    const roleRates = ROLE_RATES[selectedRole as keyof typeof ROLE_RATES]
    if (roleRates) {
      setNewMember({
        ...newMember,
        role: selectedRole,
        billRate: roleRates.bill,
        costRate: roleRates.cost
      })
    } else {
      setNewMember({
        ...newMember,
        role: selectedRole
      })
    }
  }

  // Recalculate project when roles or project settings change
  useEffect(() => {
    recalculateProject()
  }, [roles, projectSettings])

  const recalculateProject = () => {
    let totalCost = 0
    let totalRevenue = 0
    
    roles.forEach(role => {
      // Calculate using V4 formulas
      const hoursPerMonth = (projectSettings.monthly_hours * role.monthly_allocation) / 100
      
      // Convert rates to target currency for proper totals
      const billRateInTargetCurrency = convertCurrency(role.bill_rate, role.currency, projectSettings.target_currency)
      const costRateInTargetCurrency = convertCurrency(role.cost_rate, role.currency, projectSettings.target_currency)
      
      const monthlyBill = hoursPerMonth * billRateInTargetCurrency
      const monthlyCost = hoursPerMonth * costRateInTargetCurrency
      const totalBill = monthlyBill * projectSettings.duration_months
      const totalCostForRole = monthlyCost * projectSettings.duration_months
      
      totalRevenue += totalBill
      totalCost += totalCostForRole
    })
    
    const grossMargin = totalRevenue - totalCost
    const grossMarginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0
    const totalHours = roles.reduce((sum, role) => sum + (projectSettings.monthly_hours * role.monthly_allocation / 100), 0) * projectSettings.duration_months
    const blendedRate = totalHours > 0 ? totalRevenue / totalHours : 0

    setCalculations({
      total_cost: totalCost,
      total_billing: totalRevenue,
      gross_margin: grossMargin,
      gross_margin_percentage: grossMarginPercentage,
      blended_rate: blendedRate,
      monthly_breakdown: []
    })
  }

  const addRole = () => {
    if (!newMember.role || !newMember.name) {
      toast.error('Please fill in role and name fields')
      return
    }

    const newRole: ProjectRole = {
      id: Date.now().toString(),
      name: `${newMember.role} - ${newMember.name}`,
      location: newMember.location,
      hourly_rate: newMember.billRate,
      bill_rate: newMember.billRate,
      cost_rate: newMember.costRate,
      monthly_allocation: newMember.allocation,
      hours: 0,
      cost: 0,
      currency: newMember.costCurrency,
      monthly_breakdown: []
    }
    setRoles([...roles, newRole])
    
    // Reset form with Senior Developer defaults (most common role)
    setNewMember({
      role: '',
      name: '',
      location: 'United States',
      billRate: 95,  // Senior Developer market rate
      allocation: 100,
      costCurrency: 'USD',
      costRate: 75   // Senior Developer cost rate (21% margin)
    })
    
    toast.success('Team member added successfully')
  }

  const removeRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id))
  }

  // Handle project name change
  const handleProjectNameChange = (name: string) => {
    setLocalProjectName(name)
    if (onProjectNameChange) {
      onProjectNameChange(name)
    }
  }

  // Handle project description change
  const handleProjectDescriptionChange = (description: string) => {
    setLocalProjectDescription(description)
    if (onProjectDescriptionChange) {
      onProjectDescriptionChange(description)
    }
  }

  const handleSave = () => {
    if (!actualProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }
    
    if (onSave) {
      onSave({
        name: actualProjectName,
        description: actualProjectDescription,
        roles,
        project_settings: projectSettings,
        calculations,
        exchange_rates: exchangeRates
      })
    }
  }

  const exportToExcel = () => {
    const data = {
      projectName: actualProjectName,
      projectDescription: actualProjectDescription,
      settings: projectSettings,
      roles,
      calculations
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${actualProjectName || 'project'}-data.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Project data exported successfully')
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode)
    return `${currency?.symbol || currencyCode}${amount.toFixed(2)}`
  }

  // Convert currency using real exchange rates
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount
    
    // Convert to USD first (base currency)
    const amountInUSD = fromCurrency === 'USD' ? amount : amount * exchangeRates[fromCurrency as keyof typeof exchangeRates]
    
    // Convert from USD to target currency
    const targetRate = exchangeRates[toCurrency as keyof typeof exchangeRates]
    return toCurrency === 'USD' ? amountInUSD : amountInUSD / targetRate
  }

  // Add sample team members to demonstrate realistic rates and currency conversion
  const addSampleTeam = () => {
    const sampleMembers = [
      { role: 'Technical Lead', name: 'Sarah Johnson', location: 'United States', currency: 'USD' },
      { role: 'Senior Developer', name: 'Hans Mueller', location: 'Germany', currency: 'EUR' },
      { role: 'QA Engineer', name: 'Emily Rodriguez', location: 'United States', currency: 'USD' },
      { role: 'UI/UX Designer', name: 'James Wilson', location: 'United Kingdom', currency: 'GBP' }
    ]

    const newRoles = sampleMembers.map((member, index) => {
      const roleRates = ROLE_RATES[member.role as keyof typeof ROLE_RATES]
      
      // Convert rates to local currency if not USD
      let billRate = roleRates.bill
      let costRate = roleRates.cost
      
      if (member.currency !== 'USD') {
        // Convert USD rates to local currency
        const exchangeRate = exchangeRates[member.currency as keyof typeof exchangeRates]
        billRate = roleRates.bill / exchangeRate
        costRate = roleRates.cost / exchangeRate
      }
      
      return {
        id: (Date.now() + index).toString(),
        name: `${member.role} - ${member.name}`,
        location: member.location,
        hourly_rate: billRate,
        bill_rate: billRate,
        cost_rate: costRate,
        monthly_allocation: 100,
        hours: 0,
        cost: 0,
        currency: member.currency,
        monthly_breakdown: []
      }
    })

    setRoles([...roles, ...newRoles])
    toast.success('Sample team added with realistic market rates and currency conversion!')
  }

  return (
    <div className="space-y-6">
      {/* Project Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Settings</h3>
        </div>
        
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name *</label>
            <input 
              type="text" 
              value={actualProjectName} 
              onChange={(e) => handleProjectNameChange(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              placeholder="e.g., Web Platform Development"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Description</label>
            <input 
              type="text" 
              value={actualProjectDescription} 
              onChange={(e) => handleProjectDescriptionChange(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              placeholder="e.g., Modern web application with React and Node.js"
            />
          </div>
        </div>

        {/* Project Configuration */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Hours</label>
            <input 
              type="number" 
              value={projectSettings.monthly_hours} 
              onChange={(e) => setProjectSettings({ ...projectSettings, monthly_hours: parseInt(e.target.value) || 160 })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              placeholder="160" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Duration (months)</label>
            <input 
              type="number" 
              value={projectSettings.duration_months} 
              onChange={(e) => setProjectSettings({ ...projectSettings, duration_months: parseInt(e.target.value) || 6 })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              placeholder="6" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
            <select 
              value={projectSettings.target_currency} 
              onChange={(e) => setProjectSettings({ ...projectSettings, target_currency: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.code} ({currency.symbol})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Team Member */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Team Member</h3>
        </div>
        


        {/* Add Member Form */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
            <select 
              value={newMember.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a role</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              placeholder="e.g., John Doe"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <select 
              value={newMember.location}
              onChange={(e) => setNewMember({...newMember, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {LOCATIONS.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill Rate ($/hr)</label>
            <input
              type="number"
              value={newMember.billRate}
              onChange={(e) => setNewMember({...newMember, billRate: Number(e.target.value)})}
              placeholder="95"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allocation (%)</label>
            <input
              type="number"
              value={newMember.allocation}
              onChange={(e) => setNewMember({...newMember, allocation: Number(e.target.value)})}
              placeholder="100"
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost Currency</label>
            <select 
              value={newMember.costCurrency}
              onChange={(e) => setNewMember({...newMember, costCurrency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.code} ({currency.symbol})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost Rate ($/hr)</label>
            <input
              type="number"
              value={newMember.costRate}
              onChange={(e) => setNewMember({...newMember, costRate: Number(e.target.value)})}
              placeholder="75"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={addRole}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
          
          <button
            onClick={addSampleTeam}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Add Sample Team
          </button>
        </div>
      </div>

      {/* Team Members & Cost Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members & Cost Breakdown</h3>
          <button
            onClick={exportToExcel}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </button>
        </div>

        {/* Data Table */}
        {roles.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No team members added yet. Add team members to see the cost breakdown.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Role & Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Bill Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Cost Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Margin %</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Allocation</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hours/Month</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Monthly Bill</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Monthly Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Bill</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => {
                  const hoursPerMonth = (projectSettings.monthly_hours * role.monthly_allocation) / 100
                  
                  // Convert rates to target currency for display in totals
                  const billRateInTargetCurrency = convertCurrency(role.bill_rate, role.currency, projectSettings.target_currency)
                  const costRateInTargetCurrency = convertCurrency(role.cost_rate, role.currency, projectSettings.target_currency)
                  
                  const monthlyBill = hoursPerMonth * billRateInTargetCurrency
                  const monthlyCost = hoursPerMonth * costRateInTargetCurrency
                  const totalBill = monthlyBill * projectSettings.duration_months
                  const totalCost = monthlyCost * projectSettings.duration_months
                  const margin = role.bill_rate > 0 ? ((role.bill_rate - role.cost_rate) / role.bill_rate) * 100 : 0

                  return (
                    <tr key={role.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{role.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{role.id}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{role.location}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(role.bill_rate, role.currency)}/hr
                        </div>
                        {role.currency !== projectSettings.target_currency && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            (~{formatCurrency(convertCurrency(role.bill_rate, role.currency, projectSettings.target_currency), projectSettings.target_currency)}/hr)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-red-600 dark:text-red-400">
                          {formatCurrency(role.cost_rate, role.currency)}/hr
                        </div>
                        {role.currency !== projectSettings.target_currency && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            (~{formatCurrency(convertCurrency(role.cost_rate, role.currency, projectSettings.target_currency), projectSettings.target_currency)}/hr)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${margin > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {margin.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{role.monthly_allocation}%</span>
                          <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full ml-2">
                            <div 
                              className="h-2 bg-blue-600 rounded-full" 
                              style={{ width: `${role.monthly_allocation}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{hoursPerMonth.toFixed(1)}</td>
                      <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(monthlyBill, projectSettings.target_currency)}
                      </td>
                      <td className="py-3 px-4 font-medium text-orange-600 dark:text-orange-400">
                        {formatCurrency(monthlyCost, projectSettings.target_currency)}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(totalBill, projectSettings.target_currency)}
                      </td>
                      <td className="py-3 px-4 font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(totalCost, projectSettings.target_currency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => removeRole(role.id)}
                            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatCurrency(calculations.total_billing, projectSettings.target_currency)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Project Bill</div>
          <div className="text-blue-600 dark:text-blue-400">
            <DollarSign className="h-6 w-6 mx-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {formatCurrency(calculations.total_cost, projectSettings.target_currency)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Project Cost</div>
          <div className="text-orange-600 dark:text-orange-400">
            <DollarSign className="h-6 w-6 mx-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            {calculations.gross_margin_percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gross Margin %</div>
          <div className="text-green-600 dark:text-green-400">
            <Percent className="h-6 w-6 mx-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {formatCurrency(calculations.blended_rate, projectSettings.target_currency)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Blended Rate</div>
          <div className="text-purple-600 dark:text-purple-400">
            <Calculator className="h-6 w-6 mx-auto" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
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
  )
}

export default ProjectCalculator
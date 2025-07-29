import React, { useState, useEffect, useMemo } from 'react'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Users,
  Target,
  AlertTriangle,
  Lightbulb,
  Download,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'
import { exchangeRateService } from '../lib/exchangeRates'
import { toast } from 'react-hot-toast'

interface TeamMember {
  id?: string
  name: string
  role: string
  location: string
  monthlyAllocation: number
  billingRate: number
  currency: string
  startDate?: string
  endDate?: string
}

interface CostBreakdown {
  role: string
  location: string
  memberCount: number
  totalCost: number
  averageCost: number
  percentage: number
}

interface MarginAnalysis {
  memberId: string
  name: string
  role: string
  billingRate: number
  costPerMonth: number
  suggestedRate: number
  margin: number
  optimization: 'increase' | 'decrease' | 'optimal'
}

interface CurrencyImpact {
  currency: string
  totalCost: number
  convertedCost: number
  exchangeRate: number
  impact: number
}

interface OptimizationSuggestion {
  type: 'rate' | 'allocation' | 'location' | 'timing'
  title: string
  description: string
  potentialSavings: number
  impact: 'low' | 'medium' | 'high'
  action: string
}

interface CostAnalysisProps {
  teamMembers: TeamMember[]
  projectCurrency: string
  projectDuration: number
  onOptimizationApply: (suggestions: OptimizationSuggestion[]) => void
}

export const CostAnalysis: React.FC<CostAnalysisProps> = ({
  teamMembers,
  projectCurrency,
  projectDuration,
  onOptimizationApply
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'margin' | 'currency' | 'optimization'>('breakdown')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)

  // Calculate cost breakdown by role and location
  const costBreakdown = useMemo(() => {
    const breakdown: CostBreakdown[] = []
    const totalCost = teamMembers.reduce((sum, member) => {
      return sum + (member.billingRate * member.monthlyAllocation * 160) / 100
    }, 0)

    // Group by role and location
    const groups = teamMembers.reduce((acc, member) => {
      const key = `${member.role}-${member.location}`
      if (!acc[key]) {
        acc[key] = {
          role: member.role,
          location: member.location,
          members: [],
          totalCost: 0
        }
      }
      acc[key].members.push(member)
      acc[key].totalCost += (member.billingRate * member.monthlyAllocation * 160) / 100
      return acc
    }, {} as Record<string, any>)

    Object.values(groups).forEach((group: any) => {
      breakdown.push({
        role: group.role,
        location: group.location,
        memberCount: group.members.length,
        totalCost: group.totalCost,
        averageCost: group.totalCost / group.members.length,
        percentage: (group.totalCost / totalCost) * 100
      })
    })

    return breakdown.sort((a, b) => b.totalCost - a.totalCost)
  }, [teamMembers])

  // Calculate margin analysis
  const marginAnalysis = useMemo(() => {
    const analysis: MarginAnalysis[] = []
    const marketRates = {
      'Developer': { min: 50, max: 150, optimal: 80 },
      'Designer': { min: 40, max: 120, optimal: 70 },
      'Project Manager': { min: 60, max: 180, optimal: 100 },
      'QA Engineer': { min: 45, max: 130, optimal: 75 },
      'DevOps Engineer': { min: 70, max: 200, optimal: 120 }
    }

    teamMembers.forEach(member => {
      const marketRate = marketRates[member.role as keyof typeof marketRates] || { min: 50, max: 150, optimal: 80 }
      const costPerMonth = (member.billingRate * member.monthlyAllocation * 160) / 100
      const margin = ((marketRate.optimal - member.billingRate) / member.billingRate) * 100
      
      let optimization: 'increase' | 'decrease' | 'optimal'
      if (member.billingRate < marketRate.min) {
        optimization = 'increase'
      } else if (member.billingRate > marketRate.max) {
        optimization = 'decrease'
      } else {
        optimization = 'optimal'
      }

      analysis.push({
        memberId: member.id || member.name,
        name: member.name,
        role: member.role,
        billingRate: member.billingRate,
        costPerMonth,
        suggestedRate: marketRate.optimal,
        margin,
        optimization
      })
    })

    return analysis.sort((a, b) => Math.abs(b.margin) - Math.abs(a.margin))
  }, [teamMembers])

  // Calculate currency impact
  const currencyImpact = useMemo(async () => {
    const impact: CurrencyImpact[] = []
    const currencyGroups = teamMembers.reduce((acc, member) => {
      if (!acc[member.currency]) {
        acc[member.currency] = {
          members: [],
          totalCost: 0
        }
      }
      acc[member.currency].members.push(member)
      acc[member.currency].totalCost += (member.billingRate * member.monthlyAllocation * 160) / 100
      return acc
    }, {} as Record<string, any>)

    for (const [currency, group] of Object.entries(currencyGroups)) {
      if (currency === projectCurrency) {
        impact.push({
          currency,
          totalCost: group.totalCost,
          convertedCost: group.totalCost,
          exchangeRate: 1,
          impact: 0
        })
      } else {
        try {
          const rate = await exchangeRateService.getExchangeRate(currency, projectCurrency)
          const convertedCost = exchangeRateService.convertAmount(group.totalCost, currency, projectCurrency, rate.rate)
          impact.push({
            currency,
            totalCost: group.totalCost,
            convertedCost,
            exchangeRate: rate.rate,
            impact: ((convertedCost - group.totalCost) / group.totalCost) * 100
          })
        } catch (error) {
          console.warn('Failed to get exchange rate for currency:', currency)
          impact.push({
            currency,
            totalCost: group.totalCost,
            convertedCost: group.totalCost,
            exchangeRate: 1,
            impact: 0
          })
        }
      }
    }

    return impact.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
  }, [teamMembers, projectCurrency])

  // Generate optimization suggestions
  const optimizationSuggestions = useMemo(() => {
    const suggestions: OptimizationSuggestion[] = []

    // Rate optimization suggestions
    marginAnalysis.forEach(member => {
      if (member.optimization === 'decrease') {
        suggestions.push({
          type: 'rate',
          title: `Optimize ${member.name}'s rate`,
          description: `Consider reducing ${member.name}'s rate from ${member.billingRate} to ${member.suggestedRate} for better market alignment`,
          potentialSavings: (member.billingRate - member.suggestedRate) * (member.costPerMonth / member.billingRate) * projectDuration,
          impact: Math.abs(member.margin) > 30 ? 'high' : Math.abs(member.margin) > 15 ? 'medium' : 'low',
          action: `Reduce rate to ${member.suggestedRate}`
        })
      }
    })

    // Allocation optimization
    const highAllocationMembers = teamMembers.filter(member => member.monthlyAllocation > 100)
    highAllocationMembers.forEach(member => {
      suggestions.push({
        type: 'allocation',
        title: `Review ${member.name}'s allocation`,
        description: `${member.name} has ${member.monthlyAllocation}% allocation which exceeds 100%`,
        potentialSavings: (member.monthlyAllocation - 100) * (member.billingRate * 160) / 100 * projectDuration,
        impact: 'medium',
        action: 'Reduce allocation to 100%'
      })
    })

    // Location optimization
    const locationCosts = costBreakdown.reduce((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = { totalCost: 0, memberCount: 0 }
      }
      acc[item.location].totalCost += item.totalCost
      acc[item.location].memberCount += item.memberCount
      return acc
    }, {} as Record<string, any>)

    const avgCosts = Object.entries(locationCosts).map(([location, data]) => ({
      location,
      avgCost: data.totalCost / data.memberCount
    })).sort((a, b) => b.avgCost - a.avgCost)

    if (avgCosts.length > 1) {
      const expensiveLocation = avgCosts[0]
      const affordableLocation = avgCosts[avgCosts.length - 1]
      
      suggestions.push({
        type: 'location',
        title: 'Consider location-based optimization',
        description: `${expensiveLocation.location} has higher average costs than ${affordableLocation.location}`,
        potentialSavings: (expensiveLocation.avgCost - affordableLocation.avgCost) * locationCosts[expensiveLocation.location].memberCount * projectDuration,
        impact: 'high',
        action: `Consider relocating some team members to ${affordableLocation.location}`
      })
    }

    return suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings)
  }, [teamMembers, marginAnalysis, costBreakdown, projectDuration])

  const getTotalProjectCost = () => {
    return teamMembers.reduce((sum, member) => {
      return sum + (member.billingRate * member.monthlyAllocation * 160 * projectDuration) / 100
    }, 0)
  }

  const getTotalPotentialSavings = () => {
    return optimizationSuggestions.reduce((sum, suggestion) => sum + suggestion.potentialSavings, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cost Analysis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comprehensive cost breakdown and optimization insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary flex items-center space-x-2"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          </button>
          <button
            onClick={() => onOptimizationApply(optimizationSuggestions)}
            className="btn-primary flex items-center space-x-2"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Apply Optimizations</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {projectCurrency} {getTotalProjectCost().toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Potential Savings</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {projectCurrency} {getTotalPotentialSavings().toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Size</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {teamMembers.length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Optimizations</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {optimizationSuggestions.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'breakdown', label: 'Cost Breakdown', icon: PieChart },
              { key: 'margin', label: 'Margin Analysis', icon: BarChart3 },
              { key: 'currency', label: 'Currency Impact', icon: TrendingUp },
              { key: 'optimization', label: 'Optimizations', icon: Lightbulb }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
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

        <div className="p-6">
          {/* Cost Breakdown Tab */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cost Breakdown by Role & Location
                </h4>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="all">All Roles</option>
                    {Array.from(new Set(costBreakdown.map(item => item.role))).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="all">All Locations</option>
                    {Array.from(new Set(costBreakdown.map(item => item.location))).map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Placeholder */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Cost breakdown chart</p>
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="space-y-4">
                  {costBreakdown
                    .filter(item => selectedRole === 'all' || item.role === selectedRole)
                    .filter(item => selectedLocation === 'all' || item.location === selectedLocation)
                    .map((item, index) => (
                      <div
                        key={`${item.role}-${item.location}`}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{item.role}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {projectCurrency} {item.totalCost.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.memberCount} members • {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Margin Analysis Tab */}
          {activeTab === 'margin' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Margin Analysis by Team Member
              </h4>

              <div className="space-y-4">
                {marginAnalysis.map((member) => (
                  <div
                    key={member.memberId}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        member.optimization === 'optimal' ? 'bg-green-500' :
                        member.optimization === 'decrease' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {projectCurrency} {member.billingRate}/hr
                      </div>
                      <div className={`text-xs ${
                        member.margin > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {member.margin > 0 ? '+' : ''}{member.margin.toFixed(1)}% vs market
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Currency Impact Tab */}
          {activeTab === 'currency' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Currency Exchange Impact
              </h4>

              <div className="space-y-4">
                {/* Currency impact will be populated when async calculation completes */}
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading currency impact analysis...</p>
                </div>
              </div>
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Cost Optimization Suggestions
              </h4>

              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${
                            suggestion.impact === 'high' ? 'bg-red-500' :
                            suggestion.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <h5 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h5>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Potential savings: {projectCurrency} {suggestion.potentialSavings.toLocaleString()}</span>
                          <span>Impact: {suggestion.impact}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Apply specific optimization
                          toast.success(`Applied: ${suggestion.action}`)
                        }}
                        className="btn-secondary text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}

                {optimizationSuggestions.length === 0 && (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No optimization suggestions available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
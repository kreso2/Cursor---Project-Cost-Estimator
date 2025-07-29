import React, { useState, useEffect, useMemo } from 'react'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Share2,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Target,
  Filter,
  Eye,
  FileText,
  Printer,
  Mail
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProjectData {
  id: string
  name: string
  startDate: string
  endDate: string
  budget: number
  actualCost: number
  teamMembers: any[]
  milestones: any[]
  currency: string
}

interface ReportData {
  costSummary: {
    totalBudget: number
    actualCost: number
    remainingBudget: number
    variance: number
    variancePercentage: number
  }
  teamSummary: {
    totalMembers: number
    roles: Record<string, number>
    locations: Record<string, number>
    averageRate: number
  }
  timelineSummary: {
    totalDuration: number
    completedMilestones: number
    totalMilestones: number
    progress: number
  }
  monthlyBreakdown: Array<{
    month: string
    budget: number
    actual: number
    variance: number
  }>
}

interface ProjectReportsProps {
  project: ProjectData
  onExport: (format: 'pdf' | 'excel' | 'csv') => void
  onShare: (email: string) => void
}

export const ProjectReports: React.FC<ProjectReportsProps> = ({
  project,
  onExport,
  onShare
}) => {
  const [activeReport, setActiveReport] = useState<'summary' | 'cost' | 'team' | 'timeline' | 'comparison'>('summary')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')
  const [showCharts, setShowCharts] = useState(true)
  const [selectedComparison, setSelectedComparison] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Calculate report data
  const reportData = useMemo((): ReportData => {
    const totalBudget = project.budget
    const actualCost = project.actualCost
    const remainingBudget = totalBudget - actualCost
    const variance = actualCost - totalBudget
    const variancePercentage = (variance / totalBudget) * 100

    // Team summary
    const roles = project.teamMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const locations = project.teamMembers.reduce((acc, member) => {
      acc[member.location] = (acc[member.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageRate = project.teamMembers.length > 0
      ? project.teamMembers.reduce((sum, member) => sum + member.billingRate, 0) / project.teamMembers.length
      : 0

    // Timeline summary
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) // months
    const completedMilestones = project.milestones.filter(m => new Date(m.date) <= new Date()).length
    const progress = (completedMilestones / project.milestones.length) * 100

    // Monthly breakdown (simplified)
    const monthlyBreakdown = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const month = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      const monthlyBudget = totalBudget / totalDuration
      const monthlyActual = monthlyBudget * (0.8 + Math.random() * 0.4) // Simulated actual cost
      
      monthlyBreakdown.push({
        month,
        budget: monthlyBudget,
        actual: monthlyActual,
        variance: monthlyActual - monthlyBudget
      })
      
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return {
      costSummary: {
        totalBudget,
        actualCost,
        remainingBudget,
        variance,
        variancePercentage
      },
      teamSummary: {
        totalMembers: project.teamMembers.length,
        roles,
        locations,
        averageRate
      },
      timelineSummary: {
        totalDuration,
        completedMilestones,
        totalMilestones: project.milestones.length,
        progress
      },
      monthlyBreakdown
    }
  }, [project])

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setLoading(true)
    try {
      await onExport(format)
      toast.success(`${format.toUpperCase()} report exported successfully`)
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const email = prompt('Enter email address to share report:')
    if (email) {
      try {
        await onShare(email)
        toast.success('Report shared successfully')
      } catch (error) {
        toast.error('Failed to share report')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Reports
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comprehensive project analysis and reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="btn-secondary flex items-center space-x-2"
          >
            {showCharts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{showCharts ? 'Hide' : 'Show'} Charts</span>
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <div className="relative">
            <button
              onClick={() => document.getElementById('export-menu')?.classList.toggle('hidden')}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <div
              id="export-menu"
              className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
            >
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Export as Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="input-field"
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Report Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'summary', label: 'Summary', icon: BarChart3 },
              { key: 'cost', label: 'Cost Analysis', icon: DollarSign },
              { key: 'team', label: 'Team Analysis', icon: Users },
              { key: 'timeline', label: 'Timeline', icon: Calendar },
              { key: 'comparison', label: 'Comparison', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveReport(key as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeReport === key
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
          {/* Summary Report */}
          {activeReport === 'summary' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Project Summary Report
              </h4>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Budget</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {project.currency} {reportData.costSummary.totalBudget.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">Team Size</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {reportData.teamSummary.totalMembers}
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {reportData.timelineSummary.totalDuration}m
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Progress</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {reportData.timelineSummary.progress.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Charts */}
              {showCharts && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cost Overview</h5>
                    <div className="flex items-center justify-center h-48">
                      <PieChart className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Trend</h5>
                    <div className="flex items-center justify-center h-48">
                      <LineChart className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">Cost Summary</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Budget:</span>
                      <span className="font-medium">{project.currency} {reportData.costSummary.totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Actual Cost:</span>
                      <span className="font-medium">{project.currency} {reportData.costSummary.actualCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Remaining Budget:</span>
                      <span className={`font-medium ${reportData.costSummary.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {project.currency} {reportData.costSummary.remainingBudget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Variance:</span>
                      <span className={`font-medium ${reportData.costSummary.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {reportData.costSummary.variancePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">Team Summary</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Members:</span>
                      <span className="font-medium">{reportData.teamSummary.totalMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Average Rate:</span>
                      <span className="font-medium">{project.currency} {reportData.teamSummary.averageRate.toFixed(0)}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Roles:</span>
                      <span className="font-medium">{Object.keys(reportData.teamSummary.roles).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Locations:</span>
                      <span className="font-medium">{Object.keys(reportData.teamSummary.locations).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cost Analysis Report */}
          {activeReport === 'cost' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Cost Analysis Report
              </h4>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Breakdown</h5>
                  <div className="space-y-2">
                    {reportData.monthlyBreakdown.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{month.month}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Budget: {project.currency} {month.budget.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {project.currency} {month.actual.toLocaleString()}
                          </div>
                          <div className={`text-sm ${month.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {month.variance >= 0 ? '+' : ''}{month.variance.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">Cost Trends</h5>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex items-center justify-center h-64">
                    <LineChart className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Analysis Report */}
          {activeReport === 'team' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Team Analysis Report
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">Role Distribution</h5>
                  <div className="space-y-2">
                    {Object.entries(reportData.teamSummary.roles).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{role}</span>
                        <span className="text-gray-600 dark:text-gray-400">{count} members</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">Location Distribution</h5>
                  <div className="space-y-2">
                    {Object.entries(reportData.teamSummary.locations).map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{location}</span>
                        <span className="text-gray-600 dark:text-gray-400">{count} members</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Report */}
          {activeReport === 'timeline' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Timeline Report
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Duration</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {reportData.timelineSummary.totalDuration} months
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">Completed Milestones</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {reportData.timelineSummary.completedMilestones}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Progress</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {reportData.timelineSummary.progress.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Timeline Chart</h5>
                  <div className="flex items-center justify-center h-48">
                    <BarChart3 className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Report */}
          {activeReport === 'comparison' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Comparison Report
              </h4>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Comparison</h5>
                  <div className="flex items-center justify-center h-48">
                    <BarChart3 className="h-12 w-12 text-gray-400" />
                  </div>
                </div>

                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select projects to compare with current project
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
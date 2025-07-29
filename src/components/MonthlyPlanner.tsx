import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Save, 
  Download,
  BarChart3,
  Clock,
  Target,
  Users,
  DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MonthlyAllocation {
  month: string
  allocation: number
  hours: number
  cost: number
  notes?: string
}

interface Milestone {
  id: string
  name: string
  date: string
  description: string
  impact: 'low' | 'medium' | 'high'
}

interface ResourceRamp {
  month: string
  percentage: number
  reason: string
}

interface MonthlyPlannerProps {
  teamMembers: any[]
  projectDuration: number // in months
  onUpdateAllocations: (allocations: MonthlyAllocation[]) => void
  currency: string
}

export const MonthlyPlanner: React.FC<MonthlyPlannerProps> = ({
  teamMembers,
  projectDuration,
  onUpdateAllocations,
  currency
}) => {
  const [monthlyAllocations, setMonthlyAllocations] = useState<MonthlyAllocation[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [resourceRamps, setResourceRamps] = useState<ResourceRamp[]>([])
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

  // Initialize monthly allocations
  useEffect(() => {
    const months = generateMonths(projectDuration)
    const initialAllocations = months.map(month => ({
      month,
      allocation: 100,
      hours: 160, // Default 160 hours per month
      cost: 0,
      notes: ''
    }))
    setMonthlyAllocations(initialAllocations)
  }, [projectDuration])

  // Calculate costs when allocations change
  useEffect(() => {
    const updatedAllocations = monthlyAllocations.map(allocation => ({
      ...allocation,
      cost: calculateMonthlyCost(allocation, teamMembers)
    }))
    setMonthlyAllocations(updatedAllocations)
    onUpdateAllocations(updatedAllocations)
  }, [teamMembers, monthlyAllocations.map(a => ({ allocation: a.allocation, hours: a.hours }))])

  const generateMonths = (duration: number): string[] => {
    const months = []
    const startDate = new Date()
    
    for (let i = 0; i < duration; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
      months.push(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }))
    }
    
    return months
  }

  const calculateMonthlyCost = (allocation: MonthlyAllocation, members: any[]): number => {
    return members.reduce((total, member) => {
      const memberCost = (member.billingRate * allocation.hours * allocation.allocation) / 100
      return total + memberCost
    }, 0)
  }

  const updateAllocation = (month: string, field: keyof MonthlyAllocation, value: any) => {
    setMonthlyAllocations(prev => prev.map(allocation =>
      allocation.month === month
        ? { ...allocation, [field]: value }
        : allocation
    ))
  }

  const addMilestone = (milestone: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: Date.now().toString()
    }
    setMilestones(prev => [...prev, newMilestone])
    setShowMilestoneModal(false)
    setEditingMilestone(null)
    toast.success('Milestone added successfully')
  }

  const updateMilestone = (milestone: Milestone) => {
    setMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m))
    setShowMilestoneModal(false)
    setEditingMilestone(null)
    toast.success('Milestone updated successfully')
  }

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
    toast.success('Milestone deleted')
  }

  const addResourceRamp = (month: string, percentage: number, reason: string) => {
    const newRamp: ResourceRamp = { month, percentage, reason }
    setResourceRamps(prev => [...prev, newRamp])
  }

  const getTotalProjectCost = (): number => {
    return monthlyAllocations.reduce((total, allocation) => total + allocation.cost, 0)
  }

  const getAverageMonthlyCost = (): number => {
    return monthlyAllocations.length > 0 ? getTotalProjectCost() / monthlyAllocations.length : 0
  }

  const exportPlan = () => {
    const data = {
      monthlyAllocations,
      milestones,
      resourceRamps,
      summary: {
        totalCost: getTotalProjectCost(),
        averageMonthlyCost: getAverageMonthlyCost(),
        duration: projectDuration,
        teamSize: teamMembers.length
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'monthly-plan.json'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Plan exported successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monthly Planning
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Plan resource allocation and milestones across {projectDuration} months
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Milestone</span>
          </button>
          <button
            onClick={exportPlan}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Plan</span>
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
            {currency} {getTotalProjectCost().toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Monthly</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currency} {getAverageMonthlyCost().toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Size</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {teamMembers.length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {projectDuration}m
          </div>
        </div>
      </div>

      {/* Monthly Allocations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Monthly Resource Allocation
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Allocation %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {monthlyAllocations.map((allocation, index) => (
                <tr key={allocation.month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {allocation.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={allocation.allocation}
                      onChange={(e) => updateAllocation(allocation.month, 'allocation', parseInt(e.target.value) || 0)}
                      className="input-field w-20 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={allocation.hours}
                      onChange={(e) => updateAllocation(allocation.month, 'hours', parseInt(e.target.value) || 0)}
                      className="input-field w-20 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {currency} {allocation.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={allocation.notes || ''}
                      onChange={(e) => updateAllocation(allocation.month, 'notes', e.target.value)}
                      placeholder="Add notes..."
                      className="input-field text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Project Milestones
          </h4>
        </div>
        
        <div className="p-6">
          {milestones.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No milestones</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Add milestones to track project progress and resource needs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.impact === 'high' ? 'bg-red-500' :
                      milestone.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{milestone.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{milestone.description}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{milestone.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingMilestone(milestone)
                        setShowMilestoneModal(true)
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <MilestoneModal
          milestone={editingMilestone}
          onSave={editingMilestone ? updateMilestone : addMilestone}
          onCancel={() => {
            setShowMilestoneModal(false)
            setEditingMilestone(null)
          }}
        />
      )}
    </div>
  )
}

// Milestone Modal Component
interface MilestoneModalProps {
  milestone?: Milestone | null
  onSave: (milestone: Milestone) => void
  onCancel: () => void
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ milestone, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    date: milestone?.date || '',
    description: milestone?.description || '',
    impact: milestone?.impact || 'medium' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (milestone) {
      onSave({ ...milestone, ...formData })
    } else {
      onSave({
        id: '',
        ...formData
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {milestone ? 'Edit Milestone' : 'Add Milestone'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Milestone Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Impact Level
            </label>
            <select
              value={formData.impact}
              onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value as any }))}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {milestone ? 'Update' : 'Add'} Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
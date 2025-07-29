import React, { useState, useEffect } from 'react'
import { 
  Check, 
  X, 
  Plus, 
  Users, 
  Search, 
  Filter, 
  DollarSign, 
  MapPin,
  Eye,
  EyeOff,
  Settings,
  Trash2
} from 'lucide-react'
import { supabaseService } from '../lib/supabase'
import { exchangeRateService } from '../lib/exchangeRates'
import { toast } from 'react-hot-toast'
import type { RoleCatalog } from '../lib/supabase'

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
  roleId?: string
}

interface MultiRoleSelectorProps {
  onAddMembers: (members: TeamMember[]) => void
  existingMembers: TeamMember[]
  currency: string
}

interface RoleWithPreview extends RoleCatalog {
  selected: boolean
  allocation: number
  count: number
  totalCost: number
}

export const MultiRoleSelector: React.FC<MultiRoleSelectorProps> = ({
  onAddMembers,
  existingMembers,
  currency
}) => {
  const [roles, setRoles] = useState<RoleWithPreview[]>([])
  const [filteredRoles, setFilteredRoles] = useState<RoleWithPreview[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedRoles, setSelectedRoles] = useState<RoleWithPreview[]>([])
  const [previewMembers, setPreviewMembers] = useState<TeamMember[]>([])

  // Load roles from catalog
  useEffect(() => {
    loadRoles()
  }, [])

  // Filter roles based on search and category
  useEffect(() => {
    let filtered = roles

    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(role => role.category === categoryFilter)
    }

    setFilteredRoles(filtered)
  }, [roles, searchTerm, categoryFilter])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseService.client
        .from('role_catalog')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error

      const rolesWithPreview = (data || []).map(role => ({
        ...role,
        selected: false,
        allocation: 100,
        count: 1,
        totalCost: role.base_rate
      }))

      setRoles(rolesWithPreview)
    } catch (error) {
      console.error('Failed to load roles:', error)
      toast.error('Failed to load role catalog')
    } finally {
      setLoading(false)
    }
  }

  const toggleRoleSelection = (roleId: string) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, selected: !role.selected }
        : role
    ))
  }

  const updateRoleSettings = (roleId: string, field: keyof RoleWithPreview, value: any) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const updated = { ...role, [field]: value }
        
        // Recalculate total cost
        if (field === 'allocation' || field === 'count' || field === 'billingRate') {
          updated.totalCost = (updated.billingRate || role.base_rate) * 
            (updated.allocation / 100) * updated.count
        }
        
        return updated
      }
      return role
    }))
  }

  const getSelectedRoles = () => {
    return roles.filter(role => role.selected)
  }

  const generatePreview = async () => {
    const selected = getSelectedRoles()
    const members: TeamMember[] = []

    for (const role of selected) {
      for (let i = 0; i < role.count; i++) {
        // Get exchange rate for role currency to project currency
        let billingRate = role.base_rate
        if (role.currency !== currency) {
          try {
            const rate = await exchangeRateService.getExchangeRate(role.currency, currency)
            billingRate = exchangeRateService.convertAmount(role.base_rate, role.currency, currency, rate.rate)
          } catch (error) {
            console.warn('Failed to convert currency for role:', role.name)
          }
        }

        members.push({
          name: `${role.name} ${i + 1}`,
          role: role.name,
          location: 'Default', // Could be enhanced with location selection
          monthlyAllocation: role.allocation,
          billingRate,
          currency,
          roleId: role.id
        })
      }
    }

    setPreviewMembers(members)
    setShowPreview(true)
  }

  const addSelectedMembers = () => {
    const selected = getSelectedRoles()
    if (selected.length === 0) {
      toast.error('Please select at least one role')
      return
    }

    generatePreview().then(() => {
      onAddMembers(previewMembers)
      toast.success(`Added ${previewMembers.length} team members`)
      
      // Reset selections
      setRoles(prev => prev.map(role => ({ ...role, selected: false, count: 1, allocation: 100 })))
      setShowPreview(false)
    })
  }

  const getCategories = () => {
    const categories = new Set(roles.map(role => role.category).filter(Boolean))
    return Array.from(categories)
  }

  const getTotalSelectedCost = () => {
    return getSelectedRoles().reduce((sum, role) => sum + role.totalCost, 0)
  }

  const getTotalSelectedMembers = () => {
    return getSelectedRoles().reduce((sum, role) => sum + role.count, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Multi-Role Selection
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select multiple roles and configure team members
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={generatePreview}
            disabled={getSelectedRoles().length === 0}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={addSelectedMembers}
            disabled={getSelectedRoles().length === 0}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add {getTotalSelectedMembers()} Members</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      {getSelectedRoles().length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {getTotalSelectedMembers()} members selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  {currency} {getTotalSelectedCost().toLocaleString()}/month
                </span>
              </div>
            </div>
            <button
              onClick={() => setRoles(prev => prev.map(role => ({ ...role, selected: false })))}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map(role => (
          <div
            key={role.id}
            className={`border rounded-lg p-4 transition-all ${
              role.selected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Role Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={role.selected}
                  onChange={() => toggleRoleSelection(role.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{role.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{role.category}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {role.currency} {role.base_rate}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">per hour</div>
              </div>
            </div>

            {/* Role Description */}
            {role.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {role.description}
              </p>
            )}

            {/* Role Settings */}
            {role.selected && (
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {/* Count */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of members
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={role.count}
                    onChange={(e) => updateRoleSettings(role.id, 'count', parseInt(e.target.value) || 1)}
                    className="input-field text-sm"
                  />
                </div>

                {/* Allocation */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly allocation (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={role.allocation}
                    onChange={(e) => updateRoleSettings(role.id, 'allocation', parseInt(e.target.value) || 100)}
                    className="input-field text-sm"
                  />
                </div>

                {/* Total Cost */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total cost per month</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {currency} {role.totalCost.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview Team Members
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {previewMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.currency} {member.billingRate}/hr
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {member.monthlyAllocation}% allocation
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total: {previewMembers.length} members
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={addSelectedMembers}
                  className="btn-primary"
                >
                  Add Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
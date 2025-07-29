import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Star, 
  Search, 
  Filter,
  Building,
  Users,
  Target,
  Settings,
  Save,
  X,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import { supabaseService } from '../lib/supabase'
import { toast } from 'react-hot-toast'

interface Template {
  id: string
  name: string
  description: string
  category: 'industry' | 'team' | 'custom'
  industry?: string
  teamSize: number
  duration: number
  budget: number
  currency: string
  teamComposition: TeamMemberTemplate[]
  settings: TemplateSettings
  isDefault: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface TeamMemberTemplate {
  role: string
  count: number
  allocation: number
  billingRate: number
  location: string
  currency: string
}

interface TemplateSettings {
  exchangeRates: boolean
  marginAnalysis: boolean
  monthlyPlanning: boolean
  costOptimization: boolean
  reporting: boolean
  notifications: boolean
}

interface CalculatorTemplatesProps {
  onApplyTemplate: (template: Template) => void
  onSaveTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
  currentProject?: any
}

export const CalculatorTemplates: React.FC<CalculatorTemplatesProps> = ({
  onApplyTemplate,
  onSaveTemplate,
  currentProject
}) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'industry' | 'team' | 'custom'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Filter templates
  useEffect(() => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchTerm, categoryFilter])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from Supabase
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Startup MVP Development',
          description: 'Complete MVP development template for early-stage startups',
          category: 'industry',
          industry: 'Technology',
          teamSize: 5,
          duration: 6,
          budget: 50000,
          currency: 'USD',
          teamComposition: [
            { role: 'Full Stack Developer', count: 2, allocation: 100, billingRate: 80, location: 'Remote', currency: 'USD' },
            { role: 'UI/UX Designer', count: 1, allocation: 80, billingRate: 70, location: 'Remote', currency: 'USD' },
            { role: 'Product Manager', count: 1, allocation: 100, billingRate: 90, location: 'Remote', currency: 'USD' },
            { role: 'QA Engineer', count: 1, allocation: 60, billingRate: 65, location: 'Remote', currency: 'USD' }
          ],
          settings: {
            exchangeRates: true,
            marginAnalysis: true,
            monthlyPlanning: true,
            costOptimization: true,
            reporting: true,
            notifications: true
          },
          isDefault: true,
          createdBy: 'system',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Enterprise Software Development',
          description: 'Large-scale enterprise software development template',
          category: 'industry',
          industry: 'Enterprise',
          teamSize: 12,
          duration: 12,
          budget: 200000,
          currency: 'USD',
          teamComposition: [
            { role: 'Senior Developer', count: 4, allocation: 100, billingRate: 120, location: 'On-site', currency: 'USD' },
            { role: 'DevOps Engineer', count: 2, allocation: 100, billingRate: 110, location: 'On-site', currency: 'USD' },
            { role: 'Project Manager', count: 2, allocation: 100, billingRate: 100, location: 'On-site', currency: 'USD' },
            { role: 'UI/UX Designer', count: 2, allocation: 80, billingRate: 85, location: 'On-site', currency: 'USD' },
            { role: 'QA Engineer', count: 2, allocation: 100, billingRate: 75, location: 'On-site', currency: 'USD' }
          ],
          settings: {
            exchangeRates: true,
            marginAnalysis: true,
            monthlyPlanning: true,
            costOptimization: true,
            reporting: true,
            notifications: true
          },
          isDefault: true,
          createdBy: 'system',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '3',
          name: 'Small Team (3-5 people)',
          description: 'Template for small agile teams',
          category: 'team',
          teamSize: 4,
          duration: 4,
          budget: 30000,
          currency: 'USD',
          teamComposition: [
            { role: 'Developer', count: 2, allocation: 100, billingRate: 70, location: 'Remote', currency: 'USD' },
            { role: 'Designer', count: 1, allocation: 80, billingRate: 60, location: 'Remote', currency: 'USD' },
            { role: 'Project Manager', count: 1, allocation: 100, billingRate: 80, location: 'Remote', currency: 'USD' }
          ],
          settings: {
            exchangeRates: false,
            marginAnalysis: true,
            monthlyPlanning: true,
            costOptimization: false,
            reporting: true,
            notifications: false
          },
          isDefault: true,
          createdBy: 'system',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ]

      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate(template)
    toast.success(`Applied template: ${template.name}`)
  }

  const handleSaveTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate: Template = {
        ...templateData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setTemplates(prev => [...prev, newTemplate])
      onSaveTemplate(templateData)
      setShowCreateModal(false)
      toast.success('Template saved successfully')
    } catch (error) {
      toast.error('Failed to save template')
    }
  }

  const handleUpdateTemplate = async (template: Template) => {
    try {
      setTemplates(prev => prev.map(t => t.id === template.id ? { ...template, updatedAt: new Date().toISOString() } : t))
      setShowEditModal(false)
      setEditingTemplate(null)
      toast.success('Template updated successfully')
    } catch (error) {
      toast.error('Failed to update template')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        setTemplates(prev => prev.filter(t => t.id !== templateId))
        toast.success('Template deleted successfully')
      } catch (error) {
        toast.error('Failed to delete template')
      }
    }
  }

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
      ...template,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdBy: 'user'
    }
    handleSaveTemplate(duplicatedTemplate)
  }

  const getCategories = () => {
    return Array.from(new Set(templates.map(template => template.category)))
  }

  const getIndustries = () => {
    return Array.from(new Set(templates.filter(t => t.industry).map(t => t.industry!)))
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
            Calculator Templates
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pre-configured templates for quick project setup
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
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
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            <option value="industry">Industry</option>
            <option value="team">Team Size</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          >
            {/* Template Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {template.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <>
                      <button
                        onClick={() => {
                          setEditingTemplate(template)
                          setShowEditModal(true)
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {template.description}
              </p>

              {/* Template Meta */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{template.teamSize} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>{template.duration}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-3 w-3" />
                  <span>{template.category}</span>
                </div>
              </div>
            </div>

            {/* Template Details */}
            <div className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.currency} {template.budget.toLocaleString()}
                  </span>
                </div>
                
                {template.industry && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{template.industry}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Team Composition:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.teamComposition.length} roles
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApplyTemplate(template)}
                  className="btn-primary flex-1 text-sm"
                >
                  Apply Template
                </button>
                <button
                  onClick={() => {
                    // Show template details modal
                  }}
                  className="btn-secondary text-sm"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <TemplateModal
          template={null}
          onSave={handleSaveTemplate}
          onCancel={() => setShowCreateModal(false)}
          currentProject={currentProject}
        />
      )}

      {/* Edit Template Modal */}
      {showEditModal && editingTemplate && (
        <TemplateModal
          template={editingTemplate}
          onSave={handleUpdateTemplate}
          onCancel={() => {
            setShowEditModal(false)
            setEditingTemplate(null)
          }}
          currentProject={currentProject}
        />
      )}
    </div>
  )
}

// Template Modal Component
interface TemplateModalProps {
  template: Template | null
  onSave: (template: Template) => void
  onCancel: () => void
  currentProject?: any
}

const TemplateModal: React.FC<TemplateModalProps> = ({ template, onSave, onCancel, currentProject }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'custom' as const,
    industry: template?.industry || '',
    teamSize: template?.teamSize || 1,
    duration: template?.duration || 1,
    budget: template?.budget || 0,
    currency: template?.currency || 'USD',
    teamComposition: template?.teamComposition || [],
    settings: template?.settings || {
      exchangeRates: true,
      marginAnalysis: true,
      monthlyPlanning: true,
      costOptimization: true,
      reporting: true,
      notifications: true
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (template) {
      onSave({ ...template, ...formData })
    } else {
      onSave({
        id: '',
        ...formData,
        isDefault: false,
        createdBy: 'user',
        createdAt: '',
        updatedAt: ''
      })
    }
  }

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamComposition: [...prev.teamComposition, {
        role: '',
        count: 1,
        allocation: 100,
        billingRate: 0,
        location: 'Remote',
        currency: formData.currency
      }]
    }))
  }

  const updateTeamMember = (index: number, field: keyof TeamMemberTemplate, value: any) => {
    setFormData(prev => ({
      ...prev,
      teamComposition: prev.teamComposition.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamComposition: prev.teamComposition.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {template ? 'Edit Template' : 'Create Template'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="input-field"
                >
                  <option value="custom">Custom</option>
                  <option value="industry">Industry</option>
                  <option value="team">Team Size</option>
                </select>
              </div>
              
              {formData.category === 'industry' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>
              )}
            </div>

            {/* Project Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Project Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.teamSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="input-field"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Team Composition */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Team Composition</h4>
              <button
                type="button"
                onClick={addTeamMember}
                className="btn-secondary text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.teamComposition.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      className="input-field text-sm"
                      placeholder="e.g., Developer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                    <input
                      type="number"
                      min="1"
                      value={member.count}
                      onChange={(e) => updateTeamMember(index, 'count', parseInt(e.target.value) || 1)}
                      className="input-field text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocation %</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={member.allocation}
                      onChange={(e) => updateTeamMember(index, 'allocation', parseInt(e.target.value) || 100)}
                      className="input-field text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate</label>
                    <input
                      type="number"
                      min="0"
                      value={member.billingRate}
                      onChange={(e) => updateTeamMember(index, 'billingRate', parseInt(e.target.value) || 0)}
                      className="input-field text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <select
                      value={member.location}
                      onChange={(e) => updateTeamMember(index, 'location', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Settings */}
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Template Settings</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(formData.settings).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, [key]: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
              {template ? 'Update' : 'Create'} Template
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
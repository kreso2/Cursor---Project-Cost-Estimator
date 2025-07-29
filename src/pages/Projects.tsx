import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FolderOpen, Edit, Trash2, Share2, Calendar, DollarSign, Plus, Eye, 
  Search, Filter, Download, Upload, FileText, Users, Settings, 
  MoreVertical, CheckCircle, XCircle, Bell, SortAsc, SortDesc
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Project, ProjectShare, ProjectTemplate, Notification, User } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [sharedProjects, setSharedProjects] = useState<Project[]>([])
  const [projectShares, setProjectShares] = useState<ProjectShare[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingProject, setDeletingProject] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'my-projects' | 'shared' | 'templates'>('my-projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at' | 'total_cost'>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view')
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [isPublicTemplate, setIsPublicTemplate] = useState(false)
  
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    console.log('📁 Projects useEffect: user =', user)
    console.log('📁 Projects useEffect: user?.id =', user?.id)
    
    if (user && user.id) {
      console.log('📁 Projects useEffect: User found, calling fetchData...')
      fetchData()
    } else if (user === null) {
      console.log('📁 Projects useEffect: User is null, setting loading to false')
      setLoading(false)
    } else {
      console.log('📁 Projects useEffect: User is undefined, waiting...')
      // User is still loading, keep loading state true
    }
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('📁 Projects useEffect: Timeout reached, setting loading to false')
      setLoading(false)
    }, 10000) // 10 seconds timeout
    
    return () => clearTimeout(timeoutId)
  }, [user?.id])

  const fetchData = async () => {
    console.log('📁 Projects fetchData: Starting...')
    console.log('📁 Projects fetchData: user =', user)
    console.log('📁 Projects fetchData: user?.id =', user?.id)
    console.log('📁 Projects fetchData: auth.uid() =', (await supabase.auth.getUser()).data.user?.id)
    setLoading(true)
    
    try {
      // First, check if user exists in public.users table
      console.log('📁 Projects fetchData: Checking if user exists in public.users...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()
      
      console.log('📁 Projects fetchData: User check result =', { data: userData, error: userError })
      
      if (userError) {
        console.error('Error checking user:', userError)
        toast.error('User not found in database')
        setLoading(false)
        return
      }
      
      console.log('📁 Projects fetchData: Fetching projects...')
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
      
      console.log('📁 Projects fetchData: Projects result =', { data: projectsData, error: projectsError })
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError)
        toast.error('Failed to fetch projects')
        setLoading(false)
        return
      }
      
      console.log('📁 Projects fetchData: Projects found =', projectsData?.length || 0)
      setProjects(projectsData || [])
      
      console.log('📁 Projects fetchData: Fetching shared projects...')
      const { data: sharedData, error: sharedError } = await supabase
        .from('project_shares')
        .select(`
          *,
          projects (*)
        `)
        .eq('user_id', user?.id)
      
      console.log('📁 Projects fetchData: Shared projects result =', { data: sharedData, error: sharedError })
      
      if (sharedError) {
        console.error('Error fetching shared projects:', sharedError)
        toast.error('Failed to fetch shared projects')
        setLoading(false)
        return
      }
      
      const sharedProjectsList = sharedData?.map(share => share.projects).filter(Boolean) || []
      console.log('📁 Projects fetchData: Shared projects found =', sharedProjectsList.length)
      setSharedProjects(sharedProjectsList)
      setProjectShares(sharedData || [])
      
      console.log('📁 Projects fetchData: Fetching templates...')
      const { data: templatesData, error: templatesError } = await supabase
        .from('project_templates')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('📁 Projects fetchData: Templates result =', { data: templatesData, error: templatesError })
      
      if (templatesError) {
        console.error('Error fetching templates:', templatesError)
        toast.error('Failed to fetch templates')
        setLoading(false)
        return
      }
      
      console.log('📁 Projects fetchData: Templates found =', templatesData?.length || 0)
      setTemplates(templatesData || [])
      
      console.log('📁 Projects fetchData: Fetching notifications...')
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
      
      console.log('📁 Projects fetchData: Notifications result =', { data: notificationsData, error: notificationsError })
      
      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError)
        // Don't show error toast for notifications as they're not critical
      } else {
        console.log('📁 Projects fetchData: Notifications found =', notificationsData?.length || 0)
        setNotifications(notificationsData || [])
      }
      
    } catch (error) {
      console.error('Error in fetchData:', error)
      toast.error('Failed to fetch data')
    } finally {
      console.log('📁 Projects fetchData: Setting loading to false')
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setDeletingProject(projectId)
    try {
      const result = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
      
      if (result.error) {
        toast.error('Failed to delete project')
        return
      }
      
      setProjects(projects.filter(p => p.id !== projectId))
      toast.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setDeletingProject(null)
    }
  }

  const handleEditProject = (project: Project) => {
    navigate('/home', { state: { editProject: project } })
  }

  const handleShareProject = (project: Project) => {
    setSelectedProject(project)
    setShowShareModal(true)
  }

  const handleCreateTemplate = (project: Project) => {
    setSelectedProject(project)
    setTemplateName(`${project.name} Template`)
    setTemplateDescription(project.description || '')
    setShowTemplateModal(true)
  }

  const handleShareSubmit = async () => {
    if (!selectedProject || !shareEmail) return

    const targetUser = users.find(u => u.email === shareEmail)
    if (!targetUser) {
      toast.error('User not found')
      return
    }

    try {
      const result = await supabase
        .from('project_shares')
        .insert({
          project_id: selectedProject.id,
          shared_by: user!.id,
          shared_with: targetUser.id,
          permission: sharePermission,
        })
      
      if (result.error) {
        toast.error('Failed to share project')
        return
      }

      // Create notification for shared user
      await supabase
        .from('notifications')
        .insert({
          user_id: targetUser.id,
          title: 'Project Shared',
          message: `${selectedProject.name} has been shared with you`,
          type: 'project_shared',
          related_id: selectedProject.id,
          is_read: false,
        })

      toast.success('Project shared successfully')
      setShowShareModal(false)
      setShareEmail('')
      setSharePermission('view')
      setSelectedProject(null)
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error sharing project:', error)
      toast.error('Failed to share project')
    }
  }

  const handleTemplateSubmit = async () => {
    if (!selectedProject || !templateName) return

    try {
      const result = await supabase
        .from('project_templates')
        .insert({
          name: templateName,
          description: templateDescription,
          user_id: user!.id,
          data: selectedProject.data,
          is_public: isPublicTemplate,
          category: templateCategory,
        })
      
      if (result.error) {
        toast.error('Failed to create template')
        return
      }

      toast.success('Template created successfully')
      setShowTemplateModal(false)
      setTemplateName('')
      setTemplateDescription('')
      setTemplateCategory('')
      setIsPublicTemplate(false)
      setSelectedProject(null)
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Failed to create template')
    }
  }

  const handleCreateFromTemplate = async (template: ProjectTemplate) => {
    try {
      const result = await supabase
        .from('projects')
        .insert({
          name: `${template.name} - Copy`,
          description: template.description,
          user_id: user!.id,
          data: template.data,
          is_shared: false,
          is_template: false,
        })
      
      if (result.error) {
        toast.error('Failed to create project from template')
        return
      }

      toast.success('Project created from template')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error creating project from template:', error)
      toast.error('Failed to create project from template')
    }
  }

  const handleExportProject = (project: Project) => {
    const dataStr = JSON.stringify(project, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Project exported successfully')
  }

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | undefined | null, currency: string = 'USD') => {
    if (amount === undefined || amount === null) {
      return '$0'
    }
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
    }
    return `${symbols[currency] || ''}${amount.toLocaleString()}`
  }

  const getFilteredAndSortedProjects = (projectList: Project[]) => {
    let filtered = projectList.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'total_cost') {
        aValue = a.data.total_cost
        bValue = b.data.total_cost
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }

  const getProjectShareInfo = (projectId: string) => {
    return projectShares.find(share => share.project_id === projectId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your projects, templates, and shared content.
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-projects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-projects'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shared'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Shared with Me ({sharedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Templates ({templates.length})
          </button>
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Name</option>
              <option value="created_at">Created</option>
              <option value="updated_at">Updated</option>
              <option value="total_cost">Total Cost</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'my-projects' && (
        <div>
          {getFilteredAndSortedProjects(projects).length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first project to get started.'}
              </p>
              {!searchTerm && (
                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/')}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Need test data? Run the SQL script in Supabase:</p>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                      create-test-projects.sql
                    </code>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredAndSortedProjects(projects).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onShare={handleShareProject}
                  onCreateTemplate={handleCreateTemplate}
                  onExport={handleExportProject}
                  deleting={deletingProject === project.id}
                  isOwner={true}
                  canEdit={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'shared' && (
        <div>
          {getFilteredAndSortedProjects(sharedProjects).length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No shared projects</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Projects shared with you will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredAndSortedProjects(sharedProjects).map((project) => {
                const shareInfo = getProjectShareInfo(project.id)
                const canEdit = shareInfo?.permission === 'edit'
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    onShare={handleShareProject}
                    onCreateTemplate={handleCreateTemplate}
                    onExport={handleExportProject}
                    deleting={deletingProject === project.id}
                    isOwner={false}
                    canEdit={canEdit}
                    shareInfo={shareInfo}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Create templates from your projects to reuse configurations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onCreateFromTemplate={handleCreateFromTemplate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Share Project: {selectedProject.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Permission
                </label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="view">View Only</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleShareSubmit}
                className="btn-primary"
              >
                Share Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Template from: {selectedProject.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Template description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., E-commerce, Mobile App"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="public-template"
                  checked={isPublicTemplate}
                  onChange={(e) => setIsPublicTemplate(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="public-template" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Make template public
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleTemplateSubmit}
                className="btn-primary"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Project Card Component
const ProjectCard: React.FC<{
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onShare: (project: Project) => void
  onCreateTemplate: (project: Project) => void
  onExport: (project: Project) => void
  deleting: boolean
  isOwner: boolean
  canEdit?: boolean
  shareInfo?: ProjectShare
}> = ({ project, onEdit, onDelete, onShare, onCreateTemplate, onExport, deleting, isOwner, canEdit, shareInfo }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | undefined | null, currency: string = 'USD') => {
    if (amount === undefined || amount === null) {
      return '$0'
    }
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
    }
    return `${symbols[currency] || ''}${amount.toLocaleString()}`
  }

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {project.is_template && (
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          {shareInfo && (
            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {shareInfo.permission}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <DollarSign className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {formatCurrency(project.data.total_cost, project.data.currency)}
          </span>
          <span className="ml-1">total cost</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Updated {formatDate(project.updated_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          {(isOwner || canEdit) && (
            <button 
              onClick={() => onEdit(project)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Edit project"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {isOwner && (
            <>
              <button 
                onClick={() => onShare(project)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Share project"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onCreateTemplate(project)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Create template"
              >
                <FileText className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onExport(project)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Export project"
              >
                <Download className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {isOwner && (
          <button 
            onClick={() => onDelete(project.id)}
            disabled={deleting}
            className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors disabled:opacity-50"
            title="Delete project"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Template Card Component
const TemplateCard: React.FC<{
  template: ProjectTemplate
  onCreateFromTemplate: (template: ProjectTemplate) => void
}> = ({ template, onCreateFromTemplate }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | undefined | null, currency: string = 'USD') => {
    if (amount === undefined || amount === null) {
      return '$0'
    }
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
    }
    return `${symbols[currency] || ''}${amount.toLocaleString()}`
  }

  return (
    <div className="card p-6 hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {template.name}
            </h3>
          </div>
          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {template.description}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {template.category}
            </span>
            {template.is_public && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Public
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <DollarSign className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {formatCurrency(template.data.total_cost, template.data.currency)}
          </span>
          <span className="ml-1">estimated cost</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Created {formatDate(template.created_at)}</span>
        </div>
      </div>

      <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => onCreateFromTemplate(template)}
          className="btn-primary w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Use Template
        </button>
      </div>
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ProjectCalculator } from '../components/ProjectCalculator'
import { supabase, supabaseService } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { ProjectData, RoleCatalog, Project } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export const Home: React.FC = () => {
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [roleCatalog, setRoleCatalog] = useState<RoleCatalog[]>([])
  const [loading, setLoading] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    console.log('🏠 Home component mounted, fetching role catalog...')
    fetchRoleCatalog()
    
    // Check if we're editing a project
    const editProject = location.state?.editProject as Project
    if (editProject) {
      console.log('📝 Editing project:', editProject.name)
      setEditingProject(editProject)
      setProjectName(editProject.name)
      setProjectDescription(editProject.description || '')
    }
  }, [location.state])

  const fetchRoleCatalog = async () => {
    try {
      console.log('🔍 Fetching role catalog...')
      const { data, error } = await supabase
        .from('role_catalog')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) {
        console.error('❌ Error fetching role catalog:', error)
        return
      }
      
      console.log('✅ Role catalog fetched successfully:', data?.length || 0, 'roles')
      setRoleCatalog(data || [])
    } catch (error) {
      console.error('❌ Error fetching role catalog:', error)
    }
  }

  const handleSave = async (data: ProjectData) => {
    if (!user) return

    if (!projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    setLoading(true)
    console.log('💾 Starting project save...')
    
    try {
      // Add timeout to prevent infinite hanging
      const saveTimeout = setTimeout(() => {
        console.error('❌ Save operation timed out')
        toast.error('Save operation timed out. Please try again.')
        setLoading(false)
      }, 30000) // 30 second timeout

      if (editingProject) {
        console.log('📝 Updating existing project:', editingProject.id)
        // Update existing project
        await supabaseService.updateProject(editingProject.id, {
          name: projectName,
          description: projectDescription,
          data: data,
          currency: data.project_settings?.target_currency || 'USD',
          total_cost: data.calculations?.total_cost || 0,
        })
        clearTimeout(saveTimeout)
        console.log('✅ Project updated successfully')
        toast.success('Project updated successfully!')
      } else {
        console.log('🆕 Creating new project...')
        // Create new project
        await supabaseService.createProject({
          name: projectName,
          description: projectDescription,
          user_id: user.id,
          data: data,
          currency: data.project_settings?.target_currency || 'USD',
          total_cost: data.calculations?.total_cost || 0,
          is_template: false,
          status: 'draft'
        })
        clearTimeout(saveTimeout)
        console.log('✅ Project created successfully')
        toast.success('Project saved successfully!')
      }
      
      navigate('/projects')
    } catch (error: any) {
      console.error('❌ Error saving project:', error)
      const errorMessage = error.message || 'Failed to save project'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {editingProject ? 'Edit Project' : 'Project Cost Calculator'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {editingProject 
            ? `Editing project: ${editingProject.name}`
            : 'Calculate project costs by adding roles, hourly rates, and estimated hours.'
          }
        </p>
      </div>

      <ProjectCalculator 
        onSave={handleSave} 
        initialData={editingProject?.data as ProjectData}
        roleCatalog={roleCatalog}
        projectName={projectName}
        projectDescription={projectDescription}
        onProjectNameChange={setProjectName}
        onProjectDescriptionChange={setProjectDescription}
        loading={loading}
      />
    </div>
  )
} 
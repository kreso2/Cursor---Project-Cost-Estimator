import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronRight, Book, Video, MessageCircle, Mail } from 'lucide-react'

const faqs = [
  {
    question: 'How do I create a new project?',
    answer: 'Navigate to the Home page and use the Project Calculator to add roles, set hourly rates, and estimate hours. Click "Save Project" to store your calculation.'
  },
  {
    question: 'Can I share projects with other users?',
    answer: 'Yes! When viewing a project, click the share button to invite other users. They will be able to view and collaborate on the project.'
  },
  {
    question: 'How do I manage user roles and permissions?',
    answer: 'Admin users can manage user roles and permissions through the Admin dashboard. Navigate to Admin > Users to modify user access levels.'
  },
  {
    question: 'What currencies are supported?',
    answer: 'Currently, we support USD, EUR, GBP, and CAD. You can select your preferred currency when creating or editing a project.'
  },
  {
    question: 'How do I export project data?',
    answer: 'Project export functionality is coming soon! You will be able to export your calculations as PDF reports or Excel spreadsheets.'
  },
  {
    question: 'Can I customize the role catalog?',
    answer: 'Yes, admin users can add, edit, and remove roles from the catalog. Navigate to Admin > Role Catalog to manage predefined roles and rates.'
  }
]

const helpSections = [
  {
    title: 'Getting Started',
    icon: Book,
    items: [
      'Creating your first project',
      'Adding roles and rates',
      'Saving and sharing projects',
      'Understanding the interface'
    ]
  },
  {
    title: 'Advanced Features',
    icon: Video,
    items: [
      'Role catalog management',
      'Project sharing and collaboration',
      'Admin dashboard usage',
      'User management'
    ]
  },
  {
    title: 'Troubleshooting',
    icon: HelpCircle,
    items: [
      'Common issues and solutions',
      'Account and login problems',
      'Data synchronization issues',
      'Performance optimization'
    ]
  }
]

export const Help: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Find answers to common questions and learn how to use the Project Cost Calculator.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Help Sections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Start Guide</h2>
            <div className="space-y-4">
              {helpSections.map((section, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <section.icon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-3">
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need More Help?</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <MessageCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Live Chat</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get instant help</p>
                </div>
              </div>
              <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email Support</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">support@projectcalc.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Application</span>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Operational
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Useful Links</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
                API Documentation
              </a>
              <a href="#" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Terms of Service
              </a>
              <a href="#" className="block text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Release Notes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
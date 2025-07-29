import React, { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmailData {
  senderEmail: string
  recipientEmail: string
  subject: string
  messageBody: string
}

export const Email: React.FC = () => {
  const [emailData, setEmailData] = useState<EmailData>({
    senderEmail: '',
    recipientEmail: '',
    subject: '',
    messageBody: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleEmailChange = (field: keyof EmailData, value: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!emailData.senderEmail.trim()) {
      toast.error('Sender Email is required')
      return false
    }
    if (!emailData.recipientEmail.trim()) {
      toast.error('Recipient Email is required')
      return false
    }
    if (!emailData.subject.trim()) {
      toast.error('Subject is required')
      return false
    }
    if (!emailData.messageBody.trim()) {
      toast.error('Message Body is required')
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailData.senderEmail)) {
      toast.error('Please enter a valid sender email address')
      return false
    }
    if (!emailRegex.test(emailData.recipientEmail)) {
      toast.error('Please enter a valid recipient email address')
      return false
    }

    return true
  }

  const sendEmail = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: `Email sent successfully! Message ID: ${data.messageId}`
        })
        toast.success('Email sent successfully!')
        
        // Clear form on success
        setEmailData({
          senderEmail: '',
          recipientEmail: '',
          subject: '',
          messageBody: ''
        })
      } else {
        const errorData = await response.json()
        setResult({
          success: false,
          message: errorData.error || 'Failed to send email'
        })
        toast.error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setResult({
        success: false,
        message: 'Network error or server unavailable'
      })
      toast.error('Network error or server unavailable')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Mail className="mr-3 h-8 w-8 text-primary-600" />
          Email Configuration
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Send emails using SendGrid API
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Send Email
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sender Email
            </label>
            <input
              type="email"
              id="senderEmail"
              value={emailData.senderEmail}
              onChange={(e) => handleEmailChange('senderEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="sender@example.com"
            />
          </div>

          <div>
            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              id="recipientEmail"
              value={emailData.recipientEmail}
              onChange={(e) => handleEmailChange('recipientEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="recipient@example.com"
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={emailData.subject}
            onChange={(e) => handleEmailChange('subject', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter email subject"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="messageBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message Body
          </label>
          <textarea
            id="messageBody"
            rows={8}
            value={emailData.messageBody}
            onChange={(e) => handleEmailChange('messageBody', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Enter your email message here..."
          />
        </div>

        {/* Send Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={sendEmail}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send Email
              </>
            )}
          </button>
        </div>

        {/* Result Message */}
        {result && (
          <div className="mt-6">
            <div className={`rounded-md p-4 ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.success ? 'Success' : 'Error'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Important Notes
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure your SendGrid API key is configured on the server</li>
                  <li>Sender email should be verified in your SendGrid account</li>
                  <li>For trial accounts, you may have sending limits</li>
                  <li>Check your SendGrid dashboard for delivery status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
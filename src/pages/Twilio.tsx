import React, { useState } from 'react'
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface TwilioCredentials {
  accountSid: string
  authToken: string
  twilioPhoneNumber: string
}

interface MessageData {
  recipientPhoneNumber: string
  messageText: string
}

export const Twilio: React.FC = () => {
  const [credentials, setCredentials] = useState<TwilioCredentials>({
    accountSid: '',
    authToken: '',
    twilioPhoneNumber: ''
  })

  const [messageData, setMessageData] = useState<MessageData>({
    recipientPhoneNumber: '',
    messageText: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleCredentialChange = (field: keyof TwilioCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMessageChange = (field: keyof MessageData, value: string) => {
    setMessageData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!credentials.accountSid.trim()) {
      toast.error('Account SID is required')
      return false
    }
    if (!credentials.authToken.trim()) {
      toast.error('Auth Token is required')
      return false
    }
    if (!credentials.twilioPhoneNumber.trim()) {
      toast.error('Twilio Phone Number is required')
      return false
    }
    if (!messageData.recipientPhoneNumber.trim()) {
      toast.error('Recipient Phone Number is required')
      return false
    }
    if (!messageData.messageText.trim()) {
      toast.error('Message Text is required')
      return false
    }
    return true
  }

  const sendTestSMS = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setResult(null)

    try {
      // Send request to the backend server
      const response = await fetch('http://localhost:3001/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials,
          messageData
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: `SMS sent successfully! SID: ${data.sid}`
        })
        toast.success('SMS sent successfully!')
      } else {
        const errorData = await response.json()
        setResult({
          success: false,
          message: errorData.error || 'Failed to send SMS'
        })
        toast.error('Failed to send SMS')
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
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
          <MessageSquare className="mr-3 h-8 w-8 text-primary-600" />
          Twilio SMS Configuration
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure your Twilio credentials and send test SMS messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Twilio Credentials Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Twilio Credentials
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="accountSid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account SID
              </label>
              <input
                type="text"
                id="accountSid"
                value={credentials.accountSid}
                onChange={(e) => handleCredentialChange('accountSid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="AC1234567890abcdef1234567890abcdef"
              />
            </div>

            <div>
              <label htmlFor="authToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Auth Token
              </label>
              <input
                type="password"
                id="authToken"
                value={credentials.authToken}
                onChange={(e) => handleCredentialChange('authToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your Twilio Auth Token"
              />
            </div>

            <div>
              <label htmlFor="twilioPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twilio Phone Number
              </label>
              <input
                type="tel"
                id="twilioPhoneNumber"
                value={credentials.twilioPhoneNumber}
                onChange={(e) => handleCredentialChange('twilioPhoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Message
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="recipientPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipient Phone Number
              </label>
              <input
                type="tel"
                id="recipientPhoneNumber"
                value={messageData.recipientPhoneNumber}
                onChange={(e) => handleMessageChange('recipientPhoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label htmlFor="messageText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message Text
              </label>
              <textarea
                id="messageText"
                rows={4}
                value={messageData.messageText}
                onChange={(e) => handleMessageChange('messageText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Enter your test message here..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={sendTestSMS}
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
              Send Test SMS
            </>
          )}
        </button>
      </div>

      {/* Result Message */}
      {result && (
        <div className="mt-6 max-w-2xl mx-auto">
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

      {/* Information Box */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Important Notes
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your credentials are stored temporarily in memory for this test</li>
                  <li>In production, credentials should be stored securely on the server</li>
                  <li>Make sure your Twilio account has sufficient credits</li>
                  <li>Phone numbers should be in E.164 format (e.g., +1234567890)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
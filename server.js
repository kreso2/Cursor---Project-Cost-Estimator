import express from 'express'
import cors from 'cors'
import twilio from 'twilio'
import sgMail from '@sendgrid/mail'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Twilio SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { credentials, messageData } = req.body

    // Validate required fields
    if (!credentials.accountSid || !credentials.authToken || !credentials.twilioPhoneNumber) {
      return res.status(400).json({ error: 'Missing Twilio credentials' })
    }

    if (!messageData.recipientPhoneNumber || !messageData.messageText) {
      return res.status(400).json({ error: 'Missing message data' })
    }

    // Initialize Twilio client
    const client = twilio(credentials.accountSid, credentials.authToken)

    // Send SMS
    const message = await client.messages.create({
      body: messageData.messageText,
      from: credentials.twilioPhoneNumber,
      to: messageData.recipientPhoneNumber
    })

    res.json({
      success: true,
      sid: message.sid,
      status: message.status,
      message: 'SMS sent successfully'
    })

  } catch (error) {
    console.error('Error sending SMS:', error)
    
    // Handle specific Twilio errors
    if (error.code) {
      switch (error.code) {
        case 20003:
          res.status(401).json({ error: 'Authentication failed. Please check your Account SID and Auth Token.' })
          break
        case 21211:
          res.status(400).json({ error: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890).' })
          break
        case 21608:
          res.status(400).json({ error: 'Message content is invalid or contains prohibited content.' })
          break
        case 21614:
          res.status(400).json({ error: 'Phone number is not verified for trial accounts.' })
          break
        default:
          res.status(500).json({ error: `Twilio error: ${error.message}` })
      }
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// SendGrid Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { senderEmail, recipientEmail, subject, messageBody } = req.body

    // Validate required fields
    if (!senderEmail || !recipientEmail || !subject || !messageBody) {
      return res.status(400).json({ error: 'Missing required email fields' })
    }

    // Set SendGrid API key (in production, use environment variable)
    // For testing, you can hardcode it temporarily
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY_HERE'
    
    if (SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
      return res.status(500).json({ error: 'SendGrid API key not configured. Please set SENDGRID_API_KEY environment variable.' })
    }

    sgMail.setApiKey(SENDGRID_API_KEY)

    const msg = {
      to: recipientEmail,
      from: senderEmail, // This should be a verified sender in SendGrid
      subject: subject,
      text: messageBody,
      html: messageBody.replace(/\n/g, '<br>'), // Convert line breaks to HTML
    }

    const response = await sgMail.send(msg)
    
    res.json({
      success: true,
      messageId: response[0]?.headers['x-message-id'] || 'unknown',
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Error sending email:', error)
    
    // Handle specific SendGrid errors
    if (error.response) {
      const { body } = error.response
      if (body && body.errors) {
        const errorMessage = body.errors[0]?.message || 'SendGrid API error'
        res.status(400).json({ error: errorMessage })
      } else {
        res.status(500).json({ error: 'SendGrid API error' })
      }
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Twilio SMS API available at http://localhost:${PORT}/api/send-sms`)
  console.log(`SendGrid Email API available at http://localhost:${PORT}/api/send-email`)
}) 
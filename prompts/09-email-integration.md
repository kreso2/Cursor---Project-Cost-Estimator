# 09 - Email Integration (SendGrid)

## SendGrid Email Feature Overview
Add email notification capabilities to the project cost calculator using SendGrid's email API.

## Core Requirements
- Send transactional emails for project updates
- Email templates for different notification types
- Secure API key management
- Email delivery tracking and analytics

## Implementation Details

### SendGrid Setup
- **Service**: SendGrid Email API
- **Package**: `@sendgrid/mail` Node.js package
- **Authentication**: API Key
- **Rate Limits**: 100 emails/day (free tier)
- **Templates**: Dynamic email templates

### Backend Implementation
```typescript
// server.js - Express server for SendGrid API calls
import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';

const app = express();
app.use(cors());
app.use(express.json());

// SendGrid API key setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  const { fromEmail, toEmail, subject, message } = req.body;
  
  try {
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: subject,
      text: message,
      html: `<div>${message}</div>`
    };
    
    const result = await sgMail.send(msg);
    res.json({ success: true, messageId: result[0].headers['x-message-id'] });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### Frontend Implementation
```typescript
// Email.tsx - Email sending form
interface EmailFormData {
  fromEmail: string;
  toEmail: string;
  subject: string;
  message: string;
}

const sendEmail = async (data: EmailFormData) => {
  const response = await fetch('http://localhost:3001/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
};
```

## Email Templates

### Project Share Template
```html
<!DOCTYPE html>
<html>
<head>
  <title>Project Shared</title>
</head>
<body>
  <h2>Project: {{projectName}}</h2>
  <p>Hello {{recipientName}},</p>
  <p>{{senderName}} has shared a project with you.</p>
  <p><strong>Project Details:</strong></p>
  <ul>
    <li>Total Cost: {{currency}} {{totalCost}}</li>
    <li>Duration: {{duration}} months</li>
    <li>Team Size: {{teamSize}} members</li>
  </ul>
  <a href="{{projectUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
    View Project
  </a>
</body>
</html>
```

### Cost Alert Template
```html
<!DOCTYPE html>
<html>
<head>
  <title>Cost Alert</title>
</head>
<body>
  <h2>Cost Alert: {{projectName}}</h2>
  <p>Project costs have exceeded the budget threshold.</p>
  <p><strong>Current Cost:</strong> {{currency}} {{currentCost}}</p>
  <p><strong>Budget:</strong> {{currency}} {{budget}}</p>
  <p><strong>Overrun:</strong> {{currency}} {{overrun}}</p>
  <a href="{{projectUrl}}">View Project Details</a>
</body>
</html>
```

## UI Components
- **Email Form**: Input fields for sender, recipient, subject, message
- **Email Validation**: Proper email format validation
- **Send Button**: Send email functionality
- **Status Display**: Success/error message handling
- **Loading States**: Spinner during email sending
- **Template Selector**: Choose from predefined email templates

## Security Considerations
- **API Key Management**: Environment variables for SendGrid API key
- **Email Validation**: Validate sender and recipient emails
- **Rate Limiting**: Prevent email abuse
- **Content Filtering**: Sanitize email content
- **Sender Verification**: Verify sender email domain

## Use Cases
- **Project Sharing**: Email project details to stakeholders
- **Cost Alerts**: Notify when project costs exceed budget
- **Status Updates**: Send project completion notifications
- **Team Invitations**: Invite team members to projects
- **Report Delivery**: Send project reports via email

## Error Handling
- **Invalid Emails**: Email format validation
- **SendGrid API Errors**: Handle rate limits, authentication errors
- **Network Issues**: Retry logic for failed requests
- **User Feedback**: Clear error messages and suggestions

## Email Analytics
- **Delivery Tracking**: Track email delivery status
- **Open Rates**: Monitor email open rates
- **Click Tracking**: Track link clicks in emails
- **Bounce Handling**: Handle bounced emails

## Configuration
```typescript
// Environment variables
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Project Calculator

// Validation rules
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECT_MAX_LENGTH = 100;
const MESSAGE_MAX_LENGTH = 10000;
```

## Integration Points
- **Project Updates**: Trigger emails on project changes
- **User Preferences**: Allow users to opt-in/out of emails
- **Admin Controls**: Enable/disable email features
- **Audit Trail**: Log all email activities
- **Template Management**: Dynamic email templates

## Advanced Features
- **Email Scheduling**: Send emails at specific times
- **Bulk Emails**: Send to multiple recipients
- **Email Tracking**: Track email opens and clicks
- **Unsubscribe Management**: Handle unsubscribe requests
- **Email Templates**: Dynamic content insertion

## Testing
- **Test Emails**: Send test emails to verify functionality
- **Template Testing**: Test email templates with sample data
- **Error Scenarios**: Test with invalid API keys
- **Delivery Testing**: Verify email delivery to different providers

## Future Enhancements
- **Email Campaigns**: Marketing email campaigns
- **A/B Testing**: Test different email templates
- **Personalization**: Dynamic content based on user data
- **Email Automation**: Automated email workflows
- **Advanced Analytics**: Detailed email performance metrics 
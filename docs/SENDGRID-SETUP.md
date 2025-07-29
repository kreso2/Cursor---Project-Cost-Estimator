# SendGrid Email Setup Guide

This guide explains how to set up and use the SendGrid email feature in the Project Cost Calculator application.

## Prerequisites

1. **SendGrid Account**: You need a SendGrid account with:
   - API Key
   - Verified sender email address

2. **Node.js Dependencies**: The following packages are required:
   - `@sendgrid/mail` - Official SendGrid Node.js SDK
   - `express` - Web server framework
   - `cors` - Cross-origin resource sharing middleware

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already installed. If you need to reinstall:

```bash
npm install @sendgrid/mail express cors
```

### 2. Configure SendGrid

#### Create a SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com) and create an account
2. Verify your email address
3. Complete the account setup process

#### Get Your API Key
1. Log in to your SendGrid dashboard
2. Navigate to Settings → API Keys
3. Create a new API Key with "Mail Send" permissions
4. Copy the API key (it starts with "SG.")

#### Verify Your Sender Email
1. In SendGrid dashboard, go to Settings → Sender Authentication
2. Choose either:
   - **Single Sender Verification**: For testing (recommended)
   - **Domain Authentication**: For production use
3. Follow the verification process for your sender email

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

Or set the environment variable directly:

```bash
# Windows
set SENDGRID_API_KEY=your_sendgrid_api_key_here

# macOS/Linux
export SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### 4. Start the Backend Server

Run the Express server that handles SendGrid API calls:

```bash
npm run server
```

The server will start on port 3001 and provide the following endpoints:
- `POST /api/send-email` - Send emails via SendGrid
- `GET /api/health` - Health check endpoint

### 5. Start the Frontend Application

In a separate terminal, start the React development server:

```bash
npm run dev
```

### 6. Access the Email Page

1. Navigate to the application in your browser
2. Log in to your account
3. Click on the "Email" tab in the sidebar navigation

## Using the SendGrid Email Feature

### Configuration

1. **Sender Email**: Enter your verified SendGrid sender email
2. **Recipient Email**: Enter the recipient's email address
3. **Subject**: Enter the email subject
4. **Message Body**: Enter your email message

### Sending Emails

1. Fill in all the required fields
2. Click "Send Email" to send the message
3. Check the success/error message below the form

### Important Notes

- **Sender Verification**: The sender email must be verified in your SendGrid account
- **Trial Accounts**: Free SendGrid accounts have daily sending limits (usually 100 emails/day)
- **API Key Security**: Never commit your API key to version control
- **Rate Limits**: Be aware of SendGrid's rate limits

## Error Handling

The application handles common SendGrid errors:

- **Authentication Errors**: Invalid API key
- **Sender Verification**: Unverified sender email
- **Rate Limiting**: Exceeded sending limits
- **Invalid Recipients**: Malformed email addresses

## Security Considerations

For production use:

1. **Environment Variables**: Store API keys in environment variables
2. **Server-side Validation**: Validate all inputs on the server
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **HTTPS**: Use HTTPS for all API communications
5. **Input Sanitization**: Sanitize all user inputs
6. **Domain Authentication**: Use domain authentication instead of single sender verification

## Troubleshooting

### Common Issues

1. **API Key Not Configured**: Make sure SENDGRID_API_KEY is set
2. **Sender Not Verified**: Verify your sender email in SendGrid dashboard
3. **Rate Limit Exceeded**: Check your SendGrid usage limits
4. **CORS Errors**: Make sure the backend server is running on port 3001

### Getting Help

- Check the SendGrid dashboard for detailed error messages
- Review the SendGrid documentation for API reference
- Check the browser console for frontend errors
- Check the server console for backend errors

## API Reference

### Send Email Endpoint

**POST** `/api/send-email`

**Request Body:**
```json
{
  "senderEmail": "sender@example.com",
  "recipientEmail": "recipient@example.com",
  "subject": "Test Email",
  "messageBody": "This is a test email from Project Cost Calculator!"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message_id_from_sendgrid",
  "message": "Email sent successfully"
}
```

**Error Response:**
```json
{
  "error": "Error message describing the issue"
}
```

## Testing

### Test Email Setup

1. Use your verified sender email as the sender
2. Send to your own email address for testing
3. Check your email inbox for the received message
4. Verify the message content and formatting

### SendGrid Dashboard

- Monitor your email sending activity in the SendGrid dashboard
- Check delivery status and bounce reports
- View analytics and engagement metrics 
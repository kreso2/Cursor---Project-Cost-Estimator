# Twilio SMS Setup Guide

This guide explains how to set up and use the Twilio SMS feature in the Project Cost Calculator application.

## Prerequisites

1. **Twilio Account**: You need a Twilio account with:
   - Account SID
   - Auth Token
   - A Twilio phone number

2. **Node.js Dependencies**: The following packages are required:
   - `twilio` - Official Twilio Node.js SDK
   - `express` - Web server framework
   - `cors` - Cross-origin resource sharing middleware

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already installed. If you need to reinstall:

```bash
npm install twilio express cors
```

### 2. Start the Backend Server

Run the Express server that handles Twilio API calls:

```bash
npm run server
```

The server will start on port 3001 and provide the following endpoints:
- `POST /api/send-sms` - Send SMS messages via Twilio
- `GET /api/health` - Health check endpoint

### 3. Start the Frontend Application

In a separate terminal, start the React development server:

```bash
npm run dev
```

### 4. Access the Twilio Page

1. Navigate to the application in your browser
2. Log in to your account
3. Click on the "Twilio" tab in the sidebar navigation

## Using the Twilio SMS Feature

### Configuration

1. **Account SID**: Enter your Twilio Account SID (starts with "AC")
2. **Auth Token**: Enter your Twilio Auth Token
3. **Twilio Phone Number**: Enter your Twilio phone number in E.164 format (e.g., +1234567890)

### Sending Test Messages

1. **Recipient Phone Number**: Enter the recipient's phone number in E.164 format
2. **Message Text**: Enter the message you want to send
3. Click "Send Test SMS" to send the message

### Important Notes

- **Trial Accounts**: If you're using a Twilio trial account, you can only send SMS to verified phone numbers
- **Phone Number Format**: All phone numbers must be in E.164 format (e.g., +1234567890)
- **Credential Security**: In this demo, credentials are stored temporarily in memory. In production, they should be stored securely on the server
- **Rate Limits**: Be aware of Twilio's rate limits and pricing

## Error Handling

The application handles common Twilio errors:

- **Authentication Errors**: Invalid Account SID or Auth Token
- **Invalid Phone Numbers**: Incorrect phone number format
- **Content Errors**: Prohibited message content
- **Trial Account Restrictions**: Unverified phone numbers

## Security Considerations

For production use:

1. **Environment Variables**: Store Twilio credentials in environment variables
2. **Server-side Validation**: Validate all inputs on the server
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **HTTPS**: Use HTTPS for all API communications
5. **Input Sanitization**: Sanitize all user inputs

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the backend server is running on port 3001
2. **Authentication Failures**: Verify your Account SID and Auth Token
3. **Phone Number Errors**: Ensure phone numbers are in E.164 format
4. **Trial Account Issues**: Verify recipient phone numbers in your Twilio console

### Getting Help

- Check the Twilio console for detailed error messages
- Review the Twilio documentation for API reference
- Check the browser console for frontend errors
- Check the server console for backend errors

## API Reference

### Send SMS Endpoint

**POST** `/api/send-sms`

**Request Body:**
```json
{
  "credentials": {
    "accountSid": "AC1234567890abcdef1234567890abcdef",
    "authToken": "your_auth_token",
    "twilioPhoneNumber": "+1234567890"
  },
  "messageData": {
    "recipientPhoneNumber": "+0987654321",
    "messageText": "Hello from Project Cost Calculator!"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sid": "SM1234567890abcdef1234567890abcdef",
  "status": "queued",
  "message": "SMS sent successfully"
}
```

**Error Response:**
```json
{
  "error": "Error message describing the issue"
}
``` 
# Email Service

A modern email service platform built with Next.js, MongoDB, and Nodemailer.

## Features

- SMTP Configuration Management
- Email Template Creation
- Test Email Sending
- Email Logs Tracking
- API Key Management
- User Plans and Limits

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance
- SMTP server credentials

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd email_service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/email_service
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Send Email
- **Endpoint**: `/api/send-email`
- **Method**: POST
- **Body**:
```json
{
  "api_key": "your-api-key",
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "message": "Email Body"
}
```

### SMTP Configuration
- **Endpoint**: `/api/smtp`
- **Methods**: GET, POST
- **GET Query Parameters**: `userId`
- **POST Body**:
```json
{
  "userId": "user-id",
  "host": "smtp.example.com",
  "port": 587,
  "secure": true,
  "username": "smtp-username",
  "password": "smtp-password",
  "provider": "provider-name"
}
```

### Email Templates
- **Endpoint**: `/api/templates`
- **Methods**: GET, POST, DELETE
- **GET Query Parameters**: `userId`
- **POST Body**:
```json
{
  "userId": "user-id",
  "name": "Template Name",
  "subject": "Email Subject",
  "body": "Email Body",
  "type": "static"
}
```

### Email Logs
- **Endpoint**: `/api/logs`
- **Method**: GET
- **Query Parameters**: 
  - `userId` (required)
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)

## Development

The project uses:
- Next.js 13+ with App Router
- MongoDB with Mongoose
- Nodemailer for email sending
- TailwindCSS for styling

## Deployment

The application is ready for deployment on Vercel. Make sure to set up the environment variables in your deployment platform.

## License

MIT

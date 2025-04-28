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

### Deploying to Render

This project is configured for deployment on Render using the provided `render.yaml` blueprint file.

1. First, push your code to a GitHub, GitLab, or Bitbucket repository

2. Create an account on [Render](https://render.com) if you don't have one already

3. From the Render dashboard, click the "New +" button and select "Blueprint"

4. Connect your repository and Render will automatically detect the `render.yaml` configuration

5. The blueprint will set up the following services:

   - Web service for the Next.js application
   - Worker service for email queue processing
   - MongoDB database
   - Redis instance for the BullMQ queue

6. Configure the following required environment variables:

   - NEXTAUTH_URL: Set to your production URL (e.g., https://mailevery-web.onrender.com)
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: Your email service configuration

7. Click "Apply" to create and deploy all services

8. Render will provide you with URLs for your web service once deployment completes

### Running the Worker Service

The worker service for processing email jobs will be automatically deployed and started based on the configuration in the `render.yaml` file.

### Vercel Deployment (Alternative)

The application is also compatible with deployment on Vercel. Make sure to set up the environment variables in your deployment platform.

## License

MIT

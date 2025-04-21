// List of available APIs with their documentation
export const apiEndpoints = [
  // Client APIs
  {
    category: "Client APIs",
    endpoints: [
      {
        id: "api-keys",
        name: "API Keys",
        path: "/api/client/api-keys",
        description:
          "Manage API keys for authentication with the email service.",
        methods: [
          {
            method: "GET",
            description: "Get all API keys for the authenticated user",
            auth: "session",
            response: {
              success: true,
              data: [
                {
                  _id: "api-key-id",
                  key: "api-key-value",
                  active: true,
                  createdAt: "2023-01-01T00:00:00.000Z",
                },
              ],
            },
          },
          {
            method: "POST",
            description: "Create a new API key",
            auth: "session",
            response: {
              success: true,
              data: {
                _id: "api-key-id",
                key: "api-key-value",
                active: true,
                createdAt: "2023-01-01T00:00:00.000Z",
              },
            },
          },
          {
            method: "DELETE",
            description: "Delete an API key",
            auth: "session",
            params: {
              id: "API key ID to delete",
            },
            response: {
              success: true,
              message: "API key deleted successfully",
            },
          },
        ],
      },
      {
        id: "contact-groups",
        name: "Contact Groups",
        path: "/api/client/contact-groups",
        description: "Manage contact groups for sending bulk emails.",
        methods: [
          {
            method: "GET",
            description: "Get all contact groups",
            auth: "session",
            response: {
              success: true,
              data: [
                {
                  _id: "group-id",
                  name: "Group Name",
                  emails: ["test@example.com"],
                  createdAt: "2023-01-01T00:00:00.000Z",
                },
              ],
            },
          },
          {
            method: "POST",
            description: "Create a new contact group",
            auth: "session",
            params: {
              name: "Group name",
              emails: ["Array of email addresses"],
            },
            response: {
              success: true,
              data: {
                _id: "group-id",
                name: "Group Name",
                emails: ["test@example.com"],
                createdAt: "2023-01-01T00:00:00.000Z",
              },
            },
          },
          {
            method: "PUT",
            description: "Update a contact group",
            auth: "session",
            params: {
              id: "Group ID",
              name: "New group name (optional)",
              emails: ["New array of emails (optional)"],
            },
            response: {
              success: true,
              data: {
                _id: "group-id",
                name: "Updated Group Name",
                emails: ["updated@example.com"],
                updatedAt: "2023-01-01T00:00:00.000Z",
              },
            },
          },
          {
            method: "DELETE",
            description: "Delete a contact group",
            auth: "session",
            params: {
              id: "Group ID to delete",
            },
            response: {
              success: true,
              message: "Contact group deleted successfully",
            },
          },
        ],
      },
      {
        id: "logs",
        name: "Email Logs",
        path: "/api/client/logs",
        description: "View logs of sent emails.",
        methods: [
          {
            method: "GET",
            description: "Get email logs with optional filtering",
            auth: "session",
            queryParams: {
              page: "Page number (default: 1)",
              limit: "Items per page (default: 20)",
              status: "Filter by status (success, failed)",
              startDate: "Filter by date range start",
              endDate: "Filter by date range end",
            },
            response: {
              success: true,
              data: {
                logs: [
                  {
                    _id: "log-id",
                    to: "recipient@example.com",
                    subject: "Email subject",
                    status: "success",
                    createdAt: "2023-01-01T00:00:00.000Z",
                  },
                ],
                pagination: {
                  total: 45,
                  page: 1,
                  limit: 20,
                  pages: 3,
                },
              },
            },
          },
        ],
      },
      {
        id: "send-email",
        name: "Send Email (Client)",
        path: "/api/client/send-email",
        description: "Send emails directly from the client interface.",
        methods: [
          {
            method: "POST",
            description: "Send an email using a template",
            auth: "session",
            params: {
              templateId: "Template ID",
              to: "Recipient email address",
              data: {
                key1: "Value to replace in template",
                key2: "Another value to replace",
              },
            },
            response: {
              success: true,
              message: "Email sent successfully",
              data: {
                messageId: "email-message-id",
              },
            },
          },
        ],
      },
      {
        id: "smtp",
        name: "SMTP Configuration",
        path: "/api/client/smtp",
        description: "Manage SMTP server configuration.",
        methods: [
          {
            method: "GET",
            description: "Get current SMTP configuration",
            auth: "session",
            response: {
              success: true,
              data: {
                _id: "smtp-config-id",
                host: "smtp.example.com",
                port: 587,
                secure: true,
                username: "user@example.com",
              },
            },
          },
          {
            method: "POST",
            description: "Create or update SMTP configuration",
            auth: "session",
            params: {
              host: "SMTP server hostname",
              port: "SMTP server port",
              secure: "Use TLS/SSL (boolean)",
              username: "SMTP username",
              password: "SMTP password",
            },
            response: {
              success: true,
              message: "SMTP configuration saved",
              data: {
                _id: "smtp-config-id",
                host: "smtp.example.com",
                port: 587,
                secure: true,
                username: "user@example.com",
              },
            },
          },
          {
            method: "POST",
            description: "Test SMTP configuration",
            auth: "session",
            path: "/api/client/smtp/test",
            params: {
              email: "Test recipient email",
            },
            response: {
              success: true,
              message: "SMTP test successful",
              data: {
                messageId: "test-email-id",
              },
            },
          },
        ],
      },
      {
        id: "templates",
        name: "Email Templates",
        path: "/api/client/templates",
        description: "Manage email templates for sending emails.",
        methods: [
          {
            method: "GET",
            description: "Get all email templates",
            auth: "session",
            response: {
              success: true,
              data: [
                {
                  _id: "template-id",
                  name: "Template Name",
                  subject: "Email Subject",
                  type: "html",
                  createdAt: "2023-01-01T00:00:00.000Z",
                },
              ],
            },
          },
          {
            method: "GET",
            description: "Get a single email template by ID",
            auth: "session",
            path: "/api/client/templates/:id",
            response: {
              success: true,
              data: {
                _id: "template-id",
                name: "Template Name",
                subject: "Email Subject",
                body: "<p>Email body with {{variable}} placeholders</p>",
                type: "html",
                createdAt: "2023-01-01T00:00:00.000Z",
              },
            },
          },
          {
            method: "POST",
            description: "Create a new email template",
            auth: "session",
            params: {
              name: "Template name",
              subject: "Email subject",
              body: "Email body (supports HTML and variables like {{name}})",
              type: "Template type (html, text)",
            },
            response: {
              success: true,
              data: {
                _id: "template-id",
                name: "Template Name",
                subject: "Email Subject",
                body: "<p>Email body with {{variable}} placeholders</p>",
                type: "html",
                createdAt: "2023-01-01T00:00:00.000Z",
              },
            },
          },
          {
            method: "PUT",
            description: "Update an existing template",
            auth: "session",
            params: {
              id: "Template ID",
              name: "New template name (optional)",
              subject: "New subject (optional)",
              body: "New body (optional)",
              type: "New type (optional)",
            },
            response: {
              success: true,
              data: {
                _id: "template-id",
                name: "Updated Template Name",
                subject: "Updated Subject",
                body: "<p>Updated email body</p>",
                type: "html",
                updatedAt: "2023-01-01T00:00:00.000Z",
              },
            },
          },
          {
            method: "DELETE",
            description: "Delete an email template",
            auth: "session",
            params: {
              id: "Template ID to delete",
            },
            response: {
              success: true,
              message: "Template deleted successfully",
            },
          },
        ],
      },
    ],
  },
  // Service APIs (External)
  {
    category: "Service APIs (External)",
    endpoints: [
      {
        id: "send",
        name: "Send Single Email",
        path: "/api/services/email/send",
        description: "Send a single email using an email template.",
        methods: [
          {
            method: "POST",
            description: "Send an email using a template",
            auth: "apiKey",
            params: {
              templateId: "Template ID",
              to: "Recipient email address",
              data: {
                key1: "Value to replace in template",
                key2: "Another value to replace",
              },
            },
            response: {
              success: true,
              message: "Email queued successfully",
              data: {
                jobId: "queue-job-id",
                emailQueued: {
                  to: "recipient@example.com",
                  subject: "Email subject",
                  templateId: "template-id",
                },
                usage: {
                  sent: 1,
                  limit: 100,
                  remaining: 99,
                },
              },
            },
          },
        ],
      },
      {
        id: "send-group",
        name: "Send Group Email",
        path: "/api/services/email/send-group",
        description: "Send emails to a contact group using a template.",
        methods: [
          {
            method: "POST",
            description: "Send emails to an entire contact group",
            auth: "apiKey",
            params: {
              templateId: "Template ID",
              groupName: "Contact group name",
              data: {
                key1: "Value to replace in template",
                key2: "Another value to replace",
              },
            },
            response: {
              success: true,
              message: "Group email queued successfully",
              data: {
                jobIds: ["job-id-1", "job-id-2"],
                emailsQueued: 2,
                templateId: "template-id",
                groupName: "group-name",
                usage: {
                  sent: 5,
                  limit: 100,
                  remaining: 95,
                },
              },
            },
          },
        ],
      },
      {
        id: "templates-service",
        name: "Email Templates (Service)",
        path: "/api/services/email/templates",
        description: "Retrieve email templates via the service API.",
        methods: [
          {
            method: "GET",
            description: "Get all templates for the authenticated API user",
            auth: "apiKey",
            queryParams: {
              page: "Page number (default: 1)",
              limit: "Items per page (default: 50)",
            },
            response: {
              success: true,
              message: "Templates retrieved successfully",
              data: {
                templates: [
                  {
                    _id: "template-id",
                    name: "Template Name",
                    subject: "Template Subject",
                    type: "html",
                    createdAt: "2023-01-01T00:00:00.000Z",
                  },
                ],
                pagination: {
                  total: 5,
                  page: 1,
                  limit: 50,
                  pages: 1,
                },
                usage: {
                  sent: 5,
                  limit: 100,
                  remaining: 95,
                },
              },
            },
          },
        ],
      },
      {
        id: "groups-service",
        name: "Contact Groups (Service)",
        path: "/api/services/email/groups",
        description: "Retrieve contact groups via the service API.",
        methods: [
          {
            method: "GET",
            description:
              "Get all contact groups for the authenticated API user",
            auth: "apiKey",
            queryParams: {
              page: "Page number (default: 1)",
              limit: "Items per page (default: 50)",
            },
            response: {
              success: true,
              message: "Contact groups retrieved successfully",
              data: {
                groups: [
                  {
                    _id: "group-id",
                    name: "Group Name",
                    emailCount: 10,
                    createdAt: "2023-01-01T00:00:00.000Z",
                  },
                ],
                pagination: {
                  total: 3,
                  page: 1,
                  limit: 50,
                  pages: 1,
                },
                usage: {
                  sent: 5,
                  limit: 100,
                  remaining: 95,
                },
              },
            },
          },
        ],
      },
      {
        id: "queue-status",
        name: "Queue Status",
        path: "/api/services/email/queue-status",
        description: "Check the status of the email sending queue.",
        methods: [
          {
            method: "GET",
            description:
              "Get email queue status for the authenticated API user",
            auth: "apiKey",
            response: {
              success: true,
              message: "Queue status retrieved successfully",
              data: {
                globalStats: {
                  active: 2,
                  completed: 100,
                  failed: 3,
                  delayed: 0,
                  waiting: 5,
                },
                userStats: {
                  pendingJobs: 3,
                  jobs: [
                    {
                      id: "job-id",
                      state: "waiting",
                      createdAt: 1650000000000,
                      data: {
                        to: "recipient@example.com",
                        subject: "Email Subject",
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    ],
  },
];

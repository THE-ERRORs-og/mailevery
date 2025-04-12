'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('smtp');
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    secure: true,
    username: '',
    password: '',
    provider: 'gmail',
  });
  const [emailTemplate, setEmailTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'static',
  });
  const [testEmail, setTestEmail] = useState({
    to: '',
    subject: '',
    message: '',
  });
  const [emailLogs, setEmailLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [templateError, setTemplateError] = useState('');
  const [templateSuccess, setTemplateSuccess] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/client/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...smtpConfig,
          host: 'smtp.gmail.com',
          port: '587',
          secure: true,
          provider: 'gmail',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save SMTP configuration');
      }

      setSuccess('Gmail SMTP configuration saved successfully');
      setSmtpConfig({
        host: 'smtp.gmail.com',
        port: '587',
        secure: true,
        username: '',
        password: '',
        provider: 'gmail',
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    setTemplateError('');
    setTemplateSuccess('');
    setTemplateLoading(true);

    try {
      const response = await fetch('/api/client/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailTemplate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save template');
      }

      setTemplateSuccess('Template saved successfully');
      setEmailTemplate({
        name: '',
        subject: '',
        body: '',
        type: 'static',
      });
      
      // Refresh templates list
      const templatesResponse = await fetch('/api/client/templates');
      const templatesData = await templatesResponse.json();
      if (templatesData.success) {
        setTemplates(templatesData.templates);
      }
    } catch (error) {
      setTemplateError(error.message);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    // TODO: Implement test email sending
  };

  // Add useEffect to fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/client/templates');
        const data = await response.json();
        if (data.success) {
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user.email}</h1>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('smtp')}
                className={`${
                  activeTab === 'smtp'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                SMTP Configuration
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`${
                  activeTab === 'templates'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Email Templates
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`${
                  activeTab === 'test'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Send Test Email
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`${
                  activeTab === 'logs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Email Logs
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'smtp' && (
              <form onSubmit={handleSmtpSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{success}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded relative" role="alert">
                      <span className="block sm:inline">Using Gmail SMTP Configuration</span>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Gmail Address
                    </label>
                    <input
                      type="email"
                      name="username"
                      id="username"
                      value={smtpConfig.username}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder="your.email@gmail.com"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      App Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={smtpConfig.password}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Your Gmail App Password"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded relative" role="alert">
                      <span className="block sm:inline">
                        Note: You need to use an App Password from your Google Account. 
                        <a 
                          href="https://support.google.com/accounts/answer/185833?hl=en" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-800 underline ml-1"
                        >
                          Learn how to generate one
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Gmail Configuration'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'templates' && (
              <form onSubmit={handleTemplateSubmit} className="space-y-6">
                {templateError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{templateError}</span>
                  </div>
                )}
                {templateSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{templateSuccess}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">
                      Template Name
                    </label>
                    <input
                      type="text"
                      name="template-name"
                      id="template-name"
                      value={emailTemplate.name}
                      onChange={(e) => setEmailTemplate({ ...emailTemplate, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Welcome Email"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="template-subject"
                      id="template-subject"
                      value={emailTemplate.subject}
                      onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Welcome to Our Service"
                      required
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="template-body" className="block text-sm font-medium text-gray-700">
                      Body
                    </label>
                    <textarea
                      name="template-body"
                      id="template-body"
                      rows={4}
                      value={emailTemplate.body}
                      onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Dear {name}, welcome to our service..."
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="template-type" className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      name="template-type"
                      id="template-type"
                      value={emailTemplate.type}
                      onChange={(e) => setEmailTemplate({ ...emailTemplate, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    >
                      <option value="static">Static</option>
                      <option value="dynamic">Dynamic</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={templateLoading}
                    className={`ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      templateLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {templateLoading ? 'Saving...' : 'Save Template'}
                  </button>
                </div>

                {/* Templates List */}
                {templates.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">Your Templates</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {templates.map((template) => (
                        <div
                          key={template._id}
                          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              template.type === 'static' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {template.type}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{template.subject}</p>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setEmailTemplate({
                                  name: template.name,
                                  subject: template.subject,
                                  body: template.body,
                                  type: template.type,
                                });
                              }}
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            )}

            {activeTab === 'test' && (
              <form onSubmit={handleTestEmail} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="test-to" className="block text-sm font-medium text-gray-700">
                      To
                    </label>
                    <input
                      type="email"
                      name="test-to"
                      id="test-to"
                      value={testEmail.to}
                      onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="test-subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="test-subject"
                      id="test-subject"
                      value={testEmail.subject}
                      onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="test-message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      name="test-message"
                      id="test-message"
                      rows={4}
                      value={testEmail.message}
                      onChange={(e) => setTestEmail({ ...testEmail, message: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Send Test Email
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'logs' && (
              <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              To
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Subject
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Status
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {emailLogs.map((log) => (
                            <tr key={log._id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {log.to}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {log.subject}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <span
                                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                    log.status === 'success'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {log.status}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
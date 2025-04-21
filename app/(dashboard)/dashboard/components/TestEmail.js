'use client';

import { useState, useEffect } from 'react';

export default function TestEmail() {
  const [testEmail, setTestEmail] = useState({
    to: '',
    templateId: '',
    variables: {},
  });
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({ subject: '', body: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    const updatePreview = () => {
      const selectedTemplate = templates.find(t => t._id === testEmail.templateId);
      if (!selectedTemplate) return;
  
      let subject = selectedTemplate.subject;
      let body = selectedTemplate.body;
  
      if (selectedTemplate.type === 'dynamic') {
        Object.entries(testEmail.variables).forEach(([key, value]) => {
          const regex = new RegExp(`{${key}}`, 'g');
          subject = subject.replace(regex, value);
          body = body.replace(regex, value);
        });
      }
  
      setPreview({ subject, body });
    };

    updatePreview();
  }, [testEmail.templateId, testEmail.variables, templates]);

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

  const handleTestEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/client/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEmail),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setSuccess('Test email sent successfully');
      setTestEmail({
        to: '',
        templateId: '',
        variables: {},
      });
      setPreview({ subject: '', body: '' });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVariableChange = (key, value) => {
    setTestEmail({
      ...testEmail,
      variables: {
        ...testEmail.variables,
        [key]: value,
      },
    });
  };

  const selectedTemplate = templates.find(t => t._id === testEmail.templateId);

  return (
    <div className="space-y-6">
      <form onSubmit={handleTestEmailSubmit} className="space-y-6">
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
          <div className="sm:col-span-3">
            <label htmlFor="to" className="block text-sm font-medium text-gray-900">
              Recipient Email
            </label>
            <input
              type="email"
              name="to"
              id="to"
              value={testEmail.to}
              onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
              placeholder="recipient@example.com"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="template" className="block text-sm font-medium text-gray-900">
              Template
            </label>
            <select
              name="template"
              id="template"
              value={testEmail.templateId}
              onChange={(e) => setTestEmail({ ...testEmail, templateId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
              required
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} ({template.type})
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && selectedTemplate.type === 'dynamic' && (
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Template Variables
              </label>
              <div className="space-y-4">
                {Object.keys(selectedTemplate.variables || {}).map((key) => (
                  <div key={key} className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-900 w-24">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={testEmail.variables[key] || ''}
                      onChange={(e) => handleVariableChange(key, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {selectedTemplate && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Subject</label>
                <div className="mt-1 text-sm text-gray-900 bg-white p-2 rounded border border-gray-300">
                  {preview.subject}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Body</label>
                <div className="mt-1 text-sm text-gray-900 bg-white p-2 rounded border border-gray-300 whitespace-pre-wrap">
                  {preview.body}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </form>
    </div>
  );
}
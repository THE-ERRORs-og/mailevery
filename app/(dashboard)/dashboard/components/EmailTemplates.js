'use client';

import { useState, useEffect } from 'react';

export default function EmailTemplates() {
  const [emailTemplate, setEmailTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'static',
  });
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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

      setSuccess('Template saved successfully');
      setEmailTemplate({
        name: '',
        subject: '',
        body: '',
        type: 'static',
      });
      
      // Refresh templates list
      fetchTemplates();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`/api/client/templates?id=${templateId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete template');
      }

      setSuccess('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleTemplateSubmit} className="space-y-6">
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
            disabled={loading}
            className={`ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>

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
                <div className="mt-2 flex justify-end space-x-2">
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
                  <button
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
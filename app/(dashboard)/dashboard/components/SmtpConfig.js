'use client';

import { set } from 'mongoose';
import { useState, useEffect } from 'react';

export default function SmtpConfig() {
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    secure: true,
    username: '',
    password: '',
    provider: 'gmail',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSmtpConfig();
  }, []);

  const fetchSmtpConfig = async () => {
    try {
      const response = await fetch('/api/client/smtp');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch SMTP configuration');
      }

      if (data.smtpConfig) {
        setSmtpConfig({
          ...data.smtpConfig,
          password: '' // Don't show the password
        });
      } else {
        setSmtpConfig({
          host: 'smtp.gmail.com',
          port: '587',
          secure: true,
          username: '',
          password: '',
          provider: 'gmail',
        });
        setIsEditing(true); // Allow user to set up SMTP if not already configured
      }
    } catch (error) {
      setError(error.message);
    }
  };

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
      setIsEditing(false);
      setSmtpConfig({
        ...data.smtpConfig,
        password: '' // Don't show the password
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    fetchSmtpConfig(); // Reset to original values
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Gmail SMTP Configuration</h3>
          {!isEditing && smtpConfig.username && (
            <button
              onClick={handleEditClick}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Configuration
            </button>
          )}
        </div>

        <form onSubmit={handleSmtpSubmit} className="space-y-6">
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
                disabled={!isEditing}
                required
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
                placeholder={isEditing ? "Enter new App Password" : "••••••••"}
                disabled={!isEditing}
                required={isEditing}
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

          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelClick}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || (!isEditing && smtpConfig.username)}
              className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                (loading || (!isEditing && smtpConfig.username)) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Configuration' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
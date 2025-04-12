'use client';

import { useState, useEffect } from 'react';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/client/api-keys');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch API keys');
      }

      setApiKeys(data.apiKeys);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/client/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key');
      }

      setSuccess('API key created successfully');
      setNewKey(data.apiKey.key);
      setShowNewKey(true);
      setNewKeyName('');
      fetchApiKeys();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const response = await fetch(`/api/client/api-keys?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete API key');
      }

      setSuccess('API key deleted successfully');
      setSelectedKey(null);
      fetchApiKeys();
    } catch (error) {
      setError(error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('API key copied to clipboard');
  };

  const handleKeyClick = (apiKey) => {
    setSelectedKey(apiKey);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div
          className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {/* Create New API Key */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Create New API Key
        </h3>
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div>
            <label
              htmlFor="key-name"
              className="block text-sm font-medium text-gray-700"
            >
              Key Name
            </label>
            <input
              type="text"
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              placeholder="My API Key"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating..." : "Create API Key"}
            </button>
          </div>
        </form>

        {/* Show New Key */}
        {showNewKey && (
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  Your new API key:
                </p>
                <button
                  onClick={() => copyToClipboard(newKey)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Copy
                </button>
              </div>
              <div className="mt-2">
                <code className="text-sm bg-gray-100 text-black p-2 rounded block break-all">
                  {newKey}
                </code>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Make sure to copy your API key now. You won't be able to see it
                again!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* API Keys List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your API Keys</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {apiKeys.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              No API keys found. Create one to get started.
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleKeyClick(apiKey)}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {apiKey.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created on{" "}
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(apiKey._id)}
                    className="text-sm text-red-600 hover:text-red-500 ml-4"
                  >
                    Delete
                  </button>
                </div>
                {selectedKey && selectedKey._id === apiKey._id && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        API Key:
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedKey.key)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-2">
                      <code className="text-sm bg-gray-100 p-2 text-black rounded block break-all">
                        {selectedKey.key}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 
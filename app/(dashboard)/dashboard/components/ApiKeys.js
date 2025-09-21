'use client';

import { useState, useEffect, useRef } from 'react';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  
  // Domain management state for existing keys
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [allowLocalhost, setAllowLocalhost] = useState(false);
  const [savingDomains, setSavingDomains] = useState(false);
  const [domainError, setDomainError] = useState('');
  const newDomainInputRef = useRef(null);
  
  // State for new key creation with domains
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [newKeyDomains, setNewKeyDomains] = useState([]);
  const [newKeyDomain, setNewKeyDomain] = useState('');
  const [newKeyAllowLocalhost, setNewKeyAllowLocalhost] = useState(true);
  const [newKeyDomainError, setNewKeyDomainError] = useState('');
  
  // Copy animation state
  const [copiedKeyId, setCopiedKeyId] = useState(null);

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
        body: JSON.stringify({ 
          name: newKeyName,
          domains: newKeyDomains,
          allowLocalhost: newKeyAllowLocalhost
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key');
      }

      setSuccess('API key created successfully');
      setNewKey(data.apiKey.key);
      setShowNewKey(true);
      setNewKeyName('');
      setNewKeyDomains([]);
      setNewKeyAllowLocalhost(true);
      setShowDomainForm(false);
      fetchApiKeys();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
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

  const copyToClipboard = (text, id = null) => {
    navigator.clipboard.writeText(text);
    setSuccess('API key copied to clipboard');
    
    // Set animation state
    if (id) {
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 1500); // Reset after animation
    }
  };

  const handleKeyClick = (apiKey) => {
    setSelectedKey(apiKey);
    // Load domains from the selected key
    setDomains(apiKey.domains || []);
    setAllowLocalhost(apiKey.allowLocalhost || false);
    setDomainError('');
  };
  
  const addDomain = () => {
    if (!newDomain) return;
    
    // Basic validation
    const domainRegex = /^(\*\.)?([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}(\:\d+)?$/;
    if (!domainRegex.test(newDomain)) {
      setDomainError('Invalid domain format. Use format like "example.com" or "*.example.com"');
      return;
    }
    
    if (domains.includes(newDomain)) {
      setDomainError('Domain already in list');
      return;
    }
    
    setDomains([...domains, newDomain]);
    setNewDomain('');
    setDomainError('');
  };
  
  const removeDomain = (domain) => {
    setDomains(domains.filter(d => d !== domain));
  };
  
  const handleSaveDomains = async () => {
    if (!selectedKey) return;
    
    setSavingDomains(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/client/api-keys?id=${selectedKey._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains,
          allowLocalhost
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update domains');
      }
      
      setSuccess('Domain whitelist updated successfully');
      fetchApiKeys(); // Refresh the list
    } catch (error) {
      setError(error.message);
    } finally {
      setSavingDomains(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDomain();
    }
  };
  
  // Functions for handling domains in new key form
  const addNewKeyDomain = () => {
    if (!newKeyDomain) return;
    
    // Basic validation
    const domainRegex = /^(\*\.)?([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}(\:\d+)?$/;
    if (!domainRegex.test(newKeyDomain)) {
      setNewKeyDomainError('Invalid domain format. Use format like "example.com" or "*.example.com"');
      return;
    }
    
    if (newKeyDomains.includes(newKeyDomain)) {
      setNewKeyDomainError('Domain already in list');
      return;
    }
    
    setNewKeyDomains([...newKeyDomains, newKeyDomain]);
    setNewKeyDomain('');
    setNewKeyDomainError('');
  };
  
  const removeNewKeyDomain = (domain) => {
    setNewKeyDomains(newKeyDomains.filter(d => d !== domain));
  };
  
  const handleNewKeyDomainKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewKeyDomain();
    }
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
              className="block text-sm font-medium text-indigo-800"
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
          
          <div className="flex items-center mb-4">
            <button
              type="button"
              onClick={() => setShowDomainForm(!showDomainForm)}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <span>{showDomainForm ? "Hide Domain Settings" : "Configure Domain Whitelist"}</span>
              <span className="ml-1">{showDomainForm ? "▲" : "▼"}</span>
            </button>
          </div>
          
          {showDomainForm && (
            <div className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Domain Whitelist Settings</h4>
              
              {newKeyDomainError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                  {newKeyDomainError}
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  value={newKeyDomain}
                  onChange={(e) => setNewKeyDomain(e.target.value)}
                  onKeyDown={handleNewKeyDomainKeyDown}
                  placeholder="example.com or *.example.com"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                />
                <button
                  type="button"
                  onClick={addNewKeyDomain}
                  className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={newKeyAllowLocalhost}
                    onChange={(e) => setNewKeyAllowLocalhost(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow localhost (for development)</span>
                </label>
              </div>
              
              {newKeyDomains.length > 0 ? (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Whitelisted domains:</h5>
                  <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                    {newKeyDomains.map((domain, index) => (
                      <li key={index} className="flex items-center justify-between py-2 px-4 text-sm">
                        <span className="text-gray-700">{domain}</span>
                        <button
                          type="button"
                          onClick={() => removeNewKeyDomain(domain)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mb-4 text-sm text-gray-500 italic">
                  No domains whitelisted yet. {newKeyAllowLocalhost ? "Only localhost will be allowed." : "This API key won't work with any cross-origin requests."}
                </div>
              )}
            </div>
          )}
          
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
                  onClick={() => copyToClipboard(newKey, 'new')}
                  className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  {copiedKeyId === 'new' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : 'Copy'}
                </button>
              </div>
              <div className="mt-2">
                <code className="text-sm bg-gray-100 text-black p-2 rounded block break-all">
                  {newKey}
                </code>
              </div>
              <p className="mt-2 text-sm text-indigo-600">
                Make sure to copy your API key now. You won&apos;t be able to see it
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
            <div className="px-6 py-4 text-center text-indigo-600">
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
                    <p className="text-sm text-indigo-600">
                      Created on{" "}
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex">
                    {selectedKey && selectedKey._id === apiKey._id && (
                      <button
                        onClick={() => setSelectedKey(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 mr-4"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteKey(apiKey._id)}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {selectedKey && selectedKey._id === apiKey._id && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        API Key:
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedKey.key, selectedKey._id)}
                        className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                      >
                        {copiedKeyId === selectedKey._id ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied!
                          </>
                        ) : 'Copy'}
                      </button>
                    </div>
                    <div className="mt-2">
                      <code className="text-sm bg-gray-100 p-2 text-black rounded block break-all">
                        {selectedKey.key}
                      </code>
                    </div>
                    
                    {/* Domain Whitelist Management */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Domain Whitelist</h4>
                      
                      {domainError && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                          {domainError}
                        </div>
                      )}
                      
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          onKeyDown={handleKeyDown}
                          ref={newDomainInputRef}
                          placeholder="example.com or *.example.com"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                        />
                        <button
                          type="button"
                          onClick={addDomain}
                          className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={allowLocalhost}
                            onChange={(e) => setAllowLocalhost(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">Allow localhost (for development)</span>
                        </label>
                      </div>
                      
                      {domains.length > 0 ? (
                        <div className="mb-4">
                          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                            {domains.map((domain, index) => (
                              <li key={index} className="flex items-center justify-between py-2 px-4 text-sm">
                                <span className="text-gray-700">{domain}</span>
                                <button
                                  type="button"
                                  onClick={() => removeDomain(domain)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="mb-4 text-sm text-gray-500 italic">
                          No domains whitelisted. This API key won&apos;t work with cross-origin requests.
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleSaveDomains}
                        disabled={savingDomains}
                        className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          savingDomains ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {savingDomains ? "Saving..." : "Save Domain Settings"}
                      </button>
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
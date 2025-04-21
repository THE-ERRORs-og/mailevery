'use client';

import { apiEndpoints } from '@/lib/data';
import { useState, useRef } from 'react';

export default function ApiDocs() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [testApiKey, setTestApiKey] = useState('');
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);
  const [formData, setFormData] = useState({});
  
  const endpointRefs = useRef({});



  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleJsonInputChange = (e, field) => {
    try {
      const value = e.target.value.trim() ? JSON.parse(e.target.value) : {};
      setFormData({
        ...formData,
        [field]: value
      });
    } catch (error) {
      // Keep the raw string if not valid JSON
      setFormData({
        ...formData,
        [field]: e.target.value
      });
    }
  };

  const scrollToEndpoint = (id) => {
    if (endpointRefs.current[id]) {
      endpointRefs.current[id].scrollIntoView({ behavior: 'smooth' });
    }
    setActiveEndpoint(id);
  };

  const resetTestForm = () => {
    setFormData({});
    setTestResponse(null);
    setTestError(null);
  };

  const testEndpoint = async (endpoint, method) => {
    setTestLoading(true);
    setTestResponse(null);
    setTestError(null);
    
    try {
      let url = endpoint.path;
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add auth header if needed
      if (method.auth === 'apiKey') {
        headers['x-api-key'] = testApiKey;
      }
      
      let fetchOptions = {
        method: method.method,
        headers
      };
      
      // Handle query parameters for GET requests
      if (method.method === 'GET' && method.queryParams && Object.keys(formData).length) {
        const queryParams = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
      }
      
      // Handle body for non-GET requests
      if (method.method !== 'GET' && method.params) {
        fetchOptions.body = JSON.stringify(formData);
      }
      
      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      
      setTestResponse({
        status: response.status,
        data
      });
    } catch (error) {
      setTestError(error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const renderResponseData = (data) => {
    if (!data) return null;
    
    try {
      // Always convert objects to properly formatted JSON strings
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2);
      }
      // Convert primitives to strings
      return String(data);
    } catch (error) {
      return `Error displaying data: ${error.message}`;
    }
  };

  return (
    <div className="flex flex-col text-gray-700 space-y-8">
      <h1 className="text-2xl text-gray-800 font-bold">API Documentation</h1>
      
      {/* Base URL Information */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-medium mb-2">Base URL</h3>
        <div className="font-mono bg-gray-100 p-3 rounded flex items-center">
          <code className="text-sm">{`${window.location.origin}`}</code>
          <button 
            className="ml-2 text-blue-600 hover:text-blue-800" 
            onClick={() => {navigator.clipboard.writeText(`${window.location.origin}`)}}
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">All API endpoints should be prefixed with this base URL.</p>
      </div>

      {/* API Key input for Service APIs */}
      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-medium mb-2">Test Service APIs</h3>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">
            API Key (for testing Service APIs)
          </label>
          <input
            type="text"
            value={testApiKey}
            onChange={(e) => setTestApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="p-2 border border-gray-300 rounded"
          />
          <p className="text-xs text-gray-500">
            Required for testing Service APIs. Client APIs use your session
            authentication.
          </p>
        </div>
      </div>

      {/* API Navigation */}
      <div className="flex flex-col space-y-4">
        {apiEndpoints.map((category, catidx) => (
          <div key={catidx} className="rounded-md bg-white p-4 shadow">
            <h2 className="text-xl font-semibold mb-2">{category.category}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.endpoints.map((endpoint) => (
                <button
                  key={endpoint.id}
                  onClick={() => scrollToEndpoint(endpoint.id)}
                  className={`p-3 rounded-md border text-left ${
                    activeEndpoint === endpoint.id
                      ? "bg-indigo-50 border-indigo-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <h3 className="font-medium">{endpoint.name}</h3>
                  <p className="text-sm text-gray-900 truncate">
                    {endpoint.path}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Endpoint Documentation */}
      <div className="space-y-10">
        {apiEndpoints.map((category, catidx) => (
          <div key={catidx} className="space-y-8">
            <h2 className="text-xl font-semibold border-b pb-2">
              {category.category}
            </h2>

            {category.endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                id={endpoint.id}
                ref={(el) => (endpointRefs.current[endpoint.id] = el)}
                className={`p-6 rounded-lg border ${
                  activeEndpoint === endpoint.id
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <h3 className="text-xl font-bold">{endpoint.name}</h3>
                <div className="flex items-center space-x-2 my-2">
                  <code className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-mono">
                    {endpoint.path}
                  </code>
                  <span className="text-sm text-gray-500">
                    {endpoint.methods.map((m) => m.method).join(", ")}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{endpoint.description}</p>

                <div className="space-y-6">
                  {endpoint.methods.map((method, idx) => (
                    <div key={idx} className="border-t pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium text-white
                          ${
                            method.method === "GET"
                              ? "bg-green-600"
                              : method.method === "POST"
                              ? "bg-blue-600"
                              : method.method === "PUT"
                              ? "bg-yellow-600"
                              : method.method === "DELETE"
                              ? "bg-red-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {method.method}
                        </span>
                        <code className="text-sm font-mono bg-gray-100 px-2 rounded">
                          {method.path || endpoint.path || ""}
                        </code>
                        <span className="text-sm text-gray-500">
                          {method.auth === "apiKey"
                            ? "Requires API Key"
                            : "Requires Session"}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">
                        {method.description}
                      </p>

                      {/* Parameters Documentation */}
                      {(method.params || method.queryParams) && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">
                            Parameters
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="text-left">
                                  <th className="pb-2 pr-4 font-medium">
                                    Name
                                  </th>
                                  <th className="pb-2 font-medium">
                                    Description
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {method.params &&
                                  Object.entries(method.params).map(
                                    ([key, desc]) => (
                                      <tr key={key}>
                                        <td className="py-2 pr-4 font-mono">
                                          {key}
                                        </td>
                                        <td className="py-2">
                                          <pre className="whitespace-pre-wrap break-words">
                                            {JSON.stringify(desc, null, 2)}
                                          </pre>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                {method.queryParams &&
                                  Object.entries(method.queryParams).map(
                                    ([key, desc]) => (
                                      <tr key={key}>
                                        <td className="py-2 pr-4 font-mono">
                                          {key}
                                        </td>
                                        <td className="py-2">{desc}</td>
                                      </tr>
                                    )
                                  )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Example Response */}
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">
                          Example Response
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <pre className="text-xs overflow-x-auto font-mono">
                            {JSON.stringify(method.response, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Test API Form */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Test Endpoint
                        </h4>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              testEndpoint(endpoint, method);
                            }}
                            className="space-y-4"
                          >
                            {/* Parameter Inputs for GET */}
                            {method.method === "GET" && method.queryParams && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(method.queryParams).map(
                                  ([key, desc]) => (
                                    <div
                                      key={key}
                                      className="flex flex-col space-y-1"
                                    >
                                      <label className="text-xs text-gray-500">
                                        {key}
                                      </label>
                                      <input
                                        name={key}
                                        value={formData[key] || ""}
                                        onChange={handleInputChange}
                                        placeholder={desc}
                                        className="p-2 border border-gray-300 rounded text-sm"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            {/* Parameter Inputs for POST/PUT */}
                            {method.method !== "GET" && method.params && (
                              <div>
                                {Object.entries(method.params).map(
                                  ([key, desc]) => {
                                    // If this param is an object (like 'data'), render as textarea
                                    if (typeof desc === "object") {
                                      return (
                                        <div
                                          key={key}
                                          className="mb-3 flex flex-col space-y-1"
                                        >
                                          <label className="text-xs text-gray-500">
                                            {key} (JSON)
                                          </label>
                                          <textarea
                                            name={key}
                                            value={
                                              typeof formData[key] === "object"
                                                ? JSON.stringify(
                                                    formData[key],
                                                    null,
                                                    2
                                                  )
                                                : formData[key] || ""
                                            }
                                            onChange={(e) =>
                                              handleJsonInputChange(e, key)
                                            }
                                            placeholder={`Enter JSON for ${key}`}
                                            className="p-2 border border-gray-300 rounded text-sm font-mono h-24"
                                          />
                                        </div>
                                      );
                                    }

                                    return (
                                      <div
                                        key={key}
                                        className="mb-3 flex flex-col space-y-1"
                                      >
                                        <label className="text-xs text-gray-500">
                                          {key}
                                        </label>
                                        <input
                                          name={key}
                                          value={formData[key] || ""}
                                          onChange={handleInputChange}
                                          placeholder={desc}
                                          className="p-2 border border-gray-300 rounded text-sm"
                                        />
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}

                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                disabled={
                                  method.auth === "apiKey" && !testApiKey
                                }
                                className={`px-4 py-2 rounded text-white ${
                                  method.auth === "apiKey" && !testApiKey
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                              >
                                {testLoading ? "Testing..." : "Test Endpoint"}
                              </button>

                              <button
                                type="button"
                                onClick={resetTestForm}
                                className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300"
                              >
                                Reset
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Test Response */}
                        {testResponse && activeEndpoint === endpoint.id && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-medium text-sm mb-2">
                              Response
                            </h4>
                            <div
                              className={`p-3 rounded-md ${
                                testResponse.status >= 200 &&
                                testResponse.status < 300
                                  ? "bg-green-50"
                                  : "bg-red-50"
                              }`}
                            >
                              <div className="mb-1">
                                <span className="text-xs font-medium">
                                  Status:
                                </span>
                                <span
                                  className={`ml-2 text-xs ${
                                    testResponse.status >= 200 &&
                                    testResponse.status < 300
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {testResponse.status}
                                </span>
                              </div>
                              <pre className="text-xs overflow-x-auto font-mono">
                                {renderResponseData(testResponse.data)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {testError && activeEndpoint === endpoint.id && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-medium text-sm mb-2">Error</h4>
                            <div className="bg-red-50 p-3 rounded-md">
                              <pre className="text-xs text-red-700 overflow-x-auto font-mono">
                                {testError}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
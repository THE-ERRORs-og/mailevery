'use client';

import { useState, useEffect } from 'react';

export default function ContactGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmails, setNewGroupEmails] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupEmails, setEditGroupEmails] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/client/contact-groups');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contact groups');
      }

      setGroups(data.groups);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const emails = newGroupEmails.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await fetch('/api/client/contact-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName,
          emails
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create contact group');
      }

      setSuccess('Contact group created successfully');
      setNewGroupName('');
      setNewGroupEmails('');
      fetchGroups();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupEmails(group.emails.join(', '));
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const emails = editGroupEmails.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await fetch('/api/client/contact-groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingGroup._id,
          name: editGroupName,
          emails
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update contact group');
      }

      setSuccess('Contact group updated successfully');
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Are you sure you want to delete this contact group?')) {
      return;
    }

    try {
      const response = await fetch(`/api/client/contact-groups?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete contact group');
      }

      setSuccess('Contact group deleted successfully');
      fetchGroups();
    } catch (error) {
      setError(error.message);
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
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {/* Create New Group */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Contact Group</h3>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700">
              Group Name
            </label>
            <input
              type="text"
              id="group-name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              placeholder="My Contact Group"
              required
            />
          </div>
          <div>
            <label htmlFor="group-emails" className="block text-sm font-medium text-gray-700">
              Email Addresses (comma-separated)
            </label>
            <textarea
              id="group-emails"
              value={newGroupEmails}
              onChange={(e) => setNewGroupEmails(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              placeholder="email1@example.com, email2@example.com"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>

      {/* Contact Groups List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Contact Groups</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {groups.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              No contact groups found. Create one to get started.
            </div>
          ) : (
            groups.map((group) => (
              <div key={group._id} className="px-6 py-4">
                {editingGroup && editingGroup._id === group._id ? (
                  <form onSubmit={handleUpdateGroup} className="space-y-4">
                    <div>
                      <label htmlFor="edit-group-name" className="block text-sm font-medium text-gray-700">
                        Group Name
                      </label>
                      <input
                        type="text"
                        id="edit-group-name"
                        value={editGroupName}
                        onChange={(e) => setEditGroupName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-group-emails" className="block text-sm font-medium text-gray-700">
                        Email Addresses (comma-separated)
                      </label>
                      <textarea
                        id="edit-group-emails"
                        value={editGroupEmails}
                        onChange={(e) => setEditGroupEmails(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditingGroup(null)}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? 'Updating...' : 'Update Group'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-500">
                        {group.emails.length} email{group.emails.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group._id)}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Delete
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
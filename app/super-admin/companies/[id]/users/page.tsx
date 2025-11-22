'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Pagination from '../../../../components/Pagination';
import { usePagination } from '../../../../hooks/usePagination';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  business_name: string;
}

export default function ManageUsersPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    role: 'user',
    is_active: true,
    enable_login: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCompanyAndUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch company details
      const companyRes = await fetch(`/api/super-admin/companies/${companyId}`);
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompany(companyData);
      }

      // Fetch users
      const usersRes = await fetch(`/api/super-admin/companies/${companyId}/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanyAndUsers();
  }, [fetchCompanyAndUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Update existing user
        const res = await fetch(`/api/super-admin/companies/${companyId}/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            is_active: formData.is_active,
            ...(formData.password && { password: formData.password }),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update user');
        }

        setSuccess('User updated successfully!');
      } else {
        // Create new user
        const res = await fetch(`/api/super-admin/companies/${companyId}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create user');
        }

        setSuccess('User created successfully!');
      }

      // Reset form
      setFormData({ username: '', email: '', name: '', password: '', role: 'user', is_active: true, enable_login: true });
      setShowAddForm(false);
      setEditingUser(null);
      fetchCompanyAndUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.email.split('@')[0], // Extract username from email
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      is_active: user.is_active,
      enable_login: true,
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/super-admin/companies/${companyId}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully!');
      fetchCompanyAndUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`/api/super-admin/companies/${companyId}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (!res.ok) {
        throw new Error('Failed to update user status');
      }

      setSuccess(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully!`);
      fetchCompanyAndUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', name: '', password: '', role: 'user', is_active: true, enable_login: true });
    setError('');
    setSuccess('');
  };

  // Pagination
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    items: users,
    initialItemsPerPage: 10,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/super-admin/companies/${companyId}`)}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center"
          >
            ← Back to Company
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          {company && (
            <p className="text-gray-600 mt-2">
              {company.name} - {company.business_name}
            </p>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Add User Button */}
        {!showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + Add New User
            </button>
          </div>
        )}

        {/* Add/Edit User Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="e.g., john.doe"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for login</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="user@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={editingUser ? 'Leave blank to keep current' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2 w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.enable_login}
                    onChange={(e) => setFormData({ ...formData, enable_login: e.target.checked })}
                    className="mr-2 w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Login</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found. Add your first user to get started.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {users.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}


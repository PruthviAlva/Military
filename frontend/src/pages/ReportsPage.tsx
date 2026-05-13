import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
}

interface Statistics {
  total_assets: number;
  total_purchases: number;
  total_transfers: number;
  total_expended: number;
  total_opening_balance: number;
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [baseId, setBaseId] = useState(user?.baseId || '550e8400-e29b-41d4-a716-446655440001');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [baseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsResponse = await api.get(`/reports/summary/stats?base_id=${baseId}`);
      setStats(statsResponse.data);

      // Fetch audit logs
      const logsResponse = await api.get(
        `/reports?base_id=${baseId}${actionFilter ? '&action=' + actionFilter : ''}${
          resourceFilter ? '&resource_type=' + resourceFilter : ''
        }`
      );
      setAuditLogs(logsResponse.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Assets</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total_assets}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Purchases</p>
              <p className="text-3xl font-bold text-green-600">{stats.total_purchases}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Transfers</p>
              <p className="text-3xl font-bold text-purple-600">{stats.total_transfers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Expended</p>
              <p className="text-3xl font-bold text-red-600">{stats.total_expended}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Opening Balance</p>
              <p className="text-3xl font-bold text-orange-600">{stats.total_opening_balance}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Audit Logs</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base</label>
              <select
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                disabled={user?.role === 'base_commander'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="550e8400-e29b-41d4-a716-446655440001">Fort Bragg</option>
                <option value="550e8400-e29b-41d4-a716-446655440002">Fort Hood</option>
                <option value="550e8400-e29b-41d4-a716-446655440003">Fort Stewart</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="ASSET">Asset</option>
                <option value="PURCHASE">Purchase</option>
                <option value="TRANSFER">Transfer</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="EXPENDITURE">Expenditure</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading audit logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Resource Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Resource ID</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-gray-600">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              log.action === 'CREATE'
                                ? 'bg-green-100 text-green-800'
                                : log.action === 'UPDATE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900">{log.resource_type}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{log.resource_id.slice(0, 8)}...</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

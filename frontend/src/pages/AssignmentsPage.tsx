import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AssignmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignment' | 'expenditure'>('assignment');
  const [assignmentForm, setAssignmentForm] = useState({
    asset_id: '',
    personnel_name: '',
    quantity: '',
  });
  const [expenditureForm, setExpenditureForm] = useState({
    asset_id: '',
    quantity: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.recordAssignment(
        assignmentForm.asset_id,
        assignmentForm.personnel_name,
        parseInt(assignmentForm.quantity)
      );
      setMessage('Assignment recorded successfully!');
      setAssignmentForm({ asset_id: '', personnel_name: '', quantity: '' });
    } catch (error: any) {
      setMessage('Error recording assignment: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExpenditureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.recordExpenditure(
        expenditureForm.asset_id,
        parseInt(expenditureForm.quantity),
        expenditureForm.reason
      );
      setMessage('Expenditure recorded successfully!');
      setExpenditureForm({ asset_id: '', quantity: '', reason: '' });
    } catch (error: any) {
      setMessage('Error recording expenditure: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Assignments & Expenditures</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === 'assignment'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Record Assignment
            </button>
            <button
              onClick={() => setActiveTab('expenditure')}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === 'expenditure'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Record Expenditure
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'assignment' && (
              <form onSubmit={handleAssignmentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset ID</label>
                  <input
                    type="text"
                    value={assignmentForm.asset_id}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, asset_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter asset ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personnel Name</label>
                  <input
                    type="text"
                    value={assignmentForm.personnel_name}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, personnel_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter personnel name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={assignmentForm.quantity}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? 'Recording...' : 'Record Assignment'}
                </button>
              </form>
            )}

            {activeTab === 'expenditure' && (
              <form onSubmit={handleExpenditureSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset ID</label>
                  <input
                    type="text"
                    value={expenditureForm.asset_id}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, asset_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter asset ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={expenditureForm.quantity}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={expenditureForm.reason}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter reason for expenditure"
                    rows={4}
                    required
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? 'Recording...' : 'Record Expenditure'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;

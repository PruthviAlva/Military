import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const TransfersPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    asset_id: '',
    from_base_id: user?.baseId || '550e8400-e29b-41d4-a716-446655440001',
    to_base_id: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const bases = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Fort Bragg' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Fort Hood' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Fort Stewart' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.recordTransfer(
        formData.asset_id,
        formData.from_base_id,
        formData.to_base_id,
        parseInt(formData.quantity)
      );
      setMessage('Transfer recorded successfully!');
      setFormData({
        asset_id: '',
        from_base_id: user?.baseId || '550e8400-e29b-41d4-a716-446655440001',
        to_base_id: '',
        quantity: '',
      });
    } catch (error: any) {
      setMessage('Error recording transfer: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Record Transfer</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Base</label>
            <select
              value={formData.from_base_id}
              onChange={(e) => setFormData({ ...formData, from_base_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Base</label>
            <select
              value={formData.to_base_id}
              onChange={(e) => setFormData({ ...formData, to_base_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select destination base</option>
              {bases.filter((b) => b.id !== formData.from_base_id).map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asset ID</label>
            <input
              type="text"
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Enter asset ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
            {loading ? 'Recording...' : 'Record Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransfersPage;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const PurchasesPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    asset_id: '',
    quantity: '',
    unit_price: '',
  });
  const [baseId, setBaseId] = useState(user?.baseId || '550e8400-e29b-41d4-a716-446655440001');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.recordPurchase(
        formData.asset_id,
        baseId,
        parseInt(formData.quantity),
        parseFloat(formData.unit_price)
      );
      setMessage('Purchase recorded successfully!');
      setFormData({ asset_id: '', quantity: '', unit_price: '' });
    } catch (error: any) {
      setMessage('Error recording purchase: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Record Purchase</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Enter unit price"
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
            {loading ? 'Recording...' : 'Record Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchasesPage;

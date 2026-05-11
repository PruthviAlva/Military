import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Asset, ClosingBalance } from '../types';
import Navbar from '../components/Navbar';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBase, setSelectedBase] = useState(user?.baseId || '550e8400-e29b-41d4-a716-446655440001');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedAssetBalance, setSelectedAssetBalance] = useState<{
    assetId: string;
    balance: ClosingBalance;
  } | null>(null);

  useEffect(() => {
    loadAssets();
  }, [selectedBase, selectedEquipment]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const response = await api.getAssets(selectedBase, selectedEquipment);
      setAssets(response.data);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBalance = async (assetId: string) => {
    try {
      const response = await api.getAssetBalance(assetId);
      setSelectedAssetBalance({ assetId, balance: response.data });
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const calculateMetrics = (asset: Asset) => {
    const netMovement = (asset.total_purchases || 0) + (asset.total_transfers_in || 0) - (asset.total_transfers_out || 0);
    const closingBalance = asset.opening_balance + netMovement - (asset.total_expended || 0) - (asset.total_assigned || 0);
    return { netMovement, closingBalance };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base</label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="550e8400-e29b-41d4-a716-446655440001">Fort Bragg</option>
              <option value="550e8400-e29b-41d4-a716-446655440002">Fort Hood</option>
              <option value="550e8400-e29b-41d4-a716-446655440003">Fort Stewart</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              <option value="Weapon">Weapon</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Ammunition">Ammunition</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadAssets}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Asset Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Opening Balance</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Net Movement</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Closing Balance</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const { netMovement, closingBalance } = calculateMetrics(asset);
                  return (
                    <tr key={asset.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{asset.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{asset.type}</td>
                      <td className="px-6 py-3 text-sm text-right text-gray-900">{asset.opening_balance}</td>
                      <td className="px-6 py-3 text-sm text-right">
                        <button
                          onClick={() => handleViewBalance(asset.id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          {netMovement}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-sm text-right text-gray-900">{closingBalance}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleViewBalance(asset.id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedAssetBalance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md">
              <h2 className="text-2xl font-bold mb-6">Net Movement Details</h2>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Purchases:</span>
                  <span className="font-semibold text-green-600">+{selectedAssetBalance.balance.purchases}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Transfers In:</span>
                  <span className="font-semibold text-green-600">+{selectedAssetBalance.balance.transfersIn}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Transfers Out:</span>
                  <span className="font-semibold text-red-600">-{selectedAssetBalance.balance.transfersOut}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAssetBalance(null)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

import axios, { AxiosInstance } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    const apiUrl = (import.meta.env as any).VITE_API_URL || 'http://localhost:5000/api';
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }

  register(email: string, password: string, role: string, baseId?: string) {
    return this.api.post('/auth/register', { email, password, role, baseId });
  }

  getProfile() {
    return this.api.get('/auth/profile');
  }

  // Asset endpoints
  getAssets(baseId: string, equipmentType?: string) {
    return this.api.get('/assets', {
      params: { base_id: baseId, equipment_type: equipmentType },
    });
  }

  createAsset(baseId: string, name: string, type: string, openingBalance: number) {
    return this.api.post('/assets', { base_id: baseId, name, type, opening_balance: openingBalance });
  }

  getAssetBalance(assetId: string) {
    return this.api.get(`/assets/${assetId}/balance`);
  }

  // Purchase endpoints
  recordPurchase(assetId: string, baseId: string, quantity: number, unitPrice: number) {
    return this.api.post('/purchases', { asset_id: assetId, base_id: baseId, quantity, unit_price: unitPrice });
  }

  // Transfer endpoints
  recordTransfer(assetId: string, fromBaseId: string, toBaseId: string, quantity: number) {
    return this.api.post('/transfers', { asset_id: assetId, from_base_id: fromBaseId, to_base_id: toBaseId, quantity });
  }

  // Assignment endpoints
  recordAssignment(assetId: string, personnelName: string, quantity: number) {
    return this.api.post('/assignments', { asset_id: assetId, personnel_name: personnelName, quantity });
  }

  // Expenditure endpoints
  recordExpenditure(assetId: string, quantity: number, reason: string) {
    return this.api.post('/expenditures', { asset_id: assetId, quantity, reason });
  }

  // Generic GET method for reports and other endpoints
  get(endpoint: string) {
    return this.api.get(endpoint);
  }
}

export default new ApiService();

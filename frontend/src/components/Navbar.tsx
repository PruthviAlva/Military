import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold">
              Military Asset Manager
            </Link>

            <div className="flex space-x-4">
              <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
                Dashboard
              </Link>
              <Link to="/purchases" className="hover:bg-blue-700 px-3 py-2 rounded">
                Purchases
              </Link>
              <Link to="/transfers" className="hover:bg-blue-700 px-3 py-2 rounded">
                Transfers
              </Link>
              <Link to="/assignments" className="hover:bg-blue-700 px-3 py-2 rounded">
                Assignments
              </Link>
              <Link to="/reports" className="hover:bg-blue-700 px-3 py-2 rounded">
                Reports
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="font-semibold">{user?.email}</p>
              <p className="text-blue-100 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

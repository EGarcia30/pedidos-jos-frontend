import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';  // ← IMPORT CORRECTO
import Dashboard from './pages/Dashboard.jsx';
import Productos from './pages/Productos.jsx';
import Pedidos from './pages/Pedidos.jsx';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <Routes>
          <Route path="/" element={<Pedidos />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// Navbar RESPONSIVE con menú hamburguesa
const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-800 flex items-center hover:scale-105 transition-transform"
          >
            📦 Pedidos Josselin
          </Link>
          
          {/* Botón Hamburguesa MÓVIL */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>

          {/* Menú DESKTOP */}
          <div className="hidden lg:flex space-x-2 xl:space-x-4">
            <Link 
              to="/dashboard" 
              className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                location.pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-400/50' 
                  : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50 hover:shadow-md'
              }`}
            >
              📊 Dashboard
            </Link>

            <Link 
              to="/productos" 
              className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                location.pathname === '/productos'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-400/50' 
                  : 'text-gray-700 hover:text-purple-500 hover:bg-purple-50 hover:shadow-md'
              }`}
            >
              📦 Productos
            </Link>

            <Link 
              to="/pedidos" 
              className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                location.pathname === '/pedidos' || location.pathname === '/'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-400/50' 
                  : 'text-gray-700 hover:text-green-500 hover:bg-green-50 hover:shadow-md'
              }`}
            >
              📋 Pedidos
            </Link>
          </div>
        </div>
      </div>

      {/* Menú MÓVIL */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pt-2 pb-4 bg-gray-50 border-t border-gray-200">
          <Link 
            to="/dashboard" 
            className={`block w-full px-6 py-4 rounded-xl font-semibold text-left transition-all shadow-sm mb-2 ${
              location.pathname === '/dashboard'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-400/50' 
                : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50 hover:shadow-md'
            }`}
            onClick={() => setIsOpen(false)}
          >
            📊 Dashboard
          </Link>

          <Link 
            to="/productos" 
            className={`block w-full px-6 py-4 rounded-xl font-semibold text-left transition-all shadow-sm mb-2 ${
              location.pathname === '/productos'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-400/50' 
                : 'text-gray-700 hover:text-purple-500 hover:bg-purple-50 hover:shadow-md'
            }`}
            onClick={() => setIsOpen(false)}
          >
            📦 Productos
          </Link>

          <Link 
            to="/pedidos" 
            className={`block w-full px-6 py-4 rounded-xl font-semibold text-left transition-all shadow-sm ${
              location.pathname === '/pedidos' || location.pathname === '/'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-400/50' 
                : 'text-gray-700 hover:text-green-500 hover:bg-green-50 hover:shadow-md'
            }`}
            onClick={() => setIsOpen(false)}
          >
            📋 Pedidos
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default App;



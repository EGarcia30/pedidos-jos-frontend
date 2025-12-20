import { useState, useEffect } from 'react';

const Dashboard = () => {
const [stats, setStats] = useState({
    gasto: 0,
    ventas: 0,
    utilidad: 0,
    pedidosEntregados: 0
});
const [filtro, setFiltro] = useState('hoy');
const [loading, setLoading] = useState(true);

useEffect(() => {
    fetchStats(filtro);
}, [filtro]);

const fetchStats = async (periodo) => {
    setLoading(true);
    try {
    const response = await fetch(`http://localhost:3000/api/dashboard?periodo=${periodo}`);
    if (!response.ok) throw new Error('Error cargando dashboard');
    const data = await response.json();
    setStats(data.data || data);
    } catch (error) {
    console.error('Error dashboard:', error);
    } finally {
    setLoading(false);
    }
};

const getPeriodoTexto = () => {
    const hoy = new Date();
    switch (filtro) {
    case 'hoy': return `Hoy ${hoy.toLocaleDateString('es-SV')}`;
    case 'semana': return `Esta Semana`;
    case 'mes': return `Este Mes`;
    case 'año': return `Este Año ${hoy.getFullYear()}`;
    default: return 'Período';
    }
};

if (loading) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
        <p className="text-xl text-gray-600">Cargando dashboard...</p>
        </div>
    </div>
    );
}

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
        <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📊 Dashboard
            </h1>
            <p className="text-xl text-gray-600 font-semibold">{getPeriodoTexto()}</p>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mt-6 md:mt-0">
            {['hoy', 'semana', 'mes', 'año'].map(periodo => (
            <button
                key={periodo}
                onClick={() => setFiltro(periodo)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                filtro === periodo
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/50 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl hover:scale-105'
                }`}
            >
                {periodo === 'hoy' ? '📅 Hoy' : 
                periodo === 'semana' ? '📈 Semana' : 
                periodo === 'mes' ? '📊 Mes' : '📅 Año'}
            </button>
            ))}
        </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Gasto */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border border-white/50">
            <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-2xl">
                <span className="text-2xl">💸</span>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">GASTO</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
            ${stats.gasto.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Inversión en productos</p>
        </div>

        {/* Ventas */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border border-white/50">
            <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-2xl">
                <span className="text-2xl">💰</span>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">VENTAS</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
            ${stats.ventas.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Total ventas realizadas</p>
        </div>

        {/* Utilidad */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border border-white/50">
            <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-2xl">
                <span className="text-2xl">📈</span>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">UTILIDAD</span>
            </div>
            <p className={`text-3xl md:text-4xl font-black mb-1 ${
            stats.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
            ${stats.utilidad.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">{stats.utilidad >= 0 ? 'Ganancia' : 'Pérdida'}</p>
        </div>

        {/* Pedidos Entregados */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 border border-white/50">
            <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
                <span className="text-2xl">✅</span>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">ENTREGADOS</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
            {stats.pedidosEntregados}
            </p>
            <p className="text-sm text-gray-600">Pedidos completados</p>
        </div>
        </div>

        {/* Resumen Detallado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📋 Resumen Financiero</h3>
            <div className="space-y-4 text-center">
            <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-r from-red-50 to-yellow-50 rounded-2xl">
                <div>
                <p className="text-sm text-gray-600">Gasto Total</p>
                <p className="text-2xl font-bold text-red-600">-${stats.gasto.toFixed(2)}</p>
                </div>
                <div>
                <p className="text-sm text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-green-600">+${stats.ventas.toFixed(2)}</p>
                </div>
            </div>
            <div className="p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-4 border-emerald-200">
                <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Utilidad Neta</p>
                <p className={`text-4xl font-black mt-2 ${
                stats.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                ${stats.utilidad.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                {((stats.utilidad / stats.ventas) * 100 || 0).toFixed(1)}% margen
                </p>
            </div>
            </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📦 Productividad</h3>
            <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
                <p className="text-3xl font-black text-blue-600">{stats.pedidosEntregados}</p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Pedidos Entregados</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-2xl">
                <p className="text-3xl font-black text-purple-600">
                {(stats.ventas / (stats.pedidosEntregados || 1)).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Ticket Promedio</p>
            </div>
            </div>
        </div>
        </div>
    </div>
    </div>
);
};

export default Dashboard;

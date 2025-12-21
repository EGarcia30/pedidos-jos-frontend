import { useState, useEffect } from 'react';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Pedidos = () => {
const [pedidos, setPedidos] = useState([]);
const [productos, setProductos] = useState([]);
const [productosLoading, setProductosLoading] = useState(true);
const [loading, setLoading] = useState(true);

const [showDetalleModal, setShowDetalleModal] = useState(false);
const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
const [detallesPedido, setDetallesPedido] = useState([]);
const [detallesLoading, setDetallesLoading] = useState(false);

// Modal states
const [showModal, setShowModal] = useState(false);
const [nuevoPedido, setNuevoPedido] = useState({
    cliente: '',
    direccion: 'Despacho en local',
    estado: 'pendiente',
    total: 0
});
const [itemsPedido, setItemsPedido] = useState([]);

// AGREGAR ESTA FUNCIÓN para obtener detalles
const fetchDetallesPedido = async (pedidoId) => {
    try {
        setDetallesLoading(true);
        setDetallesPedido([]); // Limpia datos anteriores
        const response = await fetch(`${apiUrl}/pedidos/${pedidoId}/detalle`);
        
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error cargando detalles');
        }
        
        const data = await response.json();
        //console.log('Detalles cargados:', data); // DEBUG
        setDetallesPedido(data.data || data);
    } catch (error) {
        console.error('Error detalles:', error);
        alert('Error cargando detalles: ' + error.message);
        setDetallesPedido([]);
    } finally {
        setDetallesLoading(false);
    }
};

// FUNCIÓN para marcar como entregado
const marcarEntregado = async (pedidoId) => {
    try {
        const response = await fetch(`${apiUrl}/pedidos/${pedidoId}/entregado`, {
        method: 'PATCH'
        });
        if (!response.ok) throw new Error('Error actualizando estado');
        setShowDetalleModal(false);
        fetchPedidos(); // Refresca lista
        //alert('¡Pedido marcado como entregado!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

useEffect(() => {
    fetchPedidos();
    fetchProductos();
}, []);

const fetchPedidos = async () => {
    try {
    const response = await fetch(`${apiUrl}/pedidos`);
    if (!response.ok) throw new Error('Error en la API');
    const data = await response.json();
    setPedidos(data.data || data);
    } catch (err) {
    console.error('Error pedidos:', err);
    } finally {
    setLoading(false);
    }
};

const fetchProductos = async () => {
    try {
    setProductosLoading(true);
    const response = await fetch(`${apiUrl}/productos`);
    if (!response.ok) throw new Error('Error en productos');
    const data = await response.json();
    //console.log('Productos cargados:', data); // DEBUG
    setProductos(data.data || data);
    } catch (err) {
    console.error('Error productos:', err);
    } finally {
    setProductosLoading(false);
    }
};

// 1. REEMPLAZA agregarProducto (SIMPLIFICADO)
const agregarProducto = (producto) => {
    console.log('Agregando producto:', producto);

    const existe = itemsPedido.find(item => item.producto_id === producto.id);

    if (existe) {
        setItemsPedido(itemsPedido.map(item =>
        item.producto_id === producto.id
            ? { 
                ...item, 
                cantidad_vendida: item.cantidad_vendida + 1,
                subtotal: (item.cantidad_vendida + 1) * item.precio_venta 
            }
            : item
        ));
    } else {
        const precio = parseFloat(producto.precio_venta) || 0;
        setItemsPedido([...itemsPedido, {
        producto_id: producto.id,
        nombre: producto.nombre || 'Sin nombre',
        precio_venta: precio,
        cantidad_vendida: 1,
        subtotal: precio
        }]);
    }
// ❌ NO LLAMES calcularTotal aquí - useEffect lo hace automáticamente
};

// 2. AGREGAR ESTE useEffect DESPUÉS de los otros useEffect
    useEffect(() => {
        const total = itemsPedido.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        setNuevoPedido(prev => ({ ...prev, total }));
    }, [itemsPedido]); // ✅ Se ejecuta CADA VEZ que itemsPedido cambie

// 3. SIMPLIFICA cambiarCantidad y removerProducto (solo actualizan itemsPedido)
    const cambiarCantidad = (producto_id, cantidad) => {
        if (cantidad < 1) {
            removerProducto(producto_id);
            return;
        }
        setItemsPedido(itemsPedido.map(item => {
        if (item.producto_id === producto_id) {
        const nuevoSubtotal = cantidad * item.precio_venta;
        return { ...item, cantidad_vendida: cantidad, subtotal: nuevoSubtotal };
        }
        return item;
    }));
    // useEffect se encarga del total
    };

const removerProducto = (producto_id) => {
    setItemsPedido(itemsPedido.filter(item => item.producto_id !== producto_id));
    // useEffect se encarga del total
};

const guardarPedido = async () => {
    if (itemsPedido.length === 0) {
        alert('Agrega al menos un producto');
        return;
    }
    if (!nuevoPedido.direccion.trim()) {
        alert('La dirección es obligatoria');
        return;
    }

    try {
        // 1. Crear pedido principals
        const pedidoResponse = await fetch(`${apiUrl}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cliente: nuevoPedido.cliente,
            direccion: nuevoPedido.direccion,
            estado: nuevoPedido.estado,
            total: nuevoPedido.total
        })
        });

        if (!pedidoResponse.ok) {
        const errorData = await pedidoResponse.json();
        throw new Error(errorData.error || 'Error creando pedido');
        }

        const pedidoData = await pedidoResponse.json();
        //console.log('Respuesta pedido:', pedidoData); // DEBUG
        
        // ✅ PRUEBA ESTAS 3 OPCIONES según tu backend:
        const pedidoId = pedidoData.id || 
                        pedidoData.insertId || 
                        pedidoData.data?.id || 
                        pedidoData[0]?.id;

        if (!pedidoId) {
        throw new Error('No se pudo obtener el ID del pedido');
        }

        console.log('ID del pedido:', pedidoId); // DEBUG

        // 2. Crear detalles del pedido
        for (const item of itemsPedido) {
        const detalleResponse = await fetch(`${apiUrl}/pedidos-detalle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            pedido_id: pedidoId,  // ← AQUÍ ES DONDE FALLABA
            producto_id: item.producto_id,
            cantidad_vendida: item.cantidad_vendida,
            precio_venta: item.precio_venta,
            subtotal: item.subtotal
            })
        });

        if (!detalleResponse.ok) {
            console.error('Error detalle:', await detalleResponse.json());
        }
        }

        // Reset
        setShowModal(false);
        setNuevoPedido({ cliente: '', direccion: '', estado: 'pendiente', total: 0 });
        setItemsPedido([]);
        fetchPedidos();
        //alert('¡Pedido creado con detalles!');
        
    } catch (error) {
        console.error('Error completo:', error);
        alert('Error: ' + error.message);
    }
};


if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
    <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Cargando pedidos...</p>
    </div>
    </div>
);

return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 w-full sm:w-auto">
            📋 Gestión de Pedidos
        </h1>
        <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm sm:text-base whitespace-nowrap"
        >
            ➕ Nuevo Pedido
        </button>
    </div>


    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos.map(pedido => (
            <div 
            key={pedido.id} 
            className="bg-white border rounded-xl shadow-md p-6 hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
            onClick={() => {
                setPedidoSeleccionado(pedido);
                fetchDetallesPedido(pedido.id);
                setShowDetalleModal(true);
            }}
            >
            <h3 className="text-xl font-bold mb-3 text-gray-800">Pedido #{pedido.id}</h3>
            <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-semibold">👤 Cliente:</span> {pedido.cliente || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">📍 Dirección:</span> {pedido.direccion}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                ${parseFloat(pedido.total || 0).toFixed(2)}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                pedido.estado === 'entregado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                {pedido.estado?.toUpperCase()}
                </span>
            </div>
            </div>
        ))}
    </div>

    {/* Modal Detalle Pedido */}
    {showDetalleModal && pedidoSeleccionado && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && setShowDetalleModal(false)}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl text-white">
            <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold">Pedido #{pedidoSeleccionado.id}</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                pedidoSeleccionado.estado === 'entregado'
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-yellow-200 bg-opacity-50'
                }`}>
                {pedidoSeleccionado.estado?.toUpperCase()}
                </span>
            </div>
            <button
                onClick={() => setShowDetalleModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-2xl transition"
            >
                ✕
            </button>
            </div>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
            {/* Info General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
            <div>
                <p className="text-sm text-gray-600 mb-1">👤 Cliente</p>
                <p className="font-bold text-gray-900">{pedidoSeleccionado.cliente || 'N/A'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-600 mb-1">📍 Dirección</p>
                <p className="font-bold text-gray-900">{pedidoSeleccionado.direccion}</p>
            </div>
            <div>
                <p className="text-sm text-gray-600 mb-1">💰 Total</p>
                <p className="text-3xl font-bold text-green-600">${parseFloat(pedidoSeleccionado.total).toFixed(2)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-600 mb-1">📅 Fecha</p>
                <p className="font-bold text-gray-900">
                {new Date(pedidoSeleccionado.fecha_creado).toLocaleString('es-SV')}
                </p>
            </div>
            </div>

            {/* Detalles Productos */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    🍔 Productos Vendidos
                    <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {detallesLoading ? 'Cargando...' : `${detallesPedido.length} items`}
                    </span>
                </h3>
            
                {detallesLoading ? (
                    <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="p-6 bg-gray-100 animate-pulse rounded-2xl h-20"></div>
                    ))}
                    </div>
                ) : detallesPedido.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
                    <p>No hay productos en este pedido</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                    {detallesPedido.map((detalle, index) => (
                        <div key={detalle.id || index} className="flex items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex-1">
                            <h4 className="font-bold text-xl text-gray-900">{detalle.nombre || 'Producto'}</h4>
                            <p className="text-sm text-gray-600">
                            Cantidad: <span className="font-semibold">{detalle.cantidad_vendida}</span> x 
                            $<span className="font-semibold">{parseFloat(detalle.precio_venta).toFixed(2)}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                            ID Detalle: {detalle.id} | {new Date(detalle.fecha_creado).toLocaleString('es-SV')}
                            </p>
                        </div>
                        <div className="text-right ml-6">
                            <p className="text-2xl font-bold text-green-600">
                            ${parseFloat(detalle.subtotal).toFixed(2)}
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Botón Entregado */}
            {pedidoSeleccionado.estado !== 'entregado' && (
            <div className="pt-6 border-t flex justify-center">
                <button
                onClick={() => marcarEntregado(pedidoSeleccionado.id)}
                className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all transform"
                >
                ✅ Marcar como Entregado
                </button>
            </div>
            )}
        </div>
        </div>
    </div>
    )}

    {/* Modal Nuevo Pedido */}
    {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-2xl lg:max-w-6xl w-full max-h-[95vh] overflow-hidden mx-2">
            {/* HEADER RESPONSIVE */}
            <div className="p-4 sm:p-6 sm:p-8 border-b bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl sm:rounded-t-3xl text-white">
                <div className="flex items-center justify-between">
                <div className="flex-1 pr-4 sm:pr-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">📝 Nuevo Pedido</h2>
                    <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">Selecciona productos y completa la información</p>
                </div>
                <button
                    onClick={() => setShowModal(false)}
                    className="p-2 sm:p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl sm:rounded-2xl transition-all flex-shrink-0"
                >
                    ✕
                </button>
                </div>
            </div>

            <div className="p-4 sm:p-6 sm:p-8 overflow-y-auto max-h-[70vh]">
                {/* DATOS CLIENTE RESPONSIVE */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center">
                    👤 Cliente (opcional)
                    </label>
                    <input
                    type="text"
                    value={nuevoPedido.cliente}
                    onChange={(e) => setNuevoPedido({ ...nuevoPedido, cliente: e.target.value })}
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    placeholder="Juan Pérez"
                    />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center">
                    📍 Dirección *
                    </label>
                    <input
                    type="text"
                    value={nuevoPedido.direccion}
                    onChange={(e) => setNuevoPedido({ ...nuevoPedido, direccion: e.target.value })}
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                    placeholder="Col. San Benito, Casa #123"
                    />
                </div>
                </div>

                {/* PRODUCTOS RESPONSIVE */}
                <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center flex-wrap gap-2">
                    🍔 Productos Disponibles
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {productos.length} disponibles
                    </span>
                </h3>
                
                {productosLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-24 sm:h-28 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-xl sm:rounded-2xl p-3 sm:p-4"></div>
                    ))}
                    </div>
                ) : productos.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-xl sm:rounded-2xl mx-auto mb-4 animate-pulse"></div>
                    <p className="text-gray-500 text-base sm:text-lg">No hay productos disponibles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {productos.map(producto => {
                        const existe = itemsPedido.find(item => item.producto_id === producto.id);
                        return (
                        <div
                            key={producto.id}
                            className={`group border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all hover:shadow-xl hover:scale-105 h-full ${
                            existe
                                ? 'border-green-400 bg-green-50 shadow-lg'
                                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                            onClick={() => agregarProducto(producto)}
                        >
                            <div className="space-y-2">
                            <h4 className="font-bold text-base sm:text-lg text-gray-800 group-hover:text-blue-700 line-clamp-2">
                                {producto.nombre}
                            </h4>
                            <p className="text-xl sm:text-2xl font-black text-green-600">
                                ${parseFloat(producto.precio_venta || 0).toFixed(2)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                                📦 Stock: {parseInt(producto.cantidad_disponible || 0)}
                            </p>
                            {existe && (
                                <div className="flex items-center mt-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-xs sm:text-sm font-semibold text-green-700">
                                    Agregado (x{existe.cantidad_vendida})
                                </span>
                                </div>
                            )}
                            </div>
                        </div>
                        );
                    })}
                    </div>
                )}
                </div>

                {/* ITEMS SELECCIONADOS RESPONSIVE */}
                {itemsPedido.length > 0 && (
                <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                    🛒 Resumen del Pedido ({itemsPedido.length} items)
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                    {itemsPedido.map(item => (
                        <div key={item.producto_id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-blue-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                            <h4 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">{item.nombre}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                Unit: ${item.precio_venta.toFixed(2)} x {item.cantidad_vendida}
                            </p>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
                            <button
                                onClick={() => cambiarCantidad(item.producto_id, item.cantidad_vendida - 1)}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 hover:bg-red-200 text-red-600 font-bold text-lg sm:text-xl rounded-xl sm:rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center flex-shrink-0"
                            >
                                −
                            </button>
                            <span className="w-14 sm:w-16 text-center text-xl sm:text-2xl font-black bg-white px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-xl shadow-md flex-shrink-0 min-w-[3rem]">
                                {item.cantidad_vendida}
                            </span>
                            <button
                                onClick={() => cambiarCantidad(item.producto_id, item.cantidad_vendida + 1)}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 hover:bg-green-200 text-green-600 font-bold text-lg sm:text-xl rounded-xl sm:rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center flex-shrink-0"
                            >
                                +
                            </button>
                            <button
                                onClick={() => removerProducto(item.producto_id)}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl sm:rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center flex-shrink-0 ml-1 sm:ml-4"
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                            </div>
                            <div className="text-right sm:ml-0">
                            <p className="text-xl sm:text-2xl font-bold text-green-600">
                                ${item.subtotal.toFixed(2)}
                            </p>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* TOTAL FINAL RESPONSIVE */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-4 border-green-100 shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 gap-4">
                    <div className="flex flex-col items-start text-center sm:text-left">
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-600 tracking-wide leading-tight">
                        ${nuevoPedido.total.toFixed(2)}
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 mt-1 sm:mt-2">
                        {itemsPedido.length} {itemsPedido.length === 1 ? 'producto' : 'productos'}
                    </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                    <button
                        onClick={() => {
                        setShowModal(false);
                        setTimeout(() => {
                            setNuevoPedido({ cliente: '', direccion: '', estado: 'pendiente', total: 0 });
                            setItemsPedido([]);
                        }, 200);
                        }}
                        className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-50 hover:shadow-md transition-all shadow-sm text-sm sm:text-lg flex-1 sm:flex-none"
                    >
                        ❌ Cancelar
                    </button>
                    <button
                        onClick={guardarPedido}
                        disabled={itemsPedido.length === 0 || !nuevoPedido.direccion.trim()}
                        className="px-6 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex-1 sm:flex-none"
                    >
                        ✅ Crear Pedido
                    </button>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        )}
    </div>
);
};

export default Pedidos;

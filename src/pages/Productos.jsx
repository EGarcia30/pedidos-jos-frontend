import { useState, useEffect } from 'react';

const Productos = () => {
const [productos, setProductos] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    // Fetch nativo a tu backend
    fetch('http://localhost:3000/api/productos')
    .then(response => {
        if (!response.ok) throw new Error('Error en la API');
        return response.json();
    })
    .then(data => {
        setProductos(data.data || data); // Ajusta según tu respuesta
        setLoading(false);
    })
    .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
    });
}, []);

if (loading) return <div className="text-center p-8 text-xl">Cargando productos...</div>;
if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

return (
    <div className="container mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">Menú de Productos</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map(producto => (
        <div key={producto.id} className="bg-white border rounded-lg shadow-md p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">{producto.nombre}</h3>
            <p className="text-gray-600 mb-4">{producto.descripcion || 'Delicioso producto salvadoreño'}</p>
            <div className="space-y-2">
            <p><span className="font-bold">Stock:</span> {producto.cantidad_disponible}</p>
            <p className="text-2xl font-bold text-green-600">${producto.precio_venta}</p>
            </div>
            <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
            Agregar al Pedido
            </button>
        </div>
        ))}
    </div>
    </div>
);
};

export default Productos;

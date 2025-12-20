Esta es la aplicación frontend para el sistema de pedidos de comida rápida, construida con React y Vite. Consume la API Express en /api/productos y /api/pedidos para mostrar productos y gestionar órdenes.​​

Características
Lista de productos salvadoreños (yuca frita, papas, costillas) con descripciones.

Páginas para Productos y Pedidos con Tailwind CSS.

Consumo de API backend vía fetch/axios.

Responsive design para móviles y desktop.

Tecnologías
Frontend: React 18, Vite, Tailwind CSS 3

API Client: Fetch nativo (o axios)

Estilos: Tailwind CSS

Deploy: Vercel

Estructura del Proyecto
text
pedidos-frontend/
├── public/
├── src/
│   ├── components/     # Productos.jsx, Pedidos.jsx
│   ├── pages/          # Productos.jsx
│   ├── App.jsx
│   └── main.jsx
├── dist/               # Build de producción
├── package.json
└── vite.config.js
Instalación Local
Clona el repositorio: git clone <tu-repo-frontend>

Entra a la carpeta: cd pedidos-frontend

Instala dependencias: npm install

Inicia desarrollo: npm run dev

Abre http://localhost:5173

Asegúrate de que el backend Express corra en http://localhost:3000.​

Uso en Desarrollo
Productos: Muestra lista desde /api/productos

Pedidos: Gestiona órdenes desde /api/pedidos

Backend requerido: npm run dev en pedidos-backend

Build para Producción
bash
npm run build
Genera carpeta dist/ lista para Vercel o Netlify.

Despliegue en Vercel
Push a GitHub.

En vercel.com: New Project → Importa repo.

Configuración automática: Framework Preset = Vite, Build = npm run build, Output = dist.

Deploy en segundos: https://pedidos-frontend.vercel.app

Cambia URL de API en código: const API_URL = import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com'​

Configuración de Variables de Entorno
Crea .env en raíz:

text
VITE_API_URL=https://tu-api.onrender.com
Solución de Problemas
CORS error: Agrega CORS en backend Express.

Tailwind no carga: Verifica tailwind.config.js y @tailwind en CSS.

API no responde: Verifica backend en Render y variables Supabase.

Conexión con Backend
El frontend consume:

GET /api/productos → Lista productos

GET /api/pedidos → Lista pedidos

¡Listo para producción! 🚀 Despliega frontend en Vercel y backend en Render.​

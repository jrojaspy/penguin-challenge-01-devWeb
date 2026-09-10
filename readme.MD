# Penguin Store — Reto 01

Aplicación desarrollada como parte del nivel final del curso de programación.

El proyecto implementa una tienda online y un panel administrativo utilizando:

- Node.js
- Express
- MongoDB
- Mongoose
- Pug
- Renderizado del lado servidor
- Sesiones
- Cookies HTTP-only
- bcrypt

La tienda pública no utiliza JavaScript en el navegador.

---

# 1. Objetivo

El sistema permite:

## Panel administrativo

- iniciar sesión;
- gestionar productos;
- crear productos;
- editar productos;
- eliminar productos;
- visualizar pedidos.

## Tienda pública

- visualizar productos activos;
- consultar el detalle de un producto;
- crear pedidos;
- validar disponibilidad de stock;
- mostrar confirmación del pedido.

---

# 2. Arquitectura

El proyecto utiliza dos servidores Express independientes.

```text
                    ┌────────────────────┐
                    │      MongoDB       │
                    └─────────┬──────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
        ┌────────────────┐       ┌────────────────┐
        │ Admin Server   │       │ Store Server   │
        │ localhost:3000 │       │ localhost:3001 │
        └───────┬────────┘       └───────┬────────┘
                │                        │
                ▼                        ▼
          Panel Admin               Tienda pública
```

Ambos servidores comparten los modelos de dominio:

```text
shared/models/
├── Product.js
└── Order.js
```

---

# 3. Estructura del proyecto

```text
penguin-reto-01-store/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── requireAuth.js
│   │   └── sessionUser.js
│   ├── models/
│   │   └── Admin.js
│   ├── public/css/admin.css
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── scripts/seedAdmin.js
│   ├── views/
│   │   ├── admin/
│   │   └── auth/
│   └── app.js
├── frontend/
│   ├── controllers/
│   │   ├── orderController.js
│   │   └── storeController.js
│   ├── public/css/store.css
│   ├── routes/
│   │   ├── orderRoutes.js
│   │   └── storeRoutes.js
│   ├── views/
│   │   ├── layout.pug
│   │   └── store/
│   └── app.js
├── shared/
│   ├── config/database.js
│   └── models/
│       ├── Order.js
│       └── Product.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# 4. Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js
- npm
- MongoDB

Versiones recomendadas:

```text
Node.js 20+
MongoDB 7+
```

---

# 5. Instalación

```bash
git clone https://github.com/TU_USUARIO/penguin-reto-01-store.git
cd penguin-reto-01-store
npm install
```

---

# 6. Configuración

Crear el archivo `.env` a partir de `.env.example`.

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Ejemplo:

```env
NODE_ENV=development
ADMIN_PORT=3000
STORE_PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/penguin_store
SESSION_SECRET=replace_with_a_long_random_secret
ADMIN_USERNAME=paula
ADMIN_PASSWORD=replace_with_a_secure_password
```

El archivo `.env` no debe subirse al repositorio.

---

# 7. Base de datos

La aplicación utiliza `penguin_store` como base de datos por defecto. MongoDB creará la base y sus colecciones cuando se inserten los primeros documentos.

---

# 8. Crear administrador

```bash
npm run seed:admin
```

El script toma `ADMIN_USERNAME` y `ADMIN_PASSWORD` desde `.env`. La contraseña se almacena mediante un hash bcrypt y el script evita duplicar el administrador si ya existe.

---

# 9. Ejecutar el panel administrativo

Modo desarrollo:

```bash
npm run dev:admin
```

Modo normal:

```bash
npm run start:admin
```

Abrir:

```text
http://localhost:3000
```

---

# 10. Ejecutar la tienda pública

En otra terminal:

```bash
npm run dev:store
```

o:

```bash
npm run start:store
```

Abrir:

```text
http://localhost:3001
```

---

# 11. Flujo principal

## Administrador

```text
/login
  ↓
autenticación
  ↓
/admin
  ↓
productos
  ↓
crear / editar / eliminar
  ↓
pedidos
```

## Cliente

```text
/
↓
catálogo
↓
detalle del producto
↓
realizar pedido
↓
validación de stock
↓
confirmación
```

---

# 12. Rutas principales

## Panel administrativo

```text
GET  /login
POST /login
POST /logout
GET  /admin
GET  /admin/products
GET  /admin/products/new
POST /admin/products
GET  /admin/products/:id/edit
POST /admin/products/:id/edit
POST /admin/products/:id/delete
GET  /admin/orders
```

## Tienda pública

```text
GET  /
GET  /products/:id
GET  /orders/new?product=:id
POST /orders
GET  /orders/:id/confirmation
```

---

# 13. Modelo Product

Campos principales:

```text
name
description
price
stock
active
createdAt
updatedAt
```

---

# 14. Modelo Order

Campos principales:

```text
customerName
address
items[]
total
status
createdAt
updatedAt
```

Cada item conserva una copia histórica de:

```text
productName
unitPrice
quantity
subtotal
```

Esto evita que una modificación futura del producto cambie el pedido histórico.

---

# 15. Seguridad

El panel administrativo utiliza:

- bcrypt para hashing de contraseñas;
- `express-session`;
- cookie HTTP-only;
- `sameSite=lax`;
- middleware de autorización;
- regeneración de sesión después del login.

Las rutas administrativas están protegidas mediante `requireAuth`.

---

# 16. Gestión de stock

La cantidad de un pedido se valida en el servidor. El navegador no es considerado una fuente confiable para precio, total, stock o disponibilidad.

El precio se toma directamente desde MongoDB y el stock se decrementa mediante una actualización condicionada.

---

# 17. Renderizado del lado servidor

Todas las vistas utilizan Pug. El navegador recibe HTML renderizado desde Express.

No se utiliza:

- React;
- AJAX;
- fetch;
- JavaScript en el navegador.

```text
Browser
  ↓
GET /
  ↓
Express
  ↓
MongoDB
  ↓
Pug
  ↓
HTML
```

---

# 18. Diseño responsive y accesibilidad

Se implementaron:

- layouts adaptables a escritorio, tablet y móvil;
- tablas con scroll horizontal en pantallas pequeñas;
- formularios responsive;
- labels asociados a inputs;
- HTML semántico;
- navegación por teclado;
- foco visible;
- `scope` en encabezados de tablas;
- `role="alert"` para errores.

---

# 19. Pruebas manuales

## Autenticación

- login válido debe redirigir a `/admin`;
- login inválido debe mostrar `Credenciales inválidas.`;
- `/admin/products` sin sesión debe redirigir a `/login`;
- logout debe destruir la sesión.

## Productos

- crear producto válido;
- editar precio y stock;
- eliminar producto;
- rechazar nombre vacío, precio negativo o stock negativo.

## Tienda

- mostrar solo productos activos;
- ocultar productos desactivados;
- mostrar detalle de producto;
- impedir pedidos de productos inexistentes o inactivos.

## Pedidos

Ejemplo:

```text
stock inicial = 10
precio = 50000
cantidad = 2
```

Resultado esperado:

```text
total = 100000
stock restante = 8
```

Si el stock es 2 y se solicita cantidad 5, el servidor debe rechazar la operación y el stock nunca debe quedar negativo.

---

# 20. Persistencia histórica

Si un pedido se realiza con un precio de `85000` y luego el producto cambia a `100000`, el pedido anterior debe continuar mostrando `85000`.

---

# 21. Post/Redirect/Get

Después de crear un pedido se utiliza:

```text
POST
↓
redirect
↓
GET confirmation
```

Esto evita duplicar pedidos al refrescar la página de confirmación.

---

# 22. Limitaciones del MVP

Esta versión se concentra exclusivamente en los requisitos obligatorios.

No incluye:

- imágenes de productos;
- carrito con múltiples productos;
- registro de clientes;
- múltiples administradores;
- edición de estado de pedidos;
- filtros administrativos;
- dashboard estadístico;
- email;
- pagos;
- API externa.

---

# 23. Almacenamiento de sesiones

Durante desarrollo se utiliza el almacenamiento en memoria proporcionado por `express-session`.

Para producción sería recomendable utilizar un almacén persistente como MongoDB o Redis.

---

# 24. Requisitos del reto

## Panel de administración

| Requisito | Estado |
|---|---|
| CRUD de productos | ✅ |
| Visualización de pedidos | ✅ |
| Login | ✅ |
| Contraseñas hasheadas | ✅ |
| Sesiones/cookies HTTP-only | ✅ |
| Renderizado servidor | ✅ |

## Tienda online

| Requisito | Estado |
|---|---|
| Mostrar productos | ✅ |
| Crear pedidos | ✅ |
| Dirección del cliente | ✅ |
| Renderizado servidor | ✅ |
| Sin JavaScript frontend | ✅ |

## Entrega

| Requisito | Estado |
|---|---|
| `/backend` | ✅ |
| `/frontend` | ✅ |
| README | ✅ |
| HTML estructurado | ✅ |
| Buenas prácticas básicas | ✅ |

---

# 25. Scripts disponibles

```bash
npm run start:admin
npm run start:store
npm run dev:admin
npm run dev:store
npm run seed:admin
```

---

# 26. Autor

Proyecto desarrollado como solución académica del Reto 01.

---

# 27. Licencia

MIT

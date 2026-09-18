# Penguin Store — Reto 01

Aplicación cliente-servidor desarrollada con Node.js, Express, MongoDB, Mongoose y Pug.

El proyecto implementa una tienda pública y un panel administrativo independientes, conectados a la misma base de datos MongoDB.

La arquitectura es **SSR / MVC ligera**. No es una API JSON independiente: se utilizan formularios HTML tradicionales, renderizado del lado servidor y semántica HTTP coherente para las operaciones de escritura.

La tienda pública no utiliza JavaScript en el navegador.

---

## 1. Funcionalidades

### Panel administrativo

- inicio de sesión de administrador;
- sesiones con cookie HTTP-only;
- contraseña almacenada con bcrypt;
- CRUD de productos;
- carga opcional de imagen de producto;
- edición y reemplazo de imágenes;
- eliminación del archivo de imagen asociado;
- gestión de stock;
- activación / desactivación de productos;
- listado de pedidos;
- actualización del estado de pedidos;
- interfaz responsive y accesible.

### Tienda pública

- catálogo de productos activos;
- imágenes de productos;
- fallback visual cuando un producto no tiene imagen;
- detalle del producto;
- creación de pedidos;
- validación de stock en el servidor;
- cálculo de total en el servidor;
- descuento de stock;
- confirmación mediante patrón Post/Redirect/Get;
- diseño responsive;
- cero JavaScript de aplicación en el navegador.

---

## 2. Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Pug
- express-session
- bcrypt
- method-override
- multer
- dotenv
- nodemon

---

## 3. Arquitectura

```text
                           MongoDB
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
      Admin Server                         Store Server
      localhost:3000                       localhost:3001
             │                                 │
             │                                 │
      Login / sesiones                    Catálogo SSR
      CRUD productos                      Detalle producto
      Upload imágenes                     Creación pedidos
      Estado pedidos                      Validación stock
             │                                 │
             └──────────────┬──────────────────┘
                            │
                            ▼
                       shared/
                 modelos y uploads
```

Ambos servidores comparten:

```text
shared/
├── config/
│   └── database.js
├── models/
│   ├── Product.js
│   └── Order.js
└── uploads/
    └── products/
```

---

## 4. Estructura principal

```text
penguin-challenge-01-devWeb/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── requireAuth.js
│   │   ├── sessionUser.js
│   │   └── uploadProductImage.js
│   ├── models/
│   │   └── Admin.js
│   ├── public/
│   │   └── css/
│   │       └── admin.css
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── views/
│   │   ├── admin/
│   │   ├── auth/
│   │   └── includes/
│   └── app.js
├── frontend/
│   ├── controllers/
│   │   ├── orderController.js
│   │   └── storeController.js
│   ├── public/
│   │   └── css/
│   │       └── store.css
│   ├── routes/
│   │   ├── orderRoutes.js
│   │   └── storeRoutes.js
│   ├── views/
│   │   └── store/
│   └── app.js
├── shared/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Order.js
│   │   └── Product.js
│   └── uploads/
│       └── products/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 5. Requisitos previos

Se recomienda:

```text
Node.js 20+
MongoDB 7+
npm
```

---

## 6. Instalación

```bash
git clone https://github.com/jrojaspy/penguin-challenge-01-devWeb.git
cd penguin-challenge-01-devWeb
npm install
```

---

## 7. Configuración

Crear `.env` a partir de `.env.example`.

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

`.env` no debe subirse al repositorio.

---

## 8. Crear administrador

```bash
npm run seed:admin
```

El script toma `ADMIN_USERNAME` y `ADMIN_PASSWORD` desde `.env`.

La contraseña se almacena mediante bcrypt.

---

## 9. Ejecutar el panel administrativo

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

## 10. Ejecutar la tienda pública

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

## 11. Rutas del panel administrativo

```text
GET    /login
POST   /login
POST   /logout

GET    /admin

GET    /admin/products
GET    /admin/products/new
POST   /admin/products
GET    /admin/products/:id/edit
PATCH  /admin/products/:id
DELETE /admin/products/:id

GET    /admin/orders
PATCH  /admin/orders/:id/status
```

Los formularios HTML usan `method-override` para expresar `PATCH` y `DELETE`.

Esto mantiene la aplicación SSR y al mismo tiempo utiliza métodos HTTP coherentes.

---

## 12. Rutas de la tienda pública

```text
GET  /
GET  /products/:id

GET  /orders/new?product=:id
POST /orders
GET  /orders/:id/confirmation
```

---

## 13. Modelo Product

Campos principales:

```text
name
description
price
stock
active
image
createdAt
updatedAt
```

`image` es opcional.

Ejemplo:

```text
/uploads/products/1723456789-uuid.jpg
```

Los productos creados antes de incorporar imágenes continúan funcionando.

---

## 14. Gestión de imágenes

Las imágenes se guardan en:

```text
shared/uploads/products/
```

Formatos aceptados:

```text
JPG
PNG
WebP
```

Tamaño máximo:

```text
5 MB
```

El servidor:

- valida el MIME type;
- genera nombres únicos;
- elimina uploads huérfanos si falla la operación;
- conserva la imagen anterior si no se sube una nueva;
- elimina la imagen anterior después de un reemplazo exitoso;
- elimina el archivo cuando se elimina el producto.

Las imágenes se sirven mediante:

```text
/uploads/products/<archivo>
```

tanto desde Admin como desde Store.

---

## 15. Modelo Order

El pedido conserva datos históricos del producto para que un cambio posterior en catálogo no modifique pedidos antiguos.

Campos principales utilizados por la aplicación:

```text
customerName
address
product / items
productName
unitPrice
quantity
total
status
createdAt
updatedAt
```

La aplicación tolera registros históricos del formato anterior.

---

## 16. Estados de pedido

Estados permitidos:

```text
pending
completed
cancelled
```

Presentación:

```text
Pendiente
Completado
Cancelado
```

El administrador puede cambiar el estado mediante:

```text
PATCH /admin/orders/:id/status
```

El servidor valida el valor recibido mediante una whitelist.

---

## 17. Seguridad

El panel administrativo implementa:

- bcrypt;
- `express-session`;
- cookie `HttpOnly`;
- `sameSite=lax`;
- `secure` en producción;
- regeneración de sesión después del login;
- middleware `requireAuth`;
- cierre de sesión con destrucción de sesión;
- validación del lado servidor;
- ObjectId validado antes de consultas sensibles.

Las rutas administrativas están protegidas.

---

## 18. Gestión de stock

El navegador no es fuente de confianza para:

- precio;
- total;
- stock;
- disponibilidad.

Al crear un pedido, el servidor:

```text
1. recibe productId y quantity;
2. consulta el producto;
3. comprueba active=true;
4. comprueba stock >= quantity;
5. descuenta stock de forma condicionada;
6. calcula total desde el precio almacenado;
7. crea el pedido;
8. redirige a confirmación.
```

La actualización condicionada reduce el riesgo de overselling.

---

## 19. Post/Redirect/Get

Después de crear un pedido:

```text
POST /orders
      ↓
redirect
      ↓
GET /orders/:id/confirmation
```

Esto evita duplicar el pedido al refrescar la página de confirmación.

---

## 20. Renderizado del lado servidor

La interfaz pública y administrativa utiliza Pug.

```text
Browser
   ↓
HTTP request
   ↓
Express
   ↓
Controller
   ↓
Mongoose / MongoDB
   ↓
Pug
   ↓
HTML
```

La aplicación no usa en la tienda:

```text
React
AJAX
fetch()
JavaScript cliente
```

---

## 21. Diseño y accesibilidad

Se implementaron:

- diseño responsive;
- layout desktop real en login;
- branding unificado Admin / Store;
- encabezado administrativo compartido;
- tarjetas responsive;
- tablas con scroll horizontal;
- foco visible;
- labels asociados;
- `scope="col"`;
- `aria-current`;
- `aria-label`;
- `role="alert"`;
- texto alternativo en imágenes;
- controles táctiles de tamaño adecuado;
- estados visuales diferenciados.

Breakpoints verificados:

```text
1440 px
1366 px
1024 px
768 px
390 px
```

---

## 22. Pruebas manuales

### Autenticación

- login válido redirige a `/admin`;
- login inválido muestra error;
- acceso sin sesión a `/admin/products` redirige a login;
- logout destruye sesión.

### Productos

- crear producto sin imagen;
- crear producto con JPG;
- crear producto con PNG;
- crear producto con WebP;
- rechazar imagen > 5 MB;
- rechazar formato no permitido;
- editar producto sin reemplazar imagen;
- editar producto reemplazando imagen;
- eliminar producto e imagen asociada;
- rechazar nombre vacío;
- rechazar precio negativo;
- rechazar stock negativo.

### Tienda

- mostrar únicamente productos activos;
- mostrar imagen de producto;
- mostrar fallback sin imagen;
- mostrar detalle;
- bloquear compra si stock es 0;
- mantener diseño responsive.

### Pedidos

Ejemplo:

```text
stock inicial = 10
precio = 50.000
cantidad = 2
```

Resultado esperado:

```text
total = 100.000
stock restante = 8
```

También verificar:

- stock insuficiente;
- producto inexistente;
- producto inactivo;
- estado `pending`;
- cambio a `completed`;
- cambio a `cancelled`;
- rechazo de estado inválido.

---

## 23. Verificación de ausencia de JavaScript cliente

```bash
grep -R "<script" frontend/views backend/views
```

También:

```bash
find frontend/public -type f
```

La tienda pública debe contener únicamente los assets necesarios, sin scripts de aplicación del lado cliente.

---

## 24. Decisiones técnicas

### Dos servidores Express

Se separa claramente:

```text
Admin
Store
```

pero ambos comparten dominio y MongoDB.

### Modelos compartidos

`Product` y `Order` viven en `shared/models/` porque ambos servidores necesitan trabajar con las mismas entidades.

### SSR en lugar de SPA

El requisito se resuelve con HTML generado en servidor y formularios tradicionales.

Esto reduce complejidad innecesaria y respeta la restricción de no utilizar JavaScript de navegador.

### RESTful HTTP semantics, no API-only

La aplicación sigue siendo SSR/MVC.

Se usan:

```text
GET
POST
PATCH
DELETE
```

según la intención de la operación, sin convertir el sistema en una API JSON independiente.

### Persistencia histórica en pedidos

Nombre, precio y cantidad del producto se conservan dentro del pedido para evitar que cambios posteriores del catálogo alteren el historial.

---

## 25. Alcance actual

Incluido:

```text
✓ autenticación admin
✓ CRUD productos
✓ imágenes
✓ stock
✓ catálogo público
✓ detalle de producto
✓ pedidos
✓ validación de stock
✓ listado admin de pedidos
✓ cambio de estado de pedidos
✓ responsive
✓ accesibilidad básica
✓ SSR
```

Fuera del alcance:

```text
- pagos reales
- carrito multiproducto completo
- registro de clientes
- recuperación de contraseña
- email transaccional
- pasarela de pagos
- dashboard estadístico avanzado
- API pública externa
```

---

## 26. Checklist de entrega

Antes de presentar:

```text
[ ] MongoDB inicia correctamente
[ ] npm install desde clon limpio
[ ] seed de admin funciona
[ ] login válido
[ ] login inválido
[ ] rutas admin protegidas
[ ] CRUD producto completo
[ ] imágenes JPG/PNG/WebP
[ ] reemplazo de imagen
[ ] eliminación de imagen
[ ] catálogo SSR
[ ] producto sin imagen usa fallback
[ ] stock nunca queda negativo
[ ] pedido calcula total en servidor
[ ] Post/Redirect/Get funciona
[ ] admin lista pedidos
[ ] admin cambia estado
[ ] estado inválido es rechazado
[ ] login desktop correcto
[ ] header Admin uniforme
[ ] responsive 390/768/1366/1440
[ ] navegación por teclado
[ ] no existe JavaScript cliente
[ ] .env no está versionado
[ ] working tree limpio
[ ] git push actualizado
```

---

## 27. Comandos de cierre

```bash
git status
git diff
git log --oneline --decorate
git push
```

El estado esperado antes de entregar es:

```text
nothing to commit, working tree clean
```

---

## 28. Autor

Proyecto desarrollado como parte de los retos finales del curso Penguin Academy.

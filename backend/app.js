const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config();

const connectDatabase = require('../shared/config/database');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const requireAuth = require('./middleware/requireAuth');
const sessionUser = require('./middleware/sessionUser');

const app = express();
const PORT = process.env.ADMIN_PORT || 3000;

const productUploadsDirectory = path.join(
  __dirname,
  '..',
  'shared',
  'uploads',
  'products'
);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/uploads/products',
  express.static(productUploadsDirectory, {
    fallthrough: true,
    index: false,
    dotfiles: 'deny'
  })
);

app.use(
  session({
    name: 'penguin.sid',
    secret: process.env.SESSION_SECRET || 'development-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(sessionUser);

app.use('/', authRoutes);

app.get('/admin', requireAuth, (req, res) => {
  res.render('admin/index', {
    title: 'Panel de Administración'
  });
});

app.use('/admin/products', requireAuth, productRoutes);
app.use('/admin/orders', requireAuth, orderRoutes);

app.use((req, res) => {
  res.status(404).render('admin/error', {
    title: 'Página no encontrada',
    message: 'La página solicitada no existe.'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).render('admin/error', {
    title: error.status === 400 ? 'Solicitud inválida' : 'Error',
    message:
      error.publicMessage ||
      'Ocurrió un error inesperado.'
  });
});

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
  });
}

startServer();

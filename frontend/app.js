const express = require('express');
const path = require('path');
require('dotenv').config();

const connectDatabase = require('../shared/config/database');
const storeRoutes = require('./routes/storeRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.STORE_PORT || 3001;

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
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  '/uploads/products',
  express.static(productUploadsDirectory, {
    fallthrough: true,
    index: false,
    dotfiles: 'deny'
  })
);

app.use('/', storeRoutes);
app.use('/', orderRoutes);

app.use((req, res) => {
  res.status(404).render('store/error', {
    title: 'Página no encontrada',
    message: 'La página solicitada no existe.'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).render('store/error', {
    title: 'Error',
    message: 'Ocurrió un error inesperado.'
  });
});

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Store server running on http://localhost:${PORT}`);
  });
}

startServer();

require('dotenv').config();

const path = require('path');

const express = require('express');
const session = require('express-session');

const connectDatabase = require('../shared/config/database');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const requireAuth = require('./middleware/requireAuth');
const sessionUser = require('./middleware/sessionUser');

const app = express();

const PORT = process.env.ADMIN_PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    name: 'penguin.sid',

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(sessionUser);

app.use(authRoutes);

app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/admin');
  }

  res.redirect('/login');
});

app.get('/admin', requireAuth, (req, res) => {
  res.render('admin/index', {
    title: 'Penguin Store Admin'
  });
});

app.use(
  '/admin/products',
  requireAuth,
  productRoutes
);

app.use(
  '/admin/orders',
  requireAuth,
  orderRoutes
);

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `Admin server running on http://localhost:${PORT}`
    );
  });
}

startServer();
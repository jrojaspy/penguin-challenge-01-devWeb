require('dotenv').config();

const path = require('path');
const express = require('express');

const connectDatabase = require('../shared/config/database');

const storeRoutes = require('./routes/storeRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

const PORT = process.env.STORE_PORT || 3001;

app.set('view engine', 'pug');

app.set(
  'views',
  path.join(__dirname, 'views')
);

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

app.use(storeRoutes);
app.use(orderRoutes);

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `Store server running on http://localhost:${PORT}`
    );
  });
}

startServer();
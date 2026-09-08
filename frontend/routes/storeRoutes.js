const express = require('express');

const {
  showCatalog,
  showProductDetail
} = require('../controllers/storeController');

const router = express.Router();

router.get('/', showCatalog);

router.get('/products/:id', showProductDetail);

module.exports = router;
const express = require('express');

const {
  listProducts
} = require('../controllers/productController');

const router = express.Router();

router.get('/', listProducts);

module.exports = router;
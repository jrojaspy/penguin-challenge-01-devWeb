const express = require('express');

const {
  listOrders
} = require('../controllers/orderController');

const router = express.Router();

router.get('/', listOrders);

module.exports = router;
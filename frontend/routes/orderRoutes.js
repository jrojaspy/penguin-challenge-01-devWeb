const express = require('express');

const {
  showOrderForm,
  createOrder,
  showOrderConfirmation
} = require('../controllers/orderController');

const router = express.Router();

router.get('/orders/new', showOrderForm);

router.post('/orders', createOrder);

router.get(
  '/orders/:id/confirmation',
  showOrderConfirmation
);

module.exports = router;
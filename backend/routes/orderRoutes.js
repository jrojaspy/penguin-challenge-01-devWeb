const express = require('express');
const {
  listOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

router.get('/', listOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;

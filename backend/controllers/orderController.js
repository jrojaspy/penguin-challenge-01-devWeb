const Order = require('../../shared/models/Order');

async function listOrders(req, res) {
  try {
    const orders = await Order.find()
      .sort({
        createdAt: -1
      });

    res.render('admin/orders/index', {
      title: 'Pedidos',
      orders
    });
  } catch (error) {
    console.error('Error loading orders:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudieron cargar los pedidos.'
    });
  }
}

module.exports = {
  listOrders
};
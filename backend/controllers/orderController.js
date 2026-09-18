const mongoose = require('mongoose');
const Order = require('../../shared/models/Order');

const ALLOWED_STATUSES = ['pending', 'completed', 'cancelled'];

const STATUS_LABELS = {
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

async function listOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.render('admin/orders/index', {
      title: 'Pedidos',
      orders,
      allowedStatuses: ALLOWED_STATUSES,
      statusLabels: STATUS_LABELS,
      error: null
    });
  } catch (error) {
    console.error('Error listing orders:', error);

    return res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudieron cargar los pedidos.'
    });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('admin/error', {
      title: 'Pedido no encontrado',
      message: 'El pedido solicitado no existe.'
    });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });

      return res.status(400).render('admin/orders/index', {
        title: 'Pedidos',
        orders,
        allowedStatuses: ALLOWED_STATUSES,
        statusLabels: STATUS_LABELS,
        error: 'El estado seleccionado no es válido.'
      });
    } catch (error) {
      console.error('Error reloading orders after invalid status:', error);

      return res.status(500).render('admin/error', {
        title: 'Error',
        message: 'No se pudo procesar el cambio de estado.'
      });
    }
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).render('admin/error', {
        title: 'Pedido no encontrado',
        message: 'El pedido solicitado no existe.'
      });
    }

    order.status = status;
    await order.save();

    return res.redirect('/admin/orders');
  } catch (error) {
    console.error('Error updating order status:', error);

    return res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudo actualizar el estado del pedido.'
    });
  }
}

module.exports = {
  listOrders,
  updateOrderStatus
};

const mongoose = require('mongoose');

const Product = require('../../shared/models/Product');
const Order = require('../../shared/models/Order');

async function showOrderForm(req, res) {
  try {
    const { product } = req.query;

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(404).render('store/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    const selectedProduct = await Product.findOne({
      _id: product,
      active: true
    });

    if (!selectedProduct) {
      return res.status(404).render('store/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    if (selectedProduct.stock <= 0) {
      return res.status(400).render('store/error', {
        title: 'Producto sin stock',
        message: 'Este producto no se encuentra disponible actualmente.'
      });
    }

    res.render('store/order-form', {
      title: 'Realizar pedido',
      product: selectedProduct,
      errors: [],
      formData: {
        customerName: '',
        address: '',
        quantity: 1
      }
    });
  } catch (error) {
    console.error('Error loading order form:', error);

    res.status(500).render('store/error', {
      title: 'Error',
      message: 'No se pudo cargar el formulario de pedido.'
    });
  }
}

async function createOrder(req, res) {
  try {
    const {
      productId,
      customerName,
      address,
      quantity
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).render('store/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    const product = await Product.findOne({
      _id: productId,
      active: true
    });

    if (!product) {
      return res.status(404).render('store/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    const errors = [];

    const parsedQuantity = Number(quantity);

    if (!customerName || !customerName.trim()) {
      errors.push('El nombre es obligatorio.');
    }

    if (!address || !address.trim()) {
      errors.push('La dirección es obligatoria.');
    }

    if (
      quantity === '' ||
      Number.isNaN(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      errors.push(
        'La cantidad debe ser un número entero mayor que cero.'
      );
    }

    if (
      Number.isInteger(parsedQuantity) &&
      parsedQuantity > product.stock
    ) {
      errors.push(
        `Stock insuficiente. Actualmente hay ${product.stock} unidad(es) disponible(s).`
      );
    }

    const formData = {
      customerName: customerName || '',
      address: address || '',
      quantity: quantity || 1
    };

    if (errors.length > 0) {
      return res.status(400).render('store/order-form', {
        title: 'Realizar pedido',
        product,
        errors,
        formData
      });
    }

    const reservedProduct =
      await Product.findOneAndUpdate(
        {
          _id: productId,
          active: true,
          stock: {
            $gte: parsedQuantity
          }
        },
        {
          $inc: {
            stock: -parsedQuantity
          }
        },
        {
          new: true
        }
      );

    if (!reservedProduct) {
      const refreshedProduct =
        await Product.findById(productId);

      return res.status(409).render('store/order-form', {
        title: 'Realizar pedido',
        product: refreshedProduct || product,
        errors: [
          'El stock cambió mientras realizabas el pedido. Revisa la cantidad disponible.'
        ],
        formData
      });
    }

    const subtotal =
      product.price * parsedQuantity;

    let order;

    try {
      order = await Order.create({
        customerName: customerName.trim(),
        address: address.trim(),

        items: [
          {
            product: product._id,
            productName: product.name,
            unitPrice: product.price,
            quantity: parsedQuantity,
            subtotal
          }
        ],

        total: subtotal,

        status: 'pending'
      });
    } catch (orderError) {
      await Product.findByIdAndUpdate(
        productId,
        {
          $inc: {
            stock: parsedQuantity
          }
        }
      );

      throw orderError;
    }

    res.redirect(
      `/orders/${order._id}/confirmation`
    );
  } catch (error) {
    console.error('Error creating order:', error);

    res.status(500).render('store/error', {
      title: 'Error',
      message: 'No se pudo crear el pedido.'
    });
  }
}

async function showOrderConfirmation(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render('store/error', {
        title: 'Pedido no encontrado',
        message: 'El pedido solicitado no existe.'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).render('store/error', {
        title: 'Pedido no encontrado',
        message: 'El pedido solicitado no existe.'
      });
    }

    res.render('store/order-confirmation', {
      title: 'Pedido confirmado',
      order
    });
  } catch (error) {
    console.error('Error loading order confirmation:', error);

    res.status(500).render('store/error', {
      title: 'Error',
      message: 'No se pudo cargar la confirmación del pedido.'
    });
  }
}

module.exports = {
  showOrderForm,
  createOrder,
  showOrderConfirmation
};
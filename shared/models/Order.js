const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    productName: {
      type: String,
      required: true,
      trim: true
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    items: {
      type: [orderItemSchema],
      required: true
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
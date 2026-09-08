const mongoose = require('mongoose');

const Product = require('../../shared/models/Product');

async function showCatalog(req, res) {
  try {
    const products = await Product.find({
      active: true
    }).sort({
      createdAt: -1
    });

    res.render('store/index', {
      title: 'Penguin Store',
      products
    });
  } catch (error) {
    console.error('Error loading public catalog:', error);

    res.status(500).render('store/error', {
      title: 'Error',
      message: 'No se pudo cargar el catálogo.'
    });
  }
}

async function showProductDetail(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render('store/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    const product = await Product.findOne({
      _id: id,
      active: true
    });

    if (!product) {
      return res.status(404).render('store/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    res.render('store/detail', {
      title: product.name,
      product
    });
  } catch (error) {
    console.error('Error loading product detail:', error);

    res.status(500).render('store/error', {
      title: 'Error',
      message: 'No se pudo cargar el producto.'
    });
  }
}

module.exports = {
  showCatalog,
  showProductDetail
};
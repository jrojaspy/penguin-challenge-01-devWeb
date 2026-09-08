const Product = require('../../shared/models/Product');

async function listProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.render('admin/products/index', {
      title: 'Productos',
      products
    });
  } catch (error) {
    console.error('Error loading products:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudieron cargar los productos.'
    });
  }
}

module.exports = {
  listProducts
};
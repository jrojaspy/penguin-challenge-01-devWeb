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

function showCreateForm(req, res) {
  res.render('admin/products/new', {
    title: 'Nuevo producto',
    errors: [],
    product: {
      name: '',
      description: '',
      price: '',
      stock: '',
      active: true
    }
  });
}

async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      stock,
      active
    } = req.body;

    const errors = [];

    if (!name || !name.trim()) {
      errors.push('El nombre es obligatorio.');
    }

    if (!description || !description.trim()) {
      errors.push('La descripción es obligatoria.');
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (price === '' || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      errors.push('El precio debe ser un número igual o mayor que cero.');
    }

    if (
      stock === '' ||
      Number.isNaN(parsedStock) ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      errors.push('El stock debe ser un número entero igual o mayor que cero.');
    }

    const productData = {
      name: name ? name.trim() : '',
      description: description ? description.trim() : '',
      price,
      stock,
      active: active === 'on'
    };

    if (errors.length > 0) {
      return res.status(400).render('admin/products/new', {
        title: 'Nuevo producto',
        errors,
        product: productData
      });
    }

    await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parsedStock,
      active: active === 'on'
    });

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error creating product:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudo crear el producto.'
    });
  }
}

async function showEditForm(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    res.render('admin/products/edit', {
      title: 'Editar producto',
      errors: [],
      product
    });
  } catch (error) {
    console.error('Error loading product:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudo cargar el producto.'
    });
  }
}

async function updateProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      stock,
      active
    } = req.body;

    const errors = [];

    if (!name || !name.trim()) {
      errors.push('El nombre es obligatorio.');
    }

    if (!description || !description.trim()) {
      errors.push('La descripción es obligatoria.');
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (price === '' || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      errors.push('El precio debe ser un número igual o mayor que cero.');
    }

    if (
      stock === '' ||
      Number.isNaN(parsedStock) ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      errors.push('El stock debe ser un número entero igual o mayor que cero.');
    }

    const formProduct = {
      _id: req.params.id,
      name: name ? name.trim() : '',
      description: description ? description.trim() : '',
      price,
      stock,
      active: active === 'on'
    };

    if (errors.length > 0) {
      return res.status(400).render('admin/products/edit', {
        title: 'Editar producto',
        errors,
        product: formProduct
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        stock: parsedStock,
        active: active === 'on'
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return res.status(404).render('admin/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error updating product:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudo actualizar el producto.'
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).render('admin/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudo eliminar el producto.'
    });
  }
}

module.exports = {
  listProducts,
  showCreateForm,
  createProduct,
  showEditForm,
  updateProduct,
  deleteProduct
};
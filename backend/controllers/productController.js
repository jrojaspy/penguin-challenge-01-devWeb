const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

const Product = require('../../shared/models/Product');
const {
  UPLOAD_DIRECTORY
} = require('../middleware/uploadProductImage');

function normalizeProductInput(body) {
  return {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    description:
      typeof body.description === 'string' ? body.description.trim() : '',
    price: Number(body.price),
    stock: Number(body.stock),
    active: body.active === 'on'
  };
}

function validateProductInput(data) {
  if (!data.name) {
    return 'El nombre es obligatorio.';
  }

  if (!data.description) {
    return 'La descripción es obligatoria.';
  }

  if (!Number.isFinite(data.price) || data.price < 0) {
    return 'El precio debe ser un número mayor o igual a 0.';
  }

  if (!Number.isInteger(data.stock) || data.stock < 0) {
    return 'El stock debe ser un número entero mayor o igual a 0.';
  }

  return null;
}

function isValidProductId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function getPublicImagePath(file) {
  if (!file) {
    return null;
  }

  return `/uploads/products/${file.filename}`;
}

function getImageFilename(imagePath) {
  if (!imagePath) {
    return null;
  }

  return path.basename(imagePath);
}

async function removeImageFile(imagePath) {
  const filename = getImageFilename(imagePath);

  if (!filename) {
    return;
  }

  const absolutePath = path.join(UPLOAD_DIRECTORY, filename);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error removing product image:', error);
    }
  }
}

async function removeUploadedFile(file) {
  if (!file || !file.filename) {
    return;
  }

  await removeImageFile(`/uploads/products/${file.filename}`);
}

async function listProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.render('admin/products/index', {
      title: 'Productos',
      products
    });
  } catch (error) {
    console.error('Error listing products:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudieron cargar los productos.'
    });
  }
}

function showCreateForm(req, res) {
  res.render('admin/products/new', {
    title: 'Nuevo producto',
    error: null,
    product: {
      name: '',
      description: '',
      price: '',
      stock: '',
      active: true,
      image: null
    }
  });
}

async function createProduct(req, res) {
  const data = normalizeProductInput(req.body);
  const validationError = validateProductInput(data);

  if (validationError) {
    await removeUploadedFile(req.file);

    return res.status(400).render('admin/products/new', {
      title: 'Nuevo producto',
      error: validationError,
      product: {
        ...data,
        price: req.body.price,
        stock: req.body.stock,
        image: null
      }
    });
  }

  const image = getPublicImagePath(req.file);

  try {
    await Product.create({
      ...data,
      image
    });

    return res.redirect('/admin/products');
  } catch (error) {
    console.error('Error creating product:', error);

    await removeUploadedFile(req.file);

    return res.status(400).render('admin/products/new', {
      title: 'Nuevo producto',
      error: 'No se pudo crear el producto. Revisa los datos ingresados.',
      product: {
        ...data,
        price: req.body.price,
        stock: req.body.stock,
        image: null
      }
    });
  }
}

async function showEditForm(req, res) {
  const { id } = req.params;

  if (!isValidProductId(id)) {
    return res.status(404).render('admin/error', {
      title: 'Producto no encontrado',
      message: 'El producto solicitado no existe.'
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    return res.render('admin/products/edit', {
      title: 'Editar producto',
      error: null,
      product
    });
  } catch (error) {
    console.error('Error loading product:', error);

    return res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudo cargar el producto.'
    });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;

  if (!isValidProductId(id)) {
    await removeUploadedFile(req.file);

    return res.status(404).render('admin/error', {
      title: 'Producto no encontrado',
      message: 'El producto solicitado no existe.'
    });
  }

  const data = normalizeProductInput(req.body);
  const validationError = validateProductInput(data);

  try {
    const currentProduct = await Product.findById(id);

    if (!currentProduct) {
      await removeUploadedFile(req.file);

      return res.status(404).render('admin/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    if (validationError) {
      await removeUploadedFile(req.file);

      return res.status(400).render('admin/products/edit', {
        title: 'Editar producto',
        error: validationError,
        product: {
          _id: id,
          ...data,
          price: req.body.price,
          stock: req.body.stock,
          image: currentProduct.image
        }
      });
    }

    const previousImage = currentProduct.image;
    const newImage = getPublicImagePath(req.file);

    currentProduct.name = data.name;
    currentProduct.description = data.description;
    currentProduct.price = data.price;
    currentProduct.stock = data.stock;
    currentProduct.active = data.active;

    if (newImage) {
      currentProduct.image = newImage;
    }

    await currentProduct.save();

    if (newImage && previousImage && previousImage !== newImage) {
      await removeImageFile(previousImage);
    }

    return res.redirect('/admin/products');
  } catch (error) {
    console.error('Error updating product:', error);

    await removeUploadedFile(req.file);

    let existingImage = null;

    try {
      const product = await Product.findById(id);
      existingImage = product ? product.image : null;
    } catch (lookupError) {
      console.error('Error reloading product after failed update:', lookupError);
    }

    return res.status(400).render('admin/products/edit', {
      title: 'Editar producto',
      error: 'No se pudo actualizar el producto. Revisa los datos ingresados.',
      product: {
        _id: id,
        ...data,
        price: req.body.price,
        stock: req.body.stock,
        image: existingImage
      }
    });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  if (!isValidProductId(id)) {
    return res.status(404).render('admin/error', {
      title: 'Producto no encontrado',
      message: 'El producto solicitado no existe.'
    });
  }

  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Producto no encontrado',
        message: 'El producto solicitado no existe.'
      });
    }

    if (product.image) {
      await removeImageFile(product.image);
    }

    return res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);

    return res.status(500).render('admin/error', {
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

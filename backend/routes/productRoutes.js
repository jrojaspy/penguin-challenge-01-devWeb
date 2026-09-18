const express = require('express');
const {
  listProducts,
  showCreateForm,
  createProduct,
  showEditForm,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const {
  productImageUpload
} = require('../middleware/uploadProductImage');

const router = express.Router();

router.get('/', listProducts);
router.get('/new', showCreateForm);
router.post('/', productImageUpload, createProduct);
router.get('/:id/edit', showEditForm);
router.patch('/:id', productImageUpload, updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

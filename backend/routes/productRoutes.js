const express = require('express');
const {
  listProducts,
  showCreateForm,
  createProduct,
  showEditForm,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const router = express.Router();

router.get('/', listProducts);
router.get('/new', showCreateForm);
router.post('/', createProduct);
router.get('/:id/edit', showEditForm);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

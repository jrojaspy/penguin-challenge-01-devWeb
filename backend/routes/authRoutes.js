const express = require('express');

const {
  showLoginForm,
  login,
  logout
} = require('../controllers/authController');

const router = express.Router();

router.get('/login', showLoginForm);
router.post('/login', login);

router.post('/logout', logout);

module.exports = router;
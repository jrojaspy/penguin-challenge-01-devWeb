const bcrypt = require('bcrypt');

const Admin = require('../models/Admin');

function showLoginForm(req, res) {
  if (req.session.userId) {
    return res.redirect('/admin');
  }

  res.render('auth/login', {
    title: 'Iniciar sesión',
    error: null,
    username: ''
  });
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('auth/login', {
        title: 'Iniciar sesión',
        error: 'Usuario y contraseña son obligatorios.',
        username: username || ''
      });
    }

    const admin = await Admin.findOne({
      username: username.trim().toLowerCase()
    });

    if (!admin) {
      return res.status(401).render('auth/login', {
        title: 'Iniciar sesión',
        error: 'Credenciales inválidas.',
        username
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).render('auth/login', {
        title: 'Iniciar sesión',
        error: 'Credenciales inválidas.',
        username
      });
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error('Session regeneration error:', error);

        return res.status(500).render('admin/error', {
          title: 'Error',
          message: 'No se pudo iniciar la sesión.'
        });
      }

      req.session.userId = admin._id.toString();
      req.session.username = admin.username;

      res.redirect('/admin');
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'No se pudo procesar el inicio de sesión.'
    });
  }
}

function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);

      return res.status(500).render('admin/error', {
        title: 'Error',
        message: 'No se pudo cerrar la sesión.'
      });
    }

    res.clearCookie('penguin.sid');

    res.redirect('/login');
  });
}

module.exports = {
  showLoginForm,
  login,
  logout
};
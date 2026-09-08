function sessionUser(req, res, next) {
  res.locals.currentUser = null;

  if (req.session && req.session.userId) {
    res.locals.currentUser = {
      id: req.session.userId,
      username: req.session.username
    };
  }

  next();
}

module.exports = sessionUser;
const jwt = require('jsonwebtoken');
const NotAuthError = require('../errors/not-auth-err');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new NotAuthError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    throw new NotAuthError('Необходима авторизация');
  }

  req.user = payload;
  next();
};

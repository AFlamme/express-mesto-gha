const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadReqError = require('../errors/bad-req-err');
const NotFoundError = require('../errors/not-found-err');
const NotAuthError = require('../errors/not-auth-err');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

const getProfile = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь с указанным id не найден');
    })
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь с указанным id не найден');
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadReqError('Не указан Email или пароль');
  }
  User.findOne({ email })
    .then((user) => {
      if (user) {
        res.status(409).send({ message: 'Такой пользователь уже зарегистрирован.' });
      }
    });
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    })
      .then((user) => {
        res.status(200).send({
          _id: user._id,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
        });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new BadReqError('Ошибка при создании пользователя');
        } else next(err);
      }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadReqError('Некорректные данные');
      } else next(err);
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь с указанным id не найден');
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadReqError('Некорректные данные');
      }
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь с указанным id не найден');
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadReqError('Некорректная сcылка');
      } else if (err.name === 'ValidationError') {
        throw new BadReqError('Некорректный id');
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new NotFoundError('Указанные данные не найдены');
  } else {
    User.findOne({ email }).select('+password')
      .orFail(() => {
        throw new NotAuthError('Указан неправильный Email или пароль');
      })
      .then((user) => {
        bcrypt.compare(password, user.password)
          .then((matched) => {
            if (!matched) {
              throw new NotAuthError('Указан неправильный Email или пароль');
            } else {
              const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
              res.send({ token });
            }
          })
          .catch((err) => next(err));
      })
      .catch(next);
  }
};

module.exports = {
  getUsers, getUserById, createUser, updateProfile, updateAvatar, login, getProfile,
};

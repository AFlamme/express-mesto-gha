const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isUrl = require('validator/lib/isURL');
const isEmail = require('validator/lib/isEmail');
const NotAuthError = require('../errors/not-auth-err');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },

  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (url) => isUrl(url),
      message: 'Неверно указана ссылка',
    },
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => isEmail(email),
      message: 'Неверно указан Email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlenght: 8,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new NotAuthError('Указан неправильный Email или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new NotAuthError('Указан неправильный Email или пароль');
          }
          return user;
        });
    });
};
module.exports = mongoose.model('user', userSchema);

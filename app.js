const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ERRORS = require('./utils/utils');

const { PORT = 3000 } = process.env;

const app = express();

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '630a2fd6909cb351dc52dfc9',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));
app.use('*', (req, res) => {
  res.status(ERRORS.NOT_FOUND).send({ message: 'Страница не найдена' });
});

mongoose.connect('mongodb://localhost:27017/mestodb');

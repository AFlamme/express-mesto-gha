const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

// Вставьте сюда _id созданного в предыдущем пункте пользователя
app.use((req, res, next) => {
  req.user = {
    _id: '630a2fd6909cb351dc52dfc9',
  };

  next();
});

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));
app.use('*', require('./routes/NotFound'));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

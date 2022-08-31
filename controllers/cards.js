const ERRORS = require('../utils/utils');
const Card = require('../models/card');

// создает карточку
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.send({
      likes: card.likes,
      _id: card._id,
      name: card.name,
      link: card.link,
      owner: {
        name: card.owner.name,
        about: card.owner.about,
        avatar: card.owner.avatar,
        _id: card.owner._id,
      },
      createdAt: card.createdAt,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERRORS.BAD_REQUEST).send({ message: 'Произошла ошибка: некорректные данные' });
      }
      return res.status(ERRORS.INTERNAL_SERVER).send({ message: err.message });
    });
};

// возвращает все карточки
module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((card) => res.send(card))
    .catch(() => res.status(ERRORS.INTERNAL_SERVER).send({ message: 'Произошла ошибка Card.find' }));
};

// удалить карточку
module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        return res.send({
          likes: card.likes,
          _id: card._id,
          name: card.name,
          link: card.link,
          owner: {
            name: card.owner.name,
            about: card.owner.about,
            avatar: card.owner.avatar,
            _id: card.owner._id,
          },
          createdAt: card.createdAt,
        });
      }
      return res.status(ERRORS.NOT_FOUND).send({ message: 'Произошла ошибка: карточка с таким _id не найдена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERRORS.BAD_REQUEST).send({ message: 'Произошла ошибка: некорректные данные' });
      }
      return res.status(ERRORS.INTERNAL_SERVER).send({ message: err.message });
    });
};

// лайкаем карточку
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (card) {
        return res.send({
          likes: card.likes,
          _id: card._id,
          name: card.name,
          link: card.link,
          owner: {
            name: card.owner.name,
            about: card.owner.about,
            avatar: card.owner.avatar,
            _id: card.owner._id,
          },
          createdAt: card.createdAt,
        });
      }
      return res.status(ERRORS.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERRORS.BAD_REQUEST).send({ message: 'Произошла ошибка: некорректные данные' });
      }
      return res.status(ERRORS.INTERNAL_SERVER).send({ message: err.message });
    });
};

// дислайкаем карточку
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (card) {
        return res.send({
          likes: card.likes,
          _id: card._id,
          name: card.name,
          link: card.link,
          owner: {
            name: card.owner.name,
            about: card.owner.about,
            avatar: card.owner.avatar,
            _id: card.owner._id,
          },
          createdAt: card.createdAt,
        });
      }
      return res.status(ERRORS.NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERRORS.BAD_REQUEST).send({ message: 'Произошла ошибка: некорректные данные' });
      }
      return res.status(ERRORS.INTERNAL_SERVER).send({ message: err.message });
    });
};

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, PORT } = require('./config')
const cuid = require('cuid')

const app = express()


let users = [
  {
    "id": "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    "username": "sallyStudent",
    "password": "c00d1ng1sc00l",
    "favoriteClub": "Cache Valley Stone Society",
    "newsLetter": "true"
  },
  {
    "id": "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    "username": "johnBlocton",
    "password": "veryg00dpassw0rd",
    "favoriteClub": "Salt City Curling Club",
    "newsLetter": "false"
  }
];


app.use(morgan('dev'));
app.use(express.json());

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello, world!');
})

app.get('/user', (req, res) => {
  res.send(users);
})

app.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  let returnedUser = null;
  for (let i = 0; i < users.length; i++) {
    if ((userId) === users[i].id) {
      returnedUser = users[i];
      i = users.length;
    }
  }

  if (returnedUser !== null) {
    res
      .status(200)
      .send(returnedUser);
  }
  else {
    res
      .status(404)
      .send('No user with that ID exists.');

  }
})

app.post('/', (req, res) => {
  console.log(req.body);
  if (req.body.name) {
    console.log(req.body.name);
  }
  res
    .send('POST request received.');
})

app.post('/user', (req, res) => {
  const { username, password, favoriteClub, newsLetter = false } = req.body;
  if (!username) {
    return res
      .status(400)
      .send('Username required');
  }

  if (!password) {
    return res
      .status(400)
      .send('Password required')
  }

  if (!favoriteClub) {
    return res
      .status(400)
      .send('Favorite Club required')
  }

  if (username.length < 6 || username.length > 20) {
    return res
      .status(401)
      .send('Username must be between 6 and 20 characters');
  }

  if (password.length < 8 || password.length > 36) {
    return res
      .status(401)
      .send('Password must be between 8 and 36 characters');
  }

  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res
      .status(401)
      .send('Password must be contain at least one digit');
  }

  const clubs = [
    'Cache Valley Stone Society',
    'Ogden Curling Club',
    'Park City Curling Club',
    'Salt City Curling Club',
    'Utah Olympic Oval Curling Club'
  ];

  if (!clubs.includes(favoriteClub)) {
    return res
      .status(402)
      .send('Favorite Club must be one of: ' + clubs.join(', '))
  }

  const id = cuid();
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter
  };

  users.push(newUser);

  res
    .status(201)
    .location(`http://localhost:${PORT}/user/${id}`)
    .json(newUser);

})

app.delete('/user/:userId', (req, res) => {
  let { userId } = req.params;
  let userDeleted = false;
  for (let i = 0; i < users.length; i++) {
    if (userId === users[i].id) {
      delete users[i];
      let newUserList = [];
      for (let x = 0; x < users.length; x++) {
        if (users[i] !== undefined) {
          newUserList.push(users[i]);
        }
      }
      users = newUserList;
      userDeleted = true;
      i = (users.length + 1);
    }
  }
  if (userDeleted === true) {
    res
      .status(410)
      .send('User successfully deleted.')
  }
  else {
    res
      .status(404)
      .send('No user exists with that id.')
  }
});

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app

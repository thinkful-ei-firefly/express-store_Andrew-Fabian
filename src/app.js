require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const app = express()
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

app.post('/', (req, res) => {
  console.log(req.body);
  if (req.body.name) {
    console.log(req.body.name);
  }
  res
    .send('POST request received.');
})

app.post('/user', (req, res) => {
  const {username, password, favoriteClub, newsLetter=false } = req.body;
  if (!username){
    return res
      .status(400)
      .send('Username required');
  }

  if(!password){
    return res
      .status(400)
      .send('Password required')
  }

  if(!favoriteClub){
    return res
      .status(400)
      .send('Favorite Club required')
  }

  if (username.length < 6 || username.length > 20){
    return res
      .status(401)
      .send('Username must be between 6 and 20 characters');
  }

  if (password.length < 8 || password.length > 36){
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

  if (!clubs.includes(favoriteClub)){
    return res
      .status(402)
      .send('Favorite Club must be one of: ' + clubs.join(', '))
  }

  res
    .send('All validation passed.');

})

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

import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import {getApps, cert, initializeApp} from 'firebase-admin/app'
import {getAuth} from 'firebase-admin/auth'
import {Result} from './models/Result'
import {Rating} from './models/Rating'
import mongoose from 'mongoose'

const readyState = mongoose.connections[0].readyState
if (readyState !== 1 && readyState !== 2) {
  mongoose
    .connect(process.env.MONGODB_URL!)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(error => console.error(error))
}

if (!getApps().length) {
  const googleCredentials = process.env.GOOGLE_CREDENTIALS
  if (googleCredentials) {
    const buffer = Buffer.from(googleCredentials, 'base64')
    const decoded = JSON.parse(buffer.toString('utf-8'))
    initializeApp({credential: cert(decoded)})
  }
}

const app = express()
const server = http.createServer(app)
app.set('trust proxy', true)
app.use(cors())
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.json({status: 'ok'})
})

app.use((req, res, next) => {
  ;(async () => {
    const headerAuth = req.headers.authorization
    if (headerAuth?.startsWith('Bearer ')) {
      const auth = getAuth()
      const {uid: firebaseAuthID} = await auth.verifyIdToken(headerAuth.substring(7))
      res.locals.firebaseAuthID = firebaseAuthID
    }
  })()
    .then(() => next())
    .catch(err => next(err))
})

/*
app.get('/results', (req, res) => {
  res.json({status: 'ok'})
})

app.delete('/results/:id', (req, res) => {
  res.json({status: 'ok'})
})
*/

app.post('/results', (req, res) => {
  const result = new Result()
  result.firebaseAuthID = res.locals.firebaseAuthID
  result.request = {
    ip: req.ip,
    headers: req.headers,
  }
  result.payload = req.body
  result.save().then(() => {
    res.json({status: 'ok'})
  })
})

app.post('/ratings', (req, res) => {
  const rating = new Rating()
  rating.firebaseAuthID = res.locals.firebaseAuthID
  rating.value = req.body.value
  rating.save().then(() => {
    res.json({status: 'ok'})
  })
})

server.listen(8080, () => {
  console.log('listening on *:8080')
})

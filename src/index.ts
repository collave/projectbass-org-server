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
  res.json({status: 'ok'})
})

app.post('/ratings', (req, res) => {
  const result = new Rating()
  result.firebaseAuthID = res.locals.firebaseAuthID
  result.value = req.body.value
  res.json({status: 'ok'})
})

server.listen(8080, () => {
  console.log('listening on *:8080')
})

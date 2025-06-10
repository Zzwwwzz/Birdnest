const express = require('express')
const app = express()
require('express-async-errors')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Violator = require('./models/violator')
const violationsRouter = require('./routes/violations')
const violationService = require('./services/violations')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length]\
 - :response-time ms :body'))
app.use('/api/violations', violationsRouter)


app.get('/info', (req, res) => {
  Violator.count().then(pilot_count => {
    const body = `
    <p>There have been ${pilot_count} violators in the last 10 minutes.</p>
    <p>${new Date()}</p
    `
    res.send(body)
  })
})


const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

violationService.start()
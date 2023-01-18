const express = require('express')
const app = express()
require('express-async-errors')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Drone = require('./modules/drone')
const Pilot = require('./modules/pilot')
const Violator = require('./models/violator')
const pilotService = require('./services/pilots')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length]\
 - :response-time ms :body'))

const updatePilot = (existingPilot, pilot) => {

  // Check if the violation is already logged
  if (existingPilot.violations.some(
    coordsold => pilot.violations[0].every(
      (coordsnew,i) => coordsnew === coordsold[i]))){
    return
  }

  pilotService.update(existingPilot.id,
    {
      violations: existingPilot.violations.concat(pilot.violations),
      distance: Math.min(existingPilot.distance,pilot.distance),
      last_seen: pilot.last_seen
    })
    .then(() => {})
}

const addPilot = (pilot) => {
  pilotService.create(pilot).then(() => {})
}

const deletePilot = (pilot) => {
  pilotService.remove(pilot.id).then(() => {})
}

const getViolations = async () => {

  // pilotData from the Mongoose database.
  let pilotData = await pilotService
    .getAll()
    .then(allPilots => {return allPilots})
    .catch(error => console.log(error))

  const data = await Drone.getDrones()
  const drones = data.drones
  const timestamp = data.timestamp

  for (const drone of drones) {
    if (drone.distance <= 100000) {
      let pilot = await Pilot.getPilots(drone)

      const existingPilot = pilotData.find(
        p => p.serialNumber === drone.serialNumber)
      if (existingPilot) {
        updatePilot(existingPilot, pilot)
      } else {
        addPilot(pilot)
      }
    }
  }

  for (const pilot of pilotData) {
    if (timestamp - new Date(pilot.last_seen) > 600000) {
      deletePilot(pilot)
    }
  }
}

app.post('/api/violations', (req, res, next) => {
  const body = req.body

  if (!body.serialNumber) {
    return res.status(400).json({
      error: 'Serial number missing'
    })
  }

  const violator = new Violator({
    serialNumber: body.serialNumber,
    firstName: body.firstName,
    lastName: body.lastName,
    phoneNumber: body.phoneNumber,
    email: body.email,
    violations : body.violations,
    distance : body.distance,
    last_seen : body.last_seen
  })

  violator.save()
    .then(pilot => {
      res.json(pilot)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  Violator.count().then(pilot_count => {
    const body = `
    <p>There have been ${pilot_count} violators in the last 10 minutes.</p>
    <p>${new Date()}</p
    `
    res.send(body)
  })
})

app.get('/api/violations', (req, res) => {
  Violator.find({}).then(violations => {
    res.json(violations)
  })
})

app.get('/api/violations/:id', (req, res, next) => {

  Violator.findById(req.params.id)
    .then((pilot) => {
      res.json(pilot)
    })
    .catch(error => next(error))
})

app.patch('/api/violations/:id', (req, res, next) => {
  const body = req.body

  Violator.findByIdAndUpdate(req.params.id,
    { violations : body.violations,
      distance : body.distance,
      last_seen : body.last_seen })
    .then(updatedPilot => {
      res.json(updatedPilot)
    })
    .catch(error => next(error))
})

app.delete('/api/violations/:id', (req, res, next) => {
  Violator.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
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

// Update every second to make sure every update is logged and enough time is
// left for the async function.
setInterval(async() => {
  await getViolations()
}, 1000)

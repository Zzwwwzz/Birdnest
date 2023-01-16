const express = require('express')
const app = express()
require('express-async-errors')
const axios = require('axios')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Drone = require('./modules/drone')
const Pilot = require('./modules/pilot')
const Violator = require('./models/violator')

app.use(cors())
//app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const getViolations = async (pilotData) => {
    const data = await Drone.getDrones()
    const drones = data.drones
    const timestamp = data.timestamp

    // let pilotData = Violator.find({}).then(violations => {
    //   return violations
    // })

    // console.log(pilotData)
    

    for (const drone of drones) {
      if (drone.distance <= 100000) {
          let pilot = await Pilot.getPilots(drone)

          const existingPilot = pilotData.find(pilot => pilot.serialNumber === drone.serialNumber)
          if (existingPilot) {
            
            existingPilot.violations.push(drone.position)
            existingPilot.distance.push(drone.distance)
            existingPilot.last_seen = timestamp

            // axios.put(`http://localhost:3001/api/violations/${existingPilot.serialNumber}`, existingPilot)
            // .then((res) => {
            //   console.log(`edit`)
            // }).catch((err) => {
            //     console.error(err)
            // })

            Violator.findByIdAndUpdate(
              existingPilot.serialNumber,
                existingPilot,
                { new: true, context: 'query' }
              )
                .then(() => {console.log('pilot edited!')})
          } else {
            pilotData.push(pilot)
            
            // axios.post('http://localhost:3001/api/violations', pilot)
            // .then((res) => {
            //   console.log(`add`)
            // }).catch((err) => {
            //     console.error(err)
            // })
            const violator = new Violator(pilot)
            violator.save().then(() => {console.log('pilot added!')})
          }
        }
      }
    // remove expired pilot data
    for (const pilot of pilotData) {
      if (timestamp - pilot.last_seen > 600000) {

        // axios.delete(`http://localhost:3001/api/violations/${pilot.serialNumber}`).then((res) => {
        //   console.log(`del`)
        // }).catch((err) => {
        //     console.error(err)
        // })
        
        Violator.findByIdAndRemove(pilot.serialNumber)
        .then(() => {console.log('pilot removed!')})

        pilotData = pilotData.filter(p => p.serialNumber !== pilot.serialNumber)
      }
     }

    return pilotData

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
    <p>There have been ${pilot_count} violators</p>
    <p>${new Date()}</p
    `

    res.send(body)
  })
//   for (const pilot of pilotData){
//     res.write(`<p>Pilot: ${pilot.firstName} ${pilot.lastName} (${pilot.phoneNumber}, ${pilot.email})</p>`)
//     res.write(`<p>Closest distance from nest: ${Math.floor(Math.min(...pilot.distance)/100)} meters from ${pilot.violations.length} violation(s)</p>`)
//     res.write('<p>-------</p>')
// }
//   res.end()  
})


app.get('/api/violations', (req, res) => {
  Violator.find({}).then(violations => {
    res.json(violations)
  })
})

app.get('/api/violations/:id', (req, res, next) => {
  Violator.findById(req.params.serialNumber)
  .then((pilot) => {
    res.json(pilot)
  })
  .catch(error => next(error))
})

app.put('/api/violations/:id', (req, res, next) => {
  const body = req.body

  Violator.findByIdAndUpdate(
    req.params.serialNumber,
    {firstName: body.firstName,
    lastName: body.lastName,
    phoneNumber: body.phoneNumber,
    email: body.email,
    violations : body.violations,
    distance : body.distance,
    last_seen : body.last_seen},
    { new: true, context: 'query' }
  )
    .then(updatedPilot => {
      res.json(updatedPilot)
    })
    .catch(error => next(error))
})

app.delete('/api/violations/:id', (req, res, next) => {
  Violator.findByIdAndRemove(req.params.serialNumber)
  .then(() => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted SN' })
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

const pilotData = []
setInterval(async() => { 
  await getViolations(pilotData)
  }, 2000)
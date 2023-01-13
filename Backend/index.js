const express = require('express')
require('express-async-errors')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()

const Drone = require('./modules/drone')
const Pilot = require('./modules/pilot')

app.use(cors())
app.use(express.json())

morgan.token('body',  (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const getViolations = async (pilotData) => {
    const data = await Drone.getDrones()
    const drones = data.drones
    const timestamp = data.timestamp
    
    for (const drone of drones) {
      if (drone.distance <= 100000) {
          let pilot = await Pilot.getPilots(drone)

          if (drone.serialNumber in pilotData) {
            pilotData[drone.serialNumber]["violations"].push(drone.position)
            pilotData[drone.serialNumber]["distance"].push(drone.distance)
            pilotData[drone.serialNumber]["last_seen"] = data.timestamp
          } else {
            pilotData[drone.serialNumber] = pilot
            pilotData[drone.serialNumber]["distance"] = [drone.distance]
            pilotData[drone.serialNumber]["violations"] = [drone.position]
            pilotData[drone.serialNumber]["last_seen"] = timestamp
          }

          }
      }
    // remove expired pilot data
    for (const serialNumber in pilotData) {
      if (timestamp - pilotData[serialNumber]["last_seen"] > 600000) {
        delete pilotData[serialNumber];
      }
     }
    return pilotData

  }

const printViolations = (violations, pilotData) => {

  for (const violation in violations){
      console.log(`Pilot: ${pilotData[violation]["firstName"]} ${pilotData[violation]["lastName"]} (${pilotData[violation]["phoneNumber"]}, ${pilotData[violation]["email"]})`)
      console.log(`Closest distance from nest: ${Math.floor(Math.min(...pilotData[violation]["distance"])/100)} meters from ${pilotData[violation]["violations"].length} violation(s)`)
      console.log()
  }
}

app.post('/api/violations', (request, response) => {
    const body = request.body
  
    if (!body.content) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
  
    const pilot = {
      droneSN: body.droneSN,
      firstname: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      email: body.email,
      distance: body.distances,
      violations: body.violations,
      last_seen: body.last_seen
    }
  
    pilotData = pilotData.concat(pilot)
  
    response.json(pilot)
  })

app.get('/', (req, res) => {
  let violations = pilotData
  for (const violation in violations){
    res.write(`<p>Pilot: ${pilotData[violation]["firstName"]} ${pilotData[violation]["lastName"]} (${pilotData[violation]["phoneNumber"]}, ${pilotData[violation]["email"]})</p>`)
    res.write(`<p>Closest distance from nest: ${Math.floor(Math.min(...pilotData[violation]["distance"])/100)} meters from ${pilotData[violation]["violations"].length} violation(s)</p>`)
    res.write('<p>-------</p>')
  }
  res.end()  
})


app.get('/api/violations', (req, res) => {
  res.json(pilotData)
})

app.get('/api/violations/:id', (request, response) => {
  const pilot = pilotData[request.params.id]

  if (pilot) {
      response.json(pilot)
  } else {
      response.status(404).end()
  }
})

app.delete('/api/violations/:id', (request, response) => {
  pilotData = pilotData.filter(pilot => pilot.droneSN !== request.params.id)

response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})

const pilotData = {}
setInterval(async() => { 
    let violations = await getViolations(pilotData)
    printViolations(violations, pilotData)
    console.log("-------------------------")
  }, 2000)
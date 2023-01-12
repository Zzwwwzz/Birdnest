const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const xml2js = require('xml2js')

require('dotenv').config()

const Pilot = require('./models/pilot')

const calculateDistance = ( position ) => {
    let x = position[0]
    let y = position[1]
    return (Math.sqrt((x - 250000) ** 2 + (y - 250000) ** 2))
}

const parseDrones = (data) => {
    const timestamp = new Date(data.report.capture[0]['$'].snapshotTimestamp)
    const drones = data.report.capture[0].drone.map(drone => ({
        serialNumber: drone.serialNumber[0],
        position: [parseFloat(drone.positionX[0]),
                    parseFloat(drone.positionY[0])],
        distance: calculateDistance([parseFloat(drone.positionX[0]),
                                     parseFloat(drone.positionY[0])]),
        timestamp: timestamp
        }))
    return { drones, timestamp }
    }

const parsePilots = (pilotData) => {
    const pilot = {
        firstName: pilotData.firstName,
        lastName: pilotData.lastName,
        phoneNumber: pilotData.phoneNumber,
        email: pilotData.email
        }
    return pilot
    }

const getDrones = async () => {
    let data = await fetch('https://assignments.reaktor.com/birdnest/drones')
    .then(response => response.text())
    .then(xml => {return xml2js.parseStringPromise(xml)})
    .catch(console.error)

    return parseDrones(data)
}

const getPilots = async (drone) => {
    let pilotData = await fetch(
        `http://assignments.reaktor.com/birdnest/pilots/${drone.serialNumber}`)
    .then(response => response.json())
    .then(data => {return data})
    .catch(console.error)

    return parsePilots(pilotData)
}

const getViolations = async (pilotData) => {
    try {
    const data = await getDrones()
    const drones = data.drones
    const timestamp = data.timestamp
    
    for (const drone of drones) {
      const distance = calculateDistance(drone.position)
      if (distance <= 100000) {
          let pilot = await getPilots(drone)

          if (drone.serialNumber in pilotData) {
            pilotData[drone.serialNumber]["violations"].push(drone.position)
            pilotData[drone.serialNumber]["distance"].push(drone.distance)
            pilotData[drone.serialNumber]["last_seen"] = data.timestamp
            pilotData[drone.serialNumber]["last_seen_time"] = data.timestamp
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
    return pilotData } catch (error) {
		console.log(error);
	}

  }


  const printViolations = (violations, pilotData) => {

    for (const violation in violations){
        console.log(`Pilot: ${pilotData[violation]["firstName"]} ${pilotData[violation]["lastName"]} (${pilotData[violation]["phoneNumber"]}, ${pilotData[violation]["email"]})`)
        console.log(`Closest distance from nest: ${Math.floor(Math.min(...pilotData[violation]["distance"])/100)} meters from ${pilotData[violation]["violations"].length} violation(s)`)
        console.log()
    }
  }

// app.post('/api/notes', (request, response) => {
//     const body = request.body
  
//     if (!body.content) {
//       return response.status(400).json({ 
//         error: 'content missing' 
//       })
//     }
  
//     const note = {
//       content: body.content,
//       important: body.important || false,
//       date: new Date(),
//       id: generateId(),
//     }
  
//     notes = notes.concat(note)
  
//     response.json(note)
//   })

// app.get('/', (req, res) => {
//     res.send('<h1>Hello World!</h1>')
//   })

// app.get('/api/drones', (req, res) => {
// res.json(notes)
// })

// app.get('/api/notes/:id', (request, response) => {
// const id = Number(request.params.id)
// const note = notes.find(note => note.id === id)

// if (note) {
//     response.json(note)
// } else {
//     response.status(404).end()
// }
// })

// app.delete('/api/notes/:id', (request, response) => {
// const id = Number(request.params.id)
// notes = notes.filter(note => note.id !== id)

// response.status(204).end()
// })

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
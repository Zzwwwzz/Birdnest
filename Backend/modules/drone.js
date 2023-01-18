const xml2js = require('xml2js')


// Calculate the Euclidean distance of position to the NDZ origin.
const calculateDistance = ( position ) => {
  let x = position[0]
  let y = position[1]
  return (Math.floor(Math.sqrt((x - 250000) ** 2 + (y - 250000) ** 2)))
}

// Parses the xml from /drones endpoint.
// Returns parsed data of all the drones and a timestamp from the monitoring
// equipment
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

// Fetches the data from /drones endpoint
// Returns parsed data of all the drones and a timestamp from the monitoring
// equipment
const getDrones = async () => {
  let data = await fetch('https://assignments.reaktor.com/birdnest/drones')
    .then(response => response.text())
    .then(xml => {return xml2js.parseStringPromise(xml)})
    .catch(console.error)

  return parseDrones(data)
}

module.exports = { getDrones }
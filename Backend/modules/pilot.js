// Parses the json from /pilot/:id endpoint.
// Returns parsed data of the requested pilot
const parsePilots = (pilotData, drone) => {
  const pilot = {
    serialNumber: drone.serialNumber,
    firstName: pilotData.firstName,
    lastName: pilotData.lastName,
    phoneNumber: pilotData.phoneNumber,
    email: pilotData.email,
    violations : [drone.position],
    distance : drone.distance,
    last_seen : drone.timestamp
  }
  return pilot
}

// Fetches the data from /pilots/:id endpoint
// Returns parsed data of the requested pilot
const getPilots = async (drone) => {
  let pilotData = await fetch(
    `http://assignments.reaktor.com/birdnest/pilots/${drone.serialNumber}`)
    .then(response => response.json())
    .then(data => {return data})
    .catch(console.error)

  return parsePilots(pilotData, drone)
}

module.exports = { getPilots }
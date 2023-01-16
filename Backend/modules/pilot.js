const parsePilots = (pilotData, drone) => {
    const pilot = {
        _id : drone.serialNumber,
        serialNumber: drone.serialNumber,
        firstName: pilotData.firstName,
        lastName: pilotData.lastName,
        phoneNumber: pilotData.phoneNumber,
        email: pilotData.email,
        violations : [drone.position],
        distance : [drone.distance],
        last_seen : drone.timestamp
        }
    return pilot
    }

const getPilots = async (drone) => {
    let pilotData = await fetch(
        `http://assignments.reaktor.com/birdnest/pilots/${drone.serialNumber}`)
    .then(response => response.json())
    .then(data => {return data})
    .catch(console.error)

    return parsePilots(pilotData, drone)
}

module.exports = {getPilots}
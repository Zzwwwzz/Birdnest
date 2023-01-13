const parsePilots = (pilotData, droneSerialNumber) => {
    const pilot = {
        droneSN: droneSerialNumber,
        firstName: pilotData.firstName,
        lastName: pilotData.lastName,
        phoneNumber: pilotData.phoneNumber,
        email: pilotData.email
        }
    return pilot
    }

const getPilots = async (drone) => {
    let pilotData = await fetch(
        `http://assignments.reaktor.com/birdnest/pilots/${drone.serialNumber}`)
    .then(response => response.json())
    .then(data => {return data})
    .catch(console.error)

    return parsePilots(pilotData, drone.serialNumber)
}

module.exports = {getPilots}
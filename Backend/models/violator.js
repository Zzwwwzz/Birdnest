const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const pilotSchema = new mongoose.Schema({
    _id: String,
  serialNumber: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  violations : Array,
  distance : Array,
  last_seen : Date
}, { _id: false })

pilotSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Pilot', pilotSchema)
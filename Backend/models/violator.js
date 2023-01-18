// Model to handle Mongoose

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

// The schema for Mongoose
const pilotSchema = new mongoose.Schema({
  serialNumber: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  violations : Array,
  distance : Number,
  last_seen : Date
})


// Modifies the toJSON method to get rid of _id and __v from Mongoose.
pilotSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Pilot', pilotSchema)
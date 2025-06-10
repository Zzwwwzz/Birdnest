const router = require('express').Router()
const Violator = require('../models/violator')

router.post('/', (req, res, next) => {
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
    violations: body.violations,
    distance: body.distance,
    last_seen: body.last_seen
  })

  violator.save()
    .then(pilot => {
      res.json(pilot)
    })
    .catch(error => next(error))
})

router.get('/', (req, res) => {
  Violator.find({}).then(violations => {
    res.json(violations)
  })
})

router.get('/:id', (req, res, next) => {
  Violator.findById(req.params.id)
    .then(pilot => {
      res.json(pilot)
    })
    .catch(error => next(error))
})

router.patch('/:id', (req, res, next) => {
  const body = req.body

  Violator.findByIdAndUpdate(req.params.id,
    {
      violations: body.violations,
      distance: body.distance,
      last_seen: body.last_seen
    })
    .then(updatedPilot => {
      res.json(updatedPilot)
    })
    .catch(error => next(error))
})

router.delete('/:id', (req, res, next) => {
  Violator.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

module.exports = router
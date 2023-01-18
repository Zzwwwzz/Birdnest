// Methods to handles all the used HTTP methods.

const axios = require('axios')

const baseUrl = 'https://crimson-firefly-5060.fly.dev/api/violations'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.patch(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

const remove = (id) => {
  return axios.delete(`${baseUrl}/${id}`)
}

const exportedObject = {
  getAll, create, update, remove
}

module.exports = exportedObject
const express = require('express')
const launchesController = require('./launches.controller')

const launchesRouter = express.Router()

launchesRouter.get('/', launchesController.getAllLaunchesHandler)
launchesRouter.post('/', launchesController.addNewLaunchHandler)
launchesRouter.delete('/:id', launchesController.abortLaunchHandler)

module.exports = launchesRouter
const { retrieveAllLaunches, scheduleNewLaunch, IfLaunchExist, abortLaunch } = require('../../models/launches.model');
const {getPagination} = require('../../../share-services/query');

async function getAllLaunchesHandler(req , res){
   const {skip , limit} = getPagination(req.query);
   return res.status(200).json(await retrieveAllLaunches(skip , limit));
}

async function addNewLaunchHandler(req , res){
  const launch = req.body

  launch.launchDate = new Date(launch.launchDate)
  if(isNaN(launch.launchDate)){
    return res.status(400).json({
        error:'Invalid launch date'
    })
  }

  if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
    return res.status(400).json({
        error: 'Missing required launch property'
    })
  } 

  
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function abortLaunchHandler(req , res){
 const launchId = +req.params.id
 const exist = await IfLaunchExist(launchId)

 if(!exist){
   return res.status(404).json({
    error: 'Launch not found'
   })
 }
 const aborted = await abortLaunch(launchId);
 if(!aborted){
  return res.status(400).json({
    error:'Launch not aborted'
  })
 }
 return res.status(200).json({
  ok:true
 })

}

module.exports = {
    getAllLaunchesHandler,
    addNewLaunchHandler,
    abortLaunchHandler
}
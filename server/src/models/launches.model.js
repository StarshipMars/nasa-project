const LaunchModel = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

let defaultFlightNumber = 100;

const space_x_api_url = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    const response = await axios.post(space_x_api_url , {
        query:{},
        options:{
            pagination: false,
            populate:[
             {
                path: 'rocket',
                select:{
                    name:1
                }
             },
             {
                path:'payloads',
                select:{
                    customers:1
                }
             }
            ]
        }
      })

      if(response.status !== 200){
        throw new Error('Launch data download failed');
      }
      const launchDocs = response.data.docs;

      for(const launchDoc of launchDocs){
        const payloads = launchDoc.payloads
        const customers = payloads.flatMap((payload)=>{
          return payload.customers
        })
    
        const launch = {
            flightNumber:launchDoc.flight_number,
            mission:launchDoc.name,
            rocket:launchDoc.rocket.name,
            launchDate: new Date(launchDoc.date_local),
            upcoming: launchDoc.upcoming,
            success:launchDoc.success,
            customers
        }
        
        await saveLaunch(launch)
      }
}

async function saveLaunchesData(){
 const firstLaunch =  await findLaunch({
    flightNumber:1,
    rocket:'Falcon 1',
    mission: 'FalconSat'
  })

  if(firstLaunch){
    return;
  }
  await populateLaunches(); 
}

async function findLaunch(filter){
  return await LaunchModel.findOne(filter);
}

async function saveLaunch(launch){
  await LaunchModel.findOneAndUpdate({
    flightNumber:launch.flightNumber
  }, 
  launch, 
  {
    upsert:true
  })
}

async function retrieveAllLaunches(skip , limit){
    return await LaunchModel
                .find({},{'_id':0, '__v': 0})
                .sort('flightNumber')
                .skip(skip)
                .limit(limit);
}

async function getLatestFlightNumber(){
    const latestLaunch = await LaunchModel
     .findOne()
     .sort('-flightNumber');

     if(!latestLaunch){
        return defaultFlightNumber;
     }

     return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName:launch.target
      })
    
      if(!planet){
        throw new Error('No matching planet found');
      }
    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch , {
     success: true,
     upcoming: true,
     customers: ['Zero To Mastery','NASA'],
     flightNumber: newFlightNumber
})

  await saveLaunch(newLaunch);
}


async function abortLaunch(launchId){
  const aborted = await LaunchModel.updateOne({
    flightNumber:launchId
  },{
    upcoming: false,
    success:false
  })
  
  return aborted.acknowledged && aborted.matchedCount === 1;
}

async function IfLaunchExist(launchId){
  return await findLaunch({
    flightNumber:launchId
  })
}

module.exports = {
    saveLaunchesData,
    retrieveAllLaunches,
    scheduleNewLaunch,
    IfLaunchExist,
    abortLaunch
}
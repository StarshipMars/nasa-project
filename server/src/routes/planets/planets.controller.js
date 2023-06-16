const {parse} = require('csv-parse');
const fs = require('fs');
const path = require('path');
const planets = require('../../models/planets.mongo');


 
class PlanetsController{

   static planets = []

   static isHabitablePlanet(planet){
    return planet['koi_disposition'] === 'CONFIRMED' &&
     planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 
     && planet['koi_prad'] < 1.6
    }

    static savePlanet(planet){

      return async ()=>{
      
         return await planets.updateOne({
            keplerName:planet.kepler_name
           },{
            keplerName:planet.kepler_name
           },{
            upsert:true
         });
     }
      
    }
    
   async readAndParsePlanets(){
    
    return new Promise((resolve , reject)=>{

        fs.createReadStream(path.resolve(__dirname, '..', '..', '..', './kepler_data', 'kepler_data.csv'))
        .pipe(parse({
           comment: '#',
           columns:true
        }))
        .on('data', async (chunk)=>{
           if(PlanetsController.isHabitablePlanet(chunk)){
            PlanetsController.planets.push(PlanetsController.savePlanet(chunk))
           }
        })
        .on('error', (err)=>{
          console.log(err)
          reject(err)
        })
        .on('end', async ()=>{
           await Promise.all(PlanetsController.planets.map( func => func()))
           PlanetsController.planets = []
           resolve()
        })
    }) 
    
   }


   async getAllPlanets(req , res){
      const habitablePlanets = await planets.find({}, {'_id': 0, '__v': 0})
      return res.status(200).json(habitablePlanets)
   }

}


module.exports = new PlanetsController()
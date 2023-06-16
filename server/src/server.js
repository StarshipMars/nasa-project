const http = require('http');

require('dotenv').config();

const app = require('./app');
const {mongoConnect} = require('../share-services/mongo');
const PORT = process.env.PORT || 8000;
const planetsController = require('./routes/planets/planets.controller');
const {saveLaunchesData} = require('./models/launches.model');


const server = http.createServer(app)

async function startServer(){
 await mongoConnect();
 await planetsController.readAndParsePlanets();
 await saveLaunchesData();

 server.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})
}

startServer()



const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open' , ()=>{
    console.log('Connection ready !')
})

mongoose.connection.on('error', (err)=>{
 console.error(err)
})

async function mongoConnect(){
  try{
    await mongoose.connect(MONGO_URL , {
        useNewUrlParser: true,
        useUnifiedTopology: true,
     })
    }catch(error){
        console.log(error)
    }
}

async function mongoDisconnect(){
  await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}
const mongoose = require('mongoose')
require('dotenv').config({path:'variables.env'})

const conectarDB= async ()=>{
    try {
        await mongoose.connect(process.env.DB_MONGO,{
            useNewUrlParser:true,
        
        })
        console.log(`db conectada`)
    } catch (error) {
        console.log(`error conectando a la db`, error)
        process.exit(1);//detener la aplicacion
    }
}

module.exports = conectarDB;
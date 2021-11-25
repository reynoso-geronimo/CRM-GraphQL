const mongoose = require('mongoose'); 

const ClienteSchema = new mongoose.Schema({
    nombre:{
        type:String,
        required:true,
        trim:true
    },
    apellido:{
        type:String,
        required:true,
        trim:true
    },
    empresa:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    telefono:{
        type:String,
        trim:true,
    },
   creado:{
       type:Date,
       default:Date.now()
   },
   vendedor:{
       type: mongoose.Schema.Types.ObjectId,
       required:true,
       ref:'Usuario'
   }
});

//Export the model
module.exports = mongoose.model('Cliente', ClienteSchema);
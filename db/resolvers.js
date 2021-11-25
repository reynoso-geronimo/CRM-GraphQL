const Usuario= require('../models/Usuario')
const Producto= require('../models/Producto')
const Cliente= require('../models/Cliente')
const Pedido= require('../models/Pedido')

const bcryptjs=require('bcryptjs')
const jwt= require('jsonwebtoken')
require('dotenv').config({path:'variables.env'})


const crearToken = (usuario, secreta, expiresIn) => {
    // console.log(usuario);
    const { id, email,nombre, apellido } = usuario;

    return jwt.sign( { id, email, nombre, apellido }, secreta, { expiresIn } )
}

//Resolvers
const resolvers={
    Query : {
        obtenerUsuario:async(_,{token})=>{
          
            const usuarioId = jwt.verify(token,process.env.SECRETA)
            return usuarioId
        },
        obtenerProducto:async(_,{id})=>{
            const producto = await Producto.findById(id)
            if(!producto){
                throw new Error('Producto no Existe')
            }
            return producto
        },
        
        obtenerProductos:async()=>{
            try {
                const productos = Producto.find()
                return productos
            } catch (error) {
                console.log(error)
            }
        },
        obtenerClientes:async()=>{
            try {
                const clientes = Cliente.find()
                return clientes
            } catch (error) {
                console.log(error)
            }
        },
        obtenerClientesVendedor:async(_,{},ctx)=>{
            try {
                const vendedor=ctx.usuario.id
                const clientes = await Cliente.find({vendedor})
                return clientes
            } catch (error) {
                
            }
        },
        obtenerCliente:async(_,{id},ctx)=>{
            try {
                const cliente = await Cliente.findById(id)
                if(!cliente){ throw new Error(`Cliente no encontrado`)}
               
                if(cliente.vendedor.toString()===ctx.usuario.id){
                    return cliente
                }else
                    throw new Error(`No tiene las credenciales`)
                
            } catch (error) {
                console.log(error)
            }
        },
        obtenerPedidos:async()=>{
            try {
                const pedidos = await Pedido.find()
                return pedidos
            } catch (error) {
                console.log(error)
            }
        },
        obtenerPedidosVendedor:async(_,{},ctx)=>{
            try {
                const pedidos = await Pedido.find({vendedor:ctx.usuario.id})
                return pedidos
            } catch (error) {
                console.log(error)
            }
        },
        obtenerPedido:async(_,{id},ctx)=>{
            try {
                const pedido = await Pedido.findById(id)
                if(!pedido){throw new Error('Pedido no Encontrado')}
                if(pedido.vendedor.toString()!==ctx.usuario.id){throw new Error(`No tienes las credenciales`)}
                return pedido
            } catch (error) {
                console.log(error)
            }
        }
    },
    Mutation:{
        nuevoUsuario:async(_,{input})=>{
            const {email,password}= input

            const existeUsuario= await Usuario.findOne({email})
            if(existeUsuario){
                throw new Error('Usuario ya registrado')}
                try {

                    const salt = await bcryptjs.genSalt(10);
                    input.password = await bcryptjs.hash(password,salt)

                    const usuario= new Usuario(input)
                    usuario.save()
                    return usuario
                } catch (error) {
                    console.log(error)
                }
        },
        autenticarUsuario:async(_,{input})=>{
            const {email,password}= input
         
                try {
                    const usuario= await Usuario.findOne({email})
                    if(!usuario){
                    throw new Error('Usuario no existe')}
                    const passwordCorrecto= bcryptjs.compareSync(password,usuario.password)
                    if(!passwordCorrecto){
                        
                        console.log(`pass incorrecto`)
                        throw new Error('El password es incorrecto')
                        
                    }
                        
                      
                        return{
                            token:crearToken(usuario,process.env.SECRETA,'24h')
                        }
                   
                } catch (error) {
                    console.log(error)
                }
        },

        nuevoProducto: async (_,{input})=>{
     
            try {
                const producto= new Producto(input)
                await producto.save()
                return producto
            } catch (error) {
                console.log(error)
            }
        },
        actualizarProducto:async(_,{id,input})=>{
           
            try {
                
                let producto= await Producto.findById(id)
                if(!producto){throw new Error(`Producto no existe`)}
              
                producto = await Producto.findOneAndUpdate({_id:id}, input,{new :true })
                return producto
            } catch (error) {
                console.log(error)
            }
        },
        eliminarProducto:async(_,{id})=>{
            try {
                
                let producto= await Producto.findById(id)
                if(!producto){throw new Error(`Producto no existe`)}
                await Producto.findByIdAndDelete(id)
                return`producto eliminado`
            } catch (error) {
                console.log(error)
            }
        },
        nuevoCliente:async(_,{input},ctx)=>{
            
            try {
               

            const cliente =await Cliente.findOne({email:input.email});
            if(cliente){throw new Error(`Cliente ya existe`)}
            
            const nuevoCliente= new Cliente(input)
            nuevoCliente.vendedor= ctx.usuario.id
            const resultado = await nuevoCliente.save()
            return resultado;

            } catch (error) {
                console.log(error)
            }
        },
        actualizarCliente:async(_,{id, input},ctx)=>{
          
            let cliente = await Cliente.findById(id)
            if(!cliente){throw new Error(`Cliente no encontrado`)}
            
            if(cliente.vendedor.toString()!==ctx.usuario.id){
               
                throw new Error(`No tiene las credenciales`)
                
            }
           
            
            cliente = await Cliente.findOneAndUpdate({_id:id},input,{new:true})

            return cliente
        },
        eliminarCliente:async(_,{id},ctx)=>{
            const cliente = await Cliente.findById(id)
            if(!cliente){throw new Error(`Cliente no encontrado`)}
            if(cliente.vendedor.toString()!==ctx.usuario.id){
               
                throw new Error(`No tiene las credenciales`)
                
            }
            await Cliente.findByIdAndDelete(id)
            return `Cliente Eliminado`
        },
        nuevoPedido:async(_,{input},ctx)=>{
            
            const clienteExiste= await Cliente.findById(input.cliente)
            
            if(!clienteExiste){
                throw new Error(`Cliente no encontrado`)}
            if(clienteExiste.vendedor.toString()!==ctx.usuario.id){
               throw new Error(`No tiene las credenciales`)
            }
            //let total 
            for await(const articulo of input.pedido){
                const {id} =articulo

                const producto = await Producto.findById(id)
                
                if(articulo.cantidad>producto.existencia){
                    throw new Error(`El articulo ${producto.nombre} excede la cantidad en stock`)
                }
                //else{total += producto.precio*articulo.cantidad}
                
            };
            for await(const articulo of input.pedido){
                const {id}= articulo
                const producto = await Producto.findById(id)
                producto.existencia= producto.existencia-articulo.cantidad
                await producto.save()
            }
           
            const pedido = new Pedido(input)
            pedido.vendedor= ctx.usuario.id
            //pedido.total= total
            await pedido.save()
            return pedido
        },
        actualizarPedido: async (_,{id,input},ctx)=>{
            try {
                const pedidoAnterior = await Pedido.findById(id)
                if(!pedidoAnterior){throw new Error('Pedido no Encontrado')}
                console.log(pedidoAnterior)
                console.log(ctx.usuario.id)
                if(pedidoAnterior.vendedor.toString()!==ctx.usuario.id){throw new Error(`No tienes las credenciales`)}
                

                //restauro las existencias de stock 
                for await(const articulo of  pedidoAnterior.pedido){
                    const {id} =articulo
                   
                    const producto = await Producto.findById(id)
                    
                    
                    producto.existencia+=articulo.cantidad
                    console.log(`restaurando a stock original ${producto.nombre} ${producto.existencia}`)
                    await producto.save()
                    
                    
                };


                

                //actualizando el pedido
                for await(const articulo of input.pedido){
                    const {id} =articulo
    
                    const producto = await Producto.findById(id)
                    
                    if(!producto||articulo.cantidad>producto.existencia){
                            for await(const articulo of  pedidoAnterior.pedido){
                            const {id} =articulo
                        
                            const producto = await Producto.findById(id)
                            
                            
                            producto.existencia-=articulo.cantidad
                            console.log(`volviendo al pedido anterior ${producto.nombre} ${producto.existencia}`)
                            await producto.save()
                            
                            
                            };
                        throw new Error(`El articulo ${producto.nombre} excede la cantidad en stock`)
                    }
                    //else{total += producto.precio*articulo.cantidad}
                    //TODO SI el pedido estaba flageado como cancelador decidir que hacer con el stock
                };
                for await(const articulo of input.pedido){
                    const {id}= articulo
                    const producto = await Producto.findById(id)
                    producto.existencia= producto.existencia-articulo.cantidad
                    console.log(`restando ${producto.nombre} ${producto.existencia}`)
                    await producto.save()
                }
               
                
              
                
                const pedidoActualizado =await Pedido.findOneAndUpdate({_id:id}, input,{new :true });
                return pedidoActualizado
                


            } catch (error) {
                console.log(error)
            }
            
        },
        eliminarPedido:async(_,{id},ctx)=>{
            try {
                console.log(`a`)
                const pedido = await Pedido.findById(id)
                if(!pedido){throw new Error('Pedido no Encontrado')}
                if(pedido.vendedor.toString()!==ctx.usuario.id){throw new Error(`No tienes las credenciales`)}
                console.log(`b`)
                
                //TODO SI el pedido estaba flageado como cancelador decidir que hacer con el stock


                for await(const articulo of  pedido.pedido){
                    const {id} =articulo
                   
                    const producto = await Producto.findById(id)
                    
                    
                    producto.existencia+=articulo.cantidad
                    console.log(`restaurando a stock original ${producto.nombre} ${producto.existencia}`)
                    await producto.save()
                    
                    
                };   



                await Pedido.findByIdAndDelete(id)
                return `Pedido Eliminado`
            } catch (error) {
                console.log(error)
            }
        }
    }
    
}


module.exports = resolvers
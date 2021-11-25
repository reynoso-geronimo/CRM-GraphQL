const {gql} = require('apollo-server')
//Schema
const typeDefs= gql` 

 #Usuario
    type Usuario{
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }
    type Cliente{
        id: ID
        nombre: String
        apellido: String
        empresa:String
        email: String
        telefono:String
        creado: String
        vendedor: ID
        
    }
    type Token{
        token:String
    }
    #Producto
    type Producto{
        id: ID
        nombre: String!
        existencia: Int!
        precio: Float!
        creado: String
         
    }
#pedido
    type Pedido{
        id: ID
        pedido: [PedidoGrupo],
        total: Float
        cliente: ID
        vendedor: ID
        creado: String
        estado: EstadoPedido
    }

    type PedidoGrupo{
        id:ID
        cantidad: Int
    }
   
#usuarios
    input UsuarioInput{
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }
    input AutenticarInput{
        email: String!
        password: String!
    }


    #Productos

    

    input ProductoInput{
        nombre: String!
        existencia: Int!
        precio: Float!
        
    }

    #Clientes

    input ClienteInput{
        nombre: String!
        apellido: String!
        empresa:String!
        email: String!
        telefono:String
    }
    
    input PedidoProduictoInput{
        id: ID!
        cantidad: Int!
    }

    input PedidoInput{
        pedido:[PedidoProduictoInput]
        total: Float
        cliente: ID
        vendedor: ID
        estado: EstadoPedido
    }
    enum EstadoPedido{
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    type Query {
        obtenerUsuario(token:String!):Usuario
        obtenerProducto(id:ID!):Producto
        obtenerProductos:[Producto]
        obtenerClientes:[Cliente]
        obtenerClientesVendedor:[Cliente]
        obtenerCliente(id:ID!):Cliente
        obtenerPedidos:[Pedido]
        obtenerPedidosVendedor:[Pedido]
        obtenerPedido(id:ID!):Pedido
    }
    type Mutation{
        #Usuarios
        nuevoUsuario(input:UsuarioInput): Usuario
        autenticarUsuario(input:AutenticarInput): Token

        #Productos
        nuevoProducto(input:ProductoInput): Producto
        actualizarProducto(id: ID!, input:ProductoInput): Producto
        eliminarProducto(id:ID!): String

        #clientes
        nuevoCliente(input:ClienteInput): Cliente
        actualizarCliente(id:ID!, input:ClienteInput!):Cliente
        eliminarCliente(id:ID!): String
        
        #pedidos
        nuevoPedido(input:PedidoInput!):Pedido
        actualizarPedido(id:ID!,input:PedidoInput!):Pedido
        eliminarPedido(id:ID!):String
    }
    
     
    
`;


module.exports = typeDefs
//import dotenv
require('dotenv').config()

//import express
const express = require('express')

//import cors
const cors = require('cors')

//import Router
const router = require('./router')

//import connection
require('./connection')


//create server
const ktu = express()

//user cors
ktu.use(cors())

//parse data - Return middleware that only parses json data
ktu.use(express.json())

//user route
ktu.use(router)

//export uploads folder
const path = require('path');

// Serve the upload folder correctly (from middleware/upload)
ktu.use('/upload', express.static(path.join(__dirname, 'upload')));
// ktu.use('/upload', express.static('./upload'))
//set port
const PORT = 4000 || process.env.PORT

//listen
ktu.listen(PORT, ()=>{
    console.log(`Server is running successfully at PORT ${PORT}`);
})

//to check all the given codes are correct or not
//so we check all four methods get, post, put and delete

ktu.get('/', (req, res)=>{
    // res.send(`Get Request Recieved`)
    res.send(`Get Request Received`)
} )
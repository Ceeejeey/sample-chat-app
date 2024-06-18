const express = require('express')
const bodyparser = require('body-parser');
const { Socket } = require('dgram');

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static(__dirname))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))

const messages = [{
    name: "gihan",
    message:"hii"
}]

app.get('/messages', (req , res) =>{
    res.send(messages)
})

app.post('/messages', (req , res) =>{
    console.log(req.body)
    io.emit('message' , req.body)
    messages.push(req.body)
    res.sendStatus(200)
})

io.on('connect' , (Socket) =>{
    console.log("user connected")
})

const server = http.listen(3000 , () =>{
    console.log("server is running on port" , server.address().port)
})




const express = require('express')
const bodyparser = require('body-parser');
const { Socket } = require('dgram');
const mongoose = require('mongoose')

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static(__dirname))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))

const dbUrl = "mongodb+srv://gihanvimukthi19:VQjgCTIHmSILzj3M@cluster0.byx59wk.mongodb.net/learning-node"


app.get('/messages', (req , res) =>{
    Message.find({}).then((err, messages) => {
        res.send(messages)
    })

    
})

const Message = mongoose.model('Message' , {
    name: String,
    message: String
})

app.post('/messages', (req, res) => {
    const message = new Message(req.body);

    message.save()
        .then(() => {
            io.emit('message', req.body);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.error('Error saving message:', err);
            if (!res.headersSent) { // Ensure headers are not already sent
                res.sendStatus(500);
            }
        });
});


io.on('connect' , (Socket) =>{
    console.log("user connected")
})

mongoose.connect(dbUrl).then(() =>{
    console.log("mongodb connected")
})

const server = http.listen(3000 , () =>{
    console.log("server is running on port" , server.address().port)
})




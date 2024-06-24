const express = require('express');
const bodyparser = require('body-parser');
const { Socket } = require('dgram');
const mongoose = require('mongoose');
const { error } = require('console');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// For serving static files from the current directory
app.use(express.static(__dirname));

// For parsing application/json
app.use(bodyparser.json());

// For parsing application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }));

const dbUrl = "mongodb+srv://gihanvimukthi19:VQjgCTIHmSILzj3M@cluster0.byx59wk.mongodb.net/learning-node";

// GET method to retrieve messages from the database and send them to the frontend
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.send(messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.sendStatus(500); // Send a 500 Internal Server Error status code
    }
});


// Setup the mongoose Message model
const Message = mongoose.model('Message', {
    name: String,
    message: String
});

// POST method to save messages from the frontend to the database and filter bad messages
app.post('/messages', async (req, res) => {
    const message = new Message(req.body);

    try {
        await message.save(); // Save the message to the database

        // Check for censored messages
        const badMessage = await Message.findOne({ message: 'badword' });

        if (badMessage) {
            console.log('Censored data found', badMessage);
            await Message.deleteOne({ _id: badMessage.id }); // Delete the censored message
            console.log('Removed message');
        } else {
            io.emit('message', req.body); // Emit the message to all connected clients
        }
        res.sendStatus(200); // Send a response indicating the message was successfully handled

    } catch (err) {
        console.error('Error saving message:', err);
        if (!res.headersSent) { // Ensure headers are not already sent
            res.sendStatus(500); // Send an error response
        }
    }
});

// Check user connection status with socket.io
io.on('connect', (socket) => {
    console.log("User connected");
});

// Check database connectivity
mongoose.connect(dbUrl).then(() => {
    console.log("MongoDB connected");
});

// Setup the server
const server = http.listen(3000, () => {
    console.log("Server is running on port", server.address().port);
});

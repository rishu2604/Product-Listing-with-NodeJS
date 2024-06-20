let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer); // httpServer is the server created in app.js and passed to socket.js to be used by socket.io to listen to incoming connections and emit events to all connected clients 
        return io; // return the io object to be used in other parts of the application 
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
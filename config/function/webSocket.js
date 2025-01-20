const WebSocket = require('ws');

module.exports = ({ strapi }) => {
  const wss = new WebSocket.Server({ server: strapi.server.httpServer });

  wss.on('connection', (ws) => {
    console.log('A user connected');

    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
      // Echo the message back to the client
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    });

    ws.on('close', () => {
      console.log('A user disconnected');
    });
  });
};
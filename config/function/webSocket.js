const WebSocket = require('ws');

module.exports = ({ strapi }) => ({
  initialize() {
    // Create WebSocket server attached to the Strapi server
    const wss = new WebSocket.Server({ server: strapi.server });

    wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.on('message', async (message) => {
        try {
          const parsedMessage = JSON.parse(message);

          if (parsedMessage.type === 'auth') {
            // Validate the JWT token using Strapi's services
            try {
              const [scheme, token] = parsedMessage.token.split(' ');
              const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
              const user = await strapi.entityService.findOne('plugin::users-permissions.user', id);
              
              if (!user) {
                throw new Error('User not found');
              }

              ws.token = token;
              ws.userId = user.id;
              console.log('User authenticated:', user.username);
            } catch (error) {
              console.error('Authentication failed:', error);
              ws.close();
            }
          } else {
            // Handle regular messages
            console.log(`Received: ${parsedMessage.content}`);

            // Save the message to the database using Strapi's service
            try {
              const entry = await strapi.entityService.create('api::message.message', {
                data: {
                  content: parsedMessage.content,
                  user: ws.userId,
                }
              });

              console.log('Message saved:', entry);

              // Echo the message back to the client
              ws.send(JSON.stringify({ content: `Server: ${parsedMessage.content}` }));
            } catch (error) {
              console.error('Error saving message:', error);
            }
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }
});

module.exports = ({ strapi }) => {
  // Initialize WebSocket when Strapi starts
  strapi.config.get('function.websocket').initialize();
}; 
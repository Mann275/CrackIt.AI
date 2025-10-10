const { override, addWebpackPlugin } = require('customize-cra');

module.exports = override(
  (config) => {
    // Disable hot module replacement WebSocket
    if (config.devServer) {
      config.devServer.hot = false;
      config.devServer.liveReload = false;
    }
    
    // Remove WebSocket client
    config.entry = config.entry.filter(entry => 
      !entry.includes('webpack-dev-server/client')
    );
    
    return config;
  }
);
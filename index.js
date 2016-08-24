// create the default export based on environment variables
module.exports = require('./src/gencfg')()

// named exports for all 4 flavors/types of configs
module.exports.development = {
  server: require('./development/server'),
  client: require('./development/client'),
}

module.exports.production = {
  server: require('./production/server'),
  client: require('./production/client'),
}

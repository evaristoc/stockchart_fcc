'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/stockchartfcc-dev'
    //uri:process.env.MONGOLAB_URI
  },

  seedDB: true
};

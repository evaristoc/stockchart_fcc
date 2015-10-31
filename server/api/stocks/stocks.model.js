'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StocksSchema = new Schema({
  ticker: String,
  active: Boolean
});

module.exports = mongoose.model('Stocks', StocksSchema);'use strict';
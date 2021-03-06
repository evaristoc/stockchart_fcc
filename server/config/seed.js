/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');


Thing.find({}).remove(function() {
  Thing.create({
    name : 'GOOG',
    info : 'Google Inc'
  }, {
    name : 'FB',
    info : 'Facebook Inc'
  }, {
    name : 'SP',
    info : 'StandardPoor index'
  });
});

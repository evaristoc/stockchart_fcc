/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Stocks = require('./stocks.model');

exports.register = function(socket) {
  Stocks.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Stocks.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('stocks:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('stocks:remove', doc);
}
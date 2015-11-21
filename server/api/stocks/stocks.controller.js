'use strict';

var _ = require('lodash');
var Stocks = require('./stocks.model');

// Get list of stocks
exports.index = function(req, res) {
  Stocks.find(function (err, tickers) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(tickers);
  });
};

//// Get a single stocks
//// Not needed... we are representing all existing tickers
//exports.show = function(req, res) {
//  Stocks.findById(req.params.id, function (err, stocks) {
//    if(err) { return handleError(res, err); }
//    if(!stocks) { return res.status(404).send('Not Found'); }
//    return res.json(stocks);
//  });
//};

//http://jsfiddle.net/sebmade/swfjT/light/
// Creates a new stocks in the DB.
// Here I will take care of the symbols in DB... symbols that don't exists, at the browser using the api
exports.create = function(req, res) {
  var ticker = req.body.ticker.toUpperCase();
  Stocks.findOne({ticker:ticker}, function(err, ticker){
    if(err) { return handleError(res, err); }
    if (ticker) return res.status(403).send('Symbol (ticker) already exists.');
    Stocks.create({ticker: ticker}, function(err){
        if (err) return handleError(res, err);
        //res.send(200);
        Stocks.find(function (err, tickers) {
          if(err) { return handleError(res, err); }
          return res.status(200).json(tickers);
        });         
    })
  });
};

//// Updates an existing stocks in the DB.
//// no update for this project...
//exports.update = function(req, res) {
//  if(req.body._id) { delete req.body._id; }
//  Stocks.findById(req.params.id, function (err, stock) {
//    if (err) { return handleError(res, err); }
//    if(!stocks) { return res.status(404).send('Not Found'); }
//    var updated = _.merge(stocks, req.body);
//    updated.save(function (err) {
//      if (err) { return handleError(res, err); }
//      Stocks.find(function (err, tickers) {
//        if(err) { return handleError(res, err); }
//        return res.status(200).json(tickers);
//      });    
//      //return res.status(200).json(stocks);
//    });
//  });
//};

// Deletes a stocks from the DB.
// Here we destroy the tickers that people decide to destroy...
exports.destroy = function(req, res) {
  Stocks.findById(req.params.id, function (err, ticker) {
    if(err) { return handleError(res, err); }
    if(!ticker) { return res.status(404).send('Not Found'); }
    ticker.remove(function(err) {
      if(err) { return handleError(res, err); }
        Stocks.find(function (err, tickers) {
          if(err) { return handleError(res, err); }
          return res.status(200).json(tickers);
        });       
      //return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
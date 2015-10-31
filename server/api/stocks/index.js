'use strict';

var express = require('express');
var controller = require('./stocks.controller');

var router = express.Router();

router.get('/', controller.index);
//router.get('/:id', controller.show); No this one
router.post('/', controller.create);
//router.put('/:id', controller.update); No this one
//router.patch('/:id', controller.update); No this one
router.delete('/:id', controller.destroy); // to modify to check for ticker, no id...??

module.exports = router;
'use strict';
//http://www.angularjshub.com/examples/modules/configurationrunphases/
angular.module('stockchartFccApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/stocks', {
        templateUrl: 'app/stocks/stocks.html',
        controller: 'StocksCtrl'
      });
  });

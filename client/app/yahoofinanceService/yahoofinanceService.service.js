'use strict';

//https://docs.angularjs.org/api/ng/service/$http
//https://docs.angularjs.org/api/ng/service/$q
//http://fdietz.github.io/recipes-with-angular-js/consuming-external-services/deferred-and-promise.html
//http://andyshora.com/promises-angularjs-explained-as-cartoon.html
//http://blog.xebia.com/2014/02/23/promises-and-design-patterns-in-angularjs/
angular.module('stockchartFccApp')
  .service('yahoofinanceService', function ($http, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    // builds the url used to fetch the data using YQL
    // https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20%28%27GOOG%27,%20%27FB%27%29%20and%20startDate=%272015-09-1%27%20and%20endDate=%272015-9-10%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys
    function buildQuery(tickers, startDate, endDate) {
      //encodeURIComponent
      var headurl = "https://query.yahooapis.com/v1/public/yql?q=";
      var queryurl = "select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20%28"+tickers+"%29%20and%20startDate=%27"+startDate+"%27%20and%20endDate=%27"+endDate+"%27";
      var cburl = "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";

      return headurl+queryurl+cburl;
    }
    
    return {
        performQuery : function(tickers, startDate, endDate) {
          var deferred = $q.defer();
          var data = [];
          var query = buildQuery(tickers, startDate, endDate);
          //console.log('query ',query);    
          $http.get(query).success(function(res) {
            // get rid of unused info and keep date and close price
            if (res.query.results==null) {
              //var data = [];
              return data;
            }
            var data = res.query.results.quote
              .map(function(item) {
                //var dateArr = item.Date.split('-');
                // javascipt months are zero-based
                //dateArr[1]--;
                //return [Date.UTC.apply(Date, dateArr), Number(item.Close)];
                return {ticker:item.Symbol, date:item.Date, close:Number(item.Close)}
              })
              ;
    
            //data = {
            //  name: symbol,
            //  data: data.reverse(),
            //};
    
            // they're waiting for the data
            deferred.resolve(data);
          })
          .error(function(err) {
            console.error(err);
            deferred.reject(err);
          });
    
          // I promise you'll get the data :)
          return deferred.promise;
        }
    }
  });

//angular.module('stockchartFccApp')
//  .service('yahoofinanceService', function ($http, $q) {
//    function buildQuery(tickers, startDate, endDate) {
//      //encodeURIComponent
//      var headurl = "https://query.yahooapis.com/v1/public/yql?q=";
//      var queryurl = "select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20%28"+tickers+"%29%20and%20startDate=%27"+startDate+"%27%20and%20endDate=%27"+endDate+"%27";
//      var cburl = "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
//
//      return headurl+queryurl+cburl;
//    }
//    
//    return {
//        performQuery : function(tickers, startDate, endDate) {
//          var query = buildQuery(tickers, startDate, endDate);
//          //console.log('query ',query);    
//          $http.get(query).success(function(res) {
//            // get rid of unused info and keep date and close price
//            var data = res.query.results.quote
//              .map(function(item) {
//                //var dateArr = item.Date.split('-');
//                // javascipt months are zero-based
//                //dateArr[1]--;
//                //return [Date.UTC.apply(Date, dateArr), Number(item.Close)];
//                return {ticker:item.Symbol, date:item.Date, close:Number(item.Close)}
//              });
//          });
//        },
//    }
//    //// Public API here
//    //return {
//    //  fetch: performQuery
//    //};
//  });
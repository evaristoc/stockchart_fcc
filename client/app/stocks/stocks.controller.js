'use strict';

angular.module('stockchartFccApp')
    .controller('StocksCtrl',['$scope', '$http', 'socket','yahoofinanceService', function ($scope, $http, socket, yahoofinanceService) {
        $scope.message = 'Hello';
        $scope.awesomeStocks = [];
        $scope.duplicate = "";
        $scope.notfound = "";
        
        $http.get('/api/things').success(function(awesomeStocks) {
            $scope.awesomeStocks = awesomeStocks;
            var tickers = awesomeStocks.reduce(function(pv, v){
                    return pv+',%20%27'+v.name+'%27%20'
                },[]).slice(1)
            //var inidatestart = '2015-10-1';
            //var inidateend = '2015-10-30';
            var msg = 'Error';
            yahoofinanceService
                .performQuery(tickers, $scope.date.start, $scope.date.end)
                .then(function success(data){
                    //console.log("in the get function...", data);
                    $scope.stockdata = data;
            });

            $scope.updateDate = function(){
                var start = $scope.date.start;
                var end = $scope.date.end;
                console.log(tickers, $scope.date.start, $scope.date.end);
                yahoofinanceService
                    .performQuery(tickers, $scope.date.start, $scope.date.end)
                    .then(function success(data){
                        console.log("changed date...", data);
                        $scope.stockdata = data;
                    })
                    .catch(function(e){
                        console.log(e)
                    });
            }
            
            $scope.updateDate();
            
            socket.syncUpdates('thing', $scope.awesomeStocks);
        }); //<--- close the service!!
        
        
        $scope.addStock = function() {

            if($scope.newStock === '') {return;};
            if($scope.newStock === undefined){
                $scope.duplicate = "";
                $scope.notfound = "No found stock with that symbol.";
                return;
            };
            var ticker = "%20%27"+$scope.newStock.toUpperCase()+"%27%20"; //<-- preparing format for a query to yahoo finance...
            //if in the current list, validate as duplicate
            var stock = $scope.newStock.toLocaleUpperCase();
            if (_.find($scope.awesomeStocks, {name: stock})) {
              $scope.notfound = "";
              $scope.duplicate = "That stock is already being tracked.";
              return;
            }            
            $scope.notfound = "";
            $scope.duplicate = "";
            console.log(ticker, $scope.date.start, $scope.date.end);
            yahoofinanceService
                .performQuery(ticker, $scope.date.start, $scope.date.end)
                .then(function success(data){
                    if (data == []) {
                        return;
                    }else{
                        $http.post('/api/things', { name: $scope.newStock.toUpperCase() });
                    }
                    $scope.newStock = '';
                    //console.log(data);
                    //$scope.stockdata = data;
                    $http.get("/api/things/").success(function(awesomeStocks) {
                        $scope.awesomeStocks = awesomeStocks;
                        var tickers = awesomeStocks.reduce(function(pv, v){
                            return pv+',%20%27'+v.name+'%27%20'
                        },[]).slice(1)
                        //var inidatestart = '2015-10-1';
                        //var inidateend = '2015-10-30';
                        var msg = 'Error';
                        yahoofinanceService
                            .performQuery(tickers, $scope.date.start, $scope.date.end)
                            .then(function success(data){
                             //console.log(data);
                             $scope.stockdata = data;
                        });
                    })
                });
        };
            
        $scope.deleteStock = function(stock) {
            console.log(stock._id);
            $http.delete('/api/things/' + stock._id);
            $scope.newStock = '';
            //console.log(data);
            //$scope.stockdata = data;
            $http.get("/api/things/").success(function(awesomeStocks) {
                $scope.awesomeStocks = awesomeStocks;
                var tickers = awesomeStocks.reduce(function(pv, v){
                    return pv+',%20%27'+v.name+'%27%20'
                },[]).slice(1)
                //var inidatestart = '2015-10-1';
                //var inidateend = '2015-10-30';
                var msg = 'Error';
                yahoofinanceService
                    .performQuery(tickers, $scope.date.start, $scope.date.end)
                    .then(function success(data){
                     //console.log(data);
                     $scope.stockdata = data;
                });
            })
        };
        
        $scope.$on('$destroy', function () {
            socket.unsyncUpdates('thing');
        });
    }]);

//$http.get("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20%28"+tickers+"%29%20and%20startDate=%27"+startDate+"%27%20and%20endDate=%27"+endDate+"%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=")
//.success(function(resp){
//  $scope.stockdata = resp.dataset.data;
//  });
//$http.get("https://www.quandl.com/api/v3/datasets/WIKI/FB.json?order=asc&exclude_headers=true&trim_start=2014-03-11&column_index=4&auth_token=p5yEmuXHuJ2SB7cXjLHw")
//.success(function(resp){
//  $scope.stockdata = resp.dataset.data;
//  });


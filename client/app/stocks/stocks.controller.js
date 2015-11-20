'use strict';

angular.module('stockchartFccApp')
    .controller('StocksCtrl',['$scope', '$http', 'socket','yahoofinanceService', function ($scope, $http, socket, yahoofinanceService) {
        $scope.message = 'Hello';
        $scope.awesomeStocks = [];

        
        
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
                    //console.log(data);
                    $scope.stockdata = data;
            });

            $scope.updateDate = function(){
                var start = $scope.date.start;
                var end = $scope.date.end;
                console.log($scope.date.start, $scope.date.end);
                yahoofinanceService
                    .performQuery(tickers, $scope.date.start, $scope.date.end)
                    .then(function(data){
                        console.log(data);
                        //not a problem for the moment...
                        //$scope.stockdata = data;
                    })
                    .catch(function(e){
                        console.log(e)
                    });
            }
        
            socket.syncUpdates('thing', $scope.awesomeStocks);
        }); //<--- close the service!!
        
        $scope.addStock = function() {
            if($scope.newStock === '') {
            // an error handling? an alert?
            //console.log(date.start, date.end);
                return;
            };
            //yahoofinanceService.PerformQuery();
            var ticker = "%20%27"+$scope.newStock.toUpperCase()+"%27%20";
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
            $http.delete('/api/things/' + stock._id);
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


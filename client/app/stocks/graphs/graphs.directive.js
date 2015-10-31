'use strict';
//http://cloudspace.com/blog/2014/03/25/creating-d3.js-charts-using-angularjs-directives/#.Vi-GGbxVKlM
//http://www.sitepoint.com/creating-charting-directives-using-angularjs-d3-js/
//http://www.ng-newsletter.com/posts/d3-on-angular.html
//https://masteringmean.com/lessons/400-Working-with-Data-and-D3js
//http://dc-js.github.io/dc.js/
//http://findsupport.xyz/question/31661809/dc-js-and-d3-js-chart-update
//http://www.d3noob.org/2014/03/dynamically-retrieve-historical-stock.html
angular.module('stockchartFccApp')
  .directive('linearChart', ['$window', 'd3Service', function ($window, d3Service) {
    return {
      template: "<svg width='850' height='200'></svg>",
      restrict: 'EA',
      scope:{chartData: '='},
      link: function (scope, element, attrs) {
        element.text('this is the graphs directive');
        //console.log('this is attrs.chartData ', attrs.chartData);
        //console.log('this is chartData ',scope);
        //console.log('the serviced factory ', d3Service);
        d3Service.d3().then(function(d3) {
          scope.render = function(data){
            //var salesDataToPlot=scope[attrs.chartData];
            var salesDataToPlot = data;
            //console.log('inside serviced d3; here d3', d3);
            //console.log('salesDataToPlot ',salesDataToPlot);
            var pathClass = "path";
            var xScale, yScale, xAxisGen, yAxisGen, lineFun;

            
            var margin = {top: 20, right: 20, bottom: 30, left: 40},
             width = 480 - margin.left - margin.right,
             height = 360 - margin.top - margin.bottom,
             padding = 20; 
            
            // helper function
            function getDate(d) {
                return new Date(d);
            }
            
            // Format and Parse the date / time
            var format = d3.time.format("%d/%m/%Y");
            var parseDate = d3.time.format("%y-%b-%d").parse;
            

            // Set the ranges
            var minDate = getDate(data[0][0]),
                maxDate = getDate(data[data.length-1][0]);
            //console.log(minDate, maxDate);
            
            
            var svg = d3.select(element[0])
              .append("svg")
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
              
            //var d3 = $window.d3;
            //var rawSvg = element.find("svg")[0];
            //var svg = d3.select(rawSvg);
            //console.log(element.find("svg"));
            //var svg = d3.select(element[0]);
            
            
            function setChartParameters(){
              //var xScale = d3.scale.ordinal()
              //            .domain(d3.range(salesDataToPlot.length))
              //            .rangeRoundPoints([0, width]);
              
              //var xScale = d3.scale.linear()
              //            .domain([0, salesDataToPlot.length])
              //            .range([0, width]);

              var xScale = d3.time.scale()
                          //.domain([0, d3.max(data, function(d) {return d[1];})])
                          .domain([minDate, maxDate]).range([0, width])
                          .range([0, width]);
              
              var yScale = d3.scale.linear()
                          .domain([0, d3.max(data, function(d) {return d[1];})])
                          .range([height, 0]);

              //var xAxisGen = d3.svg.axis()
              //    .scale(xScale)
              //    .orient("bottom")
              //    .ticks(5)
              //    .tickFormat(format);

              var yAxisGen = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .ticks(10);
      
            
                  
             // xScale = d3.scale.linear()
             //            .domain([salesDataToPlot[0].hour, salesDataToPlot[salesDataToPlot.length - 1].hour])
             //            .range([padding + 5, rawSvg.clientWidth - padding]);
             //
             // yScale = d3.scale.linear()
             //   .domain([0, d3.max(salesDataToPlot, function (d) {
             //     return d.sales;
             //   })])
             //.range([rawSvg.clientHeight - padding, 0]);
            
              //xAxisGen = d3.svg.axis()
              //             .scale(xScale)
              //             .orient("bottom")
              //             .ticks(salesDataToPlot.length - 1);
              //
              //yAxisGen = d3.svg.axis()
              //             .scale(yScale)
              //             .orient("left")
              //             .ticks(5);
              var count = 0;
              lineFun = d3.svg.line()
                          .x(function (d) {
                            return xScale(getDate(d[0]));
                          })
                          .y(function (d) {
                            return yScale(d[1]);
                          })
                          .interpolate("basis");
            }
                     
            function drawLineChart() {
            
              //setChartParameters();


              var xScale = d3.time.scale()
                          //.domain([0, d3.max(data, function(d) {return d[1];})])
                          .domain([minDate, maxDate]).range([0, width])
                          .range([0, width]);
              
              var yScale = d3.scale.linear()
                          .domain([0, d3.max(data, function(d) {return d[1];})])
                          .range([height, 0]);

              var xAxisGen = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")
                  .ticks(5)
                  .tickFormat(format);

              var yAxisGen = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .ticks(10);              

              lineFun = d3.svg.line()
                          .x(function (d) {
                            return xScale(getDate(d[0]));
                          })
                          .y(function (d) {
                            return yScale(d[1]);
                          })
                          .interpolate("basis");
              
           
               svg.append("svg:path")
                  .attr({
                    d: lineFun(salesDataToPlot),
                    "stroke": "blue",
                    "stroke-width": 2,
                    "fill": "none",
                    "class": pathClass
               });
                    
               svg.append("svg:g")
                  .attr("class", "y axis")
                  .attr("transform", "translate(20,0)")
                  .call(yAxisGen);

              svg.append("svg:g")
                 .attr("class", "x axis")
                 .attr("transform", "translate(0,180)")
                 .call(xAxisGen);

            };
            
            drawLineChart();
          };
        
          scope.$watch('chartData', function(){
            //console.log("data ",scope.chartData);
            scope.render(scope.chartData);  
          })
        
        });        

      }
    };
  }]);
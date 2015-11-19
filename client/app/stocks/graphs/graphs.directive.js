'use strict';
//http://cloudspace.com/blog/2014/03/25/creating-d3.js-charts-using-angularjs-directives/#.Vf04frylilM
angular.module('stockchartFccApp')
    .directive('linearChart', ['$window', 'd3Service', function ($window, d3Service) {
        return {
            restrict: 'EA',
            scope: {chartData: '='},
            //http://www.sitepoint.com/creating-charting-directives-using-angularjs-d3-js/
            template:"<svg width='850' height='1200'></svg>",
            link: function(scope, elem, attrs) {
                //console.log(scope.$watch('chartData', function(){
                //    console.log(scope.chartData);
                //}
                //));
                d3Service.d3().then(function(d3) {
                    elem.text('this is the graphs directive');
                    
                    scope.rendere = function(data){
                        console.log('success')
                    }
                    
                    scope.render = function(data){
                        // organising dates http://stackoverflow.com/questions/7114152/given-a-start-and-end-date-create-an-array-of-the-dates-between-the-two
                        //http://stackoverflow.com/questions/3894048/what-is-the-best-way-to-initialize-a-javascript-date-to-midnight
                        //var salesDataToPlot=scope[attrs.chartData];
                        
/////////////////////////////////////////////////////////////////////
//SETTING UP THE SVG ATTRIBUTES AND OTHER FORMATTING
                        //console.log('inside serviced d3; here d3', d3);
                        //console.log('salesDataToPlot ',salesDataToPlot);
                        var pathClass = "path";
                        var xScale, yScale, xAxisGen, yAxisGen, lineFun;
                        
                        
                        var margin = {top: 20, right: 20, bottom: 30, left: 40},
                         width = 480 - margin.left - margin.right,
                         height = 360 - margin.top - margin.bottom,
                         padding = 20,
                         p = [20, 50, 30, 50]; 
                    


                        // helper function
                        function getDate(d) {
                            return new Date(d).setHours(0,0,0,0);
                        }
                        
                        // Format and Parse the date / time
                        var format = d3.time.format("%d/%m/%Y");
                        var parseDate = d3.time.format("%y-%b-%d").parse;

                        var tickers = {};
                        data.forEach(function(t){
                                //console.log(t);
                                if (tickers.hasOwnProperty(t.ticker)) {
                                    tickers[t.ticker][getDate(t.date)] = t.close;
                                }else{
                                    tickers[t.ticker] = {};
                                }
                            });
                        console.log(tickers['GOOG']);

///////////////////////////////////////////////////////////////////////
//FUNCTIONS
//CREATE RANGES
                        function findRanges(tickers){
                            var daterange = [];
                            var ms = [];
                            var datekeys = Object.keys(tickers);
                            datekeys.forEach(function(dk){
                                //console.log(dk);
                                if (tickers.hasOwnProperty(dk)) {
                                    var dkk = Object.keys(tickers[dk]);
                                    //console.log(dkk);
                                    ms.push(dkk.length);
                                    dkk.forEach(function(d){
                                        //console.log(daterange.indexOf(Number(d)) == -1, d);
                                        daterange.indexOf(Number(d)) == -1? daterange.push(Number(d)):false;
                                    });
                                };
                            });
                            ms = ms.sort(function(a,b){return a-b});
                            daterange = daterange.sort(function(a,b){return a-b});
                            console.log(ms);
                            console.log(daterange);
                            var min_m = Math.min.apply(null, ms);
                            var max_m = Math.max.apply(Math, ms);
                            var stdate = Math.min.apply(Math, daterange);
                            var endate = Math.max.apply(Math, daterange);
                            //var min_m = ms[0];
                            //var max_m = ms[ms.length-1];
                            //var stdate = daterange[0];
                            //var endate = daterange[daterange.length-1];
                            //console.log(min_m);
                            return [max_m, min_m, stdate, endate, daterange]
                        };

                        var max_m = findRanges(tickers)[0];
                        var min_m = findRanges(tickers)[1];
                        var stdate = findRanges(tickers)[2];
                        var endate = findRanges(tickers)[3];
                        var daterange = findRanges(tickers)[4];
                        console.log(max_m, min_m, stdate, endate, daterange);    
                       
//BUILD THE REQUIRED DATA STRUCTURE FOR THE STAKED GRAPH
                        //NOTE: try to remember that it is MATRIX OF COLUMNS!!!
                        function dataBuilding(tickers, daterange){
                            //console.log(tickers, daterange);
                            var matrix = [];
                            var tks = Object.keys(tickers);
                            tks.forEach(function(tk){
                                var column = [];
                                var pos = 1;
                                daterange.forEach(function(dk){
                                    console.log(dk);
                                    if (tickers.hasOwnProperty(tk)) {
                                        if (tickers[tk].hasOwnProperty(dk)){
                                            column.push({x:pos, y:tickers[tk][dk]})
                                        }else{
                                            column.push({x:pos, y:0})
                                        };
                                    };
                                    pos++;
                                });
                                matrix.push(column);
                            });
                            return matrix;
                        };

                        var matrix_data = dataBuilding(tickers, daterange);
                        var ddata = data;
console.log('this is the render function of the directive ', matrix_data[0]);                     
///////////////////////////////////////////////////////////////////////
//DECLARING THE SVG OBJECT
                        var svg = d3.select(elem[0])
                            .append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");

                       

/////////////////////////////////////////////////////////////////////////
//INITIALISING DATA
//The data already comes in form as suggested by ttp://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5
//The only problem are the DATES          


////Test
//function bumpLayer(n, o) {
//
//  function bump(a) {
//    var x = 1 / (.1 + Math.random()),
//        y = 2 * Math.random() - .5,
//        z = 10 / (.1 + Math.random());
//    for (var i = 0; i < n; i++) {
//      var w = (i / n - y) * z;
//      a[i] += x * Math.exp(-w * w);
//    }
//  }
//
//  var a = [], i;
//  for (i = 0; i < n; ++i) a[i] = o + o * Math.random();
//  for (i = 0; i < 5; ++i) bump(a);
//  return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
//}
//
//
//var n = 4, // number of layers
//    m = 58, // number of samples per layer
//    stack = d3.layout.stack(),
//    layers = stack(d3.range(n).map(function() { return bumpLayer(m, .1); })),
//    yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
//    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
//console.log(layers, yGroupMax, yStackMax);
                            
/////////////////////////////////////////////////////////////////////////
//INITIALISING D3 GRAPH OBJECTS

                        //http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value

                        var n = matrix_data[0].length;
                        console.log(n);
                        //var color_range = d3.scale
                        //    .linear()
                        //    .domain([0, n - 1])
                        //    .range(["#aad", "#556"]);
                        
                        //colouring as in http://bl.ocks.org/mbostock/1134768
                        var color_range = d3.scale
                            .category10();
                        //console.log(color_range);
                                                
                        //NOTE: initialising the data matrix as a stack
                        var stack = d3.layout.stack();
                        var layers = stack(matrix_data);
                        var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
                        var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
                        console.log(layers, yGroupMax, yStackMax);
                        
                        //NOTE: scaling the VALUES of X axis
                        var x = d3.scale
                            .ordinal()
                            .domain(d3.range(max_m))
                            .rangeRoundBands([0, width - margin.right - margin.left]);
                        
                        //NOTE: scaling the LABELS of the X axis
                        var xdate = d3.time
                            .scale()
                            .domain([stdate, endate])
                            .range([0, width - margin.right - margin.left]);

                        //NOTE: initialising the X AXIS
                        var xAxis = d3.svg.axis()
                            .scale(xdate)
                            .tickSize(0)
                            .tickPadding(6)
                            .orient("bottom")
                            .ticks(5)
                            .tickFormat(format);             


                        //NOTE: scaling the VALUES of Y axis
                        var y = d3.scale
                            .linear()
                            .domain([0, yStackMax])
                            .range([height, 0]);
                        
                        
                        //NOTE: initialising the Y AXIS
                        var yAxis = d3.svg.axis()
                            .scale(y)
                            .orient("left")
                            .ticks(5);

                        
                        //NOTE: initialising the VALUES into the SVG CONTAINER
                        // Also, assigning COLOURS
                        var valgroup = svg.selectAll("g.valgroup")
                            .data(layers)
                            .enter()
                            .append("svg:g")
                            .attr("class", "valgroup")
                            .style("fill", function(d, i) { console.log(color_range(i)); return color_range(i); })
                            .style("stroke", function(d, i) { return d3.rgb(color_range(i)).darker(); });          
                            

                        //NOTE: initialising LEGENDS    
                        var legendRectSize = 20;
                        var legendSpacing = 5;
                        
                        var legend = d3.select('svg')
                            .append("g")
                            .selectAll("g")
                            .data(color_range.domain())
                            .enter()
                            .append('g')
                            .attr('class', 'legend')
                            .attr('transform', function(d, i) {
                                var height = legendRectSize;
                                var x = 405;
                                //var y = i;
                                var y = i * height;
                                return 'translate(' + x + ',' + y + ')';
                              });
                        
                        var tickersname = Object.keys(tickers);
                      

/////////////////////////////////////////////////////////////////////////
//DRAWING AND ANIMATION

                        //NOTE: the values are now AVAILABLE to the figures
                        // this one creates the BARS, and it is a reusable functionality
                        var rect = valgroup.selectAll("rect")
                            .data(function(d){return d;})
                            .enter().append("svg:rect")
                            .attr("x", function(d) { return x(d.x); })
                            .attr("y", height)
                            .attr("width", x.rangeBand())
                            .attr("height", 0);

                        //NOTE: drawing the legend
                        legend.append('rect')
                            .attr('width', legendRectSize)
                            .attr('height', legendRectSize)
                            .style('fill', color_range)
                            .style('stroke', color_range);
 
                        legend.append('text')
                            .attr('x', legendRectSize + legendSpacing)
                            .attr('y', legendRectSize - legendSpacing)
                            .text(function(d) { return tickersname[d]; });
                                               
                        //NOTE: initialising the ANIMATION
                        //starts as stacked...
                        rect.transition()
                            .delay(function(d, i) { return i * 10; })
                            .attr("y", function(d) { return y(d.y0 + d.y); })
                            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });
                        
                        //NOTE: drawing the X AXIS
                        svg.append("g")
                            .attr("class", "xaxis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);
                        
                        
                        //NOTE: drawing the Y AXIS
                        console.log(width - margin.left);
                        var yaxis_pos = width - margin.left
                        
                        svg.append("g")
                            .attr("class", "yaxis")
                            .call(yAxis)
                            //.attr("transform", "translate(" + yaxis_pos + ",0)")
                            .append("text")
                                .attr("transform", "rotate(-90)")
                                .attr("y", 6)
                                .attr("dy", ".71em")
                                .style("text-anchor", "end")
                                .text("close price ($)")
                        
                      
                        //NOTE: responding to events: state and function    
                        d3.selectAll("input")
                            .on("change", change);
                        
                        console.log(0, yAxis);
                        
                        var timeout = setTimeout(function() {
                            d3.select("input[value=\"grouped\"]")
                            .property("checked", true)
                            .each(change);
                        }, 2000);
                        
                        // from stacked to automatically grouped
                        function change() {
                            clearTimeout(timeout);
                            if (this.value === "grouped") transitionGrouped();
                            else transitionStacked();
                        };
                        
                        function rescale(yrange) {
                            console.log(yrange);
                            svg.select(".yaxis")
                                .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                                .call(yrange);  
                            svg.select(".yaxis label")
                                //.text("Rescaled Axis");
                        };

                        function transitionGrouped() {
                            y.domain([0, yGroupMax]);
                            yAxis.scale(y);
                            //svg.select(".yaxis").remove();
                            rect.transition()
                                .duration(500)
                                .delay(function(d, i) { return i * 10; })
                                .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
                                .attr("width", x.rangeBand() / n)
                                .transition()
                                .attr("y", function(d) { return y(d.y); })
                                .attr("height", function(d) { return height - y(d.y); });
                        
                            rescale(yAxis);
                        };
                        
                        function transitionStacked() {
                            y.domain([0, yStackMax]);
                            yAxis.scale(y);
                            //svg.select(".yaxis").remove();
                            rect.transition()
                                .duration(500)
                                .delay(function(d, i) { return i * 10; })
                                .attr("y", function(d) { return y(d.y0 + d.y); })
                                .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
                                .transition()
                                .attr("x", function(d) { return x(d.x); })
                                .attr("width", x.rangeBand());
                            
                            rescale(yAxis);
                        };                            

                    };


                    scope.$watch('chartData', function(){
                        console.log("data inside the directive",scope.chartData[0]);
                        scope.render(scope.chartData);  
                    });


                });
            }
        }
    }
]);
///////////////////////////////////////////////////////////////////////////////

// based on http://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5
// based on http://stackoverflow.com/questions/8301531/dealing-with-dates-on-d3-js-axis
// based on http://codepen.io/sandeepguggu/pen/bnwos
// Set the dimensions of the canvas / graph


////dataService.data().then(function(data){console.log('IN ANGULAR ',data)});
//console.log('Before dataService call...');
////http://stackoverflow.com/questions/20584367/how-to-handle-resource-service-errors-in-angularjs
//
//var totaldata = [];
//// success handler
//
//var predata = [];
//
//for (var col = 0; col < totaldata.length; col++) {
//var k_objects = Object.keys(totaldata[col]);
////console.log(k_objects);
//var subdata = [];
//for (var ks = 0; ks < k_objects.length; ks++) {
//  if (Object.prototype.hasOwnProperty.call(totaldata[col], k_objects[ks])) {
//    subdata.push({day:getDate(k_objects[ks]).setHours(0,0,0,0), hum:totaldata[col][k_objects[ks]].hum, bot:totaldata[col][k_objects[ks]].bot});
//  };
//};
//predata.push(subdata);
//};
//
//console.log('predata ',predata);
//var ddata = [];
//var dater = dateRange(startDate, endDate);
//
//for (var ys = 0; ys < predata.length; ys++){
//var subdata = new Array();
//for (var pos = 0; pos < dater.length; pos++) {
//  //subdata.push({x:pos,y:0});
//  subdata.push({x:new Date(dater[pos]),y:0})
//};
//for (var k = 0; k < predata[ys].length; k++) {
//  subdata[dater.indexOf(predata[ys][k].day)].y = predata[ys][k].hum;
//};
//
//ddata.push(subdata);
//};
//
//console.log('data ', ddata);
//
//var minDate = dater[0],
//  maxDate = dater[dater.length - 1];
//  
////https://javadude.wordpress.com/2012/06/18/d3-js-most-simple-stack-layout-with-bars/
////http://bl.ocks.org/mbostock/1134768
////http://bl.ocks.org/mbostock/3943967
////http://bl.ocks.org/ZJONSSON/3918369
////http://www.d3noob.org/2012/12/adding-axis-labels-to-d3js-graph.html
////http://bl.ocks.org/d3noob/8603837

////ddata.unshift(dater);
//var margin = {
//  top: 30,
//  right: 50,
//  bottom: 30,
//  left: 50
//};
////width = 600 - margin.left - margin.right,
////height = 270 - margin.top - margin.bottom;
//
//var width = 780;
//var height = 500;
//var p = [20, 50, 30, 50];
//
//var svg = d3.select(elem[0])
//.append("svg")
//.attr("width", width + margin.left + margin.right)
//.attr("height", height + margin.top + margin.bottom)
//.append("g")
//.attr("transform",
//"translate(" + margin.left + "," + margin.top + ")");
////  "translate(" + p[3] + "," + (height - p[2]) + ")");          
//
//var n = ddata.length; 
//
//var stacked = d3.layout.stack()(ddata);
////console.log('stacked ',stacked)
//
//var color_range = d3.scale.linear().domain([0, n - 1]).range(["#aad", "#556"]);
//
////http://hdnrnzk.me/2012/07/04/creating-a-bar-graph-using-d3js/
////http://www.ireneros.com/conf/nicar/introduction-to-d3.html#9
////http://stackoverflow.com/questions/31816637/d3js-error-while-drawing-the-chart
////http://www.d3noob.org/2013/01/format-date-time-axis-with-specified.html
//var format = d3.time.format("%m/%Y");
//var x = d3.scale.ordinal().rangeRoundBands([0, width - margin.right - margin.left]);
//var xdate = d3.time.scale().range([0, width - margin.right - margin.left]);
////xdate.domain(stacked[0].map(function(d) { console.log('in domain x', d); return d.x; }));
//xdate.domain([new Date(dater[0]), new Date(dater[dater.length-1])]);
//var xAxis = d3.svg.axis()
//.scale(xdate)
//.tickSize(0)
//.tickPadding(6)
//.orient("bottom")
//.ticks(5)
//.tickFormat(format);             
//x.domain(stacked[0].map(function(d) { return d.x; }));
////07/201507/201507/201507/201507/201507/201507/201507/201507/201507/201507/201507/201507/201507/201507/201507/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201508/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/201509/2015


//var yGroupMax = d3.max(ddata, function(dd) { return d3.max(dd, function(d) { return d.y; }); });
//var yStackMax = d3.max(stacked, function(dd) { return d3.max(dd, function(d) { return d.y0 + d.y; }); });
//var y = d3.scale.linear().domain([0, yStackMax]).range([height, 0]);
//var yAxis = d3.svg.axis().scale(y)
//.orient("right").ticks(5);
//
//
////console.log("x.domain(): " + x.domain())
////console.log("y.domain(): " + y.domain())
////console.log("------------------------------------------------------------------");
//
//var valgroup = svg.selectAll("g.valgroup")
//.data(stacked)
//.enter().append("svg:g")
//.attr("class", "valgroup")
//.style("fill", function(d, i) { return color_range(i); })
//.style("stroke", function(d, i) { return d3.rgb(color_range(i)).darker(); });          
//
//var rect = valgroup.selectAll("rect")
//.data(function(d){return d;})
//.enter().append("svg:rect")
//.attr("x", function(d) { return x(d.x); })
//.attr("y", height)
//.attr("width", x.rangeBand())
//.attr("height", 0);
//
////start as stacked...
//rect.transition()
//.delay(function(d, i) { return i * 10; })
//.attr("y", function(d) { return y(d.y0 + d.y); })
//.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });
//
//svg.append("g")
//.attr("class", "x axis")
//.attr("transform", "translate(0," + height + ")")
//.call(xAxis);
//
//console.log(width - margin.left);
//var yaxis_pos = width - margin.left
//
//svg.append("g")
//.attr("class", "y axis")
//.attr("transform", "translate(" + yaxis_pos + ",0)")
//.call(yAxis);
//
//
//var legendRectSize = 20;
//var legendSpacing = 5;
//
//var legend = d3.select('svg')
//.append("g")
//.selectAll("g")
//.data(color_range.domain())
//.enter()
//.append('g')
//  .attr('class', 'legend')
//  .attr('transform', function(d, i) {
//    var height = legendRectSize;
//    var x = 0;
//    //var y = i;
//    var y = i * height;
//    return 'translate(' + x + ',' + y + ')';
//});
//  
//legend.append('rect')
//.attr('width', legendRectSize)
//.attr('height', legendRectSize)
//.style('fill', color_range)
//.style('stroke', color_range);
//
//var roomnames = ["HelpZiplines", "HelpBonfires"]
//legend.append('text')
//  .attr('x', legendRectSize + legendSpacing)
//  .attr('y', legendRectSize - legendSpacing)
//  .text(function(d) { return roomnames[d]; });
//
//d3.selectAll("input").on("change", change);
//
//var timeout = setTimeout(function() {
//d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
//}, 2000);
//
//// from stacked to automatically grouped
//function change() {
//clearTimeout(timeout);
//if (this.value === "grouped") transitionGrouped();
//else transitionStacked();
//};
//
//function transitionGrouped() {
//y.domain([0, yGroupMax]);
//
//rect.transition()
//.duration(500)
//.delay(function(d, i) { return i * 10; })
//.attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
//.attr("width", x.rangeBand() / n)
//.transition()
//.attr("y", function(d) { return y(d.y); })
//.attr("height", function(d) { return height - y(d.y); });
//}
//
//function transitionStacked() {
//y.domain([0, yStackMax]);
//
//rect.transition()
//.duration(500)
//.delay(function(d, i) { return i * 10; })
//.attr("y", function(d) { return y(d.y0 + d.y); })
//.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
//.transition()
//.attr("x", function(d) { return x(d.x); })
//.attr("width", x.rangeBand());
//}
//
//
//scope.$watch('chartData', function(){
////console.log("data ",scope.chartData);
//scope.render(scope.chartData);  
//})
//}
//});
//}
//}
//}]);
                            //var max_m = tickers[Object.keys(tickers).sort(function(a,b){return tickers[b]['count']-tickers[a]['count']})[0]]['count'];
                            //var min_m = tickers[Object.keys(tickers).sort(function(a,b){return tickers[a]['count']-tickers[b]['count']})[0]]['count'];
                            //function dateRanging(previousdate, enddate){
                            //    while (previousdate <= enddate) {
                            //        day = previousdate.getDate();
                            //        previousdate = new Date(previousdate.setDate(++day));
                            //        daterange.push(previousdate.setHours(0,0,0,0));
                            //    }
                            //    var date_sort_asc = function (date1, date2) {
                            //        if (date1 > date2) return 1;
                            //        if (date1 < date2) return -1;
                            //        return 0;
                            //    };
                            //    return daterange.sort(date_sort_asc);
                            //    };
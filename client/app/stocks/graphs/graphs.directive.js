'use strict';
//http://cloudspace.com/blog/2014/03/25/creating-d3.js-charts-using-angularjs-directives/#.Vf04frylilM
//http://bl.ocks.org/biovisualize/5372077
//http://www.sitepoint.com/creating-charting-directives-using-angularjs-d3-js/
//http://stackoverflow.com/questions/31613196/how-to-integrate-d3js-graph-with-angular-directive
//http://stackoverflow.com/questions/32808040/updating-a-graph-on-change-of-data-in-d3-js
//http://www.competa.com/blog/2015/10/using-d3-graphs-in-angular-2/
//https://medium.com/@stides303/dynamic-graphs-with-angular-js-and-d3-js-80b42e869a2#.67mojhmko
//http://busypeoples.github.io/post/reusable-chart-components-with-angular-d3-js/
//https://github.com/angularjs-nvd3-directives/angularjs-nvd3-directives/issues/58
//http://stackoverflow.com/questions/18068066/exit-not-working-properly
//http://matthewgladney.com/blog/data-science/using-dynamic-data-and-making-reusable-d3-js-charts/
//http://jsfiddle.net/odiseo/ZnkN6/light/
//http://www.delimited.io/blog/2014/7/16/d3-directives-in-angularjs
//https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36#.58nna1ecf
//http://bl.ocks.org/ColinEberhardt/1c2b4916fc13bbb7e99b
angular.module('stockchartFccApp')
    .directive('linearChart', ['$window', '$timeout', 'd3Service', function ($window, $timeout, d3Service) {
        return {
            restrict: 'EA',
            replace:true,
            scope: {chartData: '='},
            //http://www.sitepoint.com/creating-charting-directives-using-angularjs-d3-js/
            template:"<svg width='850' height='1200'></svg>",
            link: function(scope, elem, attrs) {
                //console.log(scope.$watch('chartData', function(){
                //    console.log(scope.chartData);
                //}
                //));

                d3Service.d3().then(function(d3) {
                    //svg.selectAll('*').remove();
                    scope.svg = null;
                    scope.container = null;
                    elem.text('this is the graphs directive');
                    
                    //scope.rendere = function(data){
                    //    console.log('success')
                    //}

                    //scope.$watch('chartData', function(newVal, oldVal){
                    //    //console.log("data inside the directive",scope.chartData);
                    //    console.log(newVal == oldVal);
                    //    scope.render(newVal);
                    //}, true);
                    //
                    //scope.$watch('chartData', function(newVal){
                    //    //console.log("data inside the directive",scope.chartData);
                    //    scope.render(newVal);
                    //}, true);
                    
                    scope.render = function(data, oldData, newData){
                        // organising dates http://stackoverflow.com/questions/7114152/given-a-start-and-end-date-create-an-array-of-the-dates-between-the-two
                        //http://stackoverflow.com/questions/3894048/what-is-the-best-way-to-initialize-a-javascript-date-to-midnight
                        //var salesDataToPlot=scope[attrs.chartData];
////////////////////////////////////////////////////////////////////
//INITIALISING THE ELEMENTS: CLEANING UP...
                        console.log("in render ", oldData, newData)
                        //OJO!!! ----------------> http://jsfiddle.net/rolfsf/8bXAN/
                        //remove previous elements HERE!
                        d3.select(elem[0]).select('svg').remove();
                        //d3.select('svg').remove();
                        //if (typeof legend != "undefined") {
                        //    console.log("gotcha...");
                        //}

                        //http://stackoverflow.com/questions/4777077/removing-elements-by-class-name
                        function removeElementsByClass(className){
                            var elements = document.getElementsByClassName(className);
                            while(elements.length > 0){
                                elements[0].parentNode.removeChild(elements[0]);
                            }
                        } 
 
                        if (document.getElementsByClassName("legend")) {
                            console.log("legend found!");
                            removeElementsByClass("legend");
                        }
                        
                        
/////////////////////////////////////////////////////////////////////
//SETTING UP THE SVG ATTRIBUTES AND OTHER FORMATTING
                        //console.log('inside serviced d3; here d3', d3);
                        //console.log('salesDataToPlot ',salesDataToPlot);
                        
                        var pathClass = "path";
                        var xScale, yScale, xAxisGen, yAxisGen, lineFun;
                        
                        var margin = {top: 20, right: 20, bottom: 50, left: 40},
                         width = 480 - margin.left - margin.right,
                         height = 360 - margin.top - margin.bottom,
                         padding = 20,
                         p = [20, 50, 30, 50]; 
                    


                        // helper function
                        function gettingDate(d) {
                            return new Date(d).setHours(0,0,0,0);
                        }
                        
                        // Format and Parse the date / time
                        var format = d3.time.format("%d/%m/%Y");
                        var parseDate = d3.time.format("%y-%b-%d").parse;

                        var tickers = {};
                        data.forEach(function(t){
                                //console.log(t);
                                if (tickers.hasOwnProperty(t.ticker)) {
                                    tickers[t.ticker][gettingDate(t.date)] = t.close;
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
                            //console.log(ms);
                            //console.log(daterange);
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
                                    //console.log(dk);
                                    if (tickers.hasOwnProperty(tk)) {
                                        if (tickers[tk].hasOwnProperty(dk)){
                                            column.push({x:pos, y:tickers[tk][dk]/100})
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

                        //appending divs svg, g (group) and some attrs to elem[0] and calling svg
                        var svg = d3.select(elem[0])
                            .append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");

                        //if (matrix_data.length) svg.selectAll("*").remove();
                        //if (matrix_data.length) svg.data(layers).exit().remove();
                            
                        //svg.selectAll('*').remove();
/////////////////////////////////////////////////////////////////////////
//INITIALISING D3 GRAPH OBJECTS

                        //http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value

                        var n = matrix_data[0].length;
                        //console.log(n);
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
                        //console.log(layers, yGroupMax, yStackMax);
                        
                        //NOTE: scaling the VALUES of X axis
                        var x = d3.scale
                            .ordinal()
                            .domain(d3.range(1,max_m+1))
                            //.domain(daterange)
                            .rangeRoundBands([0, width - margin.right - margin.left]);
                        
                        //NOTE: scaling the LABELS of the X axis
                        var xdate = d3.time
                            .scale()
                            .domain([stdate, endate])
                            .range([0, width - margin.right - margin.left]);
                        
                        //NOTE: initialising the X AXIS
                        //var newdaterange = daterange.map(function(v){
                        //        var fdd = [];
                        //        var dd = new Date(v);    
                        //        var d = String(dd.getDate());
                        //        if (d.length == 1) {
                        //            d = '0'+d;
                        //        }
                        //        var m = String(dd.getMonth()+1);
                        //        var y = String(dd.getFullYear());
                        //        return y+m+d
                        //    })
                        var xAxis = d3.svg.axis()
                            .scale(xdate)
                            //.scale(x)
                            //.tickValues(newdaterange)
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
                        //selecting unexistent class valgroup to appended g's to bind the data to (enter)
                        //append to div svg:g? or append svg:g to each valgroup?
                        //iteration is over layers; d is each LAYERS element and i is the index of layers...
                        ////////////
                        //OJO!!! udemy course style: fracturing the code a bit more......
                        var valgroup = svg.selectAll("g.valgroup")
                            .data(layers)
                        
                        valgroup.enter()
                            .append("svg:g") //this is an APPEND TO that follows and ENTER!!
                            .classed("valgroup", true);
                            //.attr("class", "valgroup")

                        //if (status == false) {
                        //    valgroup.exit().remove();
                        //}
                            
                        valgroup
                            .style("fill", function(d, i) {
                                //console.log(color_range(i));
                                return color_range(i);
                            })
                            .style("stroke", function(d, i) { return d3.rgb(color_range(i)).darker(); });          


                        ///////////    

                        //NOTE: initialising LEGENDS
                        var legendRectSize = 20;
                        var legendSpacing = 5;
                        
                        
                        //why d3.select(...)? because is a NEW svg, it is NOT the chart!
                        var legend = d3.select('svg')
                            .append("g")
                            .selectAll("g")
                            .data(color_range.domain())
                            
                        legend.enter()
                            .append('g')
                            .attr('class', 'legend')
                            
                            
                        legend
                            //.exit()
                            .attr('transform', function(d, i) {
                                var height = legendRectSize;
                                var x = 405;
                                //var y = i;
                                var y = i * height;
                                return 'translate(' + x + ',' + y + ')';
                              });
                        
                        var tickersname = Object.keys(tickers);
                      

/////////////////////////////////////////////////////////////////////////
//DRAWING

                        //NOTE: the values are now AVAILABLE to the figures
                        // this one creates the BARS, and it is a reusable functionality
                        ////////////
                        //OJO!!! udemy course style: fracturing the code a bit more......
                        var rect = valgroup.selectAll("rect")
                            .data(function(d){return d;});

                        rect.enter()
                            .append("svg:rect") //this is an APPEND TO that follows and ENTER!!
                        
                        //NOTE: discovered that this is the initial form of the rects   
                        rect
                            //.exit()
                            .attr("x", function(d) { return x(d.x); })
                            .attr("y", height)
                            .attr("width", x.rangeBand())
                            .attr("height", 0);
                        ////////////
                            
                            
                        //NOTE: drawing the legend
                        legend
                            .append('rect')
                            .attr('width', legendRectSize)
                            .attr('height', legendRectSize)
                            .style('fill', color_range)
                            .style('stroke', color_range);
 
                        legend
                            .append('text')
                            .attr('x', legendRectSize + legendSpacing)
                            .attr('y', legendRectSize - legendSpacing)
                            .text(function(d) { return tickersname[d]; });

                                              
                        //NOTE: initialising the ANIMATION
                        //starts as stacked...
                        rect
                            .transition()
                            .delay(function(d, i) { return i * 10; })
                            .attr("y", function(d) { return y(d.y0 + d.y); })
                            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });
                        
                        //NOTE: drawing the X AXIS
                        svg.append("g")
                            .attr("class", "xaxis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis)
                            .selectAll("text")
                                .style("text-anchor", "end") 
                                .attr("font-size", "9px")
                                .attr("dx", "-.05em")
                                .attr("transform", "rotate(-65)" );;
                        
                        
                        //NOTE: drawing the Y AXIS
                        //console.log(width - margin.left);
                        var yaxis_pos = width - margin.left
                        
                        //http://www.d3noob.org/2012/12/adding-axis-labels-to-d3js-graph.html
                        var dyAxis = svg.append("g")
                            .attr("class", "yaxis")
                            .call(yAxis)
                            //.attr("transform", "translate(" + yaxis_pos + ",0)")
                            .append("text")
                                .attr("transform", "rotate(-90)")
                                //.attr("y", 6)
                                .attr("dy", ".71em")
                                .attr("y", 0 - margin.left)
                                .attr("x",0 - (height / 2))
                                .style("text-anchor", "middle")
                                .text("close price ($x100)")
    

//////////////////////////////////////////////////////////////////////
//ANIMATION SECTION
                      
                        //NOTE: responding to events: state and function    
                        d3.selectAll("input")
                            .on("change", change);
                        

                        //NOTE: initial posititioning and a changing 
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
 
                        //NOTE: rescale of the AXES                       
                        function rescale(yrange) {
                            //console.log(yrange);
                            svg.select(".yaxis")
                                .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                                .call(yrange);  
                            svg.select(".yaxis label")
                                //.text("Rescaled Axis");
                        };

                        //NOTE: drawing GROUPED BARS
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
                        
                        //NOTE: drawing STACKED BARS
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
                        //NOTE: have to remove the graph for updating
                        //http://stackoverflow.com/questions/12992351/how-to-update-elements-of-d3-force-layout-when-the-underlying-data-changes
                        
                    };

/////////////////////////////////////////////////////////////////////////
//WATCH FUNCTION
                    
//http://cloudspace.com/blog/2014/03/25/creating-d3.js-charts-using-angularjs-directives/#.Vk4qgrxVKlM
                    scope.$watch('chartData', function(newVal, oldVal){
                        console.log("data inside the directive",scope.chartData);
                        //console.log(newVal == oldVal);
                        scope.render(newVal, oldVal, newVal);
                    }, true);


                });
            }
        }
    }
]);


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
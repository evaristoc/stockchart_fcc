'use strict';
//http://www.ng-newsletter.com/posts/d3-on-angular.html
angular.module('stockchartFccApp')
  .factory('d3Service', ['$document', '$q', '$rootScope', '$window', function ($document, $q, $rootScope, $window) {
    //// AngularJS will instantiate a singleton by calling "new" on this function
    //var d3;
    // insert d3 code here
    //return d3;
      var deferred = $q.defer();
      
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { deferred.resolve($window.d3); });
      }
      // Create a script tag with d3 as the source
      // and call our onScriptLoad callback when it
      // has been loaded
      
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript'; 
      scriptTag.async = true;
      //scriptTag.src = 'http://d3js.org/d3.v3.min.js';
      scriptTag.src ='https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js';
      
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);

      return {
        d3: function() {

            if (deferred.promise) {
                console.log('in the service: checking d3: ', deferred.promise);
            }
            
            return deferred.promise;
        }
      };
  }]);

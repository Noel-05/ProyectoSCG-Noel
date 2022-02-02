! function (a, b, c) {
    "use strict";

b.module('startFrom', [])
  .filter('startFrom', function () {
      return function (input, offset) {
          return (input instanceof Array) 
            ? input.slice(+offset) 
            : input
      }
  }),

  b.module("angular.filter", ["startFrom"])
}(window, window.angular);
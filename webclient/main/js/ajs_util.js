/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

// DEV START  ----->
// This will be removed during the release JS compile.
if(!(typeof require === 'undefined' || require == null)) {
  var app = {
    directive: function() {},
    factory: function() {}
  };
}
//<------ DEV END


/*
 * template factory
 * 
 * AT constructor
 * AT ngInject
 
var Factory = function($window, dateProvider, randomProvider) {
  return {
    m: function() {
    }
  }
}
Factory.$inject = [""];
app.factory("", Factory);
*/


/**
 * dirNgEnter directive
 * 
 * @constructor
 * @ngInject
 */
var dirNgEnter = function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
};
app.directive("ngEnter", dirNgEnter);


/**
 * automaticFocus directive
 * 
 * @constructor
 * @ngInject
 */
var automaticFocus = function($timeout) {
  return {
    restrict: 'AC',
    link: function(_scope, _element) {
      $timeout(function(){
        _element[0].focus();
        }, 0);
    }
  };
}
automaticFocus.$inject = ["$timeout"];
app.directive("automaticFocus", automaticFocus);


/**
 * dateProvider factory
 * 
 * @constructor
 * @ngInject
 */
var dateProviderFactory = function() {
  return {
    getDate: function() {
      return new Date();
    },
    
    getTime: function() {
      return (new Date).getTime();  
    }
  }
}
app.factory("dateProvider", dateProviderFactory);


/**
 * randomProvider factory
 * 
 * @constructor
 * @ngInject
 */
var randomProviderFactory = function() {
  return {
    random: function() {
      return Math.random();
    },
  }
}
app.factory("randomProvider", randomProviderFactory);


/**
 * uuidGenerator factory
 * 
 * @constructor
 * @ngInject
 */
var uuidGeneratorFactory = function($window, dateProvider, randomProvider) {
  return {
    generateUUID: function() {
      var d = dateProvider.getTime();
      if($window && $window.performance && typeof $window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
      }

      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + randomProvider.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      
      return uuid;

    }
  }
}
uuidGeneratorFactory.$inject = ["$window", "dateProvider", "randomProvider"];
app.factory("uuidGenerator", uuidGeneratorFactory);



//DEV START  ----->
//This will be removed during the release JS compile.

if(!(typeof require === 'undefined' || require == null)) {
  // This has to be done here, since the functions are defined as vars.
  module.exports = {
    dirNgEnter: dirNgEnter,
    automaticFocus: automaticFocus,
    dateProviderFactory: dateProviderFactory,
    randomProviderFactory: randomProviderFactory,
    uuidGeneratorFactory: uuidGeneratorFactory
  };
}
//<------ DEV END

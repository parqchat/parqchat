/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

// DEV START  ----->
// This will be removed during the release JS compile.
if(!(typeof require === 'undefined' || require == null)) {
  require("common_util.js");
}
//<------ DEV END

var app = angular.module("chatApp", ["ngRoute","ngCookies",  "angular-websocket",
  "mobile-angular-ui", "mobile-angular-ui.gestures",
  "mobile-angular-ui.core.sharedState"]);

/**
 * $locationProvider config
 * 
 * @constructor
 * @ngInject
 */
var locationProvider_config = function($locationProvider) {
  $locationProvider.html5Mode(true);
}
locationProvider_config.$inject = ["$locationProvider"];
app.config(locationProvider_config);


/**
 * $routeProvider config
 * 
 * @constructor
 * @ngInject
 */		 
var routeProvider_config = function($routeProvider) {
  console_log("config");
  $routeProvider.when(":name*", {
    template: "",
    //controller: "chatCtrl",
    reloadOnSearch: true,
  });
}
routeProvider_config.$inject = ["$routeProvider"];
app.config(routeProvider_config);

/**
 * $ajsServices Factory
 * 
 * @constructor
 * @ngInject
 */
function ajsServicesFactory(
    $rootScope, $window, $http, $websocket,
    $location, $timeout, $interval, SharedState,
    parqSettings, dateProvider, randomProvider, uuidGenerator) {
  
  var result = {
    $rootScope: $rootScope,
    $window: $window,
    $http: $http,
    $websocket: $websocket,
    $location: $location,
    $timeout: $timeout,
    $interval: $interval,
    SharedState: SharedState,
    
    parqSettings: parqSettings,
    dateProvider: dateProvider,
    randomProvider: randomProvider,
    uuidGenerator: uuidGenerator
  };
  return result;
}
ajsServicesFactory.$inject = [
  "$rootScope", "$window", "$http", "$websocket",
  "$location", "$timeout", "$interval", "SharedState",
  "parqSettings", "dateProvider", "randomProvider", "uuidGenerator"];
app.factory('ajsServices', ajsServicesFactory);

/**
 * chatCtrl controller
 * 
 * @constructor
 * @ngInject
 */
var chatCtrl = function ($scope, ajsServices) {
  console_log("App code: " + navigator.appCodeName + "\nName: " + navigator.appName + "\nAgent: " + navigator.userAgent);
  
  var serv = ajsServices;
  
  serv.SharedState.initialize($scope, "modal_nick");

  $scope.settings = serv.parqSettings;
  var tmp = serv.parqSettings.tmp;

  $scope.window = window;

  $scope.updateSeenPeers = function() {
    var peers = $scope.settings.tmp.currentChat.seenPeers;
    for (var i in peers) {
      if (peers[i].style.opacity > 0.1) {
        var lastSeen = peers[i].lastSeen;
        var opacity = (1 - (new Date().getTime() - lastSeen.getTime()) / 1000 / 240);
        opacity = Math.max(opacity, 0.1);
        peers[i].style.opacity = opacity;
        peers[i].style["font-weight"] = "normal";
      }
    }

    if (!serv.parqSettings.tmp.currentChat.isConnected()) {
      serv.parqSettings.tmp.currentChat.reconnect($scope, serv);
    }
  };

  $scope.setTitle = function(name) {
    document.title = name + " - parq.chat";
  };

  if (!$scope.init) {
    serv.$rootScope.$broadcast("restorestate");

    serv.$rootScope.$on("$routeChangeStart", function (event, next, current) {
      console_log("routeChangeStart: ");
      console_log(event);
      console_log(next);
      console_log(current);
      var name = next.pathParams.name.replace("/", "");
      var chat = serv.parqSettings.getChat(name);
      $scope.setTitle(name);
      chat.connect($scope, serv);
      $scope.$broadcast("messageAdded");
    });

    // TODO: Hold back if PaleMoon or old firefox
    serv.$interval($scope.updateSeenPeers, 5000, 0, true);

    $scope.init = true;
  }

  console_log(tmp);

  console_log($scope.sidebar);

  $scope.createNewChat = function() {
    console_log("createNewChat");
    var chat = serv.parqSettings.getChat($scope.newchat);
    chat.connect($scope, serv);
    
    window.history.pushState("", chat.name, chat.name);

    console_log($scope.sidebar);
  }

  $scope.setNick = function() {
    serv.$rootScope.$broadcast("savestate");
    serv.SharedState.turnOff("modal_nick");
  }

  $scope.scrollDown = function() {
    var outputScroll = document.getElementById("outputScroll");
    outputScroll.scrollTop = outputScroll.scrollHeight;
    console_log(outputScroll.scrollTop + " " + outputScroll.scrollHeight);
  };

  $scope.$on("messageAdded", function() {
    serv.$timeout($scope.scrollDown, 1, true);
  });

  $scope.typed = function(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
      var txt = $scope.input;
      if(!txt || String(txt).trim().length == 0) {
        return;
      }

      $scope.input = "";
      tmp.currentChat.send(txt);

      $scope.$broadcast("messageAdded");
      
      if (event.stopPropagation) {
        console_log(">> stopPropagation");
        event.stopPropagation();
      }
      
      if (event.preventDefault) {
        console_log(">> preventDefault");
        event.preventDefault();
      }
    }
  };

  $scope.setPassword = function(event) {
    tmp.currentChat.setPassword();
    serv.SharedState.turnOff("modal_pass");
  };

  $scope.setPrivacy = function(event) {
    serv.$rootScope.$broadcast("savestate");
  };

  /*
  $scope.$watch("settings.tmp.currentChat.messages", function(newValue, oldValue) {
    $scope.scrollDown();
  });
  */

  $scope.updateQr = function() {
    var qrdiv = document.getElementById("qrcode");
    
    var qrcode = new QRCode(qrdiv, {
  	  width : 100,
	  height : 100
    });

    qrcode.makeCode("http://" + serv.$location.host() + util.getConfig()["linkport"] +
        "/" + serv.parqSettings.tmp.currentChat.name);
  };
  
  $scope.getChatActive = function(thatChat) {
    if(!(thatChat && thatChat.isConnected && thatChat.isConnected())) {
      return false;
    }

    if(thatChat.passwordProtected && !thatChat.passwordOk) {
      return false;
    }

    return true;
  };

  $scope.getChatActiveClass = function(thatChat) {
    return $scope.getChatActive(thatChat) ? "chatActive" : "chatInactive";
  };

  $scope.getChatIconClass = function(thatChat) {
    //console_log("---- getChatIconClass. connected="+thatChat.connected + ", password="+thatChat.password);
    if (thatChat && thatChat.isConnected && thatChat.isConnected()) {
      if (thatChat.passwordOk) {
        return "unlock";
      } else if(thatChat.passwordProtected) {
        return "lock";
      } else {
        return "check-circle";
      }
    }

    return "circle-o-notch";
  };

  $scope.$on('mobile-angular-ui.state.changed.modal_share', function(e, newVal, oldVal) {
    if (newVal == true) {
      serv.$timeout($scope.updateQr, 1, true);
    }
  });

  var w = angular.element(serv.$window);
  $scope.$watch(
    function () {
      return serv.$window.innerWidth;
    },
    function (value) {
      $scope.windowWidth = value;
    },
    true
  );

  w.bind('resize', function(){
    //$scope.resize = "S: " + window.innerHeight + ", " +window.screenY+ ", " +window.screenTop+ ", " +window.scrollY;
    $scope.$apply();
    //$scope.resize = "D";
    $scope.scrollDown();
  });

  $scope.inputFocus = function(event) {
    //$scope.resize = "I: " + window.innerHeight + ", " +window.screenY+ ", " +window.screenTop+ ", " +window.scrollY;

    // This is for iOS devices, which does not resize the elements.
    if(window.scrollY > 0) {
      var outputScroll = document.getElementById("outputScroll");
      var input = document.getElementById("input");
      var inputHeight = input.offsetHeight;

      var h = window.innerHeight - inputHeight - 15;
      var m = window.scrollY - (window.innerHeight - window.scrollY) - 15;
      outputScroll.style.height = h + "px";
      outputScroll.style.marginTop = m + "px";

      //$scope.scrollDown();
    }
  };

  $scope.inputBlur = function(event) {
    //$scope.resize = "B: " + window.innerHeight + ", " +window.screenY+ ", " +window.screenTop+ ", " +window.scrollY;
	// WORKS??
    var outputScroll = document.getElementById("outputScroll");
    outputScroll.style.height = "100%";
    outputScroll.style.marginTop = "";
  };

};

chatCtrl.$inject = ["$scope", "ajsServices"];
app.controller("chatCtrl", chatCtrl);

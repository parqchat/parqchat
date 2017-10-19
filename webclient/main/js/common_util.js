/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

util = {

getConfig: function() {
  var config = {
    "port": "443",
    "linkport": "",
    "protocol": "wss"
  };

  // DEV START  ----->
  // This will be removed during the release JS compile.
  config = {
    "port": "9999",
    "linkport": ":9999",
    "protocol": "ws"
  };
  //<------ DEV END
  
  return config;
},


inMap: function(map) {
  if(typeof map === 'undefined' || map == null || Object.keys(map).length == 0) {
    return false;
  }
  
  if(typeof arguments === 'undefined' || arguments == null || arguments.length < 2) {
    return false;
  }
  
  for (var i = 1; i < arguments.length; i++) {
    if (!map.hasOwnProperty(arguments[i]) || 
        typeof map[arguments[i]] === 'undefined' ||
        map[arguments[i]] == null) {
      return false;
    }
  }
  
  return true;
},


inMapWith: function(map, key, value) {
  return util.inMap(map, key) && map[key] == value;
},


loopArguments: function(predicate, args) {
  for (var i = 0; i < args.length; i++) {
    if (predicate(args[i])) {
      return false;
    }
  }
  
  return true;
},

allTrue: function() {
  return util.loopArguments(
      function (a) { return typeof a === 'undefined' || !a; },
      arguments);
},


allNonEmpty: function() {
  return util.loopArguments(
      function (a) {
        return (
            typeof a === 'undefined' ||
            !a  ||
            (typeof a === 'object' && Object.keys(a).length == 0)
          );
      },
      arguments);
},


arrayIntersect: function(a, b) {
  if(!a || !b) {
    return [];
  }

  return a.filter(function(e) { return b.indexOf(e) > -1; } );
},


arrayDiff: function(a, b) {
  if(!a || !b) {
    return [];
  }
  
  return a.filter(function(e) { return b.indexOf(e) == -1; } );
},


arrayInArray: function(a, b) {
  if(!a || !b) {
    return false;
  }
  
  for (var i = 0; i < a.length; i++) {
    if (b.indexOf(a[i]) == -1) {
      return false;
    }
  }
  
  return true;
},

compareNumbers: function (a, b) {
  return a - b;
},

}; // util

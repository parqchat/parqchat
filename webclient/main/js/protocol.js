/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

// DEV START  ----->
// This will be removed during the release JS compile.

if(!(typeof require === 'undefined' || require == null)) {
  var jsSHA = require("sha3.js").jsSHA;

  var console_log = require("console_log.js");
  require("history.js");
  require("password.js");
  require("common_util.js");
  require("consts.js");
}
//<------ DEV END


TYPE = "type";
MSG = "msg";
INIT = "init";
TIMEMS = "timems";
SEQUENCE = "sequence";
HASHMETHOD = "hashmethod";
HASH = "hash";
CLIENTID = "clientid";
CHAT = "chat";
NICK = "nick";
TXT = "txt";

MSG_HASH_VARIANT = "SHA3-224";


/**
 * @constructor
 * @param {Chat} chat
 */
Protocol = function (chatObj) {
  this.chat = chatObj;

  this.name = chatObj.name;
  this.clientid = false;
  this.url = false;
  this.connected = false;

  this.rootScope = false;
  this.websocket = false;
  this.scope = false;
  this.dateProvider = false;
  this.interval = function() {};
  this.parqSettings = false;

  this.history = new ChatHistory(chatObj, this);
  this.password = new Password(chatObj, this);
}

Protocol.prototype.connect = function($scope, ajsServices) {
  if (this.websocket) {
    return;
  }
  
  var serv = ajsServices;

  this.rootScope = serv.$rootScope;
  this.parqSettings = serv.parqSettings;
  this.scope = $scope;
  this.dateProvider = serv.dateProvider;
  this.interval = serv.$interval;

  this.name = this.name ? this.name : serv.$window.location.pathname;
  this.chat.name = this.name;
  
  if(!this.clientid) {
    this.clientid = serv.uuidGenerator.generateUUID();
  }

  this.setServer(this.getServer(serv.$location));
  this.reconnect($scope, ajsServices);
}

Protocol.prototype.getServer = function($location) {
  if(!this.name) {
    return $location.host();
  }

  var p = ":" + util.getConfig()["port"];
  var servers = [$location.host() + p, $location.host() + p];

  var first = this.name.toLowerCase().charCodeAt(0);
  var index = first - "a".charCodeAt(0);
  return servers[index % servers.length];
}

Protocol.prototype.setServer = function(server) {
  this.url = util.getConfig()["protocol"] + "://" +  server + "/" + this.name;
}

Protocol.prototype.reconnect = function($scope, ajsServices) {
  console_log("reconnect");
  var serv = ajsServices;
  this.rootScope = serv.$rootScope;
  this.scope = $scope;

  console_log("_readyStateConstants=" + serv.$websocket._readyStateConstants );

  console_log(this);
  if (this.websocket && this.websocket.socket) {
    console_log("readyState=" + this.websocket.socket.readyState);
    this.websocket.close();
  }

  console_log("url="+this.url);

  this.chat.passwordOk = false;

  this.websocket = serv.$websocket(this.url);

  this.websocket.onMessage(this.websocketOnMessage.bind(this));
  this.websocket.onOpen(this.websocketOnOpen.bind(this));
  this.websocket.onError(this.websocketOnError.bind(this));
  this.websocket.onClose(this.websocketOnClose.bind(this));
}

Protocol.prototype.websocketOnMessage = function(event) {
  console_log("websocketOnMessage: ");
  console_log(event);
  
  if(!(event && event.data)) {
    return;
  }
  
  var msg;
  try {
    msg = JSON.parse(event.data);
  } catch(e) {
    console.log("Failed to parse incoming message: " + event.data);
    return;
  }
  
  console_log(">> " + this.chat.name +": " + JSON.stringify(msg));

  if(!msg) {
    return;
  }

  if(util.inMap(msg, MSG) || util.inMap(msg, TXT)) {
    this.chat.addMessage(msg);
    this.rootScope.$broadcast("messageAdded");
  }

  if (util.inMap(msg, NICK)) {
    this.chat.seenPeer(msg[NICK]);
  }

  if (util.inMapWith(msg, TYPE, PASSWORD)) {
    this.password.handlePassword(this.rootScope, msg);
  } else if (util.inMapWith(msg, TYPE, HISTORY) && this.chat.passwordOk) {
    this.history.handleHistoryMsg(msg);
  }
}

Protocol.prototype.websocketOnOpen = function(event) {
  console_log(">> OPEN: " + this.chat.name);
  this.connected = true;
  this.chat.passwordOk = false;
  this.scope.$apply();

  if(this.chat.password) {
    this.chat.setPassword(this.chat.password);
  } else {
    this.sendMessageObj(this.getInitObj());
  }
  
  this.history.connected(this.interval);
}

Protocol.prototype.websocketOnError = function(err) {
  // TODO: Count errors - disconnect or reconnect if too many?
  
  console_log("websocket error");
  console_log(err);
}

Protocol.prototype.websocketOnClose = function(event) {
  console_log(event);
  this.connected = false;
  this.chat.passwordOk = false;
}

Protocol.prototype.getNick = function() {
  if(this.parqSettings && this.parqSettings.model && this.parqSettings.model.nick) {
    return this.parqSettings.model.nick;
  }
  
  return "";
}

Protocol.prototype.createNewMessageObj = function(type) {
  var result = {};

  result[TYPE] = type;
  result[TIMEMS] = this.dateProvider.getTime();
  result[CLIENTID] = this.clientid;
  result[CHAT] = this.name;
  result[NICK] = this.getNick();
  
  return result;
}

Protocol.prototype.getMessageObj = function(txt) {
  var result = this.createNewMessageObj(MSG);
  
  // TODO: REMOVE
  result["msg"] = txt;
  result["PROTOCOL_NOTE"] = "txt is the new msg field. msg will be removed";
  
  result[TXT] = txt;
  result[SEQUENCE] = this.chat.getNextSequence();
  result[HASH] = this.hashMsgElements(
      result, TIMEMS, SEQUENCE, CLIENTID, NICK, TXT);
  
  return result;
}

Protocol.prototype.getInitObj = function() {
  var result = this.createNewMessageObj(INIT);
  
  result[HASHMETHOD] = MSG_HASH_VARIANT;
  result[HASH] = this.hashMsgElements(
      result, TIMEMS, CLIENTID, NICK);
  
  return result;
}

Protocol.prototype.hashMsgElements = function(msg) {
  var parts = [];
  
  for (var i = 1; i < arguments.length; i++) {
    parts[i - 1] = msg[arguments[i]];
  }
  
  return this.hashMsgList(parts);
}

Protocol.prototype.hashMsgArguments = function() {
  return this.hashMsgList(arguments);
}

Protocol.prototype.hashMsgList = function(list) {
  //console_log(list);
  var sha = new jsSHA(MSG_HASH_VARIANT, "TEXT");
  
  for (var i = 0; i < list.length; i++) {
    sha.update(String(list[i]));
  }
  
  return sha.getHash("HEX"); 
}

Protocol.prototype.send = function(txt) {
  var msg = this.getMessageObj(txt);
  this.chat.addMessage(msg);
  this.sendMessageObj(msg);
}

// TODO: REMOVE
Protocol.prototype.sendServiceMessage = function(request) {
  request[TYPE] = "service";
  console_log("sendServiceMessage: " + JSON.stringify(request));
  this.websocket.send(JSON.stringify(request));
}

Protocol.prototype.sendMessageObj = function(request) {
  console_log("sendMessageObj: " + JSON.stringify(request));
  if (this.websocket) {
    this.websocket.send(JSON.stringify(request));
  }
}

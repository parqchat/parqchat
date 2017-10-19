/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

// DEV START  ----->
// This will be removed during the release JS compile.

if(!(typeof require === 'undefined' || require == null)) {
  require("common_util.js");
  require("protocol.js");
}
//<------ DEV END


/** 
 * @constructor
 * @param {string} name
 */
Chat = function(name) {
  this.name = name;

  this.password = "";
  this.passwordProtected = false;
  this.passwordOk = false;
  
  this.messages = [];
  this.hashes = {};
  this.seenPeers = {};
  this.maxSequence = 0;

  this.protocol = new Protocol(this);
  this.connect = this.protocol.connect.bind(this.protocol);
  this.reconnect = this.protocol.reconnect.bind(this.protocol);
  this.send = this.protocol.send.bind(this.protocol);
  this.setPassword = this.protocol.password.setPassword.bind(this.protocol.password);
}

Chat.prototype.addLocalMessage = function(txt) {
  // TODO: ADD timems
  this.messages.push({MSG: txt});
}

Chat.prototype.addMessage = function(msg) {
  // todo: should have this?
  //if(!util.inMap(msg, HASH)) {
  //  return;
  // }
  
  if (msg[HASH] && msg[HASH] in this.hashes) {
    return;
  }
  
  if (util.inMap(msg, SEQUENCE)) {
    this.maxSequence = Math.max(this.maxSequence, parseInt(msg[SEQUENCE]));
  }
  
  this.messages.push(msg);
  this.hashes[msg[HASH]] = 1; 
  this.messages.sort(compareMsgTime);
}

Chat.prototype.getSequences = function(expanded) {
  if (!this.messages || this.messages.length == 0) {
    return [];
  }
  
  var range = [];
  var list = [];
  var broken = false;
  var last = null;
  var len = this.messages.length;
  
  range[0] = this.messages[0][SEQUENCE];
  range[1] = this.messages[len - 1][SEQUENCE];
  
  for (var i = 0; i < len; i++) { 
    var msg = this.messages[i];
    
    if (util.inMap(msg, SEQUENCE)) {
      var seq = msg[SEQUENCE];
      list[i] = seq;
      
      if (last && last + 1 != seq) {
        broken = true;
      }
      
      last = seq;
    }
  }
  
  var result = {};
  if (expanded) {
    return list;
  } else if (broken || len < 3) {
    result[KEY] = AVAILABLE_SEQUENCES;
    result[VALUE] = list;
  } else {
    result[KEY] = AVAILABLE_RANGE;
    result[VALUE] = range;
  }
  return result;
}

Chat.prototype.getNextSequence = function() {
  return this.maxSequence + 1;
}

Chat.prototype.hasMessages = function() {
  return this.messages || this.messages.length > 0;
}

Chat.prototype.getMessage = function(seq) {
  for (var v in this.messages) {
    var msg = this.messages[v];
    if(msg[SEQUENCE] == seq) {
      return msg;
    }
  }
  
  return null;
}

function compareMsgTime(msgA, msgB) {
  if("timems" in msgA && "timems" in msgB) {
    return +msgA["timems"] - +msgB["timems"];
  }

  return 0;
}

Chat.prototype.seenPeer = function(nick) {
  this.seenPeers[nick] = {
    lastSeen: new Date(),
    style: {"opacity": 1, "font-weight": "bold"},
  };
}

Chat.prototype.isConnected = function() {
  return this.protocol.connected;
}

Chat.prototype.toString = function() {
  return "[" + this.name +": " + this.url +", " + this.websocket + ", [" + this.messages + "]]"; 
}


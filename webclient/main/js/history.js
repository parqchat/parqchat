/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

// DEV START  ----->
// This will be removed during the release JS compile.

if(!(typeof require === 'undefined' || require == null)) {
  require("common_util.js");
  require("consts.js");
}
//<------ DEV END

HISTORY = "history";
INIT = "init";
RESPONSE = "response";
REQUEST = "request";
BULK = "bulk";
MESSAGES = "messages";
KEY = "key";
VALUE = "value";
AVAILABLE_RANGE = "availablerange";
AVAILABLE_SEQUENCES = "availablesequences";
GET = "get";

MAX_REQUEST_SIZE = 5;
REPEAT_REQUEST_DELAY_MS = 5000;
SCHEDULE_REQUEST_LOOP_MS = 500;

/** 
 * @constructor
 */
ChatHistory = function(chatObj, protocolObj) {
  this.chat = chatObj;
  this.protocol = protocolObj;
  
  this.offers = [];
  this.requests = [];
}

ChatHistory.prototype.connected = function(interval) {
  interval(this.scheduleRequest.bind(this), SCHEDULE_REQUEST_LOOP_MS);
}

ChatHistory.prototype.initHistory = function() {
  var request = this.protocol.createNewMessageObj(HISTORY);
  
  request[HISTORY] = INIT;
  request[HASH] = this.protocol.hashMsgElements(
      request, TIMEMS, CLIENTID);

  this.protocol.sendMessageObj(request);
}

ChatHistory.prototype.handleHistoryMsg = function(msg) {
  if(!util.inMap(msg, HISTORY)) {
    return;
  }
  
  var type = msg[HISTORY];
  if (type == INIT) {
    this.sendStatusResponse(msg);
  } else if (type == RESPONSE) {
    this.receiveStatusResponse(msg);
  } else if (type == REQUEST) {
    this.sendHistory(msg);
  } else if (type == BULK) {
    this.receiveBulkHistory(msg);
  }
}

ChatHistory.prototype.sendStatusResponse = function(msg) {
  if(!this.chat.hasMessages()) {
    return;
  }
  
  var response = this.protocol.createNewMessageObj(HISTORY);
  
  response[HISTORY] = RESPONSE;
  
  var seq = this.chat.getSequences();
  
  if(!util.inMap(seq, VALUE) || !seq[VALUE] || seq[VALUE].length == 0) {
    return;
  }
  
  response[seq[KEY]] = seq[VALUE];
  
  response[HASH] = this.protocol.hashMsgElements(
      response, TIMEMS, CLIENTID);

  this.protocol.sendMessageObj(response);
}

ChatHistory.prototype.receiveStatusResponse = function(msg) {
  if(!util.inMap(msg, CLIENTID)) {
    return;
  }
  
  var offered = [];
  if (util.inMap(msg, AVAILABLE_SEQUENCES)) {
    offered = this.expandSequences(AVAILABLE_SEQUENCES, msg[AVAILABLE_SEQUENCES]);
  } else if (util.inMap(msg, AVAILABLE_RANGE)) {
    offered = this.expandSequences(AVAILABLE_RANGE, msg[AVAILABLE_RANGE]);
  }

  if (!offered) {
    return;
  }
  
  var event = this.newHistoryEvent(msg[CLIENTID], offered);
  this.offers.push(event);

  this.requestHistory(msg[CLIENTID], this.considerOffer(offered));
}

ChatHistory.prototype.considerOffer = function(offeredSeqList) {
  var have = this.chat.getSequences(true);
  var dontHave = util.arrayDiff(offeredSeqList, have);
  
  if (!dontHave || dontHave.length == 0) {
    return [];
  }
  
  return this.considerRequest(dontHave);
}

ChatHistory.prototype.considerRequest = function(dontHave) {
  if (!util.allNonEmpty(dontHave)) {
    return dontHave;
  }
  
  if (this.requests.length > 0) {
    var now = this.protocol.dateProvider.getTime();
    var threshold = now - REPEAT_REQUEST_DELAY_MS;
       
    for (var i = 0; i < this.requests.length; i++) {
      var req = this.requests[i];
      if (req.time > threshold) {
        dontHave = util.arrayDiff(dontHave, req.sequenceList);
      }
    }
  }
  
  var len = dontHave.length;
  if (len > MAX_REQUEST_SIZE) {
    dontHave = dontHave.slice(len - MAX_REQUEST_SIZE, len);
  }
  
  return dontHave;
}

ChatHistory.prototype.scheduleRequest = function() {
  var get = {};
  var totalList = [];
  
  for (var i = 0; i < this.offers.length; i++) {
    var offer = this.offers[i];

    var consider = util.arrayDiff(offer.sequenceList, totalList);
    var requestList = this.considerOffer(consider);
    
    if(util.allNonEmpty(requestList)) {
      get[offer.clientid] = requestList;
      totalList = totalList.concat(requestList);
    }
  }
  
  this.requestBatchHistory(get);
}

ChatHistory.prototype.expandSequences = function(key, value) {
  if(!util.allNonEmpty(key, value)) {
    return [];
  }
  
  if (key == AVAILABLE_SEQUENCES) {
    value.sort();
    return value;
  } else if (key == AVAILABLE_RANGE && value.length == 2) {
    var result = [];
    var start = value[0];
    var end = value[1];
    
    for (var i = 0; i <= (end - start); i++) {
      result[i] = start + i;
    }
    
    return result;
  }
  
  return [];
}

ChatHistory.prototype.requestHistory = function(clientid, sequences) {
  if(!util.allNonEmpty(clientid, sequences)) {
    return;
  }

  var get = {};
  get[clientid] = sequences;
  this.requestBatchHistory(get);
}
  
ChatHistory.prototype.requestBatchHistory = function(get) {
  if(!util.allNonEmpty(get)) {
    return;
  }
  
  var request = this.protocol.createNewMessageObj(HISTORY);
  
  request[HISTORY] = REQUEST;
  request[GET] = get;
  request[HASH] = this.protocol.hashMsgElements(
      request, TIMEMS, CLIENTID);

  this.protocol.sendMessageObj(request);

  for (var clientid in get) {
    var event = this.newHistoryEvent(clientid, get[clientid]);
    this.requests.push(event);
  }
}

ChatHistory.prototype.sendHistory = function(historyRequest) {
  if(!util.inMap(historyRequest, GET)) {
    return;
  }
  
  var get = historyRequest[GET];

  // If there's no request for us, ignore.
  if(!util.inMap(get, this.protocol.clientid)) {
    return;
  }
  
  var requested = get[this.protocol.clientid];
  var have = this.chat.getSequences(true);
  var cansend = util.arrayIntersect(requested, have);

  // todo: limit based on msg count and total bytes 
  cansend.sort(util.compareNumbers);
  cansend.reverse();
  
  
  var messages = []
  for (var i = 0; i < cansend.length; i++) {
    var msg = this.chat.getMessage(cansend[i]);
    if (msg) {
      messages.push(msg);
    }
  }
  
  var bulkHistory = this.protocol.createNewMessageObj(HISTORY);
  bulkHistory[HISTORY] = BULK;
  bulkHistory[MESSAGES] = messages;

  this.protocol.sendMessageObj(bulkHistory);
}

ChatHistory.prototype.receiveBulkHistory = function(bulkHistory) {
  if(!util.inMap(bulkHistory, MESSAGES)) {
    return;
  }
  
  var messages = bulkHistory[MESSAGES];
  for (var i = messages.length - 1; i >= 0 ; i--) {
    this.chat.addMessage(messages[i]);
  }
  
  console_log("Added " + messages.length + " in bulk. From " + bulkHistory[NICK] + " / " + bulkHistory[CLIENTID]);
  this.protocol.rootScope.$broadcast("messageAdded");
}

ChatHistory.prototype.newHistoryEvent = function(clientid, sequenceList) {
  return new HistoryEvent(this.protocol.dateProvider.getTime(),
      clientid, sequenceList); 
}

/** 
 * @constructor
 */
function HistoryEvent(time, clientid, sequenceList) {
  this.time = time;
  this.clientid = clientid;
  this.sequenceList = sequenceList;
}


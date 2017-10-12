/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

var assert = require('assert');
require("jsmockito_import.js");

require('protocol.js');
require('history.js');

var ajsmocks = require("ajs_mocks");


suite('test_history', function() {

  var mocks = ajsmocks.mock;
  var fakes = ajsmocks.fake;
  
  var mockChat;
  var mockSend;

  var protocol;
  var chatHistory;
  
  
  setup(function() {
    ajsmocks.setup();
    
    mockChat = mocks.chat;
    protocol = new Protocol(mockChat);
    chatHistory = new ChatHistory(mockChat, protocol);
    
    protocol.connect(mocks.scope, mocks.services);
    mockSend = fakes.webSocket.send;
  });
  
  test('dummy', function() {});
  
  test('initHistory', function() {
    chatHistory.initHistory();
    
    var msg = mockito.verify(mockSend);
    
    msg(matchers.containsString('"type":"history"'));
    msg(matchers.containsString('"history":"init"'));
    msg(matchers.containsString(ajsmocks.FAKE_CHAT_NAME));
    msg(matchers.containsString(ajsmocks.FAKE_NICK));
    msg(matchers.containsString(ajsmocks.FAKE_UUID));
    msg(matchers.containsString(ajsmocks.FAKE_TIME));
    
    var expectedHash = protocol.hashMsgArguments(
        ajsmocks.FAKE_TIME, ajsmocks.FAKE_UUID);
    msg(matchers.containsString(expectedHash));
  });
  
  
  test('handleHistoryMsg_init', function() {
    mockChat.hasMessages = function() { return true; };
    mockChat.getSequences = function() { return {"key": "availablerange", "value": [1, 5]}; };
    
    chatHistory.handleHistoryMsg({"history": "init"});
    
    var msg = mockito.verify(mockSend);
    
    msg(matchers.containsString('"type":"history"'));
    msg(matchers.containsString('"history":"response"'));
    msg(matchers.containsString('"availablerange":[1,5]'));
    msg(matchers.containsString(ajsmocks.FAKE_CHAT_NAME));
    msg(matchers.containsString(ajsmocks.FAKE_NICK));
    msg(matchers.containsString(ajsmocks.FAKE_UUID));
    msg(matchers.containsString(ajsmocks.FAKE_TIME));
    
    var expectedHash = protocol.hashMsgArguments(
        ajsmocks.FAKE_TIME, ajsmocks.FAKE_UUID);
    msg(matchers.containsString(expectedHash));
  });
  
  
  test('handleHistoryMsg_response', function() {
    mockChat.getSequences = function() { return []; };
    
    chatHistory.handleHistoryMsg({
      "clientid": ajsmocks.FAKE_UUID,
      "history": "response",
      "availablesequences": [111, 112]
    });
    
    // offer event 
    assert.equal(chatHistory.offers.length, 1);
    var event = chatHistory.offers[0];
    assert.equal(event.time, ajsmocks.FAKE_TIME);
    assert.deepEqual(event.sequenceList, [111, 112]);
    
    // request event
    assert.equal(chatHistory.requests.length, 1);
    var event = chatHistory.requests[0];
    assert.equal(event.time, ajsmocks.FAKE_TIME);
    assert.deepEqual(event.sequenceList, [111, 112]);
    
    // request wire traffic
    var msg = mockito.verify(mockSend);
    
    msg(matchers.containsString('"type":"history"'));
    msg(matchers.containsString('"history":"request"'));
    msg(matchers.containsString('"get":{"'+ajsmocks.FAKE_UUID+'":[111,112]}'));
    msg(matchers.containsString(ajsmocks.FAKE_CHAT_NAME));
    msg(matchers.containsString(ajsmocks.FAKE_NICK));
    msg(matchers.containsString(ajsmocks.FAKE_UUID));
    msg(matchers.containsString(ajsmocks.FAKE_TIME));
    
    var expectedHash = protocol.hashMsgArguments(
        ajsmocks.FAKE_TIME, ajsmocks.FAKE_UUID);
    msg(matchers.containsString(expectedHash));
  });
  
  
  test('considerOffer', function() {
    mockChat.getSequences = function() { return [5, 6, 7, 8, 9]; };

    assert.deepEqual(chatHistory.considerOffer([]), []);
    
    assert.deepEqual(chatHistory.considerOffer([8, 9]), []);
    
    assert.deepEqual(chatHistory.considerOffer([1]), [1]);
    
    assert.deepEqual(
        chatHistory.considerOffer([1, 2, 3, 4, 5, 6, 7]),
        [1, 2, 3, 4]);
    
    assert.deepEqual(
        chatHistory.considerOffer([11, 12, 13, 14, 15, 16, 17]),
        [13, 14, 15, 16, 17]);
  });
  
  
  test('considerRequest_empty', function() {
    assert.deepEqual(chatHistory.considerRequest([1]), [1]);
    
    // less than or equal MAX_IMMEDIATE
    assert.deepEqual(chatHistory.considerRequest([1]), [1]);
    assert.deepEqual(chatHistory.considerRequest([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
    
    var dontHave = [1, 2, 3, 4, 5, 6, 7];
    
    // more than, but no previous requests
    assert.deepEqual(chatHistory.considerRequest(dontHave), dontHave.slice(2, dontHave.length));
  });
    
  test('considerRequest_already_requested', function() {
    var dontHave = [1, 2, 3, 4, 5, 6, 7];
    
    // more, but same already recently requested
    chatHistory.requests.push({
      time: ajsmocks.FAKE_TIME - 1,
      clientid: "client1",
      sequenceList: dontHave});
    
    assert.deepEqual(chatHistory.considerRequest(dontHave), []);
  });
  
  test('considerRequest_request_rest', function() {    
    // request the rest from another client
    chatHistory.requests.push({
      time: ajsmocks.FAKE_TIME - 10,
      clientid: "client1",
      sequenceList: [10, 11, 12, 13, 14]});
    
    assert.deepEqual(chatHistory.considerRequest(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
        [5, 6, 7, 8, 9]);
  });


  test('scheduleRequest_empty_single_offer', function() {
    mockChat.getSequences = function() { return []; };
    chatHistory.requestBatchHistory = mockito.mockFunction();

    chatHistory.offers.push({
      time: ajsmocks.FAKE_TIME - 1,
      clientid: "client1",
      sequenceList: [1, 2, 3, 4, 5, 6]});
    
    chatHistory.scheduleRequest();
    
    mockito.verify(chatHistory.requestBatchHistory)
      (matchers.hasMember("client1", [2, 3, 4, 5, 6]));
  });

  
  test('scheduleRequest_two_offers', function() {
    mockChat.getSequences = function() { return [12, 13, 14, 15]; };
    chatHistory.requestBatchHistory = mockito.mockFunction();

    chatHistory.offers.push({
      time: ajsmocks.FAKE_TIME - 2,
      clientid: "client1",
      sequenceList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]});
    chatHistory.offers.push({
      time: ajsmocks.FAKE_TIME - 1,
      clientid: "client2",
      sequenceList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]});

    chatHistory.scheduleRequest();
    
    mockito.verify(chatHistory.requestBatchHistory)
      (matchers.hasMember("client1", [7, 8, 9, 10, 11]));
    mockito.verify(chatHistory.requestBatchHistory)
      (matchers.hasMember("client2", [2, 3, 4, 5, 6]));

  });

  
  test('handleHistoryMsg_request', function() {
    mockChat.getSequences = function() { return [103]; };
    mockChat.getMessage = function() { return {"txt": "hi"}; };
    
    var get = [];
    get[ajsmocks.FAKE_UUID] = [100, 101, 103]; 
    chatHistory.handleHistoryMsg({
      "history": "request",
      "get": get
    });

    var msg = mockito.verify(mockSend);
    
    msg(matchers.containsString('"txt":"hi"'));
  });

  
  test('expandSequences', function() {
    assert.deepEqual(chatHistory.expandSequences(" ", null), [])
    assert.deepEqual(chatHistory.expandSequences(" ", 1), [])
    assert.deepEqual(chatHistory.expandSequences(null, [1]), [])
    assert.deepEqual(chatHistory.expandSequences("", [1, 4]), [])
    assert.deepEqual(chatHistory.expandSequences("availablerange", [1]), [])
    assert.deepEqual(chatHistory.expandSequences("availablerange", [1, 2, 3]), [])
    
    assert.deepEqual(
        chatHistory.expandSequences("availablerange", [1, 4]),
        [1, 2, 3, 4])
        
    assert.deepEqual(
        chatHistory.expandSequences("availablesequences", [1, 4, 2]),
        [1, 2, 4])
  });

});

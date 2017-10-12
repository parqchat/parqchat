/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

var assert = require('assert');
require('protocol.js');
require('chat.js');
require("jsmockito_import.js");

var ajsmocks = require("ajs_mocks");


suite('test_protocol', function() {
  
  var mocks = ajsmocks.mock;
  var fakes = ajsmocks.fake;
  
  var mockChat;

  var protocol;
  
  setup(function() {
    ajsmocks.setup();
    mockChat = ajsmocks.mock.chat;
    
    protocol = new Protocol(mockChat);
  });
  
  
  test('dummy', function() {});
  
  
  test('reconnect', function() {
    protocol.reconnect(mocks.scope, mocks.services);
    
    assert.equal(typeof protocol.websocket, "object");  
    mockito.verify(fakes.webSocket.onMessage)();
  });
  
  
  test('connect', function() {
    protocol.connect(mocks.scope, mocks.services);
    
    assert.equal(mockChat.name, ajsmocks.FAKE_CHAT_NAME);
    assert.equal(protocol.name, ajsmocks.FAKE_CHAT_NAME);
    assert.equal(protocol.clientid, ajsmocks.FAKE_UUID);
    assert.equal(typeof protocol.websocket, "object");  
  });
  

  test('onMessage_invalid_input', function() {
    protocol.websocketOnMessage(null);
    protocol.websocketOnMessage({});
    protocol.websocketOnMessage({"data": null});
  });


  test('onMessage_msg', function() {
    protocol.connect(mocks.scope, mocks.services);
    
    var data = "{\"txt\": \"Hi\", \"nick\": \"bob\"}";
    protocol.websocketOnMessage({data: data});
    
    mockito.verify(mockChat).addMessage(matchers.hasMember("txt", "Hi"));
    mockito.verify(mockChat).seenPeer("bob");
  });

  
  test('onMessage_pwstatus', function() {
    var mockPassword = mockito.mock({handlePassword: function (){}});
    protocol.password = mockPassword;
    
    protocol.connect(mocks.scope, mocks.services);
    
    var data = "{\"type\": \"password\", \"pwdstatus\": \"status\"}";
    protocol.websocketOnMessage({data: data});
    
    mockito.verify(mockPassword).handlePassword();
  });
  
  
  test('onMessage_history', function() {
    var mockHistory = mockito.mock({handleHistoryMsg: function (){}});
    protocol.history = mockHistory;
    
    protocol.connect(mocks.scope, mocks.services);
    mockChat.passwordOk = true;
    
    var data = "{\"type\": \"history\"}";
    protocol.websocketOnMessage({data: data});
    
    mockito.verify(mockHistory).handleHistoryMsg();
  });
  
  
  test('getMessageObj', function() {
    protocol.chat.getNextSequence = function() { return 0 };
    
    protocol.connect(mocks.scope, mocks.services);
    
    var msg = protocol.getMessageObj("bear");
    
    assert.equal(msg.type, "msg");
    assert.equal(msg.timems, ajsmocks.FAKE_TIME);
    assert.equal(msg.clientid, ajsmocks.FAKE_UUID);
    assert.equal(msg.chat, ajsmocks.FAKE_CHAT_NAME);
    assert.equal(msg.nick, ajsmocks.FAKE_NICK);
    assert.equal(msg.txt, "bear");
    
    var expectedHash = protocol.hashMsgArguments(
        ajsmocks.FAKE_TIME, 0, ajsmocks.FAKE_UUID, ajsmocks.FAKE_NICK, "bear");
    assert.equal(msg.hash, expectedHash);
  });
  
  
  test('send', function() {
    var seq = 123;
    
    protocol.chat.getNextSequence = function() {
      return seq;
    };
    
    var mockAddMessage = mockito.mockFunction();
    protocol.chat.addMessage = mockAddMessage;
    
    var mockSendMessageObj = mockito.mockFunction();
    protocol.sendMessageObj = mockSendMessageObj;
    
    protocol.connect(mocks.scope, mocks.services);
    
    protocol.send("hi");
    var call = mockito.verify(mockAddMessage);
    call(matchers.hasMember("sequence", seq));
    
    var expectedHash = protocol.hashMsgArguments(
        ajsmocks.FAKE_TIME, seq, ajsmocks.FAKE_UUID, ajsmocks.FAKE_NICK, "hi");
    call(matchers.hasMember("hash", expectedHash));
  });

  
  test('hashMsgElements', function() {
    var msg = [];
    msg["e0"] = "car";
    msg["e1"] = "test";
    msg["e2"] = "bird";
    msg["e3"] = "BEST";
    
    assert.equal(
        protocol.hashMsgElements(msg, "e1", "e3"),
        "1cb03f4d42499f4612bf14463465c5538665a2c0784c238bfc6702bc");    
  });
  
  test('hashMsgArguments', function() {
    // empty
    assert.equal(
        protocol.hashMsgArguments(),
        "6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7");
    
    // one arg
    assert.equal(
        protocol.hashMsgArguments("test"),
        "3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b");
    
    // two args
    assert.equal(
        protocol.hashMsgArguments("test", "BEST"),
        "1cb03f4d42499f4612bf14463465c5538665a2c0784c238bfc6702bc");
    
    // empty in between
    assert.equal(
        protocol.hashMsgArguments("test", "", "BEST"),
        "1cb03f4d42499f4612bf14463465c5538665a2c0784c238bfc6702bc");

    // numeric
    assert.equal(
        protocol.hashMsgArguments(123456, "BEST"),
        "b2a69f214687e09bc3cb110c46fd0af4428b7ab1f18152bb9f4dabb5");
  });
  
  
});

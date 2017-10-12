/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

var assert = require('assert');
require('protocol.js');
require('password.js');
require('chat.js');
require("jsmockito_import.js");

var ajsmocks = require("ajs_mocks");




suite('test_password', function() {
  
  var mocks = ajsmocks.mock;
  var fakes = ajsmocks.fake;
  var mockRootScope;
  
  var mockChat;

  var protocol;

  var password;
  
  setup(function() {
    ajsmocks.setup();
    mockRootScope = ajsmocks.mock.services.$rootScope;
    mockChat = ajsmocks.mock.chat;
    
    protocol = new Protocol(mockChat);
    protocol.connect(mocks.scope, mocks.services);
    
    password = new Password(mockChat, protocol);
  });
  
  test('dummy', function() {});
  
  test('handlePassword_ok', function() {
    var mockBroadcast = mockRootScope.$broadcast = mockito.mockFunction();
    
    msg = {};
    msg[PWSTATUS] = PASSWORD_OK;
    password.handlePassword(mockRootScope, msg);
    
    assert.equal(true, mockChat.passwordOk);
    assert.equal(true, mockChat.passwordProtected);
    mockito.verify(mockBroadcast)("savestate");
  });
  
  test('handlePassword_wrong', function() {
    var mockBroadcast = mockRootScope.$broadcast = mockito.mockFunction();
    
    msg = {};
    msg[PWSTATUS] = PASSWORD_WRONG;
    password.handlePassword(mockRootScope, msg);
    
    assert.equal(false, mockChat.passwordOk);
    assert.equal(true, mockChat.passwordProtected);
    mockito.verify(mockBroadcast, JsMockito.Verifiers.never())();
  });

  
  test('hashPassword', function() {
    assert.equal(
        password.hashPassword(PWD_HASH_VARIANT, "pass", "bob"),
        "f9e849ce959c649f1fc094501d938b62c1be72207f0c2c43642372e5");
    
    assert.equal(
        password.hashPassword("SHA3-256", "pass", "bob"),
        "9b5d57d05a768cdfa7531038412639a07fe6a4f19057548e3a19e899acf29941");
    
    assert.equal(
        password.hashPassword("SHA3-384", "pass", "bob"),
        "4fc1eb9a06b471270f3639d692ddaaa4bc315a0c3a62f46b97e118d9d0419fd0fdb687841b01818bac475fe7e26b947c");
  });
  
});

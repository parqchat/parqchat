/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

require("jsmockito_import.js");

require('chat.js');

var obj = {
    
  FAKE_CHAT_NAME: "TEST_CHAT_NAME",
  FAKE_NICK: "fake_nick_bob",
  FAKE_UUID: "d42ddba1-2a65-4555-9555-555555555555",
  FAKE_TIME: 1502255549944,

  
  emptyServices: {
    $rootScope: {},
    $window: {},
    $http: {},
    $websocket: {},
    $location: {},
    $timeout: {},
    $interval: {},
    $window: {},
    SharedState: {},
    
    parqSettings: {},
    dateProvider: {},
    randomProvider: {},
    uuidGenerator: {}
  },

  
  mock: {
    services: null,
    
    websocket: null,
    window: null,
    scope: null,
    dateProvider: null,
    uuidGenerator: null,
    
    chat: null,
  },

  
  fake: {
    webSocket: null,
  },
  
  setup: function() {
    obj.fake.webSocket = {
        onMessage: mockito.mockFunction(),
        onOpen: mockito.mockFunction(),
        onError: mockito.mockFunction(),
        onClose: mockito.mockFunction(),
        send: mockito.mockFunction(),
      };
    
    obj.mock.window = mockito.mock({});
    obj.mock.window.location = mockito.mockFunction();
    obj.mock.Scope = mockito.mock({});
    obj.mock.dateProvider = {
        getTime: function() { return obj.FAKE_TIME }
    };
    obj.mock.uuidGenerator = {
      generateUUID: function() { return obj.FAKE_UUID }  
    }
    
    // TODO: make this work
    //obj.mock.services = Object.assign({}, obj.emptyServices);
    obj.mock.services = obj.emptyServices;
    
    obj.mock.services.$window = obj.mock.window;
    obj.mock.services.$location = mockito.mock({
      host: function() {},
    });
    obj.mock.services.$rootScope = mockito.mock({
      $broadcast: function() {},
    });
    obj.mock.services.$websocket = function() {
      return obj.fake.webSocket;
    };
    obj.mock.services.dateProvider = obj.mock.dateProvider;
    obj.mock.services.uuidGenerator = obj.mock.uuidGenerator;
    
    obj.mock.services.parqSettings.model = [];
    obj.mock.services.parqSettings.model.nick = obj.FAKE_NICK;
    
    obj.mock.chat = mockito.mock(Chat);
    obj.mock.chat.name = obj.FAKE_CHAT_NAME;

  }
  
};

module.exports = obj;

/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

/**
 * $parqSettings Factory
 * 
 * @constructor
 * @ngInject
 */
function parqSettingsFactory($rootScope) {
  var emptyModel = {
      "nick": "",
      "storageType": "session",
      "chatSettings": {},
    };

  var settings = {

    model: emptyModel,

    tmp: {
      chats: {},
      currentChat: false,
    },

    getChat: function(name) {
      var chat;
      if (name in settings.tmp.chats) {
        chat = settings.tmp.chats[name];
        console_log("Found previous chat: " + chat);
      } else {
        chat = new Chat(name);
        settings.tmp.chats[name] = chat;
        console_log(settings.model);
        settings.model["chatSettings"][name] = {"name": name};
        console_log("Created new chat: " + chat);
        $rootScope.$broadcast("savestate");
      }

      settings.tmp.currentChat = chat;
      return chat;
    },

    getStorage: function(type) {
      if(type == "local") {
        console_log("Getting localStorage");
        return localStorage;
      } else if (type == "session") {
        console_log("Getting sessionStorage");
        return sessionStorage;
      } else if (type == "none") {
        console_log("Getting empty storage");
        return {};
      } else if(!type) {
        if (localStorage.hasOwnProperty("parqchat")) {
          return localStorage;
        } else if(sessionStorage.hasOwnProperty("parqchat")) {
          return sessionStorage;
        }
      }

     console_log("Getting default empty storage");
     return {};
    },
    
    savestate: function () {
      console_log("savestate");
      console_log(settings.model);

      for(var name in settings.tmp.chats) {
        var chat = settings.tmp.chats[name];
        settings.model.chatSettings[name] = {
           "name": name, "password": chat["password"] };
      }

      var tmpModel = {
        "nick": settings.model["nick"],
        "storageType": settings.model.storageType,
        "chatSettings": settings.model["chatSettings"]
      };

      if(sessionStorage.hasOwnProperty("parqchat")) {
        delete sessionStorage.parqchat;
      }
      if (localStorage.hasOwnProperty("parqchat")) {
        delete localStorage.parqchat;
      }

      if (settings.model.storageType == "none") {
        sessionStorage.parqStorageType = "none";
      }

      var storage = settings.getStorage(settings.model.storageType);
      storage.parqchat = angular.toJson(tmpModel);
      console_log(storage);
    },

    restorestate: function () {
      console_log("restorestate");
      settings.model = emptyModel;

      if (sessionStorage.hasOwnProperty("parqStorageType") &&
          sessionStorage.parqStorageType == "none") {
        settings.model.storageType = "none";
      }

      var storage = settings.getStorage();

      console_log(storage);

      if(!("parqchat" in storage)) {
        return;
      }

      var tmpModel = angular.fromJson(storage.parqchat);
      settings.model = {
        "nick": "nick" in tmpModel ? tmpModel["nick"] : "",
        "storageType": "storageType" in tmpModel ? tmpModel["storageType"] : "session",
        "chatSettings": "chatSettings" in tmpModel ? tmpModel["chatSettings"] : {}
      };
      console_log(settings.model);

      for(var name in settings.model.chatSettings) {
        if (!(name in settings.tmp.chats)) {
          var chat = new Chat(name);
          chat["password"] = settings.model.chatSettings[name]["password"];
          settings.tmp.chats[name] = chat;
        }
      }

      console_log(settings.tmp);
    }
  }

  $rootScope.$on("savestate", settings.savestate);
  $rootScope.$on("restorestate", settings.restorestate);

  return settings;
}
parqSettingsFactory.$inject = ["$rootScope"];
app.factory('parqSettings', parqSettingsFactory);

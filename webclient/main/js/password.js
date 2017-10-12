/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

// DEV START  ----->
// This will be removed during the release JS compile.
if(!(typeof require === 'undefined' || require == null)) {
  var jsSHA = require("sha3.js").jsSHA;
  require("consts.js");
}
//<------ DEV END

PASSWORD = "password";
PWDCMD = "pwdcmd";
SET = "set";
PWHASHED = "pwhashed";
PWSTATUS = "pwstatus";
PASSWORD_OK = "password_ok";
PASSWORD_SET = "password_set";
PASSWORD_WRONG = "password_wrong";

// TODO: Add more here.
PWD_HASH_VARIANT = "SHA3-224";


/** 
 * @constructor
 */
Password = function(chatObj, protocolObj) {
  this.chat = chatObj;
  this.protocol = protocolObj;
}

Password.prototype.handlePassword = function($rootScope, msg) {
  if(!util.inMap(msg, PWSTATUS)) {
    return;
  }

  var pwstatus = msg[PWSTATUS];
  
  if(pwstatus == PASSWORD_OK || pwstatus == PASSWORD_SET) {
    this.chat.passwordOk = true;
    this.chat.passwordProtected = true;

    this.protocol.sendMessageObj(this.protocol.getInitObj());
    this.protocol.history.initHistory();
    $rootScope.$broadcast("savestate");
  } else {
    this.chat.passwordOk = false;
    this.chat.passwordProtected = true;
  }
}

Password.prototype.setPassword = function() {
  console_log("sending password: ");
  //this.protocol.sendServiceMessage({"pwdcmd":"set", "password": this.chat.password});
  
  var request = this.protocol.createNewMessageObj(PASSWORD);
  
  request[PWDCMD] = SET;
  request[PWHASHED] = this.hashPassword(
      PWD_HASH_VARIANT, this.chat.password, this.chat.name);
  request[HASHMETHOD] = PWD_HASH_VARIANT;
  
  this.protocol.sendMessageObj(request);
}

Password.prototype.hashPassword = function(hashVariant, plainPass, chatName) {
  var sha = new jsSHA(hashVariant, "TEXT");
  sha.update(plainPass);
  sha.update(chatName);
  return sha.getHash("HEX");
}

/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

// DEV START  ----->
// This will be removed during the release JS compile.

var log = true;
if(!(typeof require === 'undefined' || require == null)) {
  //function console_log() {};
  log = false;
  module.exports = console_log;
}

function console_log(str) { 
  if (log) {
    console.log(str);
  }
}

// <------ DEV END

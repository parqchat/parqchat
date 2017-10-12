/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

var assert = require('assert');
require("jsmockito_import.js");

require("chat.js");


suite('test_chat', function() {
  
  var chat;
  
  setup(function() {
    chat = new Chat("name");
  });

  test('dummy', function() {});
  
  
  test('getSequences_empty', function() {
    assert.deepEqual(chat.getSequences(), []);
  });


  test('getSequences_one', function() {
    chat.addMessage({"sequence": 123});
    
    //console.log(chat.getSequences());
    
    assertThat(chat.getSequences(), matchers.hasMember("key", "availablesequences"));
    assertThat(chat.getSequences(), matchers.hasMember("value", [123]));
  });
  
  
  test('getSequences_two', function() {
    chat.addMessage({"sequence": 101});
    chat.addMessage({"sequence": 102});
    
    //console.log(chat.getSequences());
    
    assertThat(chat.getSequences(), matchers.hasMember("key", "availablesequences"));
    assertThat(chat.getSequences(), matchers.hasMember("value", [101, 102]));
  });
  
  
  test('getSequences_three', function() {
    chat.addMessage({"sequence": 101});
    chat.addMessage({"sequence": 102});
    chat.addMessage({"sequence": 103});
    
    //console.log(chat.getSequences());
    
    assertThat(chat.getSequences(), matchers.hasMember("key", "availablerange"));
    assertThat(chat.getSequences(), matchers.hasMember("value", [101, 103]));
    
    assert.deepEqual(chat.getSequences(true), [101, 102, 103]);
  });


  test('getSequences_broken', function() {
    chat.addMessage({"sequence": 101});
    chat.addMessage({"sequence": 102});
    chat.addMessage({"sequence": 103});
    chat.addMessage({"sequence": 105});
    
    //console.log(chat.getSequences());

    assertThat(chat.getSequences(), matchers.hasMember("key", "availablesequences"));
    assertThat(chat.getSequences(), matchers.hasMember("value", [101, 102, 103, 105]));
  });
  
});

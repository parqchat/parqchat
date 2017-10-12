/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

var assert = require('assert');
require("jsmockito_import.js");


var ajs_util = require('ajs_util');

var FAKE_TIME = 1502255549944;
var FAKE_RANDOM = 0.3379728174768388;


suite('test_ajs_utils', function() {
  
  var mockScope;
  var mockElement;
  var mockAttrs;
  var mockTimeout;
  var mockWindow;
  var mockDate;
  var mockRandom;
  
  setup(function() {
    mockScope = mockito.mock({});
    mockElement = mockito.mock({
      bind: function () {}
    });
    mockAttrs = mockito.mock({});
    mockTimeout = mockito.mockFunction();
    mockWindow = mockito.mock({});
    mockDate = {
      getTime: function() { return FAKE_TIME }
    }
    // TODO: use a static random seed instead
    mockRandom = {
      random: function() { return FAKE_RANDOM }  
    }
  });

  
  test('dummy', function() {});
  
  
  test('dirNgEnter', function() {
    var f = ajs_util.dirNgEnter();
    f(mockScope, mockElement, mockAttrs);
    // TODO: continue with the rest
  });
  
  
  test('automaticFocus', function() {
    var o = ajs_util.automaticFocus(mockTimeout);
    o.link(mockScope, mockElement);
    // TODO: continue with the rest
  });

  
  test('dateProviderFactory', function() {
    var obj = ajs_util.dateProviderFactory();
    
    var d = obj.getDate();
    assert.equal(d > 0, true);
    
    var t1 = obj.getTime();
    var t2 = obj.getTime();
    assert.equal(t1 > 0, true);
    assert.equal(t2 >= t1, true);
  });

  
  test('randomProviderFactory', function() {
    var obj = ajs_util.randomProviderFactory();
    
    var r1 = obj.random();
    var r2 = obj.random();
    assert.equal(r1 > 0, true);
    assert.equal(r2 > 0, true);
    assert.equal(r1 != r2, true);    
  });

  
  test('uuidGeneratorFactory', function() {
    var obj = ajs_util.uuidGeneratorFactory(mockWindow, mockDate, mockRandom);
    
    var uuid = obj.generateUUID();
    assert.equal("d42ddba1-2a65-4555-9555-555555555555", uuid);
  });
  
  
  test('dummy', function() {});
});


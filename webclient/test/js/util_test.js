/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

var assert = require('assert');

require('util.js');

suite('test_util', function() {
  
  test('dummy', function() {});


  test('getConfig', function() {
    var conf = util.getConfig();
    
    assert.equal(conf["port"], 9999);
    assert.equal(conf["linkport"], ":9999");
    assert.equal(conf["protocol"], "ws");
  });
  

  test('inMap', function() {
    assert.equal(util.inMap(null), false);
    assert.equal(util.inMap({}), false);
    assert.equal(util.inMap({"a": 1}), false);
    assert.equal(util.inMap({"a": 1}, "b"), false);
    assert.equal(util.inMap({"a": null}, "a"), false);
    assert.equal(util.inMap({"a": undefined}, "a"), false);
    
    assert.equal(util.inMap({"a": 1}, "a"), true);
    assert.equal(util.inMap({"a": 1, "b": 2}, "a"), true);
    assert.equal(util.inMap({"a": 1, "b": 2}, "a", "b"), true);
  });
  

  test('inMapWith', function() {
    assert.equal(util.inMapWith(null), false);
    assert.equal(util.inMapWith(null, null), false);
    assert.equal(util.inMapWith(null, null, null), false);
    assert.equal(util.inMapWith({}), false);
    assert.equal(util.inMapWith({}, null), false);
    assert.equal(util.inMapWith({}, null, null), false);
    assert.equal(util.inMapWith({"a": 1}, null), false);
    assert.equal(util.inMapWith({"a": 1}, "b", null), false);
    
    assert.equal(util.inMapWith({"a": 1}, "a", 1), true);
    assert.equal(util.inMapWith({"a": 1, "b": 2}, "b", 2), true);
  });


  test('allTrue', function() {
    assert.equal(util.allTrue(null), false);
    assert.equal(util.allTrue(undefined), false);
    assert.equal(util.allTrue(false), false);
    assert.equal(util.allTrue(""), false);
    assert.equal(util.allTrue(null, ""), false);
    
    assert.equal(util.allTrue([]), true);
    assert.equal(util.allTrue({}), true);
    
    assert.equal(util.allTrue(true), true);
    assert.equal(util.allTrue("abc"), true);
    assert.equal(util.allTrue([1]), true);
    assert.equal(util.allTrue({"a": 1}), true);
  });
  
  
  test('allNonEmpty', function() {
    assert.equal(util.allNonEmpty(null), false);
    assert.equal(util.allNonEmpty(undefined), false);
    assert.equal(util.allNonEmpty(false), false);
    assert.equal(util.allNonEmpty(""), false);
    assert.equal(util.allNonEmpty(null, ""), false);
    
    assert.equal(util.allNonEmpty([]), false);
    assert.equal(util.allNonEmpty({}), false);
    assert.equal(util.allNonEmpty(true, []), false);
    assert.equal(util.allNonEmpty(true, {}), false);
    
    assert.equal(util.allNonEmpty(true), true);
    assert.equal(util.allNonEmpty("abc"), true);
    assert.equal(util.allNonEmpty([1]), true);
    assert.equal(util.allNonEmpty({"a": 1}), true);
    assert.equal(util.allNonEmpty(true, true), true);
  });

  
  
  test('arrayIntersect', function() {
    assert.deepEqual(util.arrayIntersect([1], []), []);
    assert.deepEqual(util.arrayIntersect([], [1]), []);
    assert.deepEqual(util.arrayIntersect([1], [2]), []);
    assert.deepEqual(util.arrayIntersect([1], [1, 2]), [1]);
    assert.deepEqual(util.arrayIntersect([1, 2, 3], [1, 2]), [1, 2]);
  });
  

  test('arrayDiff', function() {
    assert.deepEqual(util.arrayDiff([1], []), [1]);
    assert.deepEqual(util.arrayDiff([], [2]), []);
    assert.deepEqual(util.arrayDiff([1], [2]), [1]);
    assert.deepEqual(util.arrayDiff([1], [2, 3]), [1]);
    assert.deepEqual(util.arrayDiff([1, 2], [3, 4]), [1, 2]);
    assert.deepEqual(util.arrayDiff([1, 2, 3], [2, 3, 4]), [1]);
  });
  
  
  test('arrayInArray', function() {
    assert.equal(util.arrayInArray([], null), false);
    assert.equal(util.arrayInArray(null, []), false);
    
    assert.equal(util.arrayInArray([], []), true);
    assert.equal(util.arrayInArray([], [1]), true);
    assert.equal(util.arrayInArray([1], []), false);
    
    assert.equal(util.arrayInArray([1,2], [1,2,3]), true);
    assert.equal(util.arrayInArray([1,2,3], [1,2]), false);
  });
});



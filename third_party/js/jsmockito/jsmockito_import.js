require("jshamcrest");

matchers = JsHamcrest.Matchers;
ops = JsHamcrest.Operators;

require("jsmockito");
require("object.js");
require("function.js");
require("verifiers.js");
require("native_types.js");
require("integration.js");

mockito = JsMockito;



assertThat = function(actualValue, matcherOrValue, message) {
  JsHamcrest.Operators.assert(actualValue, matcherOrValue, {
    message: message,
    fail: function (msg) {
      throw new Error(msg);
    }
  });
}

/*
module.exports = {
  mockito: JsMockito,

  hamcrest: JsHamcrest,
  matchers: JsHamcrest.Matchers,
  ops: JsHamcrest.Operators,
  assertThat: assertThat,
};
*/
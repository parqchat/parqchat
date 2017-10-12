# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

package(default_visibility = ["//visibility:public"])

load("//webclient/test/mocha:mocha_test.bzl", "mocha_test")

mocha_test(
  name = "example_test",
  srcs = ["example_test.js"],
)

sh_binary(
  name = "mocha",
  srcs = ["mocha.sh"],
)

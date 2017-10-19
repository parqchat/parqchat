# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

load("//webclient/test/mocha:mocha_test.bzl", "mocha_test")

mocha_test(
  name = "ajs_util_test",
  srcs = ["ajs_util_test.js"],
  deps = [
    "//third_party/js/jsmockito",
    "//webclient/main/js",
  ],
)

mocha_test(
  name = "chat_test",
  srcs = ["chat_test.js"],
  deps = [
    "//third_party/js/jsmockito",
    "//webclient/main/js",
  ],
)

mocha_test(
  name = "history_test",
  srcs = ["history_test.js"],
  deps = [
    "//third_party/js/jsmockito",
    "//webclient/main/js",
    "//webclient/main/testing:ajs_mocks",
  ],
)

mocha_test(
  name = "password_test",
  srcs = ["password_test.js"],
  deps = [
    "//third_party/js/jsmockito",
    "//webclient/main/js",
    "//webclient/main/testing:ajs_mocks",
  ],
)

mocha_test(
  name = "protocol_test",
  srcs = ["protocol_test.js"],
  deps = [
    "//third_party/js/jsmockito",
    "//webclient/main/js",
    "//webclient/main/testing:ajs_mocks",
  ],
)

mocha_test(
  name = "common_util_test",
  srcs = ["common_util_test.js"],
  deps = [
    "//webclient/main/js",
  ],
)

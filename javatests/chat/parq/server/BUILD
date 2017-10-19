# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

java_test(
  name = "ChatListenerTest",
  srcs = ["ChatListenerTest.java", "FrameMatcher.java"],
  deps = [
    "//java/chat/parq/server",
    "@io_dropwizard_metrics_core",
    "@org_mockito_core",
    "@org_simpleframework_http",
    "@org_simpleframework_transport",
  ]
)

java_test(
  name = "PasswordHandlerTest",
  srcs = ["PasswordHandlerTest.java", "FrameMatcher.java"],
  deps = [
    "//java/chat/parq/server",
    "@io_dropwizard_metrics_core",
    "@org_mockito_core",
    "@org_simpleframework_http",
    "@org_simpleframework_transport",
  ]
)

java_test(
  name = "StartTest",
  srcs = ["StartTest.java"],
  deps = [
    "//java/chat/parq/server",
  ],
  data = [
    "//webclient/main/html",
    "//webclient/main/js",
  ]
)

# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

package(default_visibility = ["//visibility:public"])

java_library(
  name = "server",
  srcs = glob(["*.java"]),
  deps = [
    "//java/chat/parq/util",
    "@com_google_gson",
    "@io_dropwizard_metrics_core",
    "@org_simpleframework_http",
    "@org_simpleframework_transport",
  ],
  data = [
    "//third_party/js/angular",
    "//third_party/js/angular_websocket",
    "//third_party/js/jsSHA",
    "//third_party/js/mobile_angular_ui",
    "//third_party/js/qrcode",

    "//webclient/main/assets",
    "//webclient/main/html",
    "//webclient/main/js",
  ]
)

java_binary(
  name = "dev_server",
  main_class = "chat.parq.server.Server",
  runtime_deps = [":server"],
  args = [
    "devMode=true",
    "enableCache=false",
    "basePath=.",
    "homeFile=webclient/main/html/index.html",
    "defaultFile=webclient/main/html/chat.html",
    "httpPort=9980",
    "chatPort=9999",
    "useTls=false"
  ]
)
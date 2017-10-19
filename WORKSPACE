# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

workspace(name = "parqchat")

load("@bazel_tools//tools/build_defs/repo:java.bzl", "java_import_external")

java_import_external(
  name = "com_google_gson",
  licenses = ["notice", "restricted"],  # Apache License 2.0 and LGPL
  jar_urls = [
    "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.8.1/gson-2.8.1.jar",
  ],
  jar_sha256 = "4f65e7dca6528d644031c43d159f1614f2ed58db7daf75f1e91a9fc1b57818d4"
)

java_import_external(
  name = "org_hamcrest_core",
  licenses = ["notice"],  # BSD-3-Clause
  jar_urls = [
    "http://bazel-mirror.storage.googleapis.com/repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar",
    "http://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar",
    "http://maven.ibiblio.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar"
  ],
  jar_sha256 = "66fdef91e9739348df7a096aa384a5685f4e875584cce89386a7a47251c4d8e9",
)

java_import_external(
  name = "org_mockito_core",
  licenses = ["notice"],  # MIT
  jar_urls = [
    "http://repo1.maven.org/maven2/org/mockito/mockito-core/2.11.0/mockito-core-2.11.0.jar",
  ],
  deps = [
    "@org_hamcrest_core",
    "@org_objenesis",
    "@net_byte_buddy",
    "@net_byte_buddy_agent",
  ],
  jar_sha256 = "fdcd5b00d99f997f82e78333c970d7a80f2247da58977b2a8afd8790a099ccb4",
)

java_import_external(
  name = "net_byte_buddy",
  licenses = ["notice"],  # Apache License 2.0
  jar_urls = [
    "https://repo1.maven.org/maven2/net/bytebuddy/byte-buddy/1.7.4/byte-buddy-1.7.4.jar",
  ],
  jar_sha256 = "17f9fc3b81f3c5b3d0ba3b6496f4512099c4755799e9786e38d53d3af0b42abf"
)

java_import_external(
  name = "net_byte_buddy_agent",
  licenses = ["notice"],  # Apache License 2.0
  jar_urls = [
    "https://repo1.maven.org/maven2/net/bytebuddy/byte-buddy-agent/1.7.4/byte-buddy-agent-1.7.4.jar",
  ],
  jar_sha256 = "c0f43cc1813a9bdc93347b32033a19bc3619cb1527d177618ea6960fe053c839"
)

java_import_external(
  name = "org_objenesis",
  licenses = ["notice"],  # Apache License 2.0
  jar_urls = [
    "https://repo1.maven.org/maven2/org/objenesis/objenesis/2.6/objenesis-2.6.jar",
  ],
  jar_sha256 = "5e168368fbc250af3c79aa5fef0c3467a2d64e5a7bd74005f25d8399aeb0708d"
)

java_import_external(
  name = "io_dropwizard_metrics_core",
  licenses = ["notice"],  # Apache License 2.0
  jar_urls = [
    "https://repo1.maven.org/maven2/io/dropwizard/metrics/metrics-core/3.1.0/metrics-core-3.1.0.jar",
    "http://maven.ibiblio.org/maven2/io/dropwizard/metrics/metrics-core/3.1.0/metrics-core-3.1.0.jar",
  ],
  deps = [
    "@org_slf4j_api",
  ],
  jar_sha256 = "d88845f17cd2c2d2203145e6f52e0c992cbe14d5887ddce97c9aceeae444b331"
)

java_import_external(
  name = "org_simpleframework_common",
  licenses = ["notice", "restricted"],  # Apache License 2.0 and LGPL
  jar_urls = [
    "https://repo1.maven.org/maven2/org/simpleframework/simple-common/6.0.1/simple-common-6.0.1.jar",
    "http://maven.ibiblio.org/maven2/org/simpleframework/simple-common/6.0.1/simple-common-6.0.1.jar",
  ],
  jar_sha256 = "50cadbcd70d80cf627661628e9d5163fe4f0757b87e89e68b43663b509c031d5"
)

java_import_external(
  name = "org_simpleframework_http",
  licenses = ["notice", "restricted"],  # Apache License 2.0 and LGPL
  jar_urls = [
    "https://repo1.maven.org/maven2/org/simpleframework/simple-http/6.0.1/simple-http-6.0.1.jar",
    "http://maven.ibiblio.org/maven2/org/simpleframework/simple-http/6.0.1/simple-http-6.0.1.jar",
  ],
  deps = [
    "@org_simpleframework_common",
    "@org_simpleframework_transport",
  ],
  jar_sha256 = "ef5ff4dc0257c1eebed07da22b4695ffdd3030da8d224282fb9c565b56cf2f24"
)

java_import_external(
  name = "org_simpleframework_transport",
  licenses = ["notice", "restricted"],  # Apache License 2.0 and LGPL
  jar_urls = [
    "https://repo1.maven.org/maven2/org/simpleframework/simple-transport/6.0.1/simple-transport-6.0.1.jar",
    "http://maven.ibiblio.org/maven2/org/simpleframework/simple-transport/6.0.1/simple-transport-6.0.1.jar",
  ],
  deps = [
    "@org_simpleframework_common",
  ],
  jar_sha256 = "1bd627d7252500462075f4a08cd0db4dbbf1ccecc08b093709551b54c8649085"
)

java_import_external(
  name = "org_slf4j_api",
  licenses = ["notice"],  # MIT
  jar_urls = [
    "https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.jar",
  ],
  jar_sha256 = "18c4a0095d5c1da6b817592e767bb23d29dd2f560ad74df75ff3961dbde25b79"
)

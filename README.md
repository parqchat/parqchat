# parq.chat&trade;  [![Build Status](https://travis-ci.org/parqchat/parqchat.svg?branch=master)](https://travis-ci.org/parqchat/parqchat)

Free open anonymous chat

Live at:

**https://parq.chat**

## Clone, test and run

* [Install Bazel](https://docs.bazel.build/versions/master/install.html) (version 0.6.1 or later required)
* Install NodeJS, [Mocha](http://mochajs.org/#installation) (e.g. *apt install mocha*, or *npm install mocha*)
* Download and run the tests:
```
    git clone https://github.com/parqchat/parqchat.git
    cd parqchat
    bazel version
    bazel test ...
```
* Start the local dev server
```
    bazel run //java/chat/parq/server:dev_server
```
* Wait 5 - 10 seconds for the "Server running" message
* Go to http://localhost:9999

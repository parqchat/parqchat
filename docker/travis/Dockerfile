# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

FROM ubuntu:17.04

RUN apt-get update  && \
    apt-get -y install curl git tree htop sudo mocha openjdk-8-jdk  && \
    echo "deb [arch=amd64] http://storage.googleapis.com/bazel-apt stable jdk1.8" >> /etc/apt/sources.list.d/bazel.list  && \
    curl https://bazel.build/bazel-release.pub.gpg | apt-key add -  && \
    apt-get update && \
    apt-get -y install bazel


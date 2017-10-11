#!/bin/bash
# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

dir=$(dirname $0)
workspace=$(realpath $dir/../..)

sudo docker build -t parqchat_test $dir
sudo docker run -v $workspace:/parqchat:ro parqchat_test /bin/sh -c "cd /parqchat; bazel test ..."

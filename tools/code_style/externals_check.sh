#!/bin/bash
# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

grep 'name.*_' WORKSPACE | cut -d '"' -f 2 | \
    while read name; do
	target="@${name}"
	echo $target
	bazel build $target || exit 1
    done

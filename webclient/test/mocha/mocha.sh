#!/bin/bash
# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

which mocha > /dev/null || (echo "\nERROR: ** 'mocha' not found in PATH. Mocha installation required.\n"; exit 1)

NODE_PATH=.
for f in "$@"; do
  if [ -f $f ]; then
    NODE_PATH="$NODE_PATH:`dirname $f`"
  fi
done

export NODE_PATH

cmd="mocha $*"

echo "NODE_PATH=$NODE_PATH"
echo "$cmd"

$cmd

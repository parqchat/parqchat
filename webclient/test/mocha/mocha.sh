#!/bin/bash
# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

which mocha > /dev/null || (echo "\nERROR: ** 'mocha' not found in PATH. Mocha installation required.\n"; exit 1)

CMD="mocha "
TEST_FILES=""
NODE_PATH=""

for arg in "$@"; do
  if [ -f $arg ]; then
    NODE_PATH="$NODE_PATH:`dirname $arg`"
    TEST_FILES="$arg $TEST_FILES"
  elif [ -d $arg ]; then
    NODE_PATH="$NODE_PATH:$arg"
  else
    CMD="$CMD $arg"
  fi
done

LEAF_DIRS=`find . -type d -links 2 | tr '\n' ':'`
NODE_PATH="$NODE_PATH:$LEAF_DIRS"
NODE_PATH=`echo $NODE_PATH | tr ':' '\n' | sort -u | tr '\n' ':'`
NODE_PATH=".$NODE_PATH"
export NODE_PATH

CMD="$CMD $TEST_FILES"

echo "NODE_PATH=$NODE_PATH"
echo "$CMD"

$CMD


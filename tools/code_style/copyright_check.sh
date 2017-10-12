#!/bin/bash
# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

copyright="Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat"

dir=`dirname $0`
whitelist=$dir/whitelist
workspace=`git rev-parse --show-toplevel`

function ilog() {
  #echo $*
  true
}

ilog "PWD: $PWD"
[ -f $workspace/WORKSPACE ] || { echo "Bazel WORKSPACE not found"; exit 1; }
ilog "Root workspace: $workspace"

filelist=`mktemp`

find $workspace -type f -not -path "*/third_party/*" -not -path "*/.git/*" > $filelist

while read line; do
  ilog "Ignoring $line"
  cat $filelist | grep -v "$line" > ${filelist}.tmp
  mv ${filelist}.tmp $filelist
done < $whitelist

ret=0

while read f; do
  ilog $f
  grep -q "$copyright" $f || { echo "Copyright message not found in $f"; ret=1; }
done < $filelist

exit $ret

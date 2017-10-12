# Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat

# Runs all the srcs files as Mocha tests. By default, the tdd (Test Driven
# Development) user interface is used. It can be changed with the ui option.
#
# In this example, it is assumed that mocha (and nodejs) is already installed
# on the system, and on the PATH. The test will fail otherwise. (See the
# mocha.sh script).

def mocha_test(name, srcs, deps=[], ui="tdd"):

  native.sh_test(
    name = name,
    srcs = ["//webclient/test/mocha:mocha.sh"],
    data = srcs + deps,
    args = ["-u", ui]
         + [Label(d).package for d in deps]
	 + ["$(location %s)" % s for s in srcs],
  )

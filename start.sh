#!/bin/sh
set -e

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

#echo HELLO WORLD
#node --version
#npm --version

#npm start
node $SCRIPTPATH/script.js

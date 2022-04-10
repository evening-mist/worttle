#!/bin/sh

if [ "${NODE_ENV}" = "development" ]; then
  echo "yarn dev"
  yarn dev
else
  echo "yarn build"
  yarn build
fi

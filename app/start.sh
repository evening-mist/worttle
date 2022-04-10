#!/bin/sh

if [ "${NODE_ENV}" = "develop" ]; then
  yarn dev
else
  yarn build
fi

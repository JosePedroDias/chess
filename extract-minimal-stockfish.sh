#!/bin/bash
rm -rf vendor/stockfish-js-minimal
mkdir -p vendor/stockfish-js-minimal
cp -R vendor/stockfish-js/src/*.js vendor/stockfish-js/src/*.wasm vendor/stockfish-js-minimal

#!/bin/bash

FILES="popup.js key_file_parser.js binary_reader.js entry.js group.js key_file_header.js"
CHROME_EXTERNS="https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/chrome_extensions.js"
OUTPUT="output/keepass-chrome.js"

gjslint *.js
closure-compiler \
  --js_output_file $OUTPUT \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --warning_level=VERBOSE \
  --externs externs.js <(curl -s $CHROME_EXTERNS) \
  --language_in ECMASCRIPT5_STRICT \
  $FILES

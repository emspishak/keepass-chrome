#!/bin/bash

FILES="popup.js key_file_parser.js binary_reader.js entry.js group.js key_file_header.js transform_key_params.js decrypt_params.js decrypt_progress_bar.js"
CHROME_EXTERNS="https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/chrome.js"
CHROME_EXTENSIONS_EXTERNS="https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/chrome_extensions.js"
OUTPUT_DIR="output"
OUTPUT="$OUTPUT_DIR/keepass-chrome.js"

mkdir -p $OUTPUT_DIR

gjslint --strict *.js
closure-compiler \
  --js_output_file $OUTPUT \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --warning_level=VERBOSE \
  --externs externs.js <(curl -s $CHROME_EXTERNS) <(curl -s $CHROME_EXTENSIONS_EXTERNS) \
  --language_in ECMASCRIPT6_STRICT \
  --summary_detail_level=3 \
  --jscomp_error=lintChecks \
  --jscomp_error=reportUnknownTypes \
  --jscomp_warning="*" \
  --js $FILES

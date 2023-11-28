#!/bin/bash

for dir in */; do
    cd "$dir" || exit
    tag -l . | awk '{$1=""; sub(/^[[:space:]]*/, ""); sub(/[[:space:]]*$/, ""); sub(/\.$/, ""); print $0}' > tags.txt
    cd ..
done
#!/bin/bash

for dir in */; do
    cd "$dir" || exit
    for subdir in */; do
        cd "$subdir" || exit
        tag -l . | awk '{$1=""; sub(/^[[:space:]]*/, ""); sub(/[[:space:]]*$/, ""); sub(/\.$/, ""); print $0}' > tags.txt
        cd ..
    done
    cd ..
done
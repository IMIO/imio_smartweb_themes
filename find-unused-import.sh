#!/bin/bash

pattern=$(find . -type f -name "$1.scss" | cut -d'/' -f2 | paste -sd '|' - | sed 's/|$//'); grep -rni '@import "./home/$1"' . | grep -Ev "$pattern"
#!/bin/bash

if command -v flutter >/dev/null 2>&1; then
  echo "Flutter detected: $(flutter --version --machine | head -n1)"
  echo "Run 'flutter doctor' for more details."
  exit 0
else
  echo "Flutter not found. Follow https://flutter.dev/docs/get-started/install to install Flutter."
  exit 2
fi

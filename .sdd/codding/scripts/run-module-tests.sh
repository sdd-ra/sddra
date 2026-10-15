#!/bin/bash
# Run module-level tests for a given module name
set -e

MODULE_NAME="$1"

if [ -z "$MODULE_NAME" ]; then
  echo "Error: Module name required"
  exit 1
fi

echo "Running module tests for: $MODULE_NAME"

# Run tests for each builder type that has output for this module
if [ -d "/workspace/be-output/$MODULE_NAME" ]; then
  echo "Running BE module tests for $MODULE_NAME"
  cd "/workspace/be-output/$MODULE_NAME" && npm test -- --module="$MODULE_NAME" || true
fi

if [ -d "/workspace/fe-output/$MODULE_NAME" ]; then
  echo "Running FE module tests for $MODULE_NAME"
  cd "/workspace/fe-output/$MODULE_NAME" && npm test -- --module="$MODULE_NAME" || true
fi

if [ -d "/workspace/mobile-output/$MODULE_NAME" ]; then
  echo "Running mobile module tests for $MODULE_NAME"
  cd "/workspace/mobile-output/$MODULE_NAME" && npm test -- --module="$MODULE_NAME" || true
fi

echo "Module tests completed for: $MODULE_NAME"
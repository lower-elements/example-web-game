#!/bin/bash
usage() {
  echo "Usage: $0 [-r|--run]"
  echo "Options:"
  echo "  -r, --run    Run the server after building"
  exit 1
}
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -r|--run)
      RUN_SERVER=true
      shift
      ;;
    *)
      # Unknown option
      usage
      ;;
  esac
done
# Pack client
if npm run build; then
  echo "Client build successful."
  cp -r sounds dist
  rm -r server/public
  cp -r dist server/public
  # Compile server
  pushd server
  npx tsc
  popd
  # Run server if specified
  if [ "$RUN_SERVER" = true ]; then
    echo "Running the server..."
    (cd server && node dist/index.js)
  fi
else
  echo "Client build failed. Aborting server build. 😟"
fi
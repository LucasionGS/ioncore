SERVER="server"
CLIENT="client"
OUTPUT="dist"

# Build client
echo "Compiling CLIENT..."
cd "$CLIENT"
yarn install
yarn build

# Build server
echo "Compiling server..."
cd "../$SERVER"
yarn install
yarn run build-server

# Combine
echo "Combining CLIENT and server..."
cd ..
if [ -d "dist" ]; then
  echo "Removing old dist..."
  rm -r dist
fi
mkdir -p dist
mv "$SERVER/build" "$OUTPUT/$SERVER"
mv "$CLIENT/dist" "$OUTPUT/public"
cp -r "$SERVER/package.json" "$OUTPUT/package.json"
yarn install --production --cwd "$OUTPUT"

# Copy .env-production to .env
if [ -f "$SERVER/.env-production" ]; then
  echo "Copying $SERVER/.env-production to .env..."
  cp "$SERVER/.env-production" "$OUTPUT/.env"
elif [ -f "$SERVER/.env" ]; then
  echo "Copying $SERVER/.env to .env..."
  cp "$SERVER/.env" "$OUTPUT/.env"
else
  echo "No .env file found. Using default values."
fi

# Build finished
REAL_OUTPUT=$(realpath "$OUTPUT")
echo "Build finished. Output in $REAL_OUTPUT"

# If post-build.sh exists, run it
if [ -f "post-build.sh" ]; then
  echo "Running post-build.sh..."
  ./post-build.sh "$REAL_OUTPUT"

  if [ $? -ne 0 ]; then
    echo "post-build.sh failed."
    exit 1
  fi
  echo "post-build.sh finished."
fi

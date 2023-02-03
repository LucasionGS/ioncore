SERVER="server"
UI="ui"
OUTPUT="dist"

# Build UI
cd $UI
yarn install
yarn build

# Build server
cd $SERVER
yarn install
yarn build

# Combine
rm -r dist && mkdir -p dist
mv "$SERVER/build" "$OUTPUT/$SERVER"
mv "$UI/build" "$OUTPUT/public"
cp -r "$SERVER/package.json" "$OUTPUT/package.json"
yarn install --production --cwd "$OUTPUT"
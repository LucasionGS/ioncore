# Ioncore Project Template
This is a template for an Ioncore project. It contains a TypeScript full-stack application, with a server in [Nodejs](https://nodejs.org/en) and a client in [React](https://react.dev/).

## Getting Started

### Prerequisites
- [Nodejs](https://nodejs.org/en) (**Recommended**: v16.10.0 or higher)
- [Yarn](https://yarnpkg.com) (**Recommended**: v1.22.10 or higher)
  - Install with `npm install -g yarn`

### Installation
Both the server's and the client's dependencies must be installed. To do so, run the following command in the root directory of the project:  
*`Unless stated otherwise, all terminal code in this file should work on Windows CMD, PowerShell, Linux, and OSX terminals.`*

```bash
cd server
yarn install
cd ../client
yarn install
cd ..
```
### Running the Project
To run the project in development mode, the easiest way is to open the project in [Visual Studio Code](https://code.visualstudio.com/) and start debugging (F5). This also enables debugging in the server and client and allows breakpoints to be used.  
Alternatively, you can open 2 terminals, one in the `server` directory and one in the `client` directory, and run the following commands:  
Terminal 1:
```bash
cd server
yarn dev
```
Terminal 2:
```bash
cd client
yarn dev
```

This will start the server on port 3080 (default). The client is proxied to the server, so you can access it on [http://localhost:3080](http://localhost:3080).
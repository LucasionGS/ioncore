# Ioncore Project Template
![Build Status](https://abstruse.ionnet.io/badge/b242914b?branch=master)

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


## HTTPS
To enable HTTPS, you need to generate a certificate and passphrase. The certificate must be placed in the `server` directory and named `certificate.pfx`.  
You can then set the `CERTIFICATE_PASSPHRASE` environment variable to the passphrase you generated.

`certificate.pfx` is ignored by .gitignore, so it will not be committed to the repository. Remove it from .gitignore if you want to commit it.

When building the project, the certificate will be copied to the `dist` directory.

As of right now, enabling HTTPS will disable HMR (Hot Module Replacement) in the client.

### Generating a Certificate
#### Windows Powershell
You can generate a self-signed certificate with a passphrase using the following command, *`assuming you are in the root directory of the project`*:
```powershell
$domain = "mydomain.com"
$passphrase = "YourPassphrase"
$cert = New-SelfSignedCertificate -DnsName $domain -CertStoreLocation cert:\LocalMachine\My
$pwd = ConvertTo-SecureString -String $passphrase -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath .\server\certificate.pfx -Password $pwd
```
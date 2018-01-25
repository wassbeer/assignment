# Viriciti Assignment Workout Thomas Wassenberg

This repository contains a Viriciti Example Application built as an assignment in the application process. 

The application generates vehicle data on a TCP server. The vehicle data is upon generation sent to a TCP-client, which is an HTTP server. The data are rendered on the HTTP client. The ports listened to on the TCP server and connected with on the TCP client are registered on and retrieved from a service discovery service using Consul.io. 

The application is built in a microservices architecture in order to enable scaling up towards multiple TCP servers and clients.

## Setup

Install all the dependencies

`npm i`

Install Consul

`https://www.consul.io/intro/getting-started/install.html`

Run the Consul agent, the HTTP server and the TCP server

`consul agent -dev -config-dir=/etc/consul.d`
`npm run http` 
`npm run tcp`

## Dependencies & Technologies

NPM packages:
* consul
* json-socket
* socket.io

# Viriciti Assignment Workout Thomas Wassenberg

This repository contains a Viriciti Example Application built as an assignment in the application process. 

The application generates vehicle data on a TCP server. The vehicle data is upon generation sent to a TCP-client, which is an HTTP server. The data are rendered on the HTTP client. The ports listened to on the TCP server and connected with on the TCP client are registered on and retrieved from a service discovery service using Consul.io. 

The application is built in a microservices architecture in order to enable scaling up towards multiple TCP servers and clients.

## Setup

Install all the dependencies

`npm i`

Install Consul

`https://www.consul.io/intro/getting-started/install.html`

Run the HTTP server, the TCP server and Consul

`npm run consul`
`npm run http` 
`npm run tcp`

## Dependencies & Technologies

NPM packages:
* request
* json-socket
* socket.io

Node.js modules:
* net
* http 

#### Back-end - Requirements [met]

Obligatory:
* Your modified back-end needs three services, a HTTP server (consuming the data), a TCP server (production the data) and the (third-party) service discovery service
* The TCP server registers its port in the service discovery
* The TCP server generates the vehicle data and streams it over a TCP connection
* The HTTP server, hosting the web client, connects to this TCP server and receives its data

Optional:
* Make the HTTP server reconnect with the TCP server after the connection is dropped (implement a reconnection strategy)

#### Back-end - Up for more? [under construction]

* Run more vehicles by increasing the number of instances of your Vehicle Data Generator service (and stream them to the HTTP server)
* Allow multiple HTTP servers to connect to your vehicle TCP server(s)
* Improve the Vehicle.js module! (it lacks re-reading it's source file after reading through it all)
* Dockerize all your services
* Add some data-visualisation in the front-end part to actually see these vehicles drive on a map using the GPS location

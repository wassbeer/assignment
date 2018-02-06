'use strict';

// Dependencies
const net = require('net'),
	consul = require('consul')({ host: process.env.CONSUL_ADDR }),
	JsonSocket = require('json-socket'),
	creatVehicle = require('./lib/vehicle'),
	path = require('path');

// Server variables
let server = net.createServer(),
	clients = [],
	serviceName;

function startTcpServer() {
	server.listen(() => {
		console.log('TCP server opened server on', server.address());

		// Register service in consul
		serviceName = `Service ${server.address().port}`;
		consul.agent.service.register({ name: `${serviceName}`, port: server.address().port }, (err) => {
			if (err) throw err;
			console.log('register service');
		});
	});

	// initiate JSON socket
	server.on('connection', (socket) => { // connection with client event handler
		socket = new JsonSocket(socket);
		clients.push(socket);
		socket.on('close', () => {
			clients.splice(clients.indexOf(socket), 1);
		});

		// send vehicle data
		vehicle.on('state', (state) => {
			state['service'] = serviceName;
			socket.sendMessage(
				state
			);
		});
	});
}

function closeTcpServer() {
	
	// ending socket connections with TCP client
	for (let i in clients) {
		clients[i].end();
	}
	
	// deregistering service
	consul.agent.service.deregister(`${serviceName}`, (err) => { 
		if (err) throw err;
		console.log('deregister service ' + serviceName);
	});

	// closing the server
	server.close(() => {
		console.log('server closed.');
	});
};

// starting server
startTcpServer();

// Staging server restart and close
setTimeout(closeTcpServer, 60000);
setTimeout(startTcpServer, 65000);
setTimeout(closeTcpServer, 100000);

// Start vehicle data
const startVehicle = () => {
	return creatVehicle({ file: path.resolve(__dirname, '../meta/route.csv') });
};

// Init vehicle
let vehicle = startVehicle();

// Once the vehicle went through all the data, start the data again from the start
vehicle.on('end', () => vehicle = startVehicle());

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
		serviceName = `Service ${server.address().port}`;
		consul.agent.service.register({ name: `${serviceName}`, port: server.address().port }, (err) => {
			if (err) throw err;
			console.log('register service');
		});
	});
	server.on('connection', (socket) => { // connection with client event handler
		socket = new JsonSocket(socket);
		clients.push(socket);
		socket.on('close', () => {
			clients.splice(clients.indexOf(socket), 1);
		});
		vehicle.on('state', (state) => {
			socket.sendMessage(
				state // + serviceName // testing whether all services reach HTTP client
			);
		});
	});
}

function closeTcpServer() {
	for (let i in clients) {
		clients[i].end(); // ending socket connections with TCP client
	}
	consul.agent.service.deregister(`${serviceName}`, (err) => { // deregistering service
		if (err) throw err;
		console.log('deregister service ' + serviceName);
	});
	vehicle.end(); // ending incoming data from vehicle module
	server.close(() => {
		console.log('server closed.');
		server.unref();
	});
};

// starting server
startTcpServer();

// Staging server close and restart
setTimeout(closeTcpServer, 60000);
setTimeout(startTcpServer, 65000);

// Start vehicle data
const startVehicle = () => {
	return creatVehicle({ file: path.resolve(__dirname, '../meta/route.csv') });
};

// Init vehicle
let vehicle = startVehicle();

// Once the vehicle went through all the data, start the data again from the start
vehicle.on('end', () => vehicle = startVehicle());

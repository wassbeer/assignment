// Dependencies
const net = require('net'),
	request = require('request'),
	jsonSocket = require('json-socket'),
	creatVehicle = require('./lib/vehicle'),
	path = require('path');

// Server variables
let server = net.createServer(),
	tcpPort = 8888,
	serviceNumber = 1,
	webJson = { 'Name': `${serviceNumber}`, 'Address': '127.0.0.1', 'Port': tcpPort };

// Registering service in Consul
request({ url: 'http://localhost:8500/v1/agent/service/register', method: 'PUT', json: webJson }, (err, request, body) => {
	if (err) { console.log(err); }
	server.listen(tcpPort, '127.0.0.1', (err) => {
		if (err) { throw err; };
		console.log('TCP server listing on port ' + tcpPort);
	});
});

// Start vehicle data
const startVehicle = () => {
	return creatVehicle({ file: path.resolve(__dirname, '../../meta/route.csv') });
}

// Init vehicle
let vehicle = startVehicle();

// Once the vehicle went through all the data, start the data again from the start
vehicle.on('end', () => vehicle = startVehicle());

// connection with client event handler
server.on('connection', (socket) => {
	socket = new jsonSocket(socket);
	vehicle.on('state', (state) => {
		console.log(state);
		socket.sendMessage(
			state
		);
	});
});

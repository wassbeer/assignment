// Dependencies
const net = require('net'),
	request = require('request'),
	jsonSocket = require('json-socket'),
	creatVehicle = require('./lib/vehicle'),
	path = require('path');

// Server variables
let server = net.createServer();

function launchTcpServer() {
	server.listen(() => {
		console.log('TCP server opened server on', server.address());
		let tcpPort = server.address().port,
		serviceNumber = tcpPort,
		webJson = { 'Name': `${serviceNumber}`, 'Address': '127.0.0.1', 'Port': tcpPort, 'EnableTagOverride': false };
		request({ url: 'http://localhost:8500/v1/agent/service/register', method: 'PUT', json: webJson }, (err, request, body) => {
			if (err) { console.log(err) }
				console.log("registered service")
		});
	});
}

// Launching server
launchTcpServer();

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
		socket.sendMessage(
			state
		);
	});
});

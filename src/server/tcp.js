// Dependencies
const net = require('net'),
	request = require('request'),
	jsonSocket = require('json-socket');

	// Server variables
	let server = net.createServer(),
		tcpPort = 8888,
		serviceNumber = 1,
		webJson = { 'Name': `${serviceNumber}`, 'Address': '127.0.0.1', 'Port': tcpPort };

// Registering service in Consul
request({ url: 'http://localhost:8500/v1/agent/service/register', method: 'PUT', json: webJson }, (err, request, body) => {
	if (err) { console.log(err) }
	server.listen(tcpPort, '127.0.0.1', (err) => {
		if (err) { throw err };
		console.log("TCP server listing on port " + tcpPort)
	});
});

// connection with client event handler 
server.on('connection', (socket) => {
	socket = new jsonSocket(socket);
	// vehicle.on('state', (state) => {
	// 	console.log(state)
	socket.sendMessage(
		// state
		"data from TCP server via JSON-socket"
	);
});

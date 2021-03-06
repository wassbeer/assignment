'use strict';

// dependencies
const express = require('express'),
	os = require('os'),
	http = require('http'),
	debug = require('debug')('server'),
	path = require('path'),
	socketio = require('socket.io'),
	net = require('net'),
	consul = require('consul')({ host: process.env.CONSUL_ADDR }),
	JsonSocket = require('json-socket'),

	// Application
	app = express(),
	server = http.Server(app),
	io = socketio.listen(server),
	sockets = [];

// TCP Client

let serviceNames = ['service'],
	service;

function watchServices() { // 1. Watch services catalog
	consul.catalog.node.list(function(err, result) { 
		if (err) throw err;
		console.log('Consul node: ' + result[0]['Node']); // Retreive consul node
		let watch = consul.watch({
			method: consul.catalog.node.services,
			options: { node: result[0]['Node'] } // Services found on node
		});
		watch.on('change', (data, res) => {
			if (data) {
				for (service in data.Services) {
					service = data.Services[service];
					if (serviceNames.indexOf(service.ID) === -1 && service.ID !== 'consul') {
						serviceNames.push(service.ID);
						startNewTcpConnection(service);
					}
				}
			}
		});
	});
}

function startNewTcpConnection(data) { // 2. Upon discovery of a new service, start new TCP socket connection
	let port = data.Port,
		socket = new JsonSocket(new net.Socket());
	socket.connect(port, (err) => {
		if (err) { console.error(err); }
		console.log(`TCP client connected to TCP server via Consul ${data.ID} on port ${port}`);
		watchService(data);
	});
	socket.on('message', vehicleDataEventHandler);
	socket.on('close', closeEventHandler);
	socket.on('error', errorEventHandler);
}

function watchService(service) { // 3. Watch a specific service after connecting
	var watch = consul.watch({
		method: consul.catalog.service.nodes,
		options: { service: `${service.ID}` }
	});
	watch.on('change', (data, res) => {
		return data.length > 0 ?
			console.log(`${service.ID} is running`) :
			(console.log(`${service.ID} deregistered`),
				serviceNames.splice(serviceNames.indexOf(service.ID), 1));
	});
}

function vehicleDataEventHandler(vehicleData) {
	io.sockets.emit('state', vehicleData);
};

function closeEventHandler(socket) {
	console.log('Socket connection closed');
}

function errorEventHandler(err) {
	console.log(err);
}

// Watch services
watchServices();

// HTTP Server

function httpClientConnectionEventHandler(socket) {
	sockets.push(socket);
	console.log('HTTP client connected. Connected:', sockets.length);
	socket.once('disconnect', () => {
		sockets.splice(sockets.findIndex((sckt) => sckt.id === socket.id), 1);
		console.log('HTTP client disconnected. Connected:', sockets.length);
	});
	socket.emit('ready');
};

// Connection event handler
io.on('connection', httpClientConnectionEventHandler);

// Webpack

if (process.env.NODE_ENV !== 'production') {
	const webpackHotMiddleware = require('webpack-hot-middleware'),
		webpackMiddleware = require('webpack-dev-middleware'),
		webpackConfig = require('../../webpack.config.js'),
		webpack = require('webpack'),
		compiler = webpack(webpackConfig);

	// Middlewares for webpack
	debug('Enabling webpack dev and HMR middlewares...');
	app.use(webpackMiddleware(compiler, {
		hot: true,
		stats: {
			colors: true,
			chunks: false,
			chunksModules: false
		},
		historyApiFallback: true
	}));

	app.use(webpackHotMiddleware(compiler, { path: '/__webpack_hmr' }));

	app.use('*', (req, res, next) => {
		const filename = path.join(compiler.outputPath, 'index.html');
		compiler.outputFileSystem.readFile(filename, (err, result) => {
			if (err) {
				return next(err);
			}
			res.set('content-type', 'text/html');
			res.send(result);
			res.end();
		});
	});
} else {
	app.use(express.static('dist'));
	app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));
}

// Create HTTP server listener
server.listen(() => {
	console.log('HTTP server opened on', server.address());
});

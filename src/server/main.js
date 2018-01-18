// dependencies
const express = require('express'),
	debug = require('debug')('server'),
	path = require('path'),
	http = require('http'),
	socketio = require('socket.io'),
	net = require('net'),
	request = require('request'),
	JsonSocket = require('json-socket'),

	// application
	app = express(),
	server = http.Server(app),
	io = socketio.listen(server),
	sockets = [];

// TCP Client

function makeConnectionWithTcpServer() {
	request('http://localhost:8500/v1/agent/services', (err, response, body) => {
		if (err) {
			console.log(err);
		}
		let services = JSON.parse(body),
			serviceNames = Object.keys(services);
		if (serviceNames.length) { // Checking existence of service(s)
			tcpPort = services[serviceNames[serviceNames.length - 1]].Port;
			tcpClient.connect(tcpPort, '127.0.0.1', (err) => {
				if (err) { console.log(err); }
				console.log('TCP client connected to TCP server on port ' + tcpPort);
			});
		} else { // Keep trying to retreive a service
			console.log("There is no service registered yet");
			setTimeout(makeConnectionWithTcpServer, 4000);
		}
	});
}

function connectTcpEventHandler() {
	console.log('connected');
}

function vehicleDataEventHandler(vehicleData) {
	// console.log(vehicleData);
	io.sockets.emit('state', vehicleData);
};

function closeEventHandler() {
	console.log('Reconnecting...');
	setTimeout(makeConnectionWithTcpServer, 4000);
}

function errorEventHandler(err) {
	console.log(err);
}

// create socket and bind callbacks
let tcpClient = new JsonSocket(new net.Socket());
tcpClient.on('connect', connectTcpEventHandler);
tcpClient.on('message', vehicleDataEventHandler);
tcpClient.on('close', closeEventHandler);
tcpClient.on('error', errorEventHandler);

// Make Connection with TCP Server
makeConnectionWithTcpServer();

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
			if (err)
				return next(err);
			res.set('content-type', 'text/html');
			res.send(result);
			res.end();
		});
	});
} else {
	app.use(express.static('dist'));
	app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));
}

// Create server listener
server.listen(() => {
	console.log('HTTP server opened on', server.address());
})

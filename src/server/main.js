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

// Initiate TCP Client
let tcpClient = new JsonSocket(new net.Socket());

// Retreiving port from Consul
request('http://localhost:8500/v1/agent/services', (err, response, body) => {
	if (err) {
		console.log(err);
	}
	if (response) {
		const services = JSON.parse(body),
			serviceNames = Object.keys(services),
			tcpPort = services[serviceNames.length].Port;
		// Connect the TCP client on that port
		tcpClient.connect(tcpPort, '127.0.0.1', (err) => {
			if (err) { console.log(err); }
			console.log('TCP client connected to TCP server');
		});
	};
});

// Message event handler
tcpClient.on('message', (data) => {
	console.log('Received: ' + data);
	io.sockets.emit('state', data);
});

// Close event handler
tcpClient.on('close', () => {
	console.log('Connection closed');
});

// HTTP Server

// Connection event handler
io.on('connection', (socket) => {
	sockets.push(socket);
	console.log('Client connected. Connected:', sockets.length);

	socket.once('disconnect', () => {
		sockets.splice(sockets.findIndex((sckt) => sckt.id === socket.id), 1);
		console.log('Client disconnected. Connected:', sockets.length);
	});

	// Let the client socket know that we're ready
	socket.emit('ready');
});

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
const port = 4932;
server.listen(port, () => console.log(`Server listening on port ${port}`));

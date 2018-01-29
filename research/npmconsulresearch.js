const consul = require('consul')();
let serviceName = "AmazingService";

// npm consul methods

function listAgentServices() {
	consul.agent.service.list(function(err, result) {
		if (err) throw err;
		console.log(result);
	});
}

// list agent services

// {
// 	example: {
// 		ID: 'example',
// 		Service: 'example',
// 		Tags: [],
// 		Address: '',
// 		Port: 5678,
// 		EnableTagOverride: false,
// 		CreateIndex: 0,
// 		ModifyIndex: 0
// 	}
// }

function listDataCenters() {
	consul.catalog.datacenters(function(err, result) {
		if (err) throw err;
		console.log(result)
	});
}

// List 'dc1' datacenter

// ['dc1']

function listNode() {
	consul.catalog.node.list(function(err, result) {
		if (err) throw err;
		console.log(result)
	});
}

// List 'Diànnâo' node

// [{
// 	ID: '0159a35f-a81f-06da-0b30-6c2d9528f1a9',
// 	Node: 'Diànnâo',
// 	Address: '127.0.0.1',
// 	Datacenter: 'dc1',
// 	TaggedAddresses: { lan: '127.0.0.1', wan: '127.0.0.1' },
// 	Meta: { 'consul-network-segment': '' },
// 	CreateIndex: 5,
// 	ModifyIndex: 6
// }]


function listNodeServices() {
	consul.catalog.node.services('Diànnâo', function(err, result) {
		if (err) throw err;
		console.log(result)
	});
}

// Services on node 'Diànnâo'

// Services: {
// 	consul: {
// 		ID: 'consul',
// 		Service: 'consul',
// 		Tags: [],
// 		Address: '',
// 		Port: 8300,
// 		EnableTagOverride: false,
// 		CreateIndex: 5,
// 		ModifyIndex: 5
// 	},
// 	example: {
// 		ID: 'example',
// 		Service: 'example',
// 		Tags: [],
// 		Address: '',
// 		Port: 5678,
// 		EnableTagOverride: false,
// 		CreateIndex: 318,
// 		ModifyIndex: 318
// 	}
// }
// }

function listCatalogServicesOnNode() {
	consul.catalog.service.nodes(`${serviceName}`, (err, result) => {
		if (err) throw err;
		console.log(result)
	});
}

// Catalog nodes on service

// []

function register() {
	consul.agent.service.register({ name: `${serviceName}`, port: 5678 }, function(err) {
		if (err) throw err;
		console.log('register example service');
	});
}

function deregister() {
	consul.agent.service.deregister(`${serviceName}`, function(err) {
		if (err) throw err;
		console.log('deregister example service');
	});
}

function returnServiceHealth() {
	consul.health.service(`${serviceName}`, function(err, result) {
		if (err) throw err;
		console.log(result)
	});
}

// npm consul watch

function watchHealth() {
	var watch = consul.watch({
		method: consul.health.service,
		options: { service: `${serviceName}` }
	});
	watch.on('change', function(data, res) {
		console.log('change data:', data);
	});
	watch.on('error', function(err) {
		console.log('error:', err);
	});
}

function watchRegister() {
	var watch = consul.watch({
		method: consul.agent.service.register,
		options: { name: `${serviceName}` }
	});
	watch.on('change', function(data, res) {
		console.log('change data:', data);
	});
}

function watchDeregister() {
	var watch = consul.watch({
		method: consul.agent.service.deregister,
		options: { id: `${serviceName}` }
	});
	watch.on('change', function(data, res) {
		console.log('change data:', data);
	});
}

function watchAgentServices() {
	var watch = consul.watch({ method: consul.agent.service.list });
	watch.on('change', function(data, res) {
		console.log('change data:', data);
	});
}

function watchCatalogServices() {
	var watch = consul.watch({
		method: consul.catalog.node.services,
		options: { node: 'Diànnâo' }
	});
	watch.on('change', (data, res) => {
		console.log('change catalog data');
		console.log(data);
	});
}

// Function calls


// watchRegister(); // Not working
// watchDeregister(); // Not working
// watchAgentServices();// Not working
// watchCatalogServices(); // Working

// watchHealth() // working
setTimeout(register, 1000);
setTimeout(listCatalogServicesOnNode, 2500);
// setTimeout(returnServiceHealth, 1500);
setTimeout(deregister, 5000);

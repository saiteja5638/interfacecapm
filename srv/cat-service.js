const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
	const { getLocProdCharAPI } = this.entities;
	const { getLocProdConfigAPI } = this.entities;
	const { getLocProdActDemandAPI } = this.entities;
	const { getLocProdActualDemandAPI } = this.entities;
	const { getProdCharAPI } = this.entities;
	const { getClassCharAPI } = this.entities;
	const { getMDTAssembly } = this.entities;
	
	const service = await cds.connect.to('ConfigProd');
	this.on('READ', getLocProdCharAPI, request => {
		return service.tx(request).run(request.query);
	});
	this.on('READ', getLocProdConfigAPI, request => {
		return service.tx(request).run(request.query);
	});
    this.on('READ', getLocProdActDemandAPI, request => {
		return service.tx(request).run(request.query);
	});
	this.on('READ', getLocProdActualDemandAPI, request => {
		return service.tx(request).run(request.query);
	});
	this.on('READ', getProdCharAPI, request => {
		return service.tx(request).run(request.query);
	});
	this.on('READ', getClassCharAPI, request => {
		return service.tx(request).run(request.query);
	});
	this.on('READ', getMDTAssembly, request => {
		return service.tx(request).run(request.query);
	});

	this.on("generateUniqueId", async (request) => {
		let response = await service.tx(request).post("/generateUniqueId", request.data);
		if(response.statusCode === 400){
			let res = request._.req.res;
			res.statusCode = 400;
			// res.send({values});
		}
		else if(response.statusCode === 199){
			let res = request._.req.res;
			res.statusCode = 199;
			// res.send({values});
		}
		request._.req.res.send(response);
	});
});
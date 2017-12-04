
var express = require('express');
var router = express.Router();
var app = express();
var ne = require('node-each')

/********** Data Elastic Get ***********/
	router.get('/',function(req,res,next){
		
	/* ORDERS data 
	let mws = require('mws-simple')({
	  accessKeyId: 'AKIAIQIJUVTLKMVUHHAA',
	  secretAccessKey: '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',
	  merchantId: 'A2Y188YGZ9NHLD'
	});
	// -------- AWS Request
	let date = new Date();
	date.setDate(date.getDate() - 2);
	// create object with path and query 
	let listOrders = {
	  path: '/Orders/2013-09-01',
	  query: {
		Action:'ListOrders',
		CreatedAfter: date.toISOString(),
		'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
		Version: '2013-09-01'
	  }
	}
	
    mws.request(listOrders, function(e, result_req) {
		
     var myres = JSON.stringify(result_req)
	 var my_data = JSON.parse(myres)
	  //ne.each(my_data,function(index,item){
	  })*/	 
		
			//add data
			var elasticsearch = require('elasticsearch'); //obj
	     	var client = new elasticsearch.Client({
				host: 'localhost:9200',
				log: 'trace'
			})	
									
			// client.indices.delete({
				  // index: 'orders',
				  // ignore: [404]
				// }).then(function (body) {
				  // console.log('index was deleted or never existed')
				// }, function (error) {
			// })
			
			 // client.indices.create({
				 // index: 'products'
			 // }, function(err, resp, status) {
				 // if (err) {
					 // console.log(err);
				 // } else {
					 // console.log("create", resp);
				 // }
			 // })
			 
	 // })
	 
	/************** Define structure *******************/
	// Delete index code 
	// client.indices.delete({
	  // index: 'products',
	  // ignore: [404]
	// }).then(function (body) {
	  // console.log('index was deleted or never existed');
	// }, function (error) {
	// })

	/***************** elastic searh data  ****************/
	
	//res.send('Elastic search !!') //show resp
	/* var elasticsearch = require('elasticsearch'); //obj
	var client = new elasticsearch.Client({
	  host: 'localhost:9200',
	  log: 'trace'
	})
	
	client.ping({
	  requestTimeout: 30000,
	}, function (error) {
	  if (error) {
		console.error('elasticsearch cluster is down!')
	  } else {
		console.log('All is well')
	  }
	})
	
	client.search({
	  q: '171 Putnam Avenue'
	}).then(function (body) {
	  var hits = body.hits.hits;
	}, function (error) {
	  console.trace(error.message);
	});

	// create
	 client.indices.create({
		 index: 'products'
	 }, function(err, resp, status) {
		 if (err) {
			 console.log(err);
		 } else {
			 console.log("create", resp);
		 }
	 });*/
 
	
	/*client.bulk({  
	  index: 'products',
	  type: 'posts',
	  body: {'name':'amazon products report'},
	})*/
	
})
/********** Data Elastic Get ***********/

module.exports=router
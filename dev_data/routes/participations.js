var express = require('express');
var router = express.Router();
var app = express();

/******* MongoDB client *******/
var MongoClient = require('mongodb').MongoClient;
var ne = require('node-each');
var url = "mongodb://45.79.8.72:27017/mws_api_db"; //mws_api_db
var createdDate = new Date();

	router.get('/',function(req,res,next){

	let mws = require('mws-simple')({
	  accessKeyId: 'AKIAIQIJUVTLKMVUHHAA',
	  secretAccessKey: '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',
	  merchantId: 'A2Y188YGZ9NHLD'
	});

	let sellers = {
	  path: '/Sellers/2011-07-01',
	  query: {
	    Action:'ListMarketplaceParticipations',
	    MarketplaceId: 'ATVPDKIKX0DER',
	    Version: '2011-07-01'
	  }
	}

	mws.request(sellers, function(e, result) {	
	res.send('Participation');
	/****** PARTICIPATIONS *******/
	ne.each(result.ListMarketplaceParticipationsResponse.ListMarketplaceParticipationsResult[0].ListParticipations[0].Participation, 			function(index, item){
			//console.log(item);
			var jsonObj = {}
			var date = new Date()
			jsonObj['type'] = 'participation'
			jsonObj['type_id'] = index.MarketplaceId[0]
			jsonObj['created_at'] = date
			jsonObj['HasSellerSuspendedListings'] = index.HasSellerSuspendedListings[0]
			MongoClient.connect(url, function(err, db) {
				var query={ type_id: index.MarketplaceId[0] }
			        db.collection('app_channels').find(query).toArray(function(err, resultp) {
				 if(resultp.length){
					console.log('PARTICIPATION ALREADY SAVED')
				   }else{
					if (err) throw err
					var myobj = jsonObj
					db.collection("app_channels").insertOne(myobj, function(err_main, res) { 
						  if(err_main){
						    	throw err_main	
						  }
					 })
					 db.close();
				   }
				})//==ALEARDY PARTICIPATION ENDS 
			})
		}) 
	/****** MARKETPLACE *******/
	ne.each(result.ListMarketplaceParticipationsResponse.ListMarketplaceParticipationsResult[0].ListMarketplaces[0].Marketplace, 			function(index, item){
			//console.log(item);
			var jsonObj = {}
			var date = new Date()
			jsonObj['MarketplaceIds'] = index.MarketplaceId[0]  //MarketplaceIds
			jsonObj['Name'] = index.Name[0]
			jsonObj['DomainName'] = index.DomainName[0]
			jsonObj['DefaultCountryCode'] = index.DefaultCountryCode[0]
			jsonObj['DefaultCurrencyCode'] = index.DefaultCurrencyCode[0]
			jsonObj['DefaultCountryCode'] = index.DefaultLanguageCode[0]
			MongoClient.connect(url, function(err, db) {
				var query={ MarketplaceIds:index.MarketplaceId[0] }
			        db.collection('app_channels_meta').find(query).toArray(function(err, resultm) {
					if(resultm.length){
						console.log('MARKETPLACE CHANNELS ALREADY SAVED')
					}else{
						if (err) throw err
						var myobj = jsonObj
						db.collection("app_channels_meta").insertOne(myobj, function(err_main, res) { 
							  if(err_main){
							    	throw err_main
							  }
						 })
						 db.close();
					}
				})//==ALEARDY PARTICIPATION ENDS 
			})
		}) /****** ###MARKETPLACE *******/
	})// mws request
})
module.exports=router;


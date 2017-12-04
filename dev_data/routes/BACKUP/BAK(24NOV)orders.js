var express = require('express');
var router = express.Router();

﻿'use strict';

// ----- initialization
var app = express();
var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended:false});

/****** Node-mongoDb conn ******/
var ne = require('node-each');
var MongoClient = require('mongodb').MongoClient;
var dateFormat = require('dateformat');
var url = "mongodb://45.79.8.72:27017/mws_api_db";
/*******##***********/

// -------- AWS KEYs
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

// ----- Routes
router.get('/',function(req, res){
	mws.request(listOrders, function(e, result) {
		// ====== Initalize variable
		res.send('ORDERS LISTING');
		//console.log(result);
		var finalRowData = JSON.stringify(result);
		var testData = JSON.parse(finalRowData);
		var currentRowDate = new Date();
		var currentDate = dateFormat(currentDate,'yyyy-mm-dd');
				
		let createdDate = new Date();
		MongoClient.connect(url, function(err, db) {
			var query = {created_before_date : currentDate};
			db.collection("app_data").find(query).toArray(function(err, result) {
				
				if (result.length) { 
				     console.log('result');
					if (err) throw err;
					var createdChangeDate = new Date(result[0].created_before_date); 
					var fetchDate = dateFormat(createdChangeDate,'yyyy-mm-dd');
					
					var currentRowDate = new Date();
					var currentDate = dateFormat(currentDate,'yyyy-mm-dd');
					
					var date1 = new Date(fetchDate);
					var date2 = new Date(currentDate);
					var timeDiff = Math.abs(date2.getTime() - date1.getTime());
					var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
					if(diffDays > 0){
						ne.each(testData.ListOrdersResponse.ListOrdersResult[0].Orders[0].Order, function(index, item){
						var createdDateRow = new Date(testData.ListOrdersResponse.ListOrdersResult[0].CreatedBefore[0]);
						var exactDate = dateFormat(createdDateRow,'yyyy-mm-dd');
						var jsonObj = {}
						jsonObj['type'] = 'order';
						jsonObj['type_id'] = index.AmazonOrderId;
						jsonObj['created_before_date_time'] = testData.ListOrdersResponse.ListOrdersResult[0].CreatedBefore;
						jsonObj['created_at'] = date;
						jsonObj['created_before_date'] = exactDate;
							
							if (err) throw err;
							var myobj = jsonObj;
							db.collection("app_data").insertOne(myobj, function(err_main, res) {
								if (err_main){
									throw err_main;
								}else{
								index['order_id'] = res.insertedId;
								db.collection("app_data_meta").insertOne(index, function(err_meta, res_meta){

		     /***** Detail ******/
		     let listOrdersDetail = {
			path: '/Orders/2013-09-01',
			query: {
				  Action:'ListOrderItems',
				  CreatedAfter: date.toISOString(),
				  AmazonOrderId: index.AmazonOrderId[0]
				 }
			}
		      mws.request(listOrdersDetail, function(e, result) {
			//res.send('ORDERS LIST');
			var finalRowItemData = JSON.stringify(result);
			var itemData = JSON.parse(finalRowItemData);
			console.log(itemData);
		        MongoClient.connect(url, function(err2, db2) {
		          ne.each(itemData.ListOrderItemsResponse.ListOrderItemsResult[0].OrderItems[0].OrderItem, function(indexItem, items){
			   console.log(indexItem)
			      db2.collection("app_order_items").insertOne({amazon_order_id:index.AmazonOrderId[0], order_items:indexItem}, 
				function(err_main2, res) {	
						console.log('Items Saved');
						}) //Save Items
					}) //Item each ends
				}) //MongoDb CONNECTION 
			}) //ITEM REQUEST
		/****** #Detail *****/								
									});
								}
								console.log("documents inserted !");
								console.log('Order has saved !');



							});
						})
					}else{
						console.log('Order already saved !');
						//res.send('Order already saved !');
					}
					
					db.close();
				}else{
					ne.each(testData.ListOrdersResponse.ListOrdersResult[0].Orders[0].Order, function(index, item){
					var createdDateRow = new Date(testData.ListOrdersResponse.ListOrdersResult[0].CreatedBefore[0]);
					var exactDate = dateFormat(createdDateRow,'yyyy-mm-dd');
					var jsonObj = {}
					jsonObj['type'] = 'order';
					jsonObj['type_id'] = index.AmazonOrderId;
					jsonObj['created_before_date_time'] = testData.ListOrdersResponse.ListOrdersResult[0].CreatedBefore;
					jsonObj['created_at'] = date;
					jsonObj['created_before_date'] = exactDate;
							
							if (err) throw err;
							var myobj = jsonObj;
							db.collection("app_data").insertOne(myobj, function(err_main, res) {
								if (err_main){
									throw err_main;
								}else{
								index['order_id'] = res.insertedId;
								db.collection("app_data_meta").insertOne(index, function(err_meta, res_meta){
		     /***** Detail ******/
		     let listOrdersDetail = {
			path: '/Orders/2013-09-01',
			query: {
				  Action:'ListOrderItems',
				  CreatedAfter: date.toISOString(),
				  AmazonOrderId: index.AmazonOrderId[0]
				 }
			}
		        mws.request(listOrdersDetail, function(e, resultList) {
			////res.send('ORDERS LIST');
			var finalRowItemData = JSON.stringify(resultList);
			var itemData = JSON.parse(finalRowItemData);
			console.log(itemData);
		        MongoClient.connect(url, function(err2, db2) {
		          ne.each(itemData.ListOrderItemsResponse.ListOrderItemsResult[0].OrderItems[0].OrderItem, function(indexItem, items){
			   console.log(indexItem)
			      db2.collection("app_order_items").insertOne({amazon_order_id:index.AmazonOrderId[0], order_items:indexItem}, 
				function(err_main2, res) {	
						console.log('Items Saved');
						}) //Save Items
					}) //Item each ends
				}) //MongoDb CONNECTION 
			}) //ITEM REQUEST
			/****** #Detail *****/

			
										
									});
								}
								console.log('Order has saved----- !');
								//res.send('Order has saved !');
							});
						})
				}
			});
		});
	});
	
}); 

module.exports=router;



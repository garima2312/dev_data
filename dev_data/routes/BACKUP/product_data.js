var express = require('express');
var router = express.Router();
var app = express();
var dateformat =require('dateformat');
let currentDate = new Date();
var currentDateUpdated = dateformat(currentDate,'yyyy-mm-dd')
var sleep = require('system-sleep');
/******* MongoDB client *******/
var MongoClient = require('mongodb').MongoClient;
var ne = require('node-each');
var url = "mongodb://45.79.8.72:27017/mws_api_db";

/**********Data Get************/
router.get('/',function(req,res,next){
	let mws = require('mws-simple')({
	  accessKeyId: 'AKIAIQIJUVTLKMVUHHAA',
	  secretAccessKey: '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',
	  merchantId: 'A2Y188YGZ9NHLD'
	})
	MongoClient.connect(url, function(err, db) {
		var query = {created_at : currentDateUpdated,report_type : '_GET_MERCHANT_LISTINGS_DATA_'};
		db.collection("app_report_request").find(query).toArray(function(err, req_report){
			
			if(req_report.length){
				console.log('Already report request done');
				var request_id = req_report[0].Report_request_id;
			
				let getReport = {
				  path: '/',
				  query: {
					Action:'GetReportList',
					'ReportRequestIdList.Id.1': request_id
				  }
				}
				mws.request(getReport, function(e, get_report) {
					var reportId = get_report.GetReportListResponse.GetReportListResult[0].ReportInfo[0].ReportId[0]
					
					let report_info = { path: '/',
						query: {
							Action:'GetReport',
							ReportId:reportId
						}
					}
					
					mws.request(report_info, function(e, report_info) {
						ne.each(report_info,function(index2, item){
							var reportInfo = {}
							reportInfo['type'] = 'product';
							reportInfo['type_id'] = index2.asin1;
							reportInfo['created_at'] = currentDateUpdated;
							var queryAppData = {type_id : index2.asin1};
							db.collection("app_data").find(queryAppData).toArray(function(err5, result5){
							if (err5) throw err5;
								if (result5.length) { 
									console.log('Product Already Saved')
								}else{	
									db.collection("app_data").insertOne(reportInfo, function(err_main, res) {
										if (err_main){
											throw err_main;
										}else{
											index2['unique_data_id'] = res.insertedId;
											db.collection("app_data_meta").insertOne(index2, function(err_meta, metaresult) {
												console.log('Product saved !');
												//res.send('Product saved !');
											});
										}
									});
								}	
							});
						})
					}) //report_info
					
				}) // End get report
			}else{
				let reportRequest = {
					path: '/',
					query: {
						Action:'RequestReport',
						ReportType: '_GET_MERCHANT_LISTINGS_DATA_'
					}
				}
				mws.request(reportRequest, function(e, result_req) {
					var reportRowData = result_req.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0];
					var reqObj = {}
					reqObj['report_type'] = reportRowData.ReportType[0];
					reqObj['Report_request_id'] = reportRowData.ReportRequestId[0];
					reqObj['created_at'] = currentDateUpdated;
					db.collection("app_report_request").insertOne(reqObj, function(err_main, res) {
						console.log('Report request saved !');
					});
					console.log('Please wait for few seconds.. !');
					sleep(35000);
					var request_id = reportRowData.ReportRequestId[0];
			
					let getReport = {
					  path: '/',
					  query: {
						Action:'GetReportList',
						'ReportRequestIdList.Id.1': request_id
					  }
					}
					mws.request(getReport, function(e, get_report) {
						var reportId = get_report.GetReportListResponse.GetReportListResult[0].ReportInfo[0].ReportId[0]
						
						let report_info = { path: '/',
							query: {
								Action:'GetReport',
								ReportId:reportId
							}
						}
						
						mws.request(report_info, function(e, report_info) {
							ne.each(report_info,function(index2, item){
								var reportInfo = {}
								reportInfo['type'] = 'product';
								reportInfo['type_id'] = index2.asin1;
								reportInfo['created_at'] = currentDateUpdated;
								var queryAppData = {type_id : index2.asin1};
								db.collection("app_data").find(queryAppData).toArray(function(err5, result5){
								if (err5) throw err5;
									if (result5.length) { 
										console.log('Product Already Saved')
									}else{	
										db.collection("app_data").insertOne(reportInfo, function(err_main, res) {
											if (err_main){
												throw err_main;
											}else{
												index2['unique_data_id'] = res.insertedId;
												db.collection("app_data_meta").insertOne(index2, function(err_meta, metaresult) {
													console.log('Product saved !');
												});
											}
										});
									}	
								});
							})
						}) //report_info
						
					}) // End get report
				})
			} //Else close
			
		}) //Db collection close
	});	
	res.send('Product has been saved !');
})
module.exports=router;


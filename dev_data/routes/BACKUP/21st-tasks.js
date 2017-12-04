var express = require('express');
var router = express.Router();
var app = express();
var dateformat =require('dateformat');

/******* MongoDB client *******/
var MongoClient = require('mongodb').MongoClient;
var ne = require('node-each');
var url = "mongodb://45.79.8.72:27017/mws_api_db";

var twodaysBefore = new Date()
var onedaysBefore = new Date()

twodaysBefore=dateformat(twodaysBefore.setDate(twodaysBefore.getDate()-2),'yyyy-mm-dd')
onedaysBefore=dateformat(onedaysBefore.setDate(onedaysBefore.getDate()-1),'yyyy-mm-dd')

  //console.log(twodaysBefore+onedaysBefore);
  router.get('/',function(req,res,next){

	let mws = require('mws-simple')({
	  accessKeyId: 'AKIAIQIJUVTLKMVUHHAA',
	  secretAccessKey: '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',
	  merchantId: 'A2Y188YGZ9NHLD'
	})

	let report = {
	  path: '/',
	  query: {
	    Action:'GetReportList',
	    AvailableFromDate: twodaysBefore,
	    AvailableToDate: onedaysBefore,
	    MaxCount: 100
	  }
	}

	mws.request(report, function(e, result) {	
			//res.send(result);
			ne.each(result.GetReportListResponse.GetReportListResult[0].ReportInfo,function(index, item){
				console.log(index);
				var jsonObj = {}
				jsonObj['ReportType'] = 'report'
				jsonObj['Acknowledged'] = index.Acknowledged
				jsonObj['ReportId'] = index.ReportId
				jsonObj['ReportRequestId'] = index.ReportRequestId
				jsonObj['AvailableDate'] = index.AvailableDate
				MongoClient.connect(url, function(err, db) {
						var query = {ReportId:index.ReportId }
						db.collection('app_report').find(query).toArray(function(err, resultp) {
						 if(resultp.length){
							console.log('REPORT ALREADY EXISTS!!');
						   }else{
							if (err) throw err
							var myobj = jsonObj
							db.collection("app_report").insertOne(myobj, function(err_main, res) { 
								  if(err_main){
								    	throw err_main
								  }console.log('report saved wow');
							 })
							 db.close();
						   }
						})	//== ALEARDY  ENDS
					})
				

		if(item==99){  //LAST ITEM
			/************ REPORTS *************/
			var hasNext=result.GetReportListResponse.GetReportListResult[0].HasNext;
			var nextToken=result.GetReportListResponse.GetReportListResult[0].NextToken[0];
			/****** REPORTS *******/

			/********** if _NEXT_TOKEN ******************/
			if(hasNext){
				let nextData={   path: '/',
						 query: {
						 Action:'GetReportListByNextToken',
						 NextToken:nextToken
						 }
						} //API url
		
		     mws.request(nextData, function(e, resultT) {
			/***********   NEXT TOKEN EACH QUERY *************/
			  ne.each(resultT.GetReportListByNextTokenResponse.GetReportListByNextTokenResult[0].ReportInfo,function(index, item){
				console.log(index);
				var jsonObj = {}
				jsonObj['ReportType'] = 'reportN'
				jsonObj['Acknowledged'] = index.Acknowledged
				jsonObj['ReportId'] = index.ReportId
				jsonObj['ReportRequestId'] = index.ReportRequestId
				jsonObj['AvailableDate'] = index.AvailableDate
			
				MongoClient.connect(url, function(err, db) {
						var query = {ReportId:index.ReportId }
						db.collection('app_report').find(query).toArray(function(err, resultp) {
						 if(resultp.length){
							console.log('next report existss');
						   }else{
							if (err) throw err
							var myobj = jsonObj
							db.collection("app_report").insertOne(myobj, function(err_main, res) { 
								  if(err_main){
								    	throw err_main
								  } console.log('next report data saved wow');
							 })
							 db.close();
						   }
						})	//== ALEARDY  ENDS
					})
				}) //EACH ENDS  /****** REPORTS *******/

					 // == after saving check for next token  
					 var hasNextpage=resultT.GetReportListByNextTokenResponse.GetReportListByNextTokenResult[0].HasNext[0];
					    if(hasNextpage){
						nextToken=resultT.GetReportListByNextTokenResponse.GetReportListByNextTokenResult[0].NextToken
					    } //###=== after saving check for next token 
					    //console.log(nextToken);
					})
			 }// last item
			}// HAS NEXT CONDITION

		}) //each  /****** REPORTS *******/

	})// mws request main report

	/*********** REPORTID DETAIL *************/
	let reportDetail={
	  path: '/',
	  query: {
	    Action:'GetReport',
	    ReportId: '7160021685017485'
	  }
	}
	/*********** ##REPORTID DETAIL ************/

})
module.exports=router;


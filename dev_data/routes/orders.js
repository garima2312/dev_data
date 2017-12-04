let currentDate = new Date()
var dateformat =require('dateformat')
var currentDateUpdated = dateformat(currentDate,'yyyy-mm-dd')
var currentDateTime = currentDate
var elasticsearch = require('elasticsearch'); //obj

/***** Constant Value Defined Start *****/
const FETCH_DAYS = '1'
const APP_DATA_TABLE = 'app_data'
const APP_DATA_META_TABLE = 'app_data_meta'
const REPORT_TYPE = '_GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_'
const TYPE = 'Order'
const MESSAGE_NAME = 'Order'
const START_DATE = dateformat(currentDate.setDate(currentDate.getDate()-FETCH_DAYS),'yyyy-mm-dd')
const END_DATE = currentDateUpdated
const HOST = 'localhost'
const DB = 'mws_api_db553'

/** Constant Value Defined End ***/
var express = require('express')
var router = express.Router()
var app = express()
//var sleep = require('system-sleep') //For server
var sleep = require('sleep')

/******* MongoDB client *******/
var MongoClient = require('mongodb').MongoClient
var ne = require('node-each')
var url = "mongodb://"+HOST+":27017/"+DB

/**********  Data Get  ************/
router.get('/',function(req,res,next){
    let mws = require('mws-simple')({
      accessKeyId: 'AKIAIQIJUVTLKMVUHHAA',
      secretAccessKey: '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',
      merchantId: 'A2Y188YGZ9NHLD'
    })
    MongoClient.connect(url, function(err, db) {	
        let reportRequest = {
            path: '/',
            query: {
                Action:'RequestReport',
                ReportType: REPORT_TYPE,
                'StartDate':START_DATE,
                'EndDate':END_DATE
            }
        }
    mws.request(reportRequest, function(e, result_req) {
            var reportRowData = result_req.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0]
            var reqObj = {}
            reqObj['report_type'] = reportRowData.ReportType[0]
            reqObj['Report_request_id'] = reportRowData.ReportRequestId[0]
            reqObj['Report_start_date'] = START_DATE
            reqObj['Report_end_date'] = END_DATE
            reqObj['created_at'] = currentDateTime
            db.collection("app_report_request").insertOne(reqObj, function(err_main, res) {
                console.log('Report request saved !')
            })
            console.log('Please wait for few seconds.. !')
            sleep.sleep(35) //35 seconds
            //sleep(35000) //35 seconds for server
            var request_id = reportRowData.ReportRequestId[0]
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
				    
					if(e) throw e
                    if(report_info.length){
                        ne.each(report_info,function(index2, item){
                            var reportInfo = {}
                            reportInfo['type'] = TYPE
                            reportInfo['order_id'] = index2['amazon-order-id']
                            reportInfo['report_id'] = reportId
                            reportInfo['sku'] = index2['sku']
                            reportInfo['asin'] = index2['asin']
                            reportInfo['order_start_date'] = START_DATE
                            reportInfo['order_end_date'] = END_DATE                            
                            reportInfo['created_at'] = currentDateTime
                            
                            var queryAppData = {order_id : index2['amazon-order-id'],type : TYPE,asin : index2['asin'],sku : index2['sku']}
                            
                            db.collection(APP_DATA_TABLE).find(queryAppData).toArray(function(err5, result5){
                            if (err5) throw err5
                                if (result5.length) { 
                                        console.log(MESSAGE_NAME+' Already Saved')
                                }else{	
										var client = new elasticsearch.Client({
											  host: 'localhost:9200',
											  log: 'trace'
										})	
										client.index({  
											 index: 'orders_new',
											 type: 'list',
											 body: index2
										},function(err, resp, status){
											console.log(resp)
										})
										/*client.index({
												 index: 'products',
												 id: '1',
												 type: 'posts',
												 body: {
													reportInfo
												}
											 }, function(err, resp, status) {
												 console.log(resp)
										})*/
											 
                                    db.collection(APP_DATA_TABLE).insertOne(reportInfo, function(err_main, res) {
                                        if (err_main){
                                                throw err_main
                                        }else{
                                            db.collection(APP_DATA_META_TABLE).insertOne(index2, function(err_meta, metaresult) {
                                                    console.log(MESSAGE_NAME+' saved !')
                                            })
                                        }
                                    })
                                }	
                            })
                        })
                    }else{
                        console.log(MESSAGE_NAME+' not saved !') 
                    }
                }) //report_info

            }) // End get report
        })	
    })	
res.send('All '+MESSAGE_NAME+' from last '+FETCH_DAYS+' days has been saved !')
})
module.exports=router

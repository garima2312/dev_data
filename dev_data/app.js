
var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');

/************ PAGES ***************/
var kibana=require('./routes/index.js');
var orders=require('./routes/orders.js');
var products=require('./routes/products.js');
var sellers=require('./routes/participations.js');
/************ PAGES ***************/

var app= express();
var port=3000;

// views
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.engine('html',require('ejs').renderFile)

// set static folder
app.use(express.static(path.join(__dirname, 'views')))

//app.use(express.static('public'));
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))

app.use('/sellers',sellers)
app.use('/orders',orders)
app.use('/products',products)
app.use('/kibana',kibana)

 app.listen(port, function(){
    console.log('Working with express, node and angular!!')
 })

/***

 app.get('/', function(){
	var elasticsearch = require('elasticsearch');
		var esclient = new elasticsearch.Client({
		  host: 'localhost:9200'
		});
		esclient.search({
		  index: 'shakes**',
		  body: {
			query: {
			  matchAll: {}
			},
		  }
		}
		).then(function (response) {
			var hits = response.hits.hits;
			console.log(hits)
		}
		)
}) */



/***
http://45.79.8.72:3000/api/tasks
http://45.79.8.72:3000
http://45.79.8.72:3000/amws
**/


var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');

var order=require('./routes/orders.js');
var product=require('./routes/products.js');
var seller=require('./routes/participations.js');
var task=require('./routes/tasks.js');

var app= express();
var port=3000;

// views
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.engine('html',require('ejs').renderFile);

// set static folder
app.use(express.static(path.join(__dirname, 'client')));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use('/sellers',seller); 
app.use('/orders',order);
app.use('/products',product); 
app.use('/tasks',task); 

app.listen(port, function(){
	console.log('Working with express, node and angularjs!!');
})

/*
const http = require('http');
const hostname = '45.79.8.72';
const port = 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World great its working now\n');
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/


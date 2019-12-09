var express = require('express');
var router = express.Router();
var csv = require('csv-parser');
var fs = require('fs');
var path = require('path')

router.get('/', function(req, res, next) {
  console.log("home page")
  res.render('index')
})

module.exports = router;

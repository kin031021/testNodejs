var express = require('express');
var router = express.Router();

/* GET modbus page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'modbus' });
});

module.exports = router;

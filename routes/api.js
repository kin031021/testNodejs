var express = require('express');
var q = require('q');
var router = express.Router();

var modbus = require('../controller/modbus');
var m = new modbus();

/* post api 讀取或寫入modbus資訊 */
router.post('/', function(req, res, next) {
  
  //取得執行動作(read:讀取, write寫入)
  method = req.body.method; 
  //取得位址
  var addr = req.body.addr; 
  //取得SlaveId
  var slaveid = req.body.slaveid;
  //取得要寫入的data
  var writedata = req.body.data;

  if (method==undefined||addr==undefined||slaveid==undefined) {
    console.log('400');
    return res.sendStatus(400)
  }

  if (method=='write'&&writedata==undefined) {
    console.log('400');
    return res.sendStatus(400)  
  }

  var addrBegin = Number(addr.split("-")[0]);
  var addrEnd   = Number(addr.split("-")[1]);   
  
  
  if (method=='read') {
  
    //讀取modbus資訊 ex: {"method":"read", "slaveid":2, "addr":"2-5"}
    m.doRead(slaveid, addrBegin, addrEnd).then((data)=>{
      console.log('doRead(result)');
      buffer = Buffer.from(data, 'utf8');
      //index 9之後為data 
      var dataIndex = 0;
      var aData = [];   
      for (var i=9; i<buffer.length; i+=2) {
        sData = paddingLeft(buffer[i].toString(16),2);
        if ((i+1)<buffer.length) {
          sData += paddingLeft(buffer[i+1].toString(16),2);
        }
        var resData = {};
        resData.index = addrBegin;
        resData.data_hex = sData;
        resData.data_dec = parseInt(sData.toUpperCase(),16);

        aData.push(resData);
        addrBegin++;
      }

      res.json(aData);
    },(err)=>{
      console.log('doRead(reject)');
      console.log(err);

      var response = {};
      response.result = false;
      response.err = err;

      res.json(response);
    });

  } else if (method=='write') {

    //寫入modbus資訊 ex: {"method":"write", "addr":"2-4", "data":"15-16", "slaveid":2}
    var Arrdata = writedata.split('-');
    m.doWrite(slaveid, addrBegin, addrEnd, Arrdata).then((data)=>{
      console.log('doWrite(result)');
      var response = {};
      response.result = true;
      res.json(response);
    },(err)=>{
      console.log('doWrite(reject)');
      console.log(err);
      var response = {};
      response.result = false;
      response.err = err;
      res.json(response);
    })
  }

});

module.exports = router;

function paddingLeft(str,lenght){
	if(str.length >= lenght)
	return str;
	else
	return paddingLeft("0" +str,lenght);
}


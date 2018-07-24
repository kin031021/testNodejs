const net= require('net');

//執行動作代碼
const METHOD_READ  = '03'; //讀取
const METHOD_WRITE = '16'; //寫入

var modbus = function (xDoLoop, xRefreshSec, xSlaveId, xAction, xAddrBegin, xAddrEnd, xData, xResponseFunc) {
    this.client = new net.Socket();
    this.ip = "127.0.0.1";
    this.port = 502;
    
    //自動循環,重新整理秒數
    this.doloop = xDoLoop;    
    this.refreshSec = xRefreshSec * 1000;

    //第幾台
    this.slaveid = paddingLeft(xSlaveId.toString(16),2);
    //執行動作
    if (xAction=='read') {
        this.action = METHOD_READ
    } else if (xAction=='write') {
        this.action = METHOD_WRITE
    };
    //位址 16進位前補零到長度4碼
    this.addrBegin = paddingLeft(xAddrBegin.toString(16),4);
    this.addrEnd   = paddingLeft(xAddrEnd.toString(16),4);
    this.addrCount = paddingLeft(((xAddrEnd - xAddrBegin)+1).toString(16),4);
    //data(寫入用)
    this.data = xData

    this.responseFunc = xResponseFunc;
    
    this.doConnect();
}

modbus.prototype.doConnect = function(){

    this.client.connect(this.port,this.ip,function(){
        console.log("connected");
        this.status = "connect";
        this.sendCommand();
    }.bind(this));

    this.client.on('close',function(){
        console.log("close");
        this.status = "close";
        // if(this.client!=null){
        //     this.client.setTimeout(10000,function(){
        //         console.log("retry");
        //         this.client.connect(this.port,this.ip,function(){
        //             console.log("reconnect");
        //         });
        //     }.bind(this));
        // }
    }.bind(this));

    this.client.on('error',function(err){
        console.log(err);
        this.status = "error";
    }.bind(this));

    this.client.on('end',function(){
        console.log("end");
    });
}

modbus.prototype.readHoldingRegisters = function(){

    const CRC = '2C3C';
    
    if (this.action==METHOD_READ) {
        //
        sbuff = this.slaveid + this.action + this.addrBegin + this.addrCount;
        sLength = paddingLeft(parseInt((sbuff.length+CRC.length)/2, 10).toString(16), 4);
        sbuff = '0200'+'0000'+sLength+ sbuff + CRC;
        //bf = new Buffer(sbuff, 'hex');
        bf = Buffer.from(sbuff, 'hex');

    } else if (this.action==METHOD_WRITE) {

        sbuff = this.slaveid + this.action + this.addrBegin + this.addrCount;
        sLength = paddingLeft(parseInt((sbuff.length+CRC.length)/2, 10).toString(16), 4);
        sbuff = '0200'+'0000'+sLength+ sbuff + CRC;
        //bf = new Buffer(sbuff, 'hex');
        bf = Buffer.from(sbuff, 'hex');

    }
    
    return new Promise(function(resolve){
        this.client.once('data',resolve);
        this.client.write(bf);        
    }.bind(this))
}

modbus.prototype.sendCommand = function(){
    if(this.client!=null){
        this.readHoldingRegisters().then(function(msg){
            this.responseFunc(msg);

            if (!this.doloop) {this.client.destroy();};
        }.bind(this));
        //this.readHoldingRegisters().then(this.responseFunc.bind(this));
    }
    if (this.doloop) {
        this.tot = setTimeout(function(){this.sendCommand();}.bind(this), this.refreshSec);
    } 
}

function paddingLeft(str,lenght){
	if(str.length >= lenght)
	return str;
	else
	return paddingLeft("0" +str,lenght);
}

module.exports = modbus;

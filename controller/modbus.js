const net= require('net');

//執行動作代碼
const METHOD_READ  = '03'; //讀取
const METHOD_WRITE = '10'; //寫入 hex:10, dec:16


exports = module.exports = class modbus {
    constructor() {
        this.client = new net.Socket();
        this.ip = "127.0.0.1";
        this.port = 502;
        //自動循環,重新整理秒數
        this.doloop = false;
        this.refreshSec = 3000;
    }
    doRead(xSlaveId, xAddrBegin, xAddrEnd) {
        //第幾台
        this.slaveid = paddingLeft(xSlaveId.toString(16), 2);
        //執行動作
        this.action = METHOD_READ;
        //位址 16進位前補零到長度4碼
        this.addrBegin = paddingLeft(xAddrBegin.toString(16), 4);
        this.addrEnd = paddingLeft(xAddrEnd.toString(16), 4);
        this.addrCount = paddingLeft(((xAddrEnd - xAddrBegin) + 1).toString(16), 4);

        return this.doConnect().then(this.sendCommand.bind(this)).then(this.readHoldingRegisters.bind(this));
    }

    doWrite(xSlaveId, xAddrBegin, xAddrEnd, xData) {
        //第幾台
        this.slaveid = paddingLeft(xSlaveId.toString(16), 2);
        //執行動作
        this.action = METHOD_WRITE;
        //位址 16進位前補零到長度4碼
        this.addrBegin = paddingLeft(xAddrBegin.toString(16), 4);
        this.addrEnd = paddingLeft(xAddrEnd.toString(16), 4);
        //長度以寫入的資料長度為主
        this.addrCount = paddingLeft(xData.length.toString(16), 4);
        this.bytecount = paddingLeft((xData.length*2).toString(16), 2);
        //寫入的data
        this.data = xData;
        return this.doConnect().then(this.sendCommand.bind(this)).then(this.readHoldingRegisters.bind(this));
    }

    doConnect() {
        return new Promise((resolve, reject)=>{

            this.client.connect(this.port, this.ip, function(){
                console.log("connected");
                this.status = "connect";
                resolve();
            }.bind(this));

            this.client.on('close', function () {
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

            this.client.on('error', function (err) {
                console.log(err);
                this.status = "error";
                reject(err);
            }.bind(this));

            this.client.on('end', function () {
                console.log("end");
                reject('socket is end');
            });

        });        
    }
    readHoldingRegisters() {
       
        if (this.action == METHOD_READ) {
            const CRC = '2C3C';
            var sbuff = this.slaveid + this.action + this.addrBegin + this.addrCount;
            var sLength = paddingLeft(parseInt((sbuff.length + CRC.length) / 2, 10).toString(16), 4);
            sbuff = '0200' + '0000' + sLength + sbuff + CRC;
            //bf = new Buffer(sbuff, 'hex');
            var bf = Buffer.from(sbuff, 'hex');
        }
        else if (this.action == METHOD_WRITE) {
            const CRC = '8BF8';
            var sData='';
            for (var i=0; i<this.data.length; i++) {
                if (i > this.addrCount) {break};
                sData += paddingLeft(parseInt(this.data[i],10).toString(16), 4);
            }

            var sbuff = this.slaveid + this.action + this.addrBegin + this.addrCount + this.bytecount + sData;
            var sLength = paddingLeft(parseInt((sbuff.length + CRC.length) / 2, 10).toString(16), 4);
            sbuff = '0200' + '0000' + sLength + sbuff + CRC;
            //bf = new Buffer(sbuff, 'hex');
            var bf = Buffer.from(sbuff, 'hex');
        }
        return new Promise(function (resolve) {
            this.client.once('data', resolve);
            this.client.write(bf);        
        }.bind(this));
    }

    sendCommand() {
        return new Promise((resolve,reject)=>{
            if (this.client != null) {    
                console.log('sendCommand');            
                resolve();                
            } else {
                reject('client is null');
            };
        });        
    }
};

function paddingLeft(str,lenght){
	if(str.length >= lenght)
	return str;
	else
	return paddingLeft("0" +str,lenght);
};

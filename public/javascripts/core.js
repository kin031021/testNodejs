// angular.module('myApp', []).
//    controller('myController', ['$scope', function($scope){    

//     $http.post('/api', {method:"read", slaveid:2, addr:"0-19"})
//     .success(function (data) {   

//         var adata = []
//         for (var i=0; i<data.length; i++) {
//             adata.push(data[i].data_hex);
//         }

//         $scope.frameworks = adata;
//         console.log(adata);
//     })
//     .error(function (data) {
//         console.log('Error: ' + data);
//     });

//   }]);

  var myApp = angular.module('myApp', []);

  function myController($scope, $http) {      

    doRead();
    
    function doRead(){
      $http.post('/api', {method:"read", slaveid:2, addr:"0-19"})
      .success(function (data) {   

          if (data.result!=undefined && data.result==false) {            
            return
          }

          $scope.writedata=[];
          for (var i=0; i<data.length; i++) {
            $scope.writedata.push(data[i].data_dec);
          }

          $scope.datas = data;
          console.log('doRead Result:' + data);
      })
      .error(function (data) {
          console.log('doRead Error:' + data);
      });
    };  
    
    function doWrite(sData, sAddr){
      $http.post('/api', {method:"write", slaveid:2, addr:sAddr, data:sData})
      .success(function (data) {
          console.log('doWrite Result:' + data);          
      })
      .error(function (data) {
          console.log('doWrite Error:' + data);
      });
    }; 

    $scope.save = function() {

      var sData='';
      var iCount=1;
      var iAddrindex=0;
      for (var i=0; i<$scope.writedata.length; i++) {

        if (iCount>10) {
          console.log('sData:'+sData);
          console.log('iAddrindex:'+iAddrindex);
          console.log('iCount:'+iCount);
          console.log('i:'+i);  
          doWrite(sData.substring(1), iAddrindex.toString(10));
          sData = '';
          iCount = 0;          
          iAddrindex=i;
        }
        sData += '-' + $scope.writedata[i].toString(10);
        iCount++;
      }
      console.log('sData:'+sData);
      console.log('iAddrindex:'+iAddrindex);
      console.log('iCount:'+iCount);
      var promise = new Promise((resolve)=>{
        doWrite(sData.substring(1), iAddrindex.toString(10));
        resolve();
      }).then(setTimeout(() => {
        doRead()
      }, 500));   
    };

    $scope.reload = function() {
      doRead();
    }

    //$scope.frameworks = ['Node.js', 'Express', 'AnjularJS'];
  };

// angular.module('myApp', []).
//   controller('myController', ['$scope', function($scope){


//     $scope.frameworks = ['Node.js', 'Express', 'AnjularJS'];
//   }]);
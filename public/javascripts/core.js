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

    $http.post('/api', {method:"read", slaveid:2, addr:"0-19"})
    .success(function (data) {   

        // var adata = []
        // for (var i=0; i<data.length; i++) {
        //     adata.push(data[i].data_hex);
        // }

        $scope.datas = data;
        console.log(data);
    })
    .error(function (data) {
        console.log('Error: ' + data);
    });

    //$scope.frameworks = ['Node.js', 'Express', 'AnjularJS'];
  }

// angular.module('myApp', []).
//   controller('myController', ['$scope', function($scope){


//     $scope.frameworks = ['Node.js', 'Express', 'AnjularJS'];
//   }]);
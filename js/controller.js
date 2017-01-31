angular
.module('myApp', ['ui.bootstrap','ngSanitize', 'ui.select'])

// controller here
.controller('FirstCtrl', function($scope,$http,$interval,$location) {

      $scope.loading = false;

      var _selected;

      $scope.selected = undefined;
      $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
      // Any function returning a promise object can be used to load values asynchronously
      $scope.getLocation = function(val) {
          query = {"name":{"$regex":"","$options":""}};
          query.name.$regex = val;
          return $http.get('http://d.yimg.com/autoc.finance.yahoo.com/autoc?query='+val+'&region=us&lang=en', {
              params: {
                q:val
              }
          }).then(function(response){
            console.log(response);
              return response.data.ResultSet.Result.map(function(item){
                  console.log(item);
                  return item;
              });
          });
      };

      $scope.ngModelOptionsSelected = function(value) {
          if (arguments.length) {
              _selected = value;
          } else {
              return _selected;
          }
      };

      $scope.modelOptions = {
          debounce: {
              default: 1000,
              blur: 1000
          },
          getterSetter: true
      };

      $scope.stockArray = [];

      $scope.httpStocks = [];

      function getStocks(){
        if ($scope.stockArray.length > 0){
          $scope.loading = true;
          stocks = '';
          for (x=0; x<$scope.stockArray.length;x++){
            stocks += '%22'+$scope.stockArray[x]+'%22,';
          }
          stocks = stocks.substring(0,stocks.length-1);

          $http.get('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20('+stocks+')&format=json&env=http://datatables.org/alltables.env',
            {
              params:{}
            }).then(function(response){
              $scope.loading = false;
              if (response.data.query.count == 1){
                $scope.httpStocks = [];
                $scope.httpStocks.push(response.data.query.results.quote);
              }
              if (response.data.query.count > 1){
                $scope.httpStocks = response.data.query.results.quote;
              }
              $scope.lastUpdated();
          });
        }
      }

      getStocks();

      function setParams(){
        /*var s = ''
        for (var x=0;x<$scope.stockArray.length;x++){
          s += $scope.stockArray[x];
          s += ',';
        }
        s = s.substring(0,s.length-1);
        $location.path(s);*/
      }

      $scope.addStock = function(stock){
        $scope.stockArray.push(stock);
        getStocks();
        $scope.selected = null;
        setParams(stock);
      }

      $scope.removeStock = function(stock){
        for (var y=0;y<$scope.stockArray.length;y++){
          if ($scope.stockArray[y] == stock){
            $scope.stockArray.splice(y, 1);
            y=y-1;
          }
        }
        for (var x=0;x<$scope.httpStocks.length;x++){
          if ($scope.httpStocks[x].symbol == stock){
            $scope.httpStocks.splice(x, 1);
            x=x-1;
          }
        }
        setParams();
      }

      $scope.lastUpdated = function(){
        $scope.hour = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
      }

      $interval( function(){
        getStocks();
        $scope.lastUpdated();
      }, 10000);

      $scope.onSelect = function(item){
        $scope.addStock(item.symbol);
      }

});

/**
 * The controller is a JavaScript function that augments the AngularJS scope and exposes functions that can be used in the custom widget template
 * 
 * Custom widget properties defined on the right can be used as variables in a controller with $scope.properties
 * To use AngularJS standard services, you must declare them in the main function arguments.
 * 
 * You can leave the controller empty if you do not need it.
 */
function LastTableCtrl($scope, $filter) {

    this.isArray = Array.isArray;
    $scope.filterList = [];
    this.isClickable = function () {
      return $scope.properties.isBound('selectedRow');
    };
    
    this.selectRow = function (row) {
      if (this.isClickable()) {
        $scope.properties.selectedRow = row;
      }
    };
    
   $scope.$watch('search', function (term) {
      var obj = term;
      
      $scope.filterList = $filter('filter')($scope.properties.content, obj);
      $scope.currentPage = 1;
    }); 
   
    $scope.sort = function(name)
    {
        console.log(name);
        $scope.sortKey = name;
        $scope.reverse = !$scope.reverse;
    };
    
    this.isSelected = function(row) {
      return angular.equals(row, $scope.properties.selectedRow);
    };
    
  }
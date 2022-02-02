function($scope, $interval, $window, $http, $modal) {
  var ctrl = this;

  // Hide the message to notify the user that we searching for next task
  $scope.display = "display:none";

  // Is it the first time the value of "submit button successful response value" change?
  // We need to ignore the first change
  ctrl.firstTime = true;

  // Current user id
  var userId;

  // Current case id
  var caseId;

  // Get current user id by performing a call to /API/system/session
  $http.get('/' + $scope.properties.bonitaWebAppName + '/API/system/session/1').
  success(function(data, status, header, config) {
    // Get the user id from REST API call answer
    userId = data.user_id;
  }).
  error(function(data, status, headers, config) {
    console.error("Fail to get user id");
    redirectFallback();
    return;
  });

  // If task id is provided use it to get case id
  if($scope.properties.taskId) {
    // Get the current case id using the provide task id
    $http.get('/' + $scope.properties.bonitaWebAppName + '/API/bpm/flowNode/' + $scope.properties.taskId).
    success(function(data, status, header, config) {
      // Get the user id from REST API call answer
      caseId = data.caseId;
    }).
    error(function(data, status, headers, config) {
      console.error("Fail to get case id");
      redirectFallback();
      return;
    });
  }

  // We watch the variable to trigger code execution when we get a successful response from the submit task REST call
  $scope.$watch('properties.submitButtonSuccessfulResponseValue', function() {

    // Ignore the first modification of the watched variable
    if (!ctrl.firstTime) {
        
      // Display the message to the user while we searching for next task
      $scope.display = "";
      $scope.warningModal();

      // If we don't alrady get case id using task id we should be on instantiation form and so we can find case id in reponse value
      if(!caseId) {
        caseId = $scope.properties.submitButtonSuccessfulResponseValue.caseId;
      }

      // Try to find next task for current user until we reach the configured numberOfRetries
      // Wait "timeToWait" between each try
      var counter = 0, interval = $interval(function() {

          // Increment number of tries
          counter++;

          // If we reach the maximum number of retries
          if (counter > $scope.properties.numberOfRetries) {

            // Cancel the periodic execution of the code to search for next task
            $interval.cancel(interval);

            // Redirect user to Portal
            redirectFallback();
          } else {

            // Call API to get pending task (limit result to one task) for current user in current case
            $http.get('/' + $scope.properties.bonitaWebAppName + '/API/bpm/humanTask?c=1&p=0&f=state=ready&f=user_id=' + userId + '&f=caseId=' + caseId).
            success(function(data, status, headers, config) {

              // If we found one task for current user
              if (data[0]) {

                // Assign  next task to current user
                $http.put('/' + $scope.properties.bonitaWebAppName + '/API/bpm/humanTask/' + data[0].id, {
                  assigned_id: userId
                });

                // Redirect user to task form
                $window.location.href = '/' + $scope.properties.bonitaWebAppName + '/portal/form/taskInstance/' + data[0].id;
              }
            }).
            error(function(data, status, headers, config) {
              console.debug("Fail to get next task");

              redirectFallback();
            });

          }
        }, $scope.properties.timeToWait);

    } else {
      // This is the first time submitButtonSuccessfulResponseValue changed
      ctrl.firstTime = false;
    }
  });

  // Display the modal window to the user to notify that we search for next task
  $scope.warningModal = function() {

    var html = "<div class=' panel-body alert alert-success' style='margin-bottom:0;'>" + "<div class='col-md-4 col-md-offset-4 ' style='top: 50%;'>" + "<i class='fa fa-spinner fa-spin'></i>" + $scope.properties.messageDisplayed + "</div>" + "</div>";

    $scope.myModal = $modal.open({
      template: html,
      backdrop: 'static'
    });
  };

  // If we cannot find any task for current user or if searching for task failed redirect user to Portal
  function redirectFallback() {
    // Redirect to Bonita Portal as we didn't find task for current user
    $window.top.location.href = '/' + $scope.properties.bonitaWebAppName;
  }
}

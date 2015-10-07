angular.module('kwiki.profile', [])

.factory('ProfileFactory', function ($http, $state, SocketFactory, $window, $rootscope) {

  var updateProfileInfo = function(userProfile) {
    return $http.post('/??????????', userProfile)
      .then(function(res) {
        return res.data;
      })
      .catch(function(err) {
        console.log(err);
      });
  };

  return {
    updateProfileInfo: updateProfileInfo
  }
})

.controller('ProfileCtrl', function ($rootScope, $state, $scope, ProfileFactory, AuthFactory) {

  $scope.handleSubmit = function(userProfile) {

    ProfileFactory.updateProfileInfo(userProfile)
      .then(function(res) {
      })
      .catch(function(err) {
        console.log(err);
      });
  };

});

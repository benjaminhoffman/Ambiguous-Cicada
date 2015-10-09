angular.module('kwiki.profile', [])

.factory('ProfileFactory', function ($http, $state, SocketFactory, $window, $rootScope) {

  var updateProfileInfo = function(userProfile) {
    return $http({
      method: 'PUT',
      url: $rootScope.host + '/profile/' + userProfile.id,
      data: userProfile
    })
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

.controller('ProfileCtrl', function ($state, $scope, ProfileFactory) {

  $scope.handleSubmit = function(userProfile) {

    ProfileFactory.updateProfileInfo(userProfile)
      .then(function(res) {
        $state.go('match');
      })
      .catch(function(err) {
        console.log(err);
      });
  };

});

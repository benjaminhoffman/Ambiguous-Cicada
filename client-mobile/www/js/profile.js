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

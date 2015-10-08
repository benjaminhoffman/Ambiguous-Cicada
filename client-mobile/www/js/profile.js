angular.module('kwiki.profile', [])

.factory('ProfileFactory', function ($http, $state, SocketFactory, $window, $rootScope) {

  // var getProfileInfo = function(userProfile) {

  //   return $http({
  //     method: 'GET',
  //     url: $rootScope.host + '/profile/' + userProfile.id,
  //     data: userProfile
  //   })
  //   .then(function(res) {
  //     return res.data;
  //   })
  //   .catch(function(err) {
  //     console.log(err);
  //   });
  // };

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
    // getProfileInfo: getProfileInfo,
    updateProfileInfo: updateProfileInfo
  }
})

.controller('ProfileCtrl', function ($rootScope, $state, $scope, ProfileFactory, AuthFactory) {


  // ProfileFactory.getProfileInfo($scope.user)
  //   .then(function(res) {
  //     console.log(res)
  //     $scope.user.interests = {
  //       sports: res.sports
  //     }

  //   })
  //   .catch(function(err) {
  //     console.log(err)
  //   });

  $scope.handleSubmit = function(userProfile) {

    ProfileFactory.updateProfileInfo(userProfile)
      .then(function(res) {
      })
      .catch(function(err) {
        console.log(err);
      });
  };

});

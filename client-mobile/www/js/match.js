angular.module('kwiki.match', ['ngCordova'])

.factory('MatchFactory', ['$state', 'SocketFactory', '$window', '$rootScope', '$cordovaGeolocation', function ($state, SocketFactory, $window, $rootScope, $cordovaGeolocation) {
  var matchFact = {};

  matchFact.connectSocket = function () {
    this.socket = SocketFactory.connect("match");
  };

  matchFact.postMatch = function () {
    var self = this;
    if( $rootScope.user.address.toUpperCase() === "CURRENT LOCATION" ) {
      console.log('beep boop');
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function (position) {
        $rootScope.user.coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        self.socket.emit('matching', $rootScope.user);
      });
    } else {
      this.socket.emit('matching', $rootScope.user);
    }
    this.socket.on('matched', function (data) {
      $rootScope.chatRoomId = data;
      $rootScope.$apply(function () {
        $state.go('chat');
      });
    });
  };

  return matchFact;
}])

.controller('MatchCtrl', ['$rootScope', '$state', '$scope', 'MatchFactory', 'AuthFactory', function ($rootScope, $state, $scope, MatchFactory, AuthFactory) {
  $rootScope.disableButton = false;

  $scope.connect = function() {
    MatchFactory.connectSocket();
  };

  $scope.submit = function () {
    $rootScope.disableButton = true;
    MatchFactory.postMatch();
    $state.go('load');
  };

  $scope.handleCancel = function () {
    $state.go('match');
  }

  $scope.logOut = function () {
    $rootScope.disableButton = false;
    AuthFactory.logOut();
  };
}]);

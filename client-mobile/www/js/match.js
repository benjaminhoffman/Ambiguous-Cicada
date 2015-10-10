angular.module('kwiki.match', ['ngCordova'])

.factory('MatchFactory', ['$state', 'SocketFactory', '$window', '$rootScope', '$cordovaGeolocation', function ($state, SocketFactory, $window, $rootScope, $cordovaGeolocation) {
  var matchFact = {};

  matchFact.connectSocket = function () {
    this.socket = SocketFactory.connect("match");
  };

  matchFact.postMatch = function (coords) {
    var self = this;
    if( $rootScope.user.address.toUpperCase() === "CURRENT LOCATION" ) {
      $rootScope.user.coords = coords;
      self.socket.emit('matching', $rootScope.user);
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

  matchFact.cancelMatch = function () {
    this.socket.emit('cancel', $rootScope.user);
  }

  return matchFact;
}])

.controller('MatchCtrl', ['$rootScope', '$state', '$scope', 'MatchFactory', 'AuthFactory', '$cordovaGeolocation', function ($rootScope, $state, $scope, MatchFactory, AuthFactory, $cordovaGeolocation) {
  $rootScope.disableButton = false;
  defaultSearch = {
    distance: 1
  };
  $rootScope.user.search = $rootScope.user.search || defaultSearch;
  $rootScope.user.address = $rootScope.user.address || 'CURRENT LOCATION';

  $scope.map = { center: { latitude: 35.3580, longitude: 138.7310 }, zoom: 13 };
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation.getCurrentPosition(posOptions)
  .then(function (position) {
    $scope.mapCoords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    $scope.map = { center: { latitude: $scope.mapCoords.lat, longitude: $scope.mapCoords.lng }, zoom: 13 };
  });

  $scope.connect = function() {
    MatchFactory.connectSocket();
  };

  $scope.submit = function () {
    $rootScope.disableButton = true;
    MatchFactory.postMatch($scope.mapCoords);
    $state.go('load');
  };

  $scope.handleCancel = function () {
    $rootScope.disableButton = false;
    MatchFactory.cancelMatch();
    $state.go('match');
  }

  $scope.logOut = function () {
    $rootScope.disableButton = false;
    AuthFactory.logOut();
  };
}]);

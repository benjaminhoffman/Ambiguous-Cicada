angular.module('kwiki.chat',[])

.factory('ChatFactory', ['$http', '$rootScope', 'SocketFactory', '$window', function ($http, $rootScope, SocketFactory, $window) {

  var chatFact = {};

  chatFact.socket = SocketFactory.connect('chat', $rootScope.user);

  chatFact.loadChat = function(callback) {
    this.socket.emit('loadChat', $rootScope.chatRoomId);
    this.socket.on('message', function (message) {
      callback(message);
    });
    this.socket.on('leaveChat', function () {
      callback(null, true);
    });
  };

  chatFact.leaveChat = function () {
    this.socket.emit('leaveChat', $rootScope.chatRoomId);
  };

  chatFact.postMessage = function (message) {
    this.socket.emit('message', message);
  };

  return chatFact;

}])

.controller('ChatCtrl', ['$rootScope', '$state', '$scope', 'ChatFactory', 'AuthFactory', '$ionicGesture', function ($rootScope, $state, $scope, ChatFactory, AuthFactory, $ionicGesture) {

  $scope.trigger = false;
  $scope.triggerWord = '';
  var triggerWords = ['cho', 'tempest', 'birthday', 'tea']

  $scope.messages = [];
  $scope.draw = false;


  $scope.message = {
    userName: $rootScope.user.name,
    text: ''
  };

  $scope.leaveChat = function (logout) {
    $scope.messages = [];
    $rootScope.disableButton = false;
    ChatFactory.leaveChat();
    $state.go('match');
  };

  $scope.loadChat = function() {
    ChatFactory.loadChat(function (message, leavechat) {
      if (leavechat) {
        $scope.messages = [];
        $state.go('match');
      } else {

        var parseText = message.text.split(" ");

        parseText.forEach(function(text) {
          if(triggerWords.indexOf(text) !== -1) {
            message.triggerWord = text;
            $scope.triggerWord = text;
            console.log($scope.triggerWord)
            $scope.trigger = true;
          }
        })

        $scope.messages.push(message);

        if(message.triggerWord) {
          $scope.makeItRain(message.triggerWord);
        }

        $scope.$apply();
      }
    });
  };

  $scope.makeItRain = function(triggerWord) {
    console.log("making it rain");

  };

  $scope.sendMessage = function () {

    if( $scope.message ){
      ChatFactory.postMessage(this.message);
      $scope.messages.push({
        userName: this.message.userName,
        text: this.message.text
      });
      $scope.message.text = '';
    }
  };

  $scope.logOut = function () {
    $scope.messages = [];
    $rootScope.disableButton = false;
    ChatFactory.leaveChat();
    AuthFactory.logOut();
  };

}]);


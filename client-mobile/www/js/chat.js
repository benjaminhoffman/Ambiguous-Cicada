angular.module('kwiki.chat',['ionic'])

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

.controller('ChatCtrl', ['$rootScope', '$state', '$scope', 'ChatFactory', 'AuthFactory', '$ionicGesture', '$window', '$timeout', function ($rootScope, $state, $scope, ChatFactory, AuthFactory, $ionicGesture, $window, $timeout) {

  $scope.trigger = false;
  $scope.triggerWord = '';
  var triggerWords = ['cho', 'tempest', 'birthday', 'tea'];

  $scope.style = [
    {
      'transition': '3s linear all'
    },
    {
      'transition': '1s linear all'
    },
    {
      'transition': '1.5s linear all'
    },
    {
      'transition': '2s linear all'
    },
    {
      'transition': '1s linear all'
    },
    {
      'transition': '4s linear all'
    },
    {
      'transition': '5s linear all'
    },
    {
      'transition': '3s linear all'
    },
    {
      'transition': '2s linear all'
    }

  ];

  $scope.messages = [];
  $scope.draw = false;

  $scope._drawGesture = undefined;

  $scope.message = {
    userName: $rootScope.user.name,
    text: ''
  };

  $scope._stopListeningToDraw = function() {
    $scope._drawGesture = $ionicGesture.on('drag', function (evt){
      var coords = {
        x:evt.gesture.srcEvent.layerX, 
        y:evt.gesture.srcEvent.layerY  
      };
      console.log(coords);
    }, $scope.can);

  };

  $scope._listenToDraw = function(){
    $scope._drawGesture = $ionicGesture.on('drag', function (evt){
      var coords = {
        x:evt.gesture.srcEvent.layerX, 
        y:evt.gesture.srcEvent.layerY  
      };
      console.log(coords);
    }, $scope.can);
  };
  
  $scope.toggleDrawView = function() {
    $scope.draw = !$scope.draw;

    if($scope.draw) {
      
      // this is terrible, just quick workaround while I work on the actual implementation
      $timeout(function(){
        $scope.can = angular.element(document.getElementById('can'));
        $scope._listenToDraw();
      },1000);
    }
    else {
      $scope._stopListeningToDraw();
    }

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
            setTimeout(function(){$scope.trigger = false}, 1000);
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

}])


.animation('.slide', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log("ELEMENT")
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true
      })
    }
  }
}])



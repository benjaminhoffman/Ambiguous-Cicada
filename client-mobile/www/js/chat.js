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
      'transition': '3s linear'
    },
    {
      'transition': '2s linear'
    },
    {
      'transition': '5s linear'
    },
    {
      'transition': '2s linear'
    },
    {
      'transition': '1s linear'
    },
    {
      'transition': '4s linear'
    },
    {
      'transition': '5s linear'
    },
    {
      'transition': '3s linear'
    },
    {
      'transition': '2s linear'
    }

  ];

  $scope.messages = [];
  $scope.draw = false;

  $scope._drawGesture = undefined;
  $scope.initialThumbCoordinates = undefined;

  $scope.message = {
    userName: $rootScope.user.name,
    text: ''
  };

  $scope.drawMessageCoordinates = [];

  $scope._clientLine = function(from, to) {
    var ctx = $scope.can[0].getContext('2d');
    console.log('from :', from, ' to: ->', to);
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    $scope.initialThumbCoordinates = to;
    $scope.drawMessage.push({ from: from, to: to });
  };

  $scope._stopListeningToDraw = function() {
    if(!$scope._drawGesture) { return ; }
    $ionicGesture.off($scope._drawGesture, 'drag');
  };

  $scope._listenToDraw = function(){
    var _begin = $ionicGesture.on('dragstart', function (evt){
      $scope.initialThumbCoordinates = {x: evt.gesture.srcEvent.layerX, y:evt.gesture.srcEvent.layerY };
      console.log('start of scope drag', $scope.initialThumbCoordinates);
    }, $scope.can);
    $ionicGesture.off(_begin, 'dragstart');

    $scope._drawGesture = $ionicGesture.on('drag', function (evt){
      var coords = {
        x:evt.gesture.srcEvent.layerX, 
        y:evt.gesture.srcEvent.layerY  
      };
      $scope._clientLine($scope.initialThumbCoordinates, coords);
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
            $scope.trigger = true;
            console.log("settimeout: " + $scope.trigger)
            setTimeout(function(){
              $scope.trigger = false;
              console.log("settimeout: " + $scope.trigger)

            }, 1000);
          }
        })

        $scope.messages.push(message);
        $scope.$apply();
      }
    });
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
    enter: function(element, done) {
      return $animateCss(element, {
        event: 'enter',
        structural: true
        // from: { top:0 },
        // to: { top: 800 }
      })
    }
  }
}])



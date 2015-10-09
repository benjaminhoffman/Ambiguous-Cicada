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

  chatFact.postPicture = function (picture) {
    this.socket.emit('picture', picture);
  };

  chatFact.loadPicture = function(callback) {
    this.socket.on('picture', function (coords) {
      callback(coords);
    });

  }

  return chatFact;

}])

.controller('ChatCtrl', ['$rootScope', '$state', '$scope', 'ChatFactory', 'AuthFactory', '$ionicGesture', '$window', '$timeout', function ($rootScope, $state, $scope, ChatFactory, AuthFactory, $ionicGesture, $window, $timeout) {

  $scope.trigger = false;
  $scope.triggerWord = '';
  var triggerWords = ['cho', 'tempest', 'birthday', 'tea'];


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
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    $scope.initialThumbCoordinates = to;
    $scope.drawMessageCoordinates.push({ from: from, to: to });
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

  $scope._drawServerPic = function(ctx, coords) {
    for(var i=0; i < coords.length; i++ ) {
      var from = coords[i].from;
      var to = coords[i].to;

      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

  };
  
  $scope.toggleDrawView = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
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
        $scope.messages.text = [];
        $state.go('match');
      } else {
        var parseText = message.text.split(" ");
        $scope.messages.push(message);
        $scope.$apply();
        triggerWords.forEach(function(word) {
          if(message.text.search(word) !== -1) {
            var animateStr
            $scope.styles = [];
            for( var i = 0; i < 10; i++ ) {
              animateStr = (Math.random() * 2 + 0.5).toFixed(2) + 's linear';
              $scope.styles.push({
                'left': (Math.random() * 100).toFixed(2) - 5 + '%',
                'animation': animateStr,
                '-webkit-animation': animateStr
              });
            }
            message.triggerWord = word;
            $scope.triggerWord = word;
            $scope.trigger = true;
            $scope.$apply();
            setTimeout(function(){
              $scope.trigger = false;
              $scope.$apply();
            }, 2500);
          }
        });

      }
    });

    ChatFactory.loadPicture(function (imageDirections) {
      var msgCanvas = document.createElement('canvas');
      // msgCanvas.id = 'picmsg-' + $scope.messages.length;
      $scope.messages.push(imageDirections);
      $scope.$apply();
      var chatCanvas = angular.element(document.getElementsByClassName('pic'));
      var canvasContainer = chatCanvas[chatCanvas.length-1];
      canvasContainer.appendChild(msgCanvas);
      $scope._drawServerPic(msgCanvas.getContext('2d'), imageDirections.text);

    });
  };

  $scope.sendMessage = function () {

    if( $scope.drawMessageCoordinates.length > 0 ) {
      console.log('length of draw object before sending', $scope.drawMessageCoordinates.length);
      $scope.message = {text: $scope.drawMessageCoordinates, type: 'pic', userName: $scope.message.userName};
      ChatFactory.postPicture($scope.message);
      $scope.drawMessageCoordinates = [];
      return;
    }

    if( $scope.message ){
      this.message.type = 'text';
      ChatFactory.postMessage(this.message);
      $scope.messages.push({
        type:'text',
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


.animation('.rain', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain1', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain2', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain3', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain4', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain5', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain6', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain7', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain8', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}])
.animation('.rain9', ['$animateCss', function($animateCss) {
  return {
    enter: function(element) {
      console.log(element);
      return $animateCss(element, {
        event: 'enter',
        structural: true,
        from: { top: '0%', opacity: 1 },
        to: { top: '100%', opacity: 0.2 }
      })
    }
  }
}]);



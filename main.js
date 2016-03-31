angular.module('app', []);

angular
  .module('app')
  .controller('DescriptionController', DescriptionController);

DescriptionController.$inject = ['$timeout', '$q', 'messageService'];

function DescriptionController($timeout, $q, messageService) {
  var vm = this;

  vm.text = '';

  activate();
  
  function activate() {
    pauseToShow(advance);
  }
  
  function pauseToShow(cb) {
    pause(cb, 600, 1000);
  }

  function pauseToDelete(cb) {
    pause(cb, 30, 120);
  }
  
  function pauseToEnter(cb) {
    pause(cb, 30, 150);
  }
  
  function pause(cb, min, max) {
    // random delay between min and max
    var delay = Math.floor(Math.random() * (max-min)) + min;

    $timeout(cb, delay);
  }
  
  function advance() {
    var next = messageService.getNext();
    
    deleteUntil(next)
      .then(function(){
        return typeNext(next);
      })
      .then(function(){
        return pauseToShow(advance);
      });
  }
  
  function deleteUntil(next) {
    var dfd = $q.defer();
    
    if (vm.text === next || next.indexOf(vm.text) === 0 || vm.text.length === 0) {
      dfd.resolve();
    }
    else {
      vm.text = vm.text.substr(0, vm.text.length - 1);
      pauseToDelete(function(){
        deleteUntil(next)
          .then(function(){
            dfd.resolve();
          });
      });
    }
    
    return dfd.promise;
  }
  
  function typeNext(next) {
    var dfd = $q.defer();
    
    if (vm.text === next) {
      dfd.resolve();
    }
    else {
      vm.text = next.substr(0, vm.text.length + 1);
      pauseToEnter(function(){
        typeNext(next)
          .then(function(){
            dfd.resolve();
          });
      });
    }
    
    return dfd.promise;
  }
}






angular
  .module('app')
  .factory('messageService', messageService);

function messageService(){
  var messages = getAll();
  var messageIndex = 0;
  var service = {
    getNext: getNext
  };
  
  return service;
  
  function getAll() {
    return [
      'cheeseburgers',
      'pizza',
      'anything from Wendy\'s',
      'bacon',
      'scrambled eggs',
      'fried rice',
      'fried anything'
    ];
  }
  
  function getNext() {
    var message = messages[messageIndex];

    messageIndex++;
    if (messageIndex >= messages.length) {
      messageIndex = 0;
    }
    
    return message;
  }
}
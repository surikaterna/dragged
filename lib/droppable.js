var angular = require('angular');

var dragged = angular.module('ui.dragged');

dragged.directive('uiDroppable', uiDroppable);

function uiDroppable() {
  return {
    /*
          scope: {
    			uiDroppable: "=",
    			onDrop: "&",
          onDragHoverOver: "&",
          onDragHoverEnter: "&",
          onDragHoverLeave: "&",
    			uiDropActiveClass:"@",
    			uiDropAccepts:"@"

    		},
    	    controllerAs: 'vm',
    	    bindToController: true,
    */
    controller: uiDroppableController
  };
}

function uiDroppableController($scope, $element, $attrs, $parse) {
  var vm = this;
  var dropActiveClass = $attrs.uiDropActiveClass || 'dropActive';
  var accepts = $scope.$eval($attrs.uiDropAccepts) || ['text/plain'];

  if (angular.isString(accepts)) {
    accepts = [accepts]
  }

  $scope.$watch($attrs.uiDroppable, function(newVal) {

    var elementToDrop = $element;

    if (newVal === undefined || newVal) {
      elementToDrop.bind('dragover', dragOverHandler);
      elementToDrop.bind('dragenter', dragEnterHandler);
      elementToDrop.bind('dragleave', dragLeaveHandler);
      elementToDrop.bind('drop', dropHandler);

    } else {
      elementToDrop.unbind('dragover');
      elementToDrop.unbind('drop');
      elementToDrop.unbind('dragenter');
      elementToDrop.unbind('dragleave');
    }
  });


  function dragOverHandler(event) {
    event = event.originalEvent || event;

    if (_isAccepted(event.dataTransfer.types)) {

      var dragHoverOverFn = $parse($attrs.onDragHoverOver);
      dragHoverOverFn($scope, {
        event: event
      });

      if (event.preventDefault) {
        event.preventDefault();
      }

      if (event.stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  function dropHandler(event) {
    event = event.originalEvent || event;

    if (_isAccepted(event.dataTransfer.types)) {
      var dataTransfer = event.dataTransfer;
      var types = dataTransfer.types;
      var allData = {};
      for (var i = 0; i < types.length; i++) {
        allData[types[i]] = dataTransfer.getData(types[i]);
      }
      var dropFn = $parse($attrs.onDrop);
      var acceptedData = []
      for (var i = 0; i < types.length; i++) {
        if (types[i] === "text/plain") {
          continue;
        } else if (allData[types[i]]) {
          acceptedData.push(allData[types[i]]);
        }
      }
      dropFn($scope, {
        data: acceptedData[0],
        allData: allData,
        event: event
      });

      dragLeaveHandler(event);

      if (event.stopPropagation) {
        event.stopPropagation();
      }
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }

  function dragEnterHandler(event) {
    event = event.originalEvent || event;
    if (_isAccepted(event.dataTransfer.types)) {
      $element.addClass(dropActiveClass);

      var dragHoverEnterFn = $parse($attrs.onDragHoverEnter);
      dragHoverEnterFn($scope, {
        event: event
      });

    }
  }

  function dragLeaveHandler(_event) {
    $element.removeClass(dropActiveClass);
    var dragHoverLeaveFn = $parse($attrs.onDragHoverLeave);
    dragHoverLeaveFn($scope, {
      event: event
    });
  }

  function _isAccepted(types) {
    for (var i = 0; i < types.length; i++) {
      for (var j = 0; j < accepts.length; j++) {
        if (types[i] === accepts[j]) {
          return true;
        }
      }
    }
    return false;
  }

}
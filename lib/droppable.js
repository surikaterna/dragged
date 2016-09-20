/* jshint node: true */
const _ = require('lodash');
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
  var dropActiveClass = $attrs.uiDropActiveClass || 'dropActive';
  var accepts = $scope.$eval($attrs.uiDropAccepts) || ['text/plain'];

  if (angular.isString(accepts)) {
    accepts = [accepts]
  }
  $scope._$$nrEnters=0;
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
      var acceptedData = null;
      for (i = 0; i < types.length; i++) {
        if (types[i] === "text/plain") {
          continue;
        } else if (allData[types[i]]) {
          acceptedData = allData[types[i]];
          break;
        }
      }
      dropFn($scope, {
        data: acceptedData,
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
      $scope._$$nrEnters++;
      $element.addClass(dropActiveClass);

      var dragHoverEnterFn = $parse($attrs.onDragHoverEnter);
      dragHoverEnterFn($scope, {
        event: event
      });

    }
  }
  function dragLeaveHandler(event) {
    $scope._$$nrEnters--;
    if($scope._$$nrEnters === 0) {
      $element.removeClass(dropActiveClass);
    }
    var dragHoverLeaveFn = $parse($attrs.onDragHoverLeave);
    dragHoverLeaveFn($scope, {
      event: event
    });
  }

  function _isAccepted(types) {
    return intersection(types, accepts).length > 0;
  }

  function intersection(a, b) {
    var t;
    if (b.length > a.length) {
      // indexOf to loop over shorter
      t = b;
      b = a;
      a = t;
    }
    return a.filter(function (e) {
      // firefox returns a domStringlist instead of array. domStringlist has contains() method rather than indexOf()
      if (b.contains) {
        return b.contains(e)
      } else {
        if (b.indexOf(e) !== -1) {
           return true;
        }
      }

    });
  }
}

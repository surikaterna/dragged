/* jshint node: true */
import _ from 'lodash';
import angular from 'angular';

function swap(array, i1, i2) {
  var ii = array[i1];
  array[i1] = array[i2];
  array[i2] = ii;
}

class uiDroppableController {

  constructor($scope, $element, $attrs, $parse, $timeout) {
    this._$scope = $scope;
    this._$element = $element;
    this._$attrs = $attrs;
    this._$parse = $parse;
    this._$timeout = $timeout;
    this.dropActiveClass = $attrs.uiDropActiveClass || 'dropActive';
    this.accepts = $scope.$eval($attrs.uiDropAccepts) || ['text/plain'];
    this._list = $scope.$eval($attrs.uiPlaceable);
    this._draggingIndex = -1;

    if (angular.isString(this.accepts)) {
      this.accepts = [this.accepts];
    }
    this._$scope._$$nrEnters = 0;
    $scope.$watch($attrs.uiPlaceable, (newVal) => {
      const elementToDrop = $element;

      if (newVal === undefined || newVal) {
        elementToDrop.bind('dragover', this.dragOverHandler.bind(this));
        elementToDrop.bind('dragenter', this.dragEnterHandler.bind(this));
        elementToDrop.bind('dragleave', this.dragLeaveHandler.bind(this));
        elementToDrop.bind('dragstart', this.dragStartHandler.bind(this));
        elementToDrop.bind('drop', this.dropHandler.bind(this));
      } else {
        elementToDrop.unbind('dragover');
        elementToDrop.unbind('drop');
        elementToDrop.unbind('dragenter');
        elementToDrop.unbind('dragleave');
      }
    });
  }
  dragStartHandler(event) {
    console.log('START', event);
    var evt = event.originalEvent || event;
    this._draggingIndex = $(event.target).index();
  }
  dragOverHandler(event) {
    const newEvent = event.originalEvent || event;
    //console.log(event);
    if (this._isAccepted(newEvent.dataTransfer.types)) {
      const dragHoverOverFn = this._$parse(this._$attrs.onDragHoverOver);
      dragHoverOverFn(this._$scope, {
        event: newEvent
      });
      //this._$element
      //console.log(newEvent.target);
      var newIndex = $(newEvent.target).index();
      console.log(newIndex, this._draggingIndex);
      if (this._draggingIndex === -1) {

      } else if (newIndex !== this._draggingIndex) {
        this._$timeout(() => {
          swap(this._list, newIndex, this._draggingIndex);
          this._draggingIndex = newIndex;
        });
      }


      if (newEvent.preventDefault) {
        newEvent.preventDefault();
      }

      if (newEvent.stopPropagation) {
        newEvent.stopPropagation();
      }
    }
  }

  dropHandler(event) {
    const newEvent = event.originalEvent || event;

    if (this._isAccepted(newEvent.dataTransfer.types)) {
      const dataTransfer = newEvent.dataTransfer;
      const types = dataTransfer.types;
      const allData = {};
      for (let i = 0; i < types.length; i++) {
        allData[types[i]] = dataTransfer.getData(types[i]);
      }
      const dropFn = this._$parse(this._$attrs.onDrop);
      let acceptedData = null;
      for (let i = 0; i < types.length; i++) {
        if (types[i] === "text/plain") {
          continue;
        } else if (allData[types[i]]) {
          acceptedData = allData[types[i]];
          break;
        }
      }
      dropFn(this._$scope, {
        data: acceptedData,
        allData,
        newEvent
      });

      this._draggingIndex = -1;
      this.dragLeaveHandler(newEvent);

      if (event.stopPropagation) {
        event.stopPropagation();
      }
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }

  dragEnterHandler(event) {
    const newEvent = event.originalEvent || event;
    if (this._isAccepted(newEvent.dataTransfer.types)) {
      if (this._$scope._$$nrEnters++ === 0) {

        $(newEvent.target).addClass(this.dropActiveClass);
        console.log('enter', newEvent.target);

        const dragHoverEnterFn = this._$parse(this._$attrs.onDragHoverEnter);
        dragHoverEnterFn(this._$scope, {
          event: newEvent
        });
      }
    }
  }

  dragLeaveHandler(event) {
    const newEvent = event.originalEvent || event;
    this._$scope._$$nrEnters--;
    if (this._$scope._$$nrEnters === 0) {
      this._draggingIndex = -1;
      //this._$element.removeClass(this.dropActiveClass);
      console.log('leave', newEvent.target);
      $(newEvent.target).removeClass(this.dropActiveClass);

      const dragHoverLeaveFn = this._$parse(this._$attrs.onDragHoverLeave);
      dragHoverLeaveFn(this._$scope, {
        event
      });
    }
  }

  _isAccepted(types) {
    return this._intersection(types, this.accepts).length > 0;
  }

  _intersection(a, b) {
    let t;
    if (b.length > a.length) {
      // indexOf to loop over shorter
      t = b;
      b = a;
      a = t;
    }
    return a.filter((e) => {
      // firefox returns a domStringlist instead of array. domStringlist has contains() method rather than indexOf()
      if (b.contains) {
        return b.contains(e);
      } else {
        if (b.indexOf(e) !== -1) {
          return true;
        }
      }
    });
  }

}


function uiPlaceable() {
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

const dragged = angular.module('ui.dragged');
dragged.directive('uiPlaceable', uiPlaceable);

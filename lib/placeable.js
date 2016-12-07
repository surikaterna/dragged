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

    // html element for placeholder object
    this._placeHolder = this._getPlaceholderElement();
    this._placeHolder.remove();

    this._placeholderNode = this._placeHolder[0];
    this._listNode = this._$element[0];

    if (angular.isString(this.accepts)) {
      this.accepts = [this.accepts];
    }
    this._$scope._$$nrPlaceEnters = [];
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
    this._showPlaceHolderItem(newEvent);

    //console.log(event);
    if (this._isAccepted(newEvent.dataTransfer.types)) {
      this._$element.addClass("isDragging");
      const dragHoverOverFn = this._$parse(this._$attrs.onDragHoverOver);
      dragHoverOverFn(this._$scope, {
        event: newEvent
      });
      //this._$element
      //console.log(newEvent.target);
      var newIndex = $(newEvent.target).index();
//      console.log(newIndex, this._draggingIndex);
      if (this._draggingIndex === -1) {

      } else if (newIndex !== this._draggingIndex) {
        this._$timeout(() => {
          // swapPreview(this._list, newIndex, this._draggingIndex, this._emptyRow);
          // this._draggingIndex = newIndex;
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
      const droppedIndex = this._getPlaceholderIndex();

      const self = this;
      this._$scope.$apply(function() {
        const oldIndex = _.indexOf(self._list, acceptedData);
        if (oldIndex !== -1) {
          self._moveListIndex(oldIndex, droppedIndex);
        } else {
          // list does not contain item - add to list
          self._list.splice(droppedIndex, 0, acceptedData);
        }
      });

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
      var index = $(newEvent.target).index();
      // console.log('||', index, this._$scope._$$nrPlaceEnters);
      var counter = this._$scope._$$nrPlaceEnters[index] ? this._$scope._$$nrPlaceEnters[index]++ : this._$scope._$$nrPlaceEnters[index] = 1;
      // console.log('enter >>', counter);
      if (counter === 1) {
        $(newEvent.target).addClass(this.dropActiveClass);
        // console.log('enter', newEvent.target);
        const dragHoverEnterFn = this._$parse(this._$attrs.onDragHoverEnter);
        dragHoverEnterFn(this._$scope, {
          event: newEvent
        });
      }
      // console.log('<< enter', this._$scope._$$nrPlaceEnters[index]);
    }
  }

  dragLeaveHandler(event) {
    const newEvent = event.originalEvent || event;

    /**
     * We have to remove the placeholder when the element is no longer dragged over our list. The problem is that the dragleave event is not only fired
     * when the element leaves our list, but also when it leaves a child element -- so practically it's fired all the time.
     * As a workaround we wait a few milliseconds and then check if the isDragging class was added again. If it is there, dragover must have been called
     * in the meantime, i.e. the element is still dragging over the list
     */
    this._$element.removeClass("isDragging");
    this._$timeout(() => {
      if (!this._$element.hasClass("isDragging")) {
        this._placeHolder.remove();
      }
    }, 100);

    var index = $(newEvent.target).index();
    var counter = --this._$scope._$$nrPlaceEnters[index];
    // console.log('leave >>', counter);
    if (counter <= 1) {
      //this._draggingIndex = -1;
      //this._$element.removeClass(this.dropActiveClass);
      // console.log('leave', newEvent.target);
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

  _showPlaceHolderItem(event) {
    // Show placeholder object
    if (this._placeholderNode.parentNode != this._listNode) {
      this._$element.append(this._placeHolder);
    }

    if (event.target !== this._listNode) {
      // Try to find the node direct directly below the list node.
      let listItemNode = event.target;
      while (listItemNode.parentNode !== this._listNode && listItemNode.parentNode) {
        listItemNode = listItemNode.parentNode;
      }

      if (listItemNode.parentNode === this._listNode && listItemNode !== this._placeholderNode) {
        // If the mouse pointer is in the upper half of the child element, we place it before the child element, otherwise below it.
        if (this._isMouseInFirstHalf(event, listItemNode)) {
          this._listNode.insertBefore(this._placeholderNode, listItemNode);
        } else {
          this._listNode.insertBefore(this._placeholderNode, listItemNode.nextSibling);
        }
      }
    } else {
      // This branch is reached when we are dragging directly over the list element.
      // Usually we wouldn't need to do anything here, but the IE does not fire it's
      // events for the child element, only for the list directly. Therefore, we repeat
      // the positioning algorithm for IE here.
      if (this._isMouseInFirstHalf(event, this._placeholderNode, true)) {
        // Check if we should move the placeholder element one spot towards the top.
        // Note that display none elements will have offsetTop and offsetHeight set to
        // zero, therefore we need a special check for them.
        while (this._placeholderNode.previousElementSibling
        && (this._isMouseInFirstHalf(event, this._placeholderNode.previousElementSibling, true)
        || this._placeholderNode.previousElementSibling.offsetHeight === 0)) {
          this._listNode.insertBefore(this._placeholderNode, this._placeholderNode.previousElementSibling);
        }
      } else {
        // Check if we should move the placeholder element one spot towards the bottom
        while (this._placeholderNode.nextElementSibling &&
        !this._isMouseInFirstHalf(event, this._placeholderNode.nextElementSibling, true)) {
          this._listNode.insertBefore(this._placeholderNode,
            this._placeholderNode.nextElementSibling.nextElementSibling);
        }
      }
    }
  }


  /**
   * Tries to find a child element that has the placeholder class set. If none was found, a new li element is created.
   */
  _getPlaceholderElement() {
    let placeholder;
    angular.forEach(this._$element.children(), (childNode) => {
      var child = angular.element(childNode);
      if (child.hasClass('placeholder')) {
        placeholder = child;
      }
    });
    return placeholder || angular.element("<li class='placeholder'></li>");
  }

  _getPlaceholderIndex() {
    return Array.prototype.indexOf.call(this._listNode.children, this._placeholderNode);
  }

  /**
   * Checks whether the mouse pointer is in the first half of the given target element.
   *
   * In Chrome we can just use offsetY, but in Firefox we have to use layerY, which only
   * works if the child element has position relative. In IE the events are only triggered
   * on the listNode instead of the listNodeItem, therefore the mouse positions are
   * relative to the parent element of targetNode.
   */
  _isMouseInFirstHalf(event, targetNode, relativeToParent) {
    const mousePointer = (event.offsetY || event.layerY);
    const targetSize = targetNode.offsetHeight;
    let targetPosition = targetNode.offsetTop;
    targetPosition = relativeToParent ? targetPosition : 0;
    return mousePointer < targetPosition + targetSize / 2;
  }

  _moveListIndex(fromIndex, toIndex) {
    if (fromIndex < toIndex) {
      // if we move down the list - account for removal of itself
      --toIndex;
    }
    if (toIndex >= this._list.length) {
      var k = toIndex - this._list.length;
      while ((k--) + 1) {
        this._list.push(undefined);
      }
    }
    this._list.splice(toIndex, 0, this._list.splice(fromIndex, 1)[0]);
  };

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

import angular from 'angular';
const dragged = angular.module('ui.dragged');

class uiDraggableController {
  constructor($scope, $element, $attrs, $parse) {
    this._$scope = $scope;
    this._$element = $element;
    this._$attrs = $attrs;
    this._$parse = $parse;
    this.draggingClass = $attrs.uiDraggingClass || 'dragging';

    $scope.$on('destroy', () => {
    });

    $scope.$watch($attrs.uiDraggable, (newVal) => {
      const elementToDrag = $element;

      if (newVal === undefined || newVal) {
        elementToDrag.attr('draggable', true);
        elementToDrag.bind('dragstart', this.dragStartHandler.bind(this));
        elementToDrag.bind('dragend', this.dragEndHandler.bind(this));
      } else {
        elementToDrag.removeAttr('draggable');
        elementToDrag.unbind('dragstart');
        elementToDrag.unbind('dragend');
      }
    });
  }

  dragStartHandler(event) {
    if (this._$attrs.onDragstart) {
      const dragStartFn = this._$parse(this._$attrs.onDragstart);
      dragStartFn({ event });
    }
    event.stopPropagation();
    const newEvent = event.originalEvent || event;
    const dataTransfer = newEvent.dataTransfer;

    if (dataTransfer.setDragImage) {
      const elm = this._createDragImage(this._$element);
      dataTransfer.setDragImage(elm, 0, 0);
    }

    const stringData = this._$attrs.uiDragData;
    if (this._$attrs.uiDragFormat) {
      dataTransfer.setData(this._$attrs.uiDragFormat, stringData);
    }
    dataTransfer.setData('text', stringData);
    dataTransfer.effectAllowed = 'all';
    setTimeout(() => {
      this._$element.addClass(this.draggingClass);
    }, 0);
  }

  dragEndHandler(event) {
    this._$element.removeClass(this.draggingClass);
  }

  _createDragImage(element) {
    return element[0];
  }
}

function uiDraggable() {
  return {
		/*		scope: {
					uiDraggable: "=",
					uiDragData: "@",
					uiDraggingClass: "@",
					uiDragFormat: "@"
				},
		*/
    controller: uiDraggableController
  };
}

dragged.directive('uiDraggable', uiDraggable);

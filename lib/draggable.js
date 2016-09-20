import angular from 'angular';
const dragged = angular.module('ui.dragged');

dragged.directive('uiDraggable', uiDraggable);

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
  }
}

function uiDraggableController($scope, $element, $attrs) {
  const vm = this;
  const draggingClass = $attrs.uiDraggingClass || 'dragging';
  //console.log($attrs);


  $scope.$on('destroy', () => {
  });

  $scope.$watch($attrs.uiDraggable, (newVal) => {

    var elementToDrag = $element;

    if (newVal === undefined || newVal) {
      elementToDrag.attr('draggable', true);
      elementToDrag.bind('dragstart', dragStartHandler);
      elementToDrag.bind('dragend', dragEndHandler);

    } else {
      elementToDrag.removeAttr('draggable');
      elementToDrag.unbind('dragstart');
      elementToDrag.unbind('dragend');
    }
  });


  function dragStartHandler(event) {
    event = event.originalEvent || event;
    const dataTransfer = event.dataTransfer;

    if (dataTransfer.setDragImage) {
      const elm = _createDragImage($element);
      dataTransfer.setDragImage(elm, 0, 0);
    }

    const stringData = $attrs.uiDragData;
    if ($attrs.uiDragFormat) {
      dataTransfer.setData($attrs.uiDragFormat, stringData);
    }
    dataTransfer.setData('text', stringData);
    dataTransfer.effectAllowed = 'all';
    setTimeout(() => {
      $element.addClass(draggingClass);
    }, 0);
  }

  function dragEndHandler(event) {
    $element.removeClass(draggingClass);
  }

  function _createDragImage(element) {
    return element[0];
  }
}

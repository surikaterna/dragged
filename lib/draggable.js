var angular = require('angular');

var dragged = angular.module('ui.dragged');

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
	var vm = this;
	var draggingClass = $attrs.uiDraggingClass || 'dragging';
	//console.log($attrs);


	$scope.$on('destroy', function() {
	});

	$scope.$watch($attrs.uiDraggable, function(newVal) {

		var elementToDrag = $element;

		if(newVal === undefined || newVal) {
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
		var dataTransfer = event.dataTransfer;

		if(dataTransfer.setDragImage) {
			var elm = _createDragImage($element);
	        dataTransfer.setDragImage(elm, 0, 0);
       	}

        var stringData = $attrs.uiDragData;
        if($attrs.uiDragFormat) {
			dataTransfer.setData($attrs.uiDragFormat, stringData);
        }
		dataTransfer.setData('text', stringData);
        dataTransfer.effectAllowed = 'all';
        setTimeout(function() {
        	$element.addClass(draggingClass);
        },0);
	}

	function dragEndHandler(event) {
		$element.removeClass(draggingClass);
	}

	function _createDragImage(element) {

	}

}
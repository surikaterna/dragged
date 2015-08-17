var angular = require('angular');

var dragged = angular.module('ui.dragged');

dragged.directive('uiDraggable', uiDraggable);

function uiDraggable() {
	return {
		scope: {
			uiDraggable: "=", 
			uiDragData: "@",
			uiDraggingClass: "@",
			uiDragFormat: "@"
		},
	    controllerAs: 'vm',
	    bindToController: true,
		controller: uiDraggableController
	}
}

function uiDraggableController($scope, $element) {
	var vm = this;
	var draggingClass = this.uiDraggingClass || 'dragging';


	$scope.$on('destroy', function() {
	});

	$scope.$watch('vm.uiDraggable', function(newVal) {

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

		var elm = _createDragImage($element);
        dataTransfer.setDragImage(elm, 0, 0);

        var stringData = vm.uiDragData;
        if(vm.uiDragFormat) {
			dataTransfer.setData(vm.uiDragFormat, stringData);
        }
		dataTransfer.setData('text/plain', stringData);
        dataTransfer.effectAllowed = 'all';
        setTimeout(function() {
        	$element.addClass(draggingClass);
        },0);
	}

	function dragEndHandler(event) {
		$element.removeClass(draggingClass);
	}

	function _createDragImage(element) {
		if(element[0].tagName === 'TR')	{
			var elm = element.clone();
			var table = angular.element('<table></table>');
			table.append(elm);
			table.css({
				 "top": 0+"px",
                "left": 0+"px",
                "position": "absolute",
                "pointerEvents": "none"				
			});
			document.body.appendChild(table[0]);
			setTimeout(function() {
				table.remove();
			},0);
			return table[0];
		} else {
			return element[0];
		}
	}

}
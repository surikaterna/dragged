var angular = require('angular');

var dragged = angular.module('ui.dragged');

dragged.directive('uiDroppable', uiDroppable);

function uiDroppable() {
	return {
		scope: {
			uiDroppable: "=", 
			onDrop: "&",
			uiDropActiveClass:"@",
			uiDropAccepts:"@"

		},
	    controllerAs: 'vm',
	    bindToController: true,
		controller: uiDroppableController
	}
}

function uiDroppableController($scope, $element) {
	var vm = this;
	var dropActiveClass = this.uiDropActiveClass || 'dropActive';
	var accepts = this.uiDropAccepts || 'text/plain';


	$scope.$watch('vm.uiDraggable', function(newVal) {

		var elementToDrop = $element;

		if(newVal === undefined || newVal) {
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

		if(_isAccepted(event.dataTransfer.types)) {
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

		var dataTransfer = event.dataTransfer;
		var types = dataTransfer.types;
		var allData = {};
		for(var i=0;i<types.length; i++) {
			allData[types[i]] = dataTransfer.getData(types[i]);
		}
		vm.onDrop({data:allData[accepts], allData:allData, event:event});
		dragLeaveHandler(event);

		if(event.stopPropagation) {
			event.stopPropagation();
		}
		if (event.preventDefault) {
	        event.preventDefault(); 
	    }
	}

	function dragEnterHandler(event) {
		event = event.originalEvent || event;
		if(_isAccepted(event.dataTransfer.types)) {
			$element.addClass(dropActiveClass)
		}
	}

	function dragLeaveHandler(event) {
		$element.removeClass(dropActiveClass)
	}

	function _isAccepted(types) {
		for( var i=0;i< types.length; i++) {
			if(types[i] === accepts ) {
				return true;
			}
		}
		return false;
	}

}

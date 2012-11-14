/*global window, $, jQuery*/

(function ($, undef) {
	"use strict";

	$.treeDragDrop = {
		
		defaults: {
			
			selectedClass: "tdd-selected",
			collapsedClass: "tdd-collapsed",
			expandedClass: "tdd-expanded",
			inFolderThreshhold: 50,
			cursorAt: {top: -30}, 
			dragContainer: $('<div class="tdd-dragContainer" />'),			
			marker: $('<div />')
		}
		
	};	
	
	
	// helpers
	
	function debug(txt) {
		if (window.console && window.console.log) {
			window.console.log(txt);
		}
	}
	// handlers	
		
	$.treeDragDrop.handlers = {
				
		handleDraggableStart: function (e, o) {
			debug("handleDraggableStart");	
			$(e.target).addClass($.treeDragDrop.defaults.selectedClass);		
		},
		
		handleDraggableDrag: function (e, o) {
			debug("handleDraggableDrag");						
		},
		
		handleDraggableStop: function (e, o) {
			debug("handleDraggableStop");
			
		},
		
		handleDroppableOut: function (e, o) {
			$(e.target).unbind("mousemove");
		},
		
		handleDroppableOver: function (e, o) {
			
			$(e.target).bind("mousemove", function (mme) {
				var	marker = $.treeDragDrop.defaults.marker,
					target = $(mme.target),
					selectedClass = $.treeDragDrop.defaults.selectedClass,
					x = mme.pageX - mme.target.offsetLeft,
					y = mme.pageY - mme.target.offsetTop,
					threshhold = $.treeDragDrop.defaults.inFolderThreshhold;
					
						
				if ($(target).is("li")) {			
					if (target.find("ul").length !== 0) {
						threshhold = Math.min($.treeDragDrop.defaults.inFolderThreshhold * (target.find("ul").length + 1), target.width() * 0.75);
					}
					
					marker.removeClass("tdd-append", "tdd-before", "tdd-after");
					if (x > threshhold) {
						marker.addClass("tdd-append");
						//debug("parents: " + target.parents("."+selectedClass).length )
						if (target.is("li") && target.children("ul").length !== 0) {
							if (!target.hasClass(selectedClass) && target.parents("." + selectedClass).length === 0) {
								target.children("ul").append(marker);
							} else {
								marker.detach();
							}
						} else {
							if (!target.hasClass(selectedClass) && target.parents("." + selectedClass).length === 0) {
								target.append(marker);
							} else {
								marker.detach();
							}
						}
						
					} else if (y < target.height() / 2) {
						marker.addClass("tdd-before");
						target.before(marker);
					} else {
						marker.addClass("tdd-after");
						target.after(marker);
					}
				}
				e.stopImmediatePropagation();	
			});
			
		},
		
		handleDroppableDrop: function (e, o) {
			debug("handleDroppableDrop");
			
			var	target = $(o.draggable),
				marker = $.treeDragDrop.defaults.marker,
				ctx = target.data("tddCtx");
			
			target.removeClass($.treeDragDrop.defaults.selectedClass);
			
				
			marker.before(target);				
			if (target.parent().is("li")) {					
				target.wrap("<ul></ul>");				
			}	
							
			marker.detach();
			$("ul", ctx).each(function () {
				if ($(this).children("li").length === 0) {
					$(this).remove();
				}
			});	
			$("li", ctx).has("ul").not("li." + $.treeDragDrop.defaults.collapsedClass).addClass($.treeDragDrop.defaults.expandedClass);
			$("li", ctx).not("li:has(ul)").removeClass($.treeDragDrop.defaults.expandedClass).removeClass($.treeDragDrop.defaults.collapsedClass);
			
			
			$("li", ctx).unbind("mousemove");
			
		},
		
		handleClick: function (e) {
			
			var target = $(e.target),
				collapsed = $.treeDragDrop.defaults.collapsedClass,
				expanded = $.treeDragDrop.defaults.expandedClass;
			
			if ($(e.target).children("ul").length === 0) {				
				target.removeClass(collapsed).removeClass(expanded);
			} else {
				if (target.hasClass(collapsed)) {
					target.removeClass(collapsed).addClass(expanded);
				} else {
					target.removeClass(expanded).addClass(collapsed);	
				}
			}			
			e.stopImmediatePropagation();
		}
	};
	
		
	$.fn.treeDragDrop = function (options) {
		options = $.extend({}, $.treeDragDrop.defaults, options);

		return this.each(function () {
			var $el = $(this),
				data = $el.data('treeDragDrop');

			if (!data) {	
				$("li", $el).draggable({ 
					addClasses: false,
					cursorAt:  $.treeDragDrop.defaults.cursorAt,
					helper: "clone",
					appendTo: "body",
					opacity: 0.2,
					delay: 300,
					//create: $.treeDragDrop.handlers.handleDraggableCreate,
					start: $.treeDragDrop.handlers.handleDraggableStart,
					//drag: $.treeDragDrop.handlers.handleDraggableDrag,
					stop: $.treeDragDrop.handlers.handleDraggableStop
				}).droppable({
					greedy: true,
					tolerance: "pointer",
					drop: $.treeDragDrop.handlers.handleDroppableDrop,
					over: $.treeDragDrop.handlers.handleDroppableOver,
					out: $.treeDragDrop.handlers.handleDroppableOut
					
				}).bind("click", $.treeDragDrop.handlers.handleClick).data("tddCtx", $el).has("ul").addClass($.treeDragDrop.defaults.expandedClass);
				
				$el.data('treeDragDrop', {inited: true});				
			}				
		});
	};
	
}(jQuery));

$('.treeDragDrop').treeDragDrop(); 

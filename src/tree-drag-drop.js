/*global window, $, jQuery*/

if (typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function () {
		"use strict";
		return this.replace(/^\s+|\s+$/g, '');
	};
}

(function ($, undef) {
	"use strict";

	$.treeDragDrop = {
		
		defaults: {			
			selectedClass: "tdd-selected",
			collapsedClass: "tdd-collapsed",
			expandedClass: "tdd-expanded",
			inFolderThreshhold: 100,
			cursorAt: {top: -30}, 
			dragContainer: $('<div class="tdd-dragContainer" />'),			
			marker: $('<div />'),
			attributes: ["id", "class"],
			getUrl: "/navigation/api/get",
			updateUrl: "/navigation/api/update"		
		}		
	};	
	
	
	// helpers
	
	function debug(txt) {
		if (window.console && window.console.log) {
			window.console.log(txt);
		}
	}
	
	
	function list2Array(node) {
		var output = [];
		node.children("li").each(function (index, value) {			
			var obj = {},
				attr = {}, 
				intestingAttr = $.treeDragDrop.defaults.attributes;
			
			obj.data = $(value).clone().children().remove().end().text().trim();
			$.each(intestingAttr, function (index, attribute) {
				if ($(value).attr(attribute) !== undef) {
					attr[attribute] = $(value).attr(attribute);
				}
			});			
			obj.attr = attr;								
			if ($(value).children("ul").length > 0) {
				obj.children = list2Array($(value).children("ul"));
			}			
			output.push(obj);
		});					
		return output;
		
	}
	
	// handlers	
		
	$.treeDragDrop.handlers = {
				
		handleDraggableStart: function (e, o) {
			debug("handleDraggableStart");	
			$(e.target).addClass($.treeDragDrop.defaults.selectedClass);
			
			document.onmousemove = function () {
				return false;
			};		
		},
		
		handleDraggableDrag: function (e, o) {
			debug("handleDraggableDrag");						
		},
		
		handleDraggableStop: function (e, o) {
			debug("handleDraggableStop");
			$(".ui-draggable-dragging").remove();
		},
		
		handleDroppableOut: function (e, o) {
			$(e.target).unbind("mousemove");
		},
		
		handleDroppableOver: function (e, o) {
			
			var	marker = $.treeDragDrop.defaults.marker;		
			
			if ($(e.target).is("li")) {
				
				// bind MouseMove to the item to check if the draggable should be appended or placed before or after the item 
				$(e.target).bind("mousemove", function (mme) {
					
					var target = $(mme.target),
						selectedClass = $.treeDragDrop.defaults.selectedClass,
						x = mme.pageX - mme.target.offsetLeft,
						y = mme.pageY - mme.target.offsetTop,
						threshhold = $.treeDragDrop.defaults.inFolderThreshhold;
					
					// threshhold for apending or placing before/ater
					// will grow according to the deepness of nesting
					
					if (target.find("ul").length !== 0) {
						threshhold = Math.min($.treeDragDrop.defaults.inFolderThreshhold * (target.find("ul").length + 1), target.width() * 0.75);
					}
					
					marker.removeClass("tdd-append", "tdd-before", "tdd-after");
										
					// prevent dropping items in itself
					if (target.hasClass(selectedClass) || target.parents("." + selectedClass).length !== 0) {
						marker.detach();
					} else {
						// append to item
						if (x > threshhold) {							
							// append to ul if there is one
							if (target.is("li") && target.children("ul").length !== 0) {
								target.children("ul").append(marker);
							} else if (target.is("li")) {
								target.append(marker);
							}
						// place before item	
						} else if (y < target.height() / 2) {
							marker.addClass("tdd-before");
							target.before(marker);
						// place after item
						} else {
							marker.addClass("tdd-after");
							target.after(marker);
						}
					}
										
					e.stopImmediatePropagation();
				});
			
			// if tree is empty items may be put in the ul 
			} else if ($(e.target).hasClass("tdd-tree") && $(".tdd-tree").children().length === 0) {
				debug("tree");
				marker.removeClass("tdd-append", "tdd-before", "tdd-after");
				marker.addClass("tdd-append");
				$(e.target).append(marker);
			} else if ($(e.target).hasClass("tdd-trashbin")) {
				debug("trashbin");
				marker.detach();
			}
			
			//e.stopImmediatePropagation();		
		},
		
		handleDroppableDrop: function (e, o) {
			debug("handleDroppableDrop");
			
			var	ajaxData,
				draggable = $(o.draggable),
				dropable = $(e.target),
				marker = $.treeDragDrop.defaults.marker,
				ctx = draggable.data("tddCtx"),
				tree = $(".tdd-tree", ctx);
				
			// remove selection	
			draggable.removeClass($.treeDragDrop.defaults.selectedClass);
			
			// if its the trashbin put them all next to each other (no nesting)
			if (dropable.parents(".tdd-trashbin").length !== 0 || dropable.hasClass("tdd-trashbin")) {
				$("li", draggable).each(function (index, value) {
					$(".tdd-trashbin").append(value);
				});
				$(".tdd-trashbin").append(draggable);	
			// put the item directly in the tree ul if it contains no other element	
			} else if (dropable.hasClass("tdd-tree") && $(".tdd-tree").children().length === 0) {
				$(".tdd-tree").append(draggable);
			// otherwise put it before the marker, which will be detached asap
			} else {				
				marker.before(draggable);				
				if (draggable.parent().is("li")) {					
					draggable.wrap("<ul></ul>");				
				}
			}			
			marker.detach();
			//clean up empty uls if its not the tree or trashbin
			$("ul", ctx).each(function () {
				if ($(this).children("li").length === 0 && !$(this).hasClass("tdd-trashbin") && !$(this).hasClass("tdd-tree")) {
					$(this).remove();
				}
			});	
			// adjust expand/collapse icons 
			$("li", ctx).has("ul").not("li." + $.treeDragDrop.defaults.collapsedClass).addClass($.treeDragDrop.defaults.expandedClass);
			$("li", ctx).not("li:has(ul)").removeClass($.treeDragDrop.defaults.expandedClass).removeClass($.treeDragDrop.defaults.collapsedClass);
						
			// remove the mousemove Listener			
			$("li, .tdd-tree", ctx).unbind("mousemove");
			
			// build the array and post the ajax
			if ($.treeDragDrop.defaults.updateUrl !== null) {
				ajaxData = {list: list2Array(tree)};
				debug(ajaxData);
				$.post($.treeDragDrop.defaults.updateUrl, ajaxData, function (res) {
					//console.log (res.data.msg);
					//TODO: error handling
					return true;
				});
			}					
		},
		
		
		// toggle expand/collapse
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
			//e.stopImmediatePropagation();
		}
	};
	
	
	// the Prototype
		
	$.fn.treeDragDrop = function (options) {
		
		//extend the global default with the options for the element
		options = $.extend({}, $.treeDragDrop.defaults, options);

		return this.each(function () {
			var $el = $(this),
				data = $el.data('treeDragDrop');
			
			// init the element
			if (!data) {	
				$("li", $el).draggable({ 
					addClasses: false,
					cursorAt:  $.treeDragDrop.defaults.cursorAt,
					helper: "clone",
					appendTo: "body",
					opacity: 0.2,
					delay: 10,
					//create: $.treeDragDrop.handlers.handleDraggableCreate,
					start: $.treeDragDrop.handlers.handleDraggableStart,
					//drag: $.treeDragDrop.handlers.handleDraggableDrag,
					stop: $.treeDragDrop.handlers.handleDraggableStop
				}).droppable({
					addClasses: false,
					greedy: true,
					tolerance: "pointer",
					drop: $.treeDragDrop.handlers.handleDroppableDrop,
					over: $.treeDragDrop.handlers.handleDroppableOver,
					out: $.treeDragDrop.handlers.handleDroppableOut
					
				}).bind(
					"click", 
					$.treeDragDrop.handlers.handleClick
				).bind("onselectstart", function () { 
					return false;
				}).attr("unselectable", "on").data("tddCtx", $el).has("ul").addClass($.treeDragDrop.defaults.expandedClass);
				
				$(".tdd-tree, .tdd-trashbin", $el).droppable({
					addClasses: false,				
					tolerance: "pointer",
					drop: $.treeDragDrop.handlers.handleDroppableDrop,
					over: $.treeDragDrop.handlers.handleDroppableOver,
					out: $.treeDragDrop.handlers.handleDroppableOut				
				}).bind("onselectstart", function () {return false; }).attr("unselectable", "on");
								
				$el.data('treeDragDrop', {inited: true});				
			}				
		});
	};
	
}(jQuery));

$('.treeDragDrop').treeDragDrop(); 

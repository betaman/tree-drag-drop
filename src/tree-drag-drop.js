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
	
	function list2Array(node){
		
		var output = [];
				
		node.children("li").each(function(index, value){			
			var obj = {},
				attr = {}, 
				intestingAttr = $.treeDragDrop.defaults.attributes ;
			
			obj.data = $(value).clone().children().remove().end().text().trim();
			$.each(intestingAttr, function(index, attribute) {
				if($(value).attr(attribute) !== undef){
					 attr[attribute] = $(value).attr(attribute);
				}
			});
			
			obj.attr = attr;
								
			if($(value).children("ul").length > 0){
				obj.children = list2Array($(value).children("ul"))
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
			
			var	marker = $.treeDragDrop.defaults.marker;		
			
			if($(e.target).is("li")){
				
				$(e.target).bind("mousemove", function (mme) {
					
					var target = $(mme.target),
						selectedClass = $.treeDragDrop.defaults.selectedClass,
						x = mme.pageX - mme.target.offsetLeft,
						y = mme.pageY - mme.target.offsetTop,
						threshhold = $.treeDragDrop.defaults.inFolderThreshhold;
					
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
					
					e.stopImmediatePropagation();
				});
			
			} else if ($(e.target).hasClass("tdd-tree") && $(".tdd-tree").children().length === 0){
					
				debug ("tree");
				marker.removeClass("tdd-append", "tdd-before", "tdd-after");
				marker.addClass("tdd-append");
				$(e.target).append(marker);
				
			}
			
			
		},
		
		handleDroppableDrop: function (e, o) {
			debug("handleDroppableDrop");
			
			var	ajaxData,
				draggable = $(o.draggable),
				dropable = $(e.target),
				marker = $.treeDragDrop.defaults.marker,
				ctx = draggable.data("tddCtx"),
				tree = $(".tdd-tree", ctx);
			
			debug("handleDroppableDrop: dropable: " + dropable);
				
			draggable.removeClass($.treeDragDrop.defaults.selectedClass);
			
			if (dropable.parents(".tdd-trashbin").length !== 0 || dropable.hasClass("tdd-trashbin")) {
				$("li", draggable).each(function(index, value){
					$(".tdd-trashbin").append(value)
				})
				$(".tdd-trashbin").append(draggable)	
			} else if(dropable.hasClass("tdd-tree") && $(".tdd-tree").children().length === 0) {
				$(".tdd-tree").append(draggable)
			}else{				
				marker.before(draggable);				
				if (draggable.parent().is("li")) {					
					draggable.wrap("<ul></ul>");				
				}
			}
			
			marker.detach();
			$("ul", ctx).each(function () {
				if ($(this).children("li").length === 0 && !$(this).hasClass("tdd-trashbin") && !$(this).hasClass("tdd-tree")) {
					$(this).remove();
				}
			});	
			$("li", ctx).has("ul").not("li." + $.treeDragDrop.defaults.collapsedClass).addClass($.treeDragDrop.defaults.expandedClass);
			$("li", ctx).not("li:has(ul)").removeClass($.treeDragDrop.defaults.expandedClass).removeClass($.treeDragDrop.defaults.collapsedClass);
						
			$("li, .tdd-tree", ctx).unbind("mousemove");
			
			
			if( $.treeDragDrop.defaults.updateUrl !== null ){
				ajaxData = {list: list2Array(tree)}
				debug(ajaxData)
				$.post($.treeDragDrop.defaults.updateUrl, ajaxData, function (res) {
					//console.log (res.data.msg);
					//TODO: error handling
					return true;
				});
			}					
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
					addClasses: false,
					greedy: true,
					tolerance: "pointer",
					drop: $.treeDragDrop.handlers.handleDroppableDrop,
					over: $.treeDragDrop.handlers.handleDroppableOver,
					out: $.treeDragDrop.handlers.handleDroppableOut
					
				}).bind("click", $.treeDragDrop.handlers.handleClick).data("tddCtx", $el).has("ul").addClass($.treeDragDrop.defaults.expandedClass);
				
				$(".tdd-tree, .tdd-trashbin", $el).droppable({
					addClasses: false,				
					tolerance: "pointer",
					drop: $.treeDragDrop.handlers.handleDroppableDrop				
				}).bind("onselectstart", function(){return false}).attr("unselectable", "on");
				
				$(".tdd-tree", $el).droppable({
					over: $.treeDragDrop.handlers.handleDroppableOver,
					out: $.treeDragDrop.handlers.handleDroppableOut
				});
				
				$el.data('treeDragDrop', {inited: true});				
			}				
		});
	};
	
}(jQuery));

$('.treeDragDrop').treeDragDrop(); 

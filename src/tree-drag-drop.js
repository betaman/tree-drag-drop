/*global window, $, jQuery*/

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
	
	function getClosestItem(ctx, y){
		var dy, 
			closest = null, 
			cursorAt = $.treeDragDrop.defaults.cursorAt;
		
		$("li", ctx).each(function(){
			var testDy = (y + cursorAt.top) - ($(this).offset().top + $(this).height()/2);
			if( isNaN(dy) || Math.abs(testDy) < dy) { 
				dy = testDy;
				closest = $(this);
			}
		})
		
		debug("closest id: " + closest.attr("id") + " " + dy)
		return closest;
	}
	
	function setMarker(el, ctx, pos){
		
		var marker = $.treeDragDrop.defaults.marker,
			threshhold = $.treeDragDrop.defaults.inFolderThreshhold,
			selectedClass =  $.treeDragDrop.defaults.selectedClass,
			ulChildren = $("ul", el).length;
		
		marker.removeClass("tdd-append", "tdd-before", "tdd-after");
		
		if (el === null) {
			if (ctx.hasClass("tdd-tree")) {
				marker.addClass("tdd-append");
				ctx.append(marker);
			} else {
				marker.detach();
			}
			
		} else {
					
			if (ulChildren !== 0) {
				threshhold = Math.min(threshhold * (ulChildren + 1), el.width() * 0.75);
			}
			
			if (el.hasClass(selectedClass) || el.parents("." + selectedClass).length !== 0) {
				marker.detach();
			} else {
			
				if (pos.x - el.offset().left > threshhold) {
					if (el.children("ul").length === 0) {
						el.append(marker);
					}else{
						el.children("ul").append(marker);
					}
				
				} else if (pos.y < el.height() / 2) {
					marker.addClass("tdd-before");
					el.before(marker);
				} else {
					marker.addClass("tdd-after");
					el.after(marker);
				}
			}
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
			
			var	marker = $.treeDragDrop.defaults.marker,
				draggable = $(e.target),
				ctx = draggable.data("tddCtx"),
				listItem,	
				tree = $(".tdd-tree", ctx),
				listItem = getClosestItem(tree, e.pageY);
					
			if (listItem) {
				setMarker(listItem, tree, {x: e.pageX, y: e.pageY});
			}	
			
			e.stopImmediatePropagation();					
		},
		
		handleDraggableStop: function (e, o) {
			debug("handleDraggableStop");
			
		},
		
		handleDroppableOut: function (e, o) {
			debug("handleDroppableOut");
			//$(e.target).unbind("mousemove");
		},
		
		handleDroppableOver: function (e, o) {
			debug("handleDroppableOver");
			var ctx = o.draggable.data("tddCtx");
			
			 if ( $(e.target).hasClass("tdd-trashbin") ) {
				$(".tdd-trashbin", ctx).addClass("highlight")
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
									
			draggable.removeClass($.treeDragDrop.defaults.selectedClass);
			
			if (dropable.hasClass("tdd-trashbin")) {
				$("li", draggable).each(function(index, value){
					$(".tdd-trashbin").append(value)
				})
				$(".tdd-trashbin").append(draggable)	
			} else{				
				marker.before(draggable);				
				if (draggable.parent().is("li")) {					
					draggable.wrap("<ul></ul>");				
				}
			}
						
			marker.detach();
			
			$(".tdd-trashbin ul, .tdd-tree ul", ctx).each(function () {
				if ($(this).children("li").length === 0) {
					$(this).remove();
				}
			});	
			
			$("li", ctx).has("ul").not("li." + $.treeDragDrop.defaults.collapsedClass).addClass($.treeDragDrop.defaults.expandedClass);
			$("li", ctx).not("li:has(ul)").removeClass($.treeDragDrop.defaults.expandedClass).removeClass($.treeDragDrop.defaults.collapsedClass);
						
			$(".tdd-trashbin, .tdd-tree", ctx).unbind("mousemove");
			
			
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
					drag: $.treeDragDrop.handlers.handleDraggableDrag,
					stop: $.treeDragDrop.handlers.handleDraggableStop
				}).bind("click", $.treeDragDrop.handlers.handleClick).data("tddCtx", $el).has("ul").addClass($.treeDragDrop.defaults.expandedClass);
				
				$(".tdd-tree, .tdd-trashbin", $el).droppable({
					addClasses: false,				
					tolerance: "pointer",
					drop: $.treeDragDrop.handlers.handleDroppableDrop,
					over: $.treeDragDrop.handlers.handleDroppableOver,
					out: $.treeDragDrop.handlers.handleDroppableOut			
				}).bind("onselectstart", function(){return false}).attr("unselectable", "on");
				
				$el.data('treeDragDrop', {inited: true});				
			}				
		});
	};
	
}(jQuery));

$('.treeDragDrop').treeDragDrop(); 

tree-drag-drop
==============

A drag and drop tree control depending on jQuery

Usage
-----

$('.selector').treeDragDrop(options); 


For Example:
$('.treeDragDrop').treeDragDrop({
	collapsedClass: "icon-folder-close", 
	expandedClass: "icon-folder-open", 
	updateUrl: "/navigation/api/update"
}); 


Options
-------


* selectedClass

defaults: "tdd-selected"


* collapsedClass

defaults: "tdd-collapsed"


* expandedClass

defaults: "tdd-expanded"


* appendClass

defaults: "tdd-append" 


* beforeClass

defaults: "tdd-before"


* afterClass

defaults: "tdd-after"


* inFolderThreshhold

defaults: 100


* cursorAt

defaults: {left: 10, top: -40}


* dragContainer

defaults: $('<div class="tdd-dragContainer" />'),			


* marker

defaults: $('<div />'),


* attributes

defaults: ["id", "class"]


* getUrl

defaults: null

Pass a url, to retrieve a JSON. A tree will be constructed from that JSON. Is not implemented yet 


* updateUrl

defaults: null		
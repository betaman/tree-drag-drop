tree-drag-drop
==============

A drag and drop tree control depending on jQuery

Usage
-----

    $('.selector').treeDragDrop(options); 


For example:

    $('.treeDragDrop').treeDragDrop({
	collapsedClass: "icon-folder-close", 
	expandedClass: "icon-folder-open", 
	updateUrl: "/navigation/api/update"
    }); 


Options
-------


**selectedClass** (defaults: `"tdd-selected"`)

the css classname of the draggable while it is dragged around

* * *

**collapsedClass** (defaults: `"tdd-collapsed"`)

the css classname of the listitem while it contains other items and is not expanded

* * *

**expandedClass** (defaults: `"tdd-expanded"`)

the css classname of the listitem while it contains other items and is expanded

* * *

**appendClass** (defaults: `"tdd-append"`)

the css classname of the marker while it is indicating that the draggable should be dropped into an other listitem

*Is not completly  implemented yet*

* * *

**beforeClass** (defaults: `"tdd-before"`)

the css classname of the marker while it is indicating that the draggable should be dropped before an other listitem

* * *

**afterClass** (defaults: `"tdd-after"`)

the css classname of the marker while it is indicating that the draggable should be dropped after an other listitem

* * *

**inFolderThreshhold** (defaults: `100`)

The extra indent for the marker to indicate weather the draggable is dropped into an listitem or next to it

*Is not completly implemented yet*

* * *

**cursorAt** (defaults: `{left: 10, top: -40}`)

The positioning relative to the mouse of the draggable representaion see: http://api.jqueryui.com/draggable/#option-cursorAt

* * *

**dragContainer** (defaults: `$('<div class="tdd-dragContainer" />')`)

The container in which the draggable representaion will be palced, while beeing dragged about

* * *

**marker** (defaults: `$('<div />')`)

The marker which indicates where the draggable will be dropped

* * *

**attributes** (defaults: `["id", "class"]`)

the attributes of you listitems `<li>` which will be passed to the JSON for updating purposes.

* * *

**getUrl** (defaults: `null`)

Url, to retrieve a JSON. A tree will be constructed from that JSON. 

*Is not implemented yet.*

* * *

**updateUrl** (defaults: `null`)

Url to pass a JSON to, in order update the data from your tree in the Backend

* * *
tree-drag-drop
==============

A drag and drop tree control depending on jQuery and jQuery ui

See an example:
http://treedragdrop.die-symbionten.de/docs/example_1.html

Folder Icons are made with Font Awesome. 
http://fortawesome.github.com/Font-Awesome/


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

**afterClass** (defaults: `"tdd-after"`)

The css classname of the marker while it is indicating that the draggable should be dropped after an other listitem

* * *

**attributes** (defaults: `["id", "class"]`)

The attributes of you listitems `<li>` which will be passed to the JSON for updating purposes.

* * *

**beforeClass** (defaults: `"tdd-before"`)

The css classname of the marker while it is indicating that the draggable should be dropped before an other listitem

* * *

**collapsedClass** (defaults: `"tdd-collapsed"`)

The css classname of the listitem while it contains other items and is not expanded

* * *

**cursorAt** (defaults: `{left: 10, top: -40}`)

The positioning relative to the mouse of the draggable representaion see: http://api.jqueryui.com/draggable/#option-cursorAt

* * *

**dragContainer** (defaults: `$('<div class="tdd-dragContainer" />')`)

The container in which the draggable representaion will be palced, while beeing dragged about

* * *

**expandedClass** (defaults: `"tdd-expanded"`)

The css classname of the listitem while it contains other items and is expanded

* * *

**getUrl** (defaults: `null`)

Url, to retrieve a JSON. A tree will be constructed from that JSON. 

*Is not implemented yet.*

* * *

**inFolderThreshhold** (defaults: `100`)

The extra indent for the marker to indicate weather the draggable is dropped into an listitem or next to it

* * *

**marker** (defaults: `$('<div />')`)

The marker which indicates where the draggable will be dropped

* * *

**selectedClass** (defaults: `"tdd-selected"`)

The css classname of the draggable while it is dragged around

* * *

**updateUrl** (defaults: `null`)

Url to pass a JSON to, in order update the data from your tree in the Backend

* * *
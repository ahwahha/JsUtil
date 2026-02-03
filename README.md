# JsUtil Library

> **Note:** This README was generated with assistance from generative AI and content is subject to be changed for improving accuracy.

A lightweight, vanilla JavaScript utility library providing DOM manipulation helpers and a powerful data table component with advanced filtering, sorting, and editing capabilities.

## Installation

Include the bundled library in your HTML:

```html
<script src="/static/util_bundle.js" type="text/javascript"></script>
```

For cache-busting, append a version parameter:

```html
<script src="/static/util_bundle.js?v=1.0.0" type="text/javascript"></script>
```

## Core Modules

### Util - DOM Manipulation & Utilities

The `Util` class provides a jQuery-like API for DOM manipulation and common utility functions.

#### Creating and Selecting Elements

**`Util.create(type, attributes)`**

Creates a new HTML element wrapped in a Util instance.

- `type` (string): HTML tag name (e.g., 'div', 'span', 'input')
- `attributes` (object, optional): Object containing attribute key-value pairs

```javascript
let div = Util.create('div', {
    id: 'myDiv',
    class: 'container',
    style: 'padding: 10px;'
});
```

**`Util.get(selector)`**

Selects elements from the DOM.

- `selector` (string): CSS selector string

Returns:
- Single Util instance if selector starts with '#' (ID selector)
- Array of Util instances for other selectors

```javascript
let element = Util.get('#myId');           // Returns single Util instance
let elements = Util.get('.myClass');        // Returns array of Util instances
```

#### DOM Manipulation Methods

**`.appendContent(content)`**

Appends content to the element.

- `content` (string|number|HTMLElement|Util): Content to append

Returns: `this` (for chaining)

**`.clear()`**

Removes all child content from the element.

Returns: `this`

**`.content(content)`**

Gets or sets the entire content of the element.

- `content` (string|HTMLElement|Util, optional): If provided, replaces all content

Returns: If getting, returns the HTMLElement; if setting, returns `this`

**`.remove()`**

Removes the element from the DOM.

Returns: `this`

**`.appendContentIf(content, condition)`**

Conditionally appends content.

- `content` (string|number|HTMLElement|Util): Content to append
- `condition` (boolean, optional): If true (default), content is appended

Returns: `this`

**`.appendContentOf(list, funcValue, funcCondition)`**

Appends content for each item in a list based on conditions.

- `list` (array): Array of items to process
- `funcValue` (function, optional): Function that returns content for each item. Default: `(item) => item`
- `funcCondition` (function, optional): Function that returns boolean for each item. Default: `(item) => true`

Returns: `this`

**`.show()`**

Makes the element visible by setting display to 'unset'.

Returns: `this`

**`.hide()`**

Hides the element by setting display to 'none'.

Returns: `this`

**`.attr(name, assignment)`**

Gets or sets an attribute.

- `name` (string): Attribute name
- `assignment` (string, optional): If provided, sets the attribute. Use 'unset' to remove the attribute.

Returns: If getting, returns attribute value; if setting, returns `this`

**`.css(name, assignment)`**

Gets or sets a CSS style property.

- `name` (string|null): Style property name. If null, returns entire style string.
- `assignment` (string, optional): If provided, sets the style. Use 'unset' to remove the property.

Returns: If getting, returns style value; if setting, returns `this`

**`.class(className)`**

Replaces the element's class attribute.

- `className` (string): New class name(s)

Returns: `this`

**`.addClass(className)`**

Adds a class to the element.

- `className` (string): Class name to add

Returns: `this`

**`.removeClass(className)`**

Removes a class from the element.

- `className` (string): Class name to remove

Returns: `this`

**`.containClass(className)`**

Checks if element has a specific class.

- `className` (string): Class name to check

Returns: boolean

**`.prop(name, assignment)`**

Gets or sets a custom property on the Util instance.

- `name` (string): Property name
- `assignment` (any, optional): If provided, sets the property. Use 'unset' to remove.

Returns: If getting, returns property value; if setting, returns `this`

**`.val(value)`**

Gets or sets the value of an input element.

- `value` (string, optional): If provided, sets the value

Returns: If getting, returns current value; if setting, returns `this`

**`.parent()`**

Gets the parent element.

Returns: New Util instance wrapping the parent element

**`.entity(entity)`**

Gets or sets the underlying HTMLElement.

- `entity` (HTMLElement, optional): If provided, replaces the wrapped element

Returns: If getting, returns HTMLElement; if setting, returns `this`

```javascript
element.appendContent('Hello World');
element.clear();
element.show();
element.hide();
element.attr('data-id', '123');
let dataId = element.attr('data-id');
element.css('color', 'red');
let color = element.css('color');
```

#### Event Handling

**`.addEventHandler(events, func, options)`**

Adds one or more event listeners.

- `events` (string|array): Event name(s) (e.g., 'click', ['mouseenter', 'mouseleave'])
- `func` (function): Event handler function
- `options` (object, optional): Event listener options (passive, capture, once, etc.)

Returns: `this`

**`.addEventHandlerIf(events, func, options, bool)`**

Conditionally adds event listeners.

- `events` (string|array): Event name(s)
- `func` (function): Event handler function
- `options` (object, optional): Event listener options
- `bool` (boolean): If true, adds the event handlers

Returns: `this`

**`.removeAllEventHandlers()`**

Removes all event listeners added through this Util instance.

Returns: `this`

**`.preventDefault(eventType)`**

Adds an event listener that prevents default behavior.

- `eventType` (string): Event type (e.g., 'submit', 'click')

Returns: `this`

**`.fireEvent(event)`**

Dispatches an event on the element.

- `event` (string): Event name

Returns: `this`

**`.debounce(func, delay)`**

Debounces a function call.

- `func` (function): Function to execute after delay
- `delay` (number): Delay in milliseconds

Returns: `this`

**`.countClicks(handlers, delay)`**

Detects single, double, triple clicks, etc.

- `handlers` (array): Array of functions for each click count [singleClick, doubleClick, tripleClick, ...]
- `delay` (number): Detection window in milliseconds

Returns: `this`

**`.holdClick(handler, holdTime)`**

Detects long-press/hold click.

- `handler` (function): Function to execute when hold completes
- `holdTime` (number): Duration to hold in milliseconds

Returns: `this`

**`.repeat(func, interval)`**

Executes a function repeatedly at intervals.

- `func` (function): Function to execute
- `interval` (number): Interval in milliseconds

Returns: `this`

**`.idleControl(events, onactive, onidle, interval)`**

Detects idle/active states.

- `events` (array): Events that indicate activity (e.g., ['mousemove', 'keydown'])
- `onactive` (function): Called when transitioning from idle to active
- `onidle` (function): Called when user becomes idle
- `interval` (number): Idle timeout in milliseconds

Returns: `this`

```javascript
element.addEventHandler('click', (e) => console.log('clicked'));
element.addEventHandler(['mouseenter', 'mouseleave'], handler);
element.countClicks([
    () => console.log('single'),
    () => console.log('double'),
    () => console.log('triple')
], 250);
```

#### Advanced Utilities

**File Handling**

**`Util.createFileElement(name, fileElementProps)`**

Creates a file input element with remove button.

- `name` (string, optional): Input name attribute. Default: ''
- `fileElementProps` (object, optional): Style/attribute overrides for sub-elements:
  - `container` (object): Attributes for container div
  - `inputField` (object): Attributes for file input (e.g., `{accept: '.pdf'}`)
  - `removeButton` (object): Attributes for remove button

Returns: Util instance with properties `.container`, `.inputField`, `.removeButton`

**`Util.createFileGroup(name, initial, max, fileElementProps)`**

Creates a group of file inputs with add/remove controls.

- `name` (string, optional): Input name attribute. Default: ''
- `initial` (number): Initial number of file inputs
- `max` (number): Maximum number of file inputs allowed
- `fileElementProps` (object, optional): Props passed to each file element

Returns: Util instance with properties `.container`, `.files`, `.addButton`

```javascript
let fileElement = Util.createFileElement('document', {
    inputField: { accept: '.pdf,.doc' }
});

let fileGroup = Util.createFileGroup('attachments[]', 2, 5);
```

**Movable/Draggable Elements**

**`Util.createMovableDiv(content)`**

Creates a draggable floating div with close button.

- `content` (string|HTMLElement|Util, optional): Initial content

Returns: Util instance of the movable div

**`.appendMovableDiv(content)`**

Appends a movable div to this element (sets position: relative).

- `content` (string|HTMLElement|Util, optional): Content for the movable div

Returns: `this`

**`.drag(target)`**

Makes this element a drag handle for a target element.

- `target` (Util|HTMLElement): Element to move when dragging this handle

Returns: `this`

```javascript
let movableDiv = Util.createMovableDiv('Drag me!');
document.body.appendChild(movableDiv.entity());

// Or attach to existing container
container.appendMovableDiv('Floating content');

// Custom drag handle
dragHandle.drag(targetElement);
```

**Split Pane Layout**

**`Util.createSplittedDiv(direction, firstSpan, adjustable, drag)`**

Creates a split-pane container with adjustable divider.

- `direction` (number): Split direction
  - `0` = up (vertical split, first pane above)
  - `1` = right (horizontal split, first pane left)
  - `2` = down (vertical split, first pane below)
  - `3` = left (horizontal split, first pane right)
- `firstSpan` (string, optional): Size of first pane (e.g., '50%', '200px'). Default: '50%'
- `adjustable` (boolean, optional): Whether divider is adjustable. Default: false
- `drag` (boolean, optional): If true, drag to resize; if false, click to collapse. Default: false

Returns: Util instance with properties `.a` (first pane), `.b` (second pane), `.divider`

```javascript
let split = Util.createSplittedDiv(1, '300px', true, true);
split.a.appendContent('Sidebar');
split.b.appendContent('Main content');
container.appendContent(split);
```

**Menu Creation**

**`Util.createMenu(trees, prop_label, prop_handler, prop_children, mode)`**

Creates a hierarchical menu from tree data.

- `trees` (array): Array of menu node objects
- `prop_label` (string, optional): Property name for label text. Default: 'label'
- `prop_handler` (string, optional): Property name for click handlers. Default: 'handlers'
- `prop_children` (string, optional): Property name for child nodes. Default: 'children'
- `mode` (number, optional): Reserved for future use. Default: 0

Each node object structure:
- `[prop_label]` (string): Display text
- `[prop_handler]` (function|array): Single function or array of functions for multi-click detection
- `[prop_children]` (array, optional): Child menu items

Returns: Util instance containing the menu

```javascript
let menuData = [
    {
        label: 'File',
        handlers: [
            () => console.log('File clicked'),
            () => console.log('File double-clicked')
        ],
        children: [
            { label: 'Open', handlers: openFile },
            { label: 'Save', handlers: saveFile }
        ]
    },
    {
        label: 'Edit',
        handlers: editHandler
    }
];

let menu = Util.createMenu(menuData);
container.appendContent(menu);
```

**Keyboard Shortcuts**

**`.commands(bufferSize, handlers)`**

Detects typed command sequences ending with Enter.

- `bufferSize` (number): Maximum characters to track
- `handlers` (array|object): Array of handler objects with structure:
  - `command` (string): Text sequence to detect
  - `function` (function): Function to call when command detected

Returns: `this`

**`.holdKeys(combinations, flushDelay)`**

Detects key combinations (keyboard shortcuts).

- `combinations` (array): Array of combination objects with structure:
  - `keySet` (array): Array of key names (e.g., `['Control', 's']`)
  - `handler` (function): Function to call when combination pressed
- `flushDelay` (number, optional): Milliseconds before key buffer clears. Default: 1000

Returns: `this`

```javascript
// Type "help" then press Enter
document.body.commands(20, [
    { command: 'help', function: showHelp },
    { command: 'save', function: quickSave }
]);

// Ctrl+S to save, Ctrl+Shift+S to save as
Util.get('body')[0].holdKeys([
    { keySet: ['Control', 's'], handler: save },
    { keySet: ['Control', 'Shift', 'S'], handler: saveAs },
    { keySet: ['Alt', 'F4'], handler: closeApp }
]);
```

#### Utility Functions

**Style Conversion**

**`Util.objToStyle(obj)`**

Converts a style object to CSS string.

- `obj` (object): Object with style properties and values

Returns: string (CSS style string)

**`Util.styleToObj(style)`**

Converts CSS string to style object.

- `style` (string): CSS style string (e.g., 'color:red; font-size:14px;')

Returns: object

```javascript
let styleString = Util.objToStyle({
    'color': 'red',
    'font-size': '14px'
});
// Returns: 'color:red; font-size:14px;'

let styleObj = Util.styleToObj('color:red; font-size:14px;');
// Returns: { color: 'red', 'font-size': '14px' }
```

**Deep Cloning**

**`Util.clone(input)`**

Creates a deep clone of objects, arrays, or Util instances.

- `input` (any): Value to clone. Handles Util instances, arrays, objects, primitives.

Returns: Cloned copy (Util instances preserve event listeners)

```javascript
let clone = Util.clone(originalObject);
let clonedUtil = Util.clone(utilInstance);  // Event listeners preserved
```

**CSV Operations**

**`Util.parseCsv(csv, delimiter)`**

Parses CSV string into array of objects.

- `csv` (string): CSV string with header row
- `delimiter` (string, optional): Column delimiter. Default: ','

Returns: array of objects (keys from header row)

**`Util.objectArrayToCsv(data, delimiter, linebreak)`**

Converts array of objects to CSV string.

- `data` (array): Array of objects (all objects should have same keys)
- `delimiter` (string, optional): Column delimiter. Default: ','
- `linebreak` (string, optional): Line break character(s). Default: '\n'

Returns: string (CSV formatted)

**`Util.downloadAsCsv(data, fileName, delimiter)`**

Downloads data as CSV file.

- `data` (array): Array of objects
- `fileName` (string, optional): Download filename. Default: 'data.csv'
- `delimiter` (string, optional): Column delimiter. Default: ','

Returns: void

```javascript
let data = Util.parseCsv(csvString, ',');
let csv = Util.objectArrayToCsv(dataArray, ',', '\n');
Util.downloadAsCsv(dataArray, 'export.csv', ',');
```

**File Downloads**

**`Util.downloadBlob(blob, filename)`**

Downloads a Blob as a file.

- `blob` (Blob): Blob object to download
- `filename` (string, optional): Download filename. Default: 'filename'

Returns: void

**`Util.openBlob(blob)`**

Opens a Blob in a new browser tab.

- `blob` (Blob): Blob object to open

Returns: void

```javascript
Util.downloadBlob(pdfBlob, 'document.pdf');
Util.openBlob(imageBlob);
```

**String Utilities**

**`Util.getHierarchicalTree(arr, prop_id, prop_parent_id)`**

Converts flat array with parent references into hierarchical tree structure.

- `arr` (array): Flat array of objects
- `prop_id` (string): Property name containing unique ID
- `prop_parent_id` (string): Property name containing parent ID reference

Returns: array of root nodes (each node has `children` array property, parent reference removed)

```javascript
let flat = [
    { id: 1, parent_id: null, name: 'Root' },
    { id: 2, parent_id: 1, name: 'Child 1' },
    { id: 3, parent_id: 1, name: 'Child 2' },
    { id: 4, parent_id: 2, name: 'Grandchild' }
];

let tree = Util.getHierarchicalTree(flat, 'id', 'parent_id');
// Returns: [{ id: 1, name: 'Root', children: [...] }]
```

**`Util.splitString(str, delimiters)`**

Splits string by delimiters, respecting quoted sections.

- `str` (string): String to split
- `delimiters` (array, optional): Array of delimiter characters. Default: [' ']

Returns: array of strings (quotes removed, quoted sections kept intact)

```javascript
let parts = Util.splitString('hello "world test" foo', [' ']);
// Returns: ['hello', 'world test', 'foo']

let parts = Util.splitString('a,b, "c,d", e', [',']);
// Returns: ['a', 'b', 'c,d', 'e']
```

**`Util.getStrParts(str, delimiter, lv)`**

Multi-level string splitting (creates nested arrays).

- `str` (string): String to split
- `delimiter` (string, optional): Delimiter character. Default: '`'
- `lv` (number, optional): Nesting level. Default: 1

Returns: Nested arrays based on delimiter repetition

```javascript
let parts = Util.getStrParts('a`b``c`d', '`', 2);
// Level 2: split by ``  ->  ['a`b', 'c`d']
// Level 1: split by `   ->  [['a', 'b'], ['c', 'd']]
```

**Text Matching**

**`Util.matchText(text, matchingText, delimiter, caseSensitive, emptyRepresentation)`**

Advanced text matching with logical operators and regex support.

- `text` (string): Text to test
- `matchingText` (string): Filter expression (see syntax below)
- `delimiter` (string, optional): NOT operator delimiter. Default: '`'
- `caseSensitive` (boolean, optional): Case-sensitive matching. Default: false
- `emptyRepresentation` (string, optional): Token representing empty/null values. Default: '___'

Returns: boolean

Matching syntax:
- `apple` - contains "apple"
- `"apple pie"` - exact phrase
- `apple pear` - contains "apple" AND "pear" (space = AND)
- ``apple ` tart`` - contains "apple" but NOT "tart" (backtick = NOT)
- ``apple `` banana`` - contains "apple" OR "banana" (double backtick = OR)
- `regex:^test.*` - regex pattern

```javascript
Util.matchText('apple pie', 'apple', '`', false, 'mt');  // true
Util.matchText('apple pie', 'apple`tart', '`');          // true (apple, no tart)
Util.matchText('apple tart', 'apple`tart', '`');         // false (has tart)
Util.matchText('', 'mt', '`', false, 'mt');              // true (empty match)
```

**`Util.match(text, matchingText, delimiter, criteria)`**

Generic matching using custom criteria function.

- `text` (string): Text to test
- `matchingText` (string): Filter expression
- `delimiter` (string): NOT operator delimiter
- `criteria` (function): Custom comparison function `(text, filterValue) => boolean`

Returns: boolean

**`Util.checkCriteria(str, matchingString, delimiter, criteria)`**

Internal helper for complex filter logic (supports AND/OR/NOT operators).

- `str` (string): Text to test
- `matchingString` (string): Filter expression
- `delimiter` (string): Delimiter character
- `criteria` (function): Comparison function

Returns: boolean

**DOM Ready**

**`Util.loaded(func)`**

Executes function when DOM is fully loaded.

- `func` (function): Function to execute

Returns: void

```javascript
Util.loaded(() => {
    console.log('DOM ready');
    // Initialize your app
});
```

**Async Utilities**

**`Util.deferExec(delay)`**

Returns a promise that resolves after a delay.

- `delay` (number, optional): Delay in milliseconds. Default: 100

Returns: Promise

```javascript
await Util.deferExec(500);  // Wait 500ms
console.log('Executed after delay');
```

**Select Element Creation**

**`Util.createSelect(items)`**

Creates a `<select>` element with options.

- `items` (array): Array of option objects with properties:
  - `value` (string): Option value attribute
  - `content` (string): Display text
  - Any other properties become attributes

Returns: Util instance wrapping the select element

```javascript
let select = Util.createSelect([
    { value: '1', content: 'Option 1', selected: 'selected' },
    { value: '2', content: 'Option 2' }
]);
```

---

### JsonTable - Advanced Data Table Component

A feature-rich data table with filtering, sorting, pagination, inline editing, and selection capabilities.

#### Basic Usage

```javascript
import { JsonTable } from './util_bundle.js';

// Create table instance
let table = JsonTable(
    containerElement,  // Util instance or HTMLElement
    keyHandler         // Optional: KeyHandler instance for keyboard shortcuts
);

// Configure table
table.setTableSettings({
    label: "User Data",
    columns: [
        {
            header: "ID",
            data: "id",
            sortable: true
        },
        {
            header: "Name",
            data: "name",
            filter: "",
            filterPlaceholder: "Search name..."
        },
        {
            header: "Email",
            data: "email"
        }
    ]
});

// Set data
table.setData([
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" }
]);

// Render table
table.refreshTable();
```

#### Constructor Parameters

**`JsonTable(c, kh)`**

- `c` (Util|HTMLElement, optional): Container element for the table. Default: null
- `kh` (object, optional): KeyHandler instance with `.keys` array property for advanced keyboard shortcuts. Default: null

Returns: Object with API methods

#### Column Configuration

Each column in the `columns` array accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `header` | string | `"Header"` | Column header text |
| `data` | string | `""` | Object property key to display |
| `filter` | string | `""` | Initial filter value |
| `filterPlaceholder` | string | `"---"` | Placeholder text for filter input |
| `filterEditable` | boolean | `true` | Whether filter input is editable |
| `sortable` | boolean | `true` | Whether column is sortable |
| `class` | string | `""` | CSS class for column cells |
| `headerStyle` | object | `{}` | Inline styles for header cell |
| `filterStyle` | object | `{}` | Inline styles for filter input |
| `rowsStyle` | object | `{}` | Inline styles for data cells |
| `modifier` | function | `null` | Function to transform cell data: `(row) => return value` |

**Modifier Example:**

```javascript
{
    header: "Status",
    data: "active",
    modifier: (row) => {
        return row.active ? '✓ Active' : '✗ Inactive';
    }
}
```

#### Table Settings

Complete configuration options for `setTableSettings()`:

**Display Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `label` | string | `""` | Table title/label |
| `maxHeight` | string | `undefined` | Max height for scrollable body (e.g., `"500px"`) |
| `emptyRepresentation` | string | `"___"` | Text to represent empty/null values in filters |
| `filterDelimiter` | string | `` ` `` | Delimiter for filter NOT operator |

**Pagination Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `start` | number | `1` | Starting row number |
| `end` | number | `10` | Ending row number |
| `defaultStart` | number | `1` | Default start for reset |
| `defaultEnd` | number | `10` | Default end for reset |
| `maxRows` | number | `100` | Maximum rows per page |

**Sorting Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sortedBy` | string/array | `"###row-index"` | Column(s) to sort by |
| `ascending` | boolean | `true` | Sort direction |

**Selection Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showSelectingGroup` | boolean | `true` | Show selection controls |
| `multiSelect` | boolean | `true` | Allow multiple row selection |

**Button Labels:**

| Option | Type | Default |
|--------|------|---------|
| `selectAllFiltered` | string | `"(Un)Select all filtered"` |
| `selectAllInserted` | string | `"(Un)Select all inserted"` |
| `selectAllEdited` | string | `"(Un)Select all edited"` |
| `removeAllFiltered` | string | `"(Un)Remove all filtered"` |
| `resetFilters` | string | `"Reset filters"` |
| `resetData` | string | `"Reset data"` |
| `resetSelectedData` | string | `"Reset selected data"` |
| `noOfSelected` | string | `"No. of selected: "` |
| `noOfEdited` | string | `"No. of edited: "` |
| `toBegining` | string/Util | `"<<"` |
| `previousPage` | string/Util | `"<"` |
| `nextPage` | string/Util | `">"` |
| `toEnding` | string/Util | `">>"` |

**CSS Classes:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tableClass` | string | `""` | Base class for table |
| `buttonClass` | string | `""` | Class for buttons |
| `headersClass` | string | `""` | Class for header row |
| `filtersClass` | string | `""` | Class for filter row |
| `actionsGroupClass` | string | `"actionsGroup"` | Class for action buttons container |

**Style Objects:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `headersStyle` | object | See below | Header cell styles |
| `filtersStyle` | object | See below | Filter input styles |
| `rowsStyle` | object | See below | Data cell styles |
| `oddRowsStyle` | object | `{}` | Styles for odd rows |
| `evenRowsStyle` | object | See below | Styles for even rows |
| `editedStyle` | object | See below | Styles for edited cell indicators |
| `insertedStyle` | object | See below | Styles for inserted rows |
| `removedStyle` | object | See below | Styles for removed rows |
| `actionsGroupStyle` | object | `{}` | Styles for actions container |

**Default Styles:**

```javascript
headersStyle: {
    "position": "relative",
    "border-radius": "5px",
    "border": "hsl(0, 0%, 75%) solid 1px",
    "height": "calc(100% - 8px)",
    "display": "flex",
    "flex-flow": "column nowrap",
    "padding": "3px",
    "margin": "1px",
    "text-align": "center",
    "font-weight": "bold",
    "background-color": "hsl(180, 50%, 90%)",
    "white-space": "nowrap"
}

filtersStyle: {
    "width": "calc(100% - 2px)",
    "border-radius": "5px",
    "border": "hsl(0, 0%, 75%) solid 1px",
    "margin": "1px",
    "text-align": "center",
    "font-size": "11px",
    "overflow": "hidden",
    "cursor": "help"
}

rowsStyle: {
    "text-align": "center"
}

evenRowsStyle: {
    "background-color": "hsl(0, 0%, 95%)"
}

editedStyle: {
    "display": "revert",
    "color": "hsl(0, 100%, 30%)",
    "font-size": "11px",
    "height": "13px",
    "width": "100%",
    "resize": "none",
    "border": "none",
    "outline": "none",
    "background": "none"
}

insertedStyle: {
    "background-image": "linear-gradient(to bottom, ...green gradient...)"
}

removedStyle: {
    "text-decoration": "line-through",
    "text-decoration-color": "hsl(0, 80%, 50%)",
    "background-image": "linear-gradient(to bottom, ...red gradient...)"
}
```

**Timing Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filterDebounce` | number | `500` | Filter input debounce (ms) |
| `multiClickDebounce` | number | `250` | Multi-click detection delay (ms) |
| `shieldRefreshGap` | number | `100` | Delay before UI updates (ms) |
| `overlayZIndex` | number | `99` | Z-index for overlay elements |

**Event Handlers:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `controlGroupEventHandlers` | array | `[]` | Event handlers for control area: `[{event: 'click', function: handler}]` |
| `tableBodyEventHandlers` | array | `[]` | Event handlers for table body |
| `paginationGroupEventHandlers` | array | `[]` | Event handlers for pagination area |
| `onrefresh` | function | `null` | Callback after table refresh |

**Custom Filter Function:**

```javascript
filterFunction: function(data, filter) {
    // data: Cell value (any type)
    // filter: Filter input string
    // Return true to show row, false to hide
    return yourCustomLogic(data, filter);
}
```

#### API Methods

**Data Management:**

**`.setData(data)`**

Sets the initial table data.

- `data` (array): Array of objects (each object is a row)

Returns: `this`

**`.getData()`**

Gets current table data including all modifications.

Returns: array (all rows with internal properties)

**`.resetData()`**

Resets all data to original state (discards edits/inserts/removals).

Returns: `this`

**`.insertData(data)`**

Inserts new row(s) into the table.

- `data` (object|array): Single object or array of objects to insert

Returns: `this`

**`.resetSelectedData()`**

Resets only the selected rows to their original values.

Returns: `this`

**`.editData(index, data, value)`**

Programmatically edits a cell value.

- `index` (number): Row index (`###row-index` value)
- `data` (string): Column key to edit
- `value` (any): New value

Returns: `this`

```javascript
table.setData(dataArray);
let data = table.getData();
table.resetData();
table.insertData({ id: 3, name: "Bob" });
table.insertData([{ id: 4 }, { id: 5 }]);
table.resetSelectedData();
table.editData(1, 'name', 'Updated Name');
```

**Retrieval Methods:**

**`.getFiltered(bool, arr)`**

Gets rows that pass the current filters.

- `bool` (boolean, optional): If true, returns filtered rows; if false, returns non-filtered. Default: true
- `arr` (array, optional): Custom array to filter. Default: current table data

Returns: array of objects (deep cloned, no internal properties)

**`.getSelected(bool, arr)`**

Gets selected rows.

- `bool` (boolean, optional): If true, returns selected rows; if false, returns non-selected. Default: true
- `arr` (array, optional): Custom array to check. Default: current table data

Returns: array of objects (deep cloned, no internal properties)

**`.getEdited(bool, arr)`**

Gets edited rows with before/after values.

- `bool` (boolean, optional): If true, returns edited rows; if false, returns non-edited. Default: true
- `arr` (array, optional): Custom array to check. Default: current table data

Returns: array of objects with structure `{ori: {}, current: {}, index: number}`

**`.getInserted(bool, arr)`**

Gets newly inserted rows.

- `bool` (boolean, optional): If true, returns inserted rows; if false, returns non-inserted. Default: true
- `arr` (array, optional): Custom array to check. Default: current table data

Returns: array of objects (cleaned of internal properties)

**`.getRemoved(bool, arr)`**

Gets rows marked for removal.

- `bool` (boolean, optional): If true, returns removed rows; if false, returns non-removed. Default: true
- `arr` (array, optional): Custom array to check. Default: current table data

Returns: array of objects (cleaned, reverted to pre-edit state)

```javascript
let filtered = table.getFiltered();
let selected = table.getSelected();
let edited = table.getEdited();
// edited = [{ori: {id: 1, name: 'John'}, current: {id: 1, name: 'Jon'}, index: 1}]
let inserted = table.getInserted();
let removed = table.getRemoved();
```

**Display Control:**

**`.refreshTable(resetPage)`**

Refreshes (re-renders) the table display.

- `resetPage` (boolean, optional): If true, resets pagination to page 1. Default: false

Returns: `this`

**`.sortAsOriginal()`**

Sorts table back to original data order.

Returns: `this`

**`.shieldOn()`**

Shows loading overlay (prevents interaction during updates).

Returns: Promise (resolves after `shieldRefreshGap` delay)

**`.shieldOff()`**

Hides loading overlay.

Returns: `this`

**`.setContainer(c)`**

Changes the container element.

- `c` (Util|HTMLElement): New container

Returns: `this`

**`.setFilter(index, value)`**

Programmatically sets a column filter.

- `index` (number): Column index (0-based)
- `value` (string): Filter value

Returns: `this`

```javascript
table.refreshTable();
table.refreshTable(true);
table.sortAsOriginal();
await table.shieldOn();
table.shieldOff();
table.setContainer(newContainer);
table.setFilter(0, 'search term');
```

**Selection & Checkboxes:**

**`.createSelectBox(row)`**

Creates a selection checkbox for a specific row.

- `row` (object): Row data object (must have `###row-index`)

Returns: Util instance of checkbox input

**`.createRemoveBox(row)`**

Creates a removal checkbox for a specific row.

- `row` (object): Row data object (must have `###row-index`)

Returns: Util instance of checkbox input

```javascript
// In column modifier:
{
    header: "Select",
    data: "###row-selected",
    modifier: (row) => table.createSelectBox(row)
}
```

**Configuration Retrieval:**

**`.getTableSettings()`**

Gets the current table settings object.

Returns: object (complete settings)

#### Special Column Keys

JsonTable automatically adds internal properties to track row state. These are prefixed with `###`:

| Property | Type | Description |
|----------|------|-------------|
| `###row-index` | number | Original row index (negative for inserted) |
| `###row-filtered` | boolean | Whether row passes filters |
| `###row-selected` | boolean | Whether row is selected |
| `###row-edited` | boolean | Whether row has edits |
| `###row-inserted` | boolean | Whether row is newly inserted |
| `###row-removed` | boolean | Whether row is marked for removal |
| `###ori-{key}` | any | Original value before edit |

**Using Special Columns:**

```javascript
columns: [
    {
        header: "Select",
        data: "###row-selected",
        modifier: (row) => table.createSelectBox(row)
    },
    {
        header: "Remove",
        data: "###row-removed",
        modifier: (row) => table.createRemoveBox(row)
    }
]
```

#### Filtering Syntax

JsonTable supports powerful filter expressions:

**Basic Filters:**

- **Text:** `apple` - contains "apple"
- **Quoted text:** `"apple pie"` - exact phrase
- **Boolean:** `true` / `false` or `1` / `0`
- **Numbers:** `<100`, `<=100`, `=100`, `>100`, `>=100`
- **Dates:** `>=2024-01-15`, `<01-07-1997`

**Combined Conditions:**

```
apple pear       → Contains "apple" AND "pear"
apple ` tart     → Contains "apple" but NOT "tart"
apple pear `` banana → (apple AND pear) OR (banana)
```

**Operators:**

- **Space** ` ` - AND operator (all must match)
- **Backtick** `` ` `` - NOT operator (exclude)
- **Double backtick** ``` `` ``` - OR operator (any condition)

**Empty Values:**

Use the `emptyRepresentation` setting (default: `___`) to filter empty/null cells:

```
___    → Match empty cells
` ___  → Match non-empty cells
```

**Regex:**

```
regex:^test.*    → Matches strings starting with "test"
```

#### Advanced Example

```javascript
import { JsonTable } from './util_bundle.js';

let container = Util.get('#tableContainer')[0];

let table = JsonTable(container);

table.setTableSettings({
    label: "Product Inventory",
    maxHeight: "600px",
    multiSelect: true,
    showSelectingGroup: true,
    emptyRepresentation: 'mt',
    filterDelimiter: '`',
    
    columns: [
        {
            header: "Select",
            data: "###row-selected",
            sortable: false,
            filterEditable: false,
            modifier: (row) => table.createSelectBox(row)
        },
        {
            header: "ID",
            data: "id",
            filterPlaceholder: "Filter ID..."
        },
        {
            header: "Product",
            data: "name",
            filterPlaceholder: "Search products...",
            headerStyle: { 'text-align': 'left' },
            rowsStyle: { 'text-align': 'left' }
        },
        {
            header: "Price",
            data: "price",
            filter: ">=100",
            modifier: (row) => '$' + row.price.toFixed(2)
        },
        {
            header: "Stock",
            data: "stock",
            modifier: (row) => {
                let color = row.stock < 10 ? 'red' : 'green';
                return `<span style="color: ${color}">${row.stock}</span>`;
            }
        },
        {
            header: "Remove",
            data: "###row-removed",
            sortable: false,
            filterEditable: false,
            modifier: (row) => table.createRemoveBox(row)
        }
    ],
    
    sortedBy: 'name',
    ascending: true,
    start: 1,
    end: 20,
    maxRows: 100,
    
    onrefresh: () => {
        console.log('Table refreshed');
        console.log('Selected:', table.getSelected().length);
        console.log('Edited:', table.getEdited().length);
    },
    
    evenRowsStyle: {
        'background-color': '#f9f9f9'
    }
});

// Set data
table.setData([
    { id: 1, name: "Widget", price: 149.99, stock: 5 },
    { id: 2, name: "Gadget", price: 89.99, stock: 15 },
    { id: 3, name: "Doohickey", price: 199.99, stock: 3 }
]);

// Render
table.refreshTable();

// Later: Get edited data
document.getElementById('saveBtn').addEventListener('click', () => {
    let edited = table.getEdited();
    let inserted = table.getInserted();
    let removed = table.getRemoved();
    
    console.log('Changes:', { edited, inserted, removed });
    
    // Send to server
    fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edited, inserted, removed })
    });
});
```

#### Sorting Behavior

- **Single-click header:** Sort by that column
- **Double-click header:** Add column to multi-sort
- **Triple-click header:** Clear sorting
- **Ctrl+click header:** Add column to multi-sort

#### Helper Methods

**`JsonTable.cleanKeys(arr)`**

Removes all internal properties (starting with `###`) from data array.

- `arr` (array): Array of objects

Returns: array (cleaned objects)

**`JsonTable.removeKeys(arr, keys)`**

Removes specific keys from all objects in array (supports wildcards).

- `arr` (array): Array of objects
- `keys` (string|array): Key(s) to remove. Use `%` as wildcard (e.g., `'temp%'`)

Returns: array (modified objects)

```javascript
// Clean all internal properties
let cleanData = JsonTable.cleanKeys(table.getData());

// Remove specific keys
let cleaned = JsonTable.removeKeys(data, 'temp%');
let cleaned = JsonTable.removeKeys(data, ['key1', 'key2']);
```

---

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JsUtil Demo</title>
    <script src="/static/util_bundle.js?v=1.0.0"></script>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        button { padding: 8px 16px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>User Management</h1>
        <div>
            <button id="addBtn">Add User</button>
            <button id="saveBtn">Save Changes</button>
            <button id="exportBtn">Export CSV</button>
        </div>
        <div id="tableContainer"></div>
    </div>

    <script type="module">
        import { Util, JsonTable } from './util_bundle.js';
        
        Util.loaded(() => {
            // Initialize table
            let container = Util.get('#tableContainer')[0];
            let table = JsonTable(container);
            
            table.setTableSettings({
                label: "User Directory",
                maxHeight: "500px",
                columns: [
                    {
                        header: "Select",
                        data: "###row-selected",
                        sortable: false,
                        modifier: (row) => table.createSelectBox(row)
                    },
                    { header: "ID", data: "id" },
                    { header: "Name", data: "name" },
                    { header: "Email", data: "email" },
                    {
                        header: "Active",
                        data: "active",
                        modifier: (row) => row.active ? '✓' : '✗'
                    }
                ]
            });
            
            // Load data
            fetch('/api/users')
                .then(res => res.json())
                .then(data => {
                    table.setData(data);
                    table.refreshTable();
                });
            
            // Add user
            Util.get('#addBtn')[0].addEventHandler('click', () => {
                table.insertData({
                    id: Date.now(),
                    name: prompt('Name:'),
                    email: prompt('Email:'),
                    active: true
                });
                table.refreshTable();
            });
            
            // Save changes
            Util.get('#saveBtn')[0].addEventHandler('click', async () => {
                let changes = {
                    edited: table.getEdited(),
                    inserted: table.getInserted(),
                    removed: table.getRemoved()
                };
                
                await fetch('/api/users/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(changes)
                });
                
                alert('Saved!');
            });
            
            // Export
            Util.get('#exportBtn')[0].addEventHandler('click', () => {
                let data = JsonTable.cleanKeys(table.getData());
                Util.downloadAsCsv(data, 'users.csv');
            });
        });
    </script>
</body>
</html>
```

---

## License

This project is licensed under the MIT License.



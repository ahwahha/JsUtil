function Util(entity) {
    this['_entity'] = null;
    if (entity != null) {
        if (typeof entity == 'string') {
            return Util.get(entity);
        } else if (entity instanceof HTMLElement) {
            this['_entity'] = entity;
            return this;
        } else if (entity instanceof Util) {
            return entity;
        }
    }
};

Util.get = function (selector) {
    if (typeof selector == 'string') {
        if (selector.trim().startsWith("#")) {
            return new Util(document.querySelector(selector));
        } else {
            let array = [];
            document.querySelectorAll(selector).forEach((item) => {
                array.push(new Util(item));
            })
            return array;
        }
    } else {
        return null;
    }
};

Util.create = function (type, attributes) {
    let e = document.createElement(type);
    if (attributes != null && typeof attributes === 'object') {
        for (let key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                e.setAttribute(key, attributes[key]);
            }
        }
    }
    return new Util(e);
};

Util.objToStyle = function (obj) {
    var output = null;
    try {
        output = '';
        for (let key in (obj || {})) {
            output += (output ? ' ' : '') + key + ':' + obj[key] + ';';
        }
    } catch (error) {
        throw new Error("error caught @ objToStyle(" + obj + "): " + error);
    }
    return output;
};

Util.styleToObj = function (style) {
    var output = null;
    try {
        output = {};
        var styles = style.split(';');
        styles.forEach(function (style) {
            if (style.trim()) {
                var parts = style.split(':');
                var key = parts[0].trim();
                var value = parts[1].trim();
                output[key] = value;
            }
        });
    } catch (error) {
        throw new Error("error caught @ styleToObj(" + style + "): " + error);
    }
    return output;
};

Util.clone = function (input) {
    if (input instanceof Util) {
        let u = new Util(input.entity());
        if (input['_eventListenerList']) {
            u['_eventListenerList'] = [];
            for (let l of input['_eventListenerList']) {
                u.addEventHandler(l['type'], l['listener'], l['options']);
            }
        }
        return u;
    } else if (Array.isArray(input)) {
        return input.map(Util.clone);
    } else if (typeof input === 'object' && input != null) {
        if (input instanceof Node) {
            return input;
        }
        let output = {};
        for (let key in input) {
            if (input.hasOwnProperty(key)) {
                output[key] = Util.clone(input[key]);
            }
        }
        return output;
    } else {
        return input;
    }
};

Util.openBlob = function (blob) {
    let url = null;
    try {
        url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error opening blob:', error);
    } finally {
        if (url) {
            URL.revokeObjectURL(url);
        }
    }
};

Util.downloadBlob = function (blob, filename = 'filename') {
    let url = null;
    try {
        url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (error) {
        console.error('Error downloading blob:', error);
    } finally {
        if (url) {
            URL.revokeObjectURL(url);
        }
    }
};

Util.downloadBlob = function (blob, fileName = 'data') {
    try {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw new Error("error caught @ downloadBlob: " + error);
    }
};

Util.parseCsv = function (csv, delimiter = ',') {
    function splitCSVLines(input) {
        const lines = [];
        let currentLine = '';
        let insideQuotes = false;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            const nextChar = input[i + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    // Handle escaped quote by adding a single quote to the current line
                    currentLine += '"';
                    i++; // Skip the next character
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (!insideQuotes && (char === '\n' || (char === '\r' && nextChar !== '\n'))) {
                lines.push(currentLine);
                currentLine = '';
            } else if (!insideQuotes && char === '\r' && nextChar === '\n') {
                lines.push(currentLine);
                currentLine = '';
                i++; // Skip the next character as it's part of \r\n
            } else {
                currentLine += char;
            }
        }

        // Add the last line if there's any remaining content
        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    function splitCSVLine(line, delimiter) {
        const regex = new RegExp(`(?:^|${delimiter})(\"(?:[^\"]+|\"\")*\"|[^${delimiter}]*)`, 'g');
        const matches = [];
        let match;
        while (match = regex.exec(line)) {
            matches.push(match[1].replace(/^\"|\"$/g, '').replace(/\"\"/g, '\"'));
        }
        return matches;
    }

    function csvLineToObject(headers, lineArray) {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = lineArray[i];
        }
        return obj;
    }

    const lines = splitCSVLines(csv);
    const headers = splitCSVLine(lines[0], delimiter);
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = splitCSVLine(lines[i], delimiter);
        const obj = csvLineToObject(headers, currentLine);
        result.push(obj);
    }

    return result;
};

Util.objectArrayToCsv = function (data, delimiter = ',', linebreak = '\n') {
    let csv = '';
    let headers = Object.keys(data[0]).sort((a, b) => { return a.localeCompare(b); });
    // Add the data
    data.forEach(function (row) {
        let data = headers.map(header => JSON.stringify(row[header])).join(delimiter);
        csv += (csv == '' ? '' : linebreak) + data;
    });
    // Get the headers
    csv = headers.join(delimiter) + linebreak + csv;
    return csv;
};

Util.downloadAsCsv = function (data, fileName = 'data.csv', delimiter = ',') {
    try {
        if (data && data.length > 0) {
            // Convert JSON data to CSV
            let csvData = Util.objectArrayToCsv(data, delimiter);

            // Create a CSV file and allow the user to download it
            Util.downloadBlob(new Blob([csvData], { type: 'text/csv' }), fileName);
        }
    } catch (error) {
        throw new Error("error caught @ downloadAsCsv: " + error);
    }
};

Util.loaded = function (func) {
    if (func != null && typeof func === 'function') {
        document.addEventListener('DOMContentLoaded', func);
    }
};

Util.createFileElement = function (name = '', fileElementProps = {}) {
    let container, inputField, removeButton
    let e = Util.create('div')
        .appendContent(
            container = Util.create('div', {
                ...{
                    'style': Util.objToStyle({
                        'width': 'calc(100% - 4px)',
                        'padding': '1px',
                        'border': 'hsl(0 0 90) solid 1px',
                        'border-radius': '4px',
                        'display': 'flex',
                        'flex-flow': 'row nowrap',
                        'justify-content': 'flex-start',
                        'align-items': 'center',
                        'gap': '3px'
                    })
                }, ...(fileElementProps['container'] || {})
            })
                .appendContent(
                    inputField = Util.create('input', {
                        ...{
                            'type': 'file',
                            'name': name,
                            'style': Util.objToStyle(
                                { 'width': 'calc(100% - 30px)' },
                            )
                        }, ...(fileElementProps['inputField'] || {})
                    })
                )
                .appendContent(
                    removeButton = Util.create('div', {
                        ...{
                            'style': Util.objToStyle({
                                'width': '30px',
                                'height': '20px',
                                'display': 'flex',
                                'flex-flow': 'row nowrap',
                                'justify-content': 'center',
                                'align-items': 'center',
                                'font-size': '15px',
                                'font-weight': 'bold',
                                'cursor': 'pointer',
                                'margin': '0px',
                                'padding': '0px',
                                'border': '1px solid #888888',
                                'border-radius': '3px',
                                'color': '#000000;',
                                'background-color': '#f3f3f3',
                                'outline': 'none'
                            })
                        }, ...(fileElementProps['removeButton'] || {})
                    })
                        .appendContent("✕")
                        .addEventHandler('click', (event) => { e.remove(); })
                )
        );
    return e.prop('container', container).prop('inputField', inputField).prop('removeButton', removeButton);
};

Util.createFileGroup = function (name = '', initial, max, fileElementProps = {}) {

    let e;
    let columnElementStyle = {
        'width': '100%',
        'display': 'flex',
        'flex-flow': 'column nowrap',
        'justify-content': 'flex-start',
        'align-items': 'flex-start'
    };

    let files = Util.create('div', { style: Util.objToStyle(columnElementStyle) });

    let addButton = Util.create('div', {
        style: Util.objToStyle({
            'display': 'flex',
            'flex-flow': 'row nowrap',
            'justify-content': 'center',
            'align-items': 'center',
            'font-size': '100%',
            'cursor': 'pointer',
            'margin': '0px',
            'padding': '0px 3px',
            'border': '1px solid #888888',
            'border-radius': '3px',
            'color': '#000000;',
            'background-color': '#f3f3f3',
            'outline': 'none'
        })
    })
        .appendContent("Add")
        .addEventHandler('click', (event) => {
            if (max == null || files.entity().children.length < max) {
                files.appendContent(
                    Util.createFileElement(name, fileElementProps).css('width', '100%').css('padding-bottom', '3px')
                );
            }
        });

    new MutationObserver(() => {
        if (files.entity().children.length < max && addButton.entity().style.display === 'none') {
            addButton.show();
        } else if (files.entity().children.length == max && addButton.entity().style.display !== 'none') {
            addButton.hide();
        }
    }).observe(files.entity(), { attributes: !true, childList: true, subtree: true })

    for (let i = 0; i < initial; i++) {
        files.appendContent(Util.createFileElement(name, fileElementProps).css('width', '100%').css('padding-bottom', '3px'));
    }

    e = Util.create('div').appendContent(
        Util.create('div', { style: Util.objToStyle(columnElementStyle) })
            .appendContent(files)
            .appendContent(addButton)
    );

    return e.prop('container', e).prop('files', files).prop('addButton', addButton);
};

Util.createMovableDiv = function (content) {
    let div = Util.create('div', {
        style: this.objToStyle({
            'position': 'absolute',
            'height': 'min-content',
            'width': 'min-content',
            'min-height': '50px',
            'min-width': '50px',
            'margin': '0px',
            'padding': '0px',
            'border': 'solid #ddd 1px',
            'z-index': '50',
            'box-sizing': 'border-box',
            'background-color': '#fff'
        })
    });
    div.appendContent(
        Util.create('div', {
            style: this.objToStyle({
                'height': '20px',
                'width': '20px',
                'margin': '0px',
                'padding': '0px',
                'position': 'absolute',
                'right': '-21px',
                'top': '-1px',
                'border-top': 'solid #ddd 1px',
                'border-bottom': 'solid #ddd 1px',
                'border-right': 'solid #ddd 1px',
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'font-size': '15px',
                'box-sizing': 'border-box',
                'color': 'inherit',
                'background-color': 'inherit'
            })
        })
            .appendContent('✖')
    )
        .appendContent(
            Util.create('div', {
                style: this.objToStyle({
                    'height': '20px',
                    'width': '20px',
                    'margin': '0px',
                    'padding': '0px',
                    'position': 'absolute',
                    'right': '-21px',
                    'top': '-1px',
                    'box-sizing': 'border-box'
                })
            })
                .addEventHandler('mouseover', function (event) { event.target.style.cursor = 'pointer'; })
                .addEventHandler('mouseout', function (event) { event.target.style.cursor = 'default'; })
                .addEventHandler('focus', function (event) { event.target.blur() })
                .addEventHandler('click', (e) => {
                    div.remove();
                })
        )
        .appendContent(
            Util.create('div', {
                style: this.objToStyle({
                    'height': '20px',
                    'width': '20px',
                    'margin': '0px',
                    'padding': '0px',
                    'position': 'absolute',
                    'right': '-21px',
                    'top': '19px',
                    'border-right': 'solid #ddd 1px',
                    'border-bottom': 'solid #ddd 1px',
                    'display': 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                    'font-size': '15px',
                    'box-sizing': 'border-box',
                    'color': 'inherit',
                    'background-color': 'inherit'
                })
            })
                .appendContent('✠')
        )
        .appendContent(
            Util.create('div', {
                style: this.objToStyle({
                    'height': '20px',
                    'width': '20px',
                    'margin': '0px',
                    'padding': '0px',
                    'position': 'absolute',
                    'right': '-21px',
                    'top': '19px',
                    'box-sizing': 'border-box'
                })
            })
                .addEventHandler('mouseover', function (event) { event.target.style.cursor = 'move'; })
                .addEventHandler('mouseout', function (event) { event.target.style.cursor = 'default'; })
                .addEventHandler('focus', function (event) { event.target.blur() })
                .drag(div)
        )
        .appendContentIf(content, content);
    return div;
};

Object.defineProperty(Util, 'directions', {
    value: { up: 0, right: 1, down: 2, left: 3 }
    , writable: false
    , configurable: false
    , enumerable: false
});

Util.createSplitedDiv = function (direction, firstSpan, adjustable, drag) {
    direction = direction == null ? 1 : direction;
    firstSpan = firstSpan == null ? '50%' : firstSpan;
    adjustable = adjustable == null ? false : adjustable;
    drag = drag || false;

    let container = Util.create('div', {
        style: Util.objToStyle({
            'padding': '0px',
            'margin': '0px',
            'box-sizing': 'border-box',
            'width': '100%',
            'height': '100%',
            'display': 'flex',
            'align-items': 'center'
        })
    })
        .css('flex-flow', (direction % 2 === 0 ? 'column' : 'row') + ' nowrap')
        .css('justify-content', (direction % 3 === 0 ? 'flex-end' : 'flex-start'))
        .css('flex-direction', (direction % 2 === 0 ? 'column' : 'row') + (direction % 3 === 0 ? '-reverse' : ''));

    let a = Util.create('div', {
        style: Util.objToStyle({
            'padding': '0px',
            'margin': '0px',
            'box-sizing': 'border-box',
            'overflow': 'hidden'
        })
    })
        .css((direction % 2 === 0 ? 'width' : 'height'), '100%')
        .css((direction % 2 === 0 ? 'height' : 'width'), firstSpan);

    let b = Util.create('div', {
        style: Util.objToStyle({
            'padding': '0px',
            'margin': '0px',
            'box-sizing': 'border-box',
            'flex': '1'
        })
    })
        .css((direction % 2 === 0 ? 'width' : 'height'), '100%');

    let divider = Util.create('div', {
        style: Util.objToStyle({
            'padding': '0px',
            'margin': '0px',
            'box-sizing': 'border-box',
            'cursor': !adjustable ? 'unset' : direction % 2 === 0 ? 'row-resize' : 'col-resize',
            'box-sizing': 'border-box',
            'border': '0px',
            'background-image': 'linear-gradient(to ' + (direction % 2 === 0 ? 'bottom' : 'right') + ',  #eee, #eee, #f8f8f8, #eee, #eee)'
        })
    })
        .css((direction % 2 === 0 ? 'width' : 'height'), '100%')
        .css((direction % 2 === 0 ? 'height' : 'width'), !adjustable ? '3px' : drag ? '5px' : '8');

    let overlay;
    if (adjustable) {
        if (drag == false) {
            let isCollapsed = false;
            divider.addEventHandler('click', (e) => {
                if (!isCollapsed) {
                    a.css((direction % 2 === 0 ? 'height' : 'width'), '0px');
                } else {
                    a.css((direction % 2 === 0 ? 'height' : 'width'), firstSpan);
                }
                isCollapsed = !isCollapsed;
            });
        } else {
            divider.addEventHandler('mousedown', (e) => {
                divider['hold'] = {};
                divider['hold'][(direction % 2 === 0 ? 'y' : 'x')] = (direction % 2 === 0 ? e.clientY : e.clientX);
                Util.get('html')[0].appendContent(
                    overlay = Util.create('div', { "style": Util.objToStyle({ 'position': 'fixed', 'top': '0px', 'left': '0px', 'width': '100%', 'height': '100%', 'z-index': '9999' }) })
                        .addEventHandler(['mouseup', 'mouseleave'], (e) => {
                            if (divider['hold']) {
                                divider['hold'] = undefined;
                                overlay.remove();
                            }
                        })
                        .addEventHandler('mousemove', (e) => {
                            if (divider['hold']) {
                                a.css((direction % 2 === 0 ? 'height' : 'width'), (a.entity()[(direction % 2 === 0 ? 'offsetHeight' : 'offsetWidth')] + (direction % 3 === 0 ? '-1' : '1') * (direction % 2 === 0 ? e.clientY : e.clientX) - (direction % 3 === 0 ? '-1' : '1') * divider['hold'][(direction % 2 === 0 ? 'y' : 'x')]) + 'px');
                                divider['hold'][(direction % 2 === 0 ? 'y' : 'x')] = (direction % 2 === 0 ? e.clientY : e.clientX);
                            }
                        })
                );
            });
        }
    }

    return container
        .prop('a', a)
        .prop('b', b)
        .prop('divider', divider)
        .appendContent(a)
        .appendContent(divider)
        .appendContent(b);
};

Util.getStrParts = (str, delimiter = '`', lv = 1) => {
    try {
        let getParts = (str, delimiter, lv) => {
            let parts = str.split(delimiter.repeat(lv));
            if (lv > 1) {
                let a = [];
                for (let i = 0; i < parts.length; i++) {
                    let part = getParts(parts[i], delimiter, lv - 1);
                    a.push(part);
                }
                return a;
            } else {
                return parts;
            }
        }
        return getParts(str, delimiter, lv);
    } catch (e) {
        throw new Error("error caught @ getStrParts: " + e);
    }
};

Util.splitString = (str, delimiters = [" "]) => {
    try {
        let values = [];
        let isQuoteOpen = false;
        let currentWord = "";

        /* push every whole string in quotes */
        for (let i = 0; i < str.length; i++) {
            let char = str[i];
            if (!isQuoteOpen && delimiters.includes(char)) {
                if (currentWord !== "") {
                    values.push(currentWord);
                    currentWord = "";
                }
            } else if (char === "\"") {
                isQuoteOpen = !isQuoteOpen;
                if (!isQuoteOpen && currentWord !== "") {
                    values.push(currentWord);
                    currentWord = "";
                }
            } else {
                currentWord += char;
            }
        }

        /* push the last part */
        if (currentWord !== "") {
            values.push(currentWord);
        }

        return values;
    } catch (e) {
        throw '@ splitString: ' + e;
    }
}

Util.checkCriteria = (str, matchingString, delimiter, criteria) => {
    try {

        let check = (array) => {
            let includes = array[0] ? Util.splitString(array[0], [' ', ',', '+', '\t']) : [];
            let excludes = array[1] ? Util.splitString(array[1], [' ', ',', '+', '\t']) : [];

            /*handle excludes*/
            let exclusiveMatch = true;
            for (let value of excludes) {
                exclusiveMatch = exclusiveMatch && !criteria(str, value);
                if (!exclusiveMatch) {
                    return false;
                }
            }

            /*handle includes*/
            let inclusiveAndMatch = includes.length !== 0;
            for (let value of includes) {
                inclusiveAndMatch = inclusiveAndMatch && criteria(str, value);
                if (!inclusiveAndMatch) {
                    return false;
                }
            }

            return true;
        }

        let parts = Util.getStrParts(matchingString, delimiter, 2);

        let bool = false;
        for (let i = 0; i < parts.length; i++) {
            if (check(parts[i])) {
                bool = true;
                break;
            }
        }

        return bool;

    } catch (e) {
        throw '@ checkCriteria: ' + e;
    }
}

Util.match = function (text, matchingText, delimiter, criteria) {
    let match = false;
    try {
        if (text == null && matchingText !== '') {
            match = false;
        } else {
            match = Util.checkCriteria(text, matchingText, delimiter, criteria);
        }
        return match;

    } catch (e) {
        throw new Error("error caught @ match: " + e);
    }
}

Util.matchText = function (text, matchingText, delimiter, caseSensitive = false) {
    let match = false;
    try {
        if (text == null && matchingText !== '') {
            match = false;
        } else {
            let regex = matchingText.trim().startsWith("regex:");

            if (regex) {
                let regexPattern = new RegExp(matchingText.trim().substring(6));
                match = regexPattern.test(text);
            } else {

                if (!caseSensitive) {
                    text = text.toUpperCase();
                    matchingText = matchingText.toUpperCase();
                }

                match = Util.checkCriteria(text, matchingText, delimiter, (a, b) => {
                    return b === '___' && (a == null || a.trim() == '') ? true : a.indexOf(b) !== -1;
                });

            }

        }
        return match;

    } catch (e) {
        throw new Error("error caught @ matchText: " + e);
    }

}

Util.isIntersecting = function (A1, A2, B1, B2) {
    if (!A1 || !A2 || !B1 || !B2) return false;
    let [a1, a2] = A2 > A1 ? [A1, A2] : [A2, A1];
    let [b1, b2] = B2 > B1 ? [B1, B2] : [B2, B1];
    return b2 >= a1 && b1 <= a2;
}

Util.isOverlapping = function (A1, A2, B1, B2) {
    if (A1 == A2 || B1 == B2) return false;
    return Util.isIntersecting(A1, A2, B1, B2);
}

Util.createSelect = function (items) {
    let select = Util.create('select');
    if (items && Array.isArray(items) && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            let option = Util.create('option');
            if (typeof items[i] === "object" && items[i] != null) {
                for (let attr in items[i]) {
                    if (attr === 'content') {
                        option.appendContent(items[i][attr]);
                    } else if (attr === 'value') {
                        option.attr('value', items[i][attr]);
                    } else if (attr === 'eventHandler') {
                        option.addEventHandler(attr['events'], attr['func']);
                    } else {
                        option.attr(attr, items[i][attr]);
                    }
                }
            }
            select.appendContent(option);
        }
    }
    return select;
};

Util.getHierarchicalTree = function (arr, prop_id, prop_parent_id) {
    const trees = [];
    const seen = new Set();

    function getTree(parentId) {
        return arr
            .filter(item => item[prop_parent_id] === parentId && !seen.has(item[prop_id]))
            .map(item => {
                seen.add(item[prop_id]);
                const node = { ...item, children: getTree(item[prop_id]) };
                delete node[prop_parent_id];
                return node;
            });
    }

    const allIds = new Set(arr.map(item => item[prop_id]));
    arr.forEach(item => {
        const parentId = item[prop_parent_id];
        if ((parentId === null || !allIds.has(parentId)) && !seen.has(item[prop_id])) {
            trees.push(...getTree(parentId));
        }
    });

    return trees;
}

Util.createMenu = function (trees = [], prop_label = 'label', prop_handler = 'handler', prop_children = 'children') {
    if (!Array.isArray(trees) || !prop_label || prop_label === '') {
        throw new Error('Invalid input: trees must be an array, prop_label must be a non-empty string');
    }

    let output = Util.create('div');

    let createSubMenu = function (node, level = 0) {
        let div = Util.create('div', { class: ('menu_branch') });

        if (!node || typeof node !== 'object') { return div };

        let haveChildren = Array.isArray(node[prop_children]) && node[prop_children].length > 0;

        let label = Util.create('div', { class: ('menu_level_' + level) })
            .appendContent(node[prop_label] ?? '---')
            .addEventHandlerIf('click', node[prop_handler], typeof node[prop_handler] == 'Function')
            .addEventHandlerIf('click', childrenContainer.css('display', childrenContainer.css('display') === 'none' ? 'unset' : 'none'), haveChildren);

        let childrenContainer = Util.create('div', { class: ('menu_children'), style: "display:none;" });
        if (haveChildren) {
            for (let child of node[prop_children]) {
                childrenContainer.appendContent(createSubMenu(child, level + 1));
            }
        }

        div.appendContent(label).appendContentIf(childrenContainer, haveChildren)
    }

    for (let tree of trees) {
        output.appendContent(createSubMenu(tree, 0));
    }

    return output;
}

Util.prototype.appendMovableDiv = function (content) {
    this.css('position', 'relative')
        .appendContent(Util.createMovableDiv(content));
    return this;
};

Util.prototype.entity = function (entity) {
    if (entity == undefined) {
        return this['_entity'];
    } else {
        this['_entity'] = entity;
        return this;
    }
};

Util.prototype.parent = function () {
    return new Util(this['_entity'].parentElement);
};

Util.prototype.hide = function () {
    if (this['_entity']) {
        this.css('display', 'none');
    }
    return this;
};

Util.prototype.show = function () {
    if (this['_entity']) {
        this.css('display', 'unset');
    }
    return this;
};

Util.prototype.clear = function () {
    if (this['_entity']) {
        this['_entity'].innerHTML = '';
    }
    return this;
};

Util.prototype.fireEvent = function (event) {
    if (this['_entity']) {
        this['_entity'].dispatchEvent(new Event(event));
    }
    return this;
};

Util.prototype.addEventHandler = function (_events, func, options) {
    try {
        let events = [];
        this['_eventListenerList'] = this['_eventListenerList'] ? this['_eventListenerList'] : [];

        if (Array.isArray(_events)) {
            events = _events;
        } else if (_events) {
            events = [...events, _events];
        }

        events.forEach((event) => {
            if (typeof event === 'string') {
                this['_entity'].addEventListener(event, func, options);
                this['_eventListenerList'].push({ type: event, listener: func, options: options });
            } else {
                throw 'invalid events in input list:' + events;
            }
        });

        return this;
    } catch (error) {
        throw '@ addEventHandler: ' + error;
    }
};

Util.prototype.addEventHandlerIf = function (events, func, options, bool) {
    if (bool) {
        this.addEventHandler(events, func, options);
    }
    return this;
};

Util.prototype.removeAllEventHandlers = function () {
    if (this['_eventListenerList'] && this['_eventListenerList'].length > 0) {
        this['_eventListenerList'].forEach((item) => {
            this['_entity'].removeEventListener(item['type'], item['listener'], item['options']);
        })
    }
    this['_eventListenerList'] = undefined;
    return this;
};

Util.prototype.content = function (content) {
    if (content === undefined) {
        return this['_entity'].innerHTML;
    } else {
        if (content) {
            this.clear().appendContent(content);
        }
        return this;
    }
};

Util.prototype.appendContent = function (content) {
    try {
        if (content != null) {
            if (typeof content === 'string') {
                this['_entity'].append(content);
            } else if (typeof content === 'number') {
                this['_entity'].append(content);
            } else if (content instanceof HTMLElement) {
                this['_entity'].appendChild(content);
            } else if (content instanceof Util) {
                this.appendContent(content.entity());
            } else {
                throw 'content must be a string or number or HTMLElement or Util';
            }
        }
    } catch (error) {
        throw ("@ appendContent(" + JSON.stringify(content) + "): " + error);
    }
    return this;
};

Util.prototype.appendContentIf = function (content, condition = true) {
    try {
        if (condition) {
            this.appendContent(content);
        }
    } catch (error) {
        throw ("@ appendContentIf(" + content + "): " + error);
    }
    return this;
};

Util.prototype.appendContentOf = function (list, funcValue = function (item) { return item; }, funcCondition = function (item) { return true; }) {
    try {
        for (let item of list) {
            this.appendContentIf(funcValue(item), funcCondition(item));
        }
    } catch (error) {
        throw ("@ appendContentOf(" + list + ", " + func + "): " + error);
    }
};

Util.prototype.drag = function (target) {
    let overlay;
    this.addEventHandler('mousedown', (e) => {
        this['hold'] = {};
        this['hold']['x'] = e.clientX;
        this['hold']['y'] = e.clientY;
        Util.get('html')[0].appendContent(
            overlay = Util.create('div', { "style": Util.objToStyle({ 'position': 'fixed', 'top': '0px', 'left': '0px', 'width': '100%', 'height': '100%', 'z-index': '9999' }) })
                .addEventHandler(['mouseup', 'mouseleave'], (e) => {
                    if (this['hold']) {
                        this['hold'] = undefined;
                        overlay.remove();
                    }
                })
                .addEventHandler('mousemove', (e) => {
                    if (this['hold']) {
                        target.css('left', target.entity().offsetLeft + e.clientX - this['hold']['x'] + 'px');
                        target.css('top', target.entity().offsetTop + e.clientY - this['hold']['y'] + 'px');
                        this['hold']['x'] = e.clientX;
                        this['hold']['y'] = e.clientY;
                    }
                })
        );
    });
    return this;
};

Util.deferExec = function (delay = 100) {
    return new Promise((res) => {
        let exit = false;
        let quit = () => {
            if (!exit) {
                exit = true;
                res();
            }
        }
        setTimeout(quit, delay);
    });
};

Util.prototype.debounce = function (func, delay) {
    let context = this;
    if (context['###timeout']) { clearTimeout(context['###timeout']); }
    context['###timeout'] = setTimeout(async function () {
        await func.apply(context);
    }, delay);
    return this;
};

Util.prototype.countClicks = function (handlers = [], delay) {
    let context = this;
    let count = 0;
    this.addEventHandler('click', (event) => {
        count++;
        this.debounce(() => {
            if (handlers[count - 1]) {
                handlers[count - 1].apply(context, event);
            }
            count = 0;
        }, delay);
    })
    return this;
}

Util.prototype.repeat = function (func, interval) {
    let context = this;
    func.apply(context);
    setInterval(function () {
        func.apply(context);
    }, interval);
    return this;
};

Util.prototype.idleControl = function (events, onactive, onidle, interval) {
    let idle = false;
    let context = this;
    context
        .addEventHandler(events, () => {
            if (idle) {
                idle = false;
                if (typeof onactive === 'function') {
                    onactive.apply(context);
                }
            }
        })
        .addEventHandler(events, context.debounce(() => {
            idle = true;
            if (typeof onidle === 'function') {
                onidle();
            }
        }, interval));
}

Util.prototype.appendSelect = function (items) {
    return this.appendContent(Util.createSelect(items));
};

Util.prototype.preventDefault = function (eventType) {
    this.addEventHandler(eventType, function (event) { event.preventDefault(); });
    return this;
};

Util.prototype.val = function (value) {
    if (value === undefined) {
        return this['_entity'] ? this['_entity']['value'] : undefined;
    } else {
        if (this['_entity']) {
            this['_entity']['value'] = value;
        }
        return this;
    }
};

Util.prototype.class = function (className) {
    this['_entity'].className = className;
    return this;
};

Util.prototype.addClass = function (className) {
    this['_entity'].classList.add(className);
    return this;
};

Util.prototype.removeClass = function (className) {
    this['_entity'].classList.remove(className);
    return this;
};

Util.prototype.containClass = function (className) {
    return this['_entity'].classList.contains(className);
};

Util.prototype.class = function (className) {
    this['_entity'].className = className;
    return this;
};

Util.prototype.attr = function (name, assignment) {
    if (assignment === undefined) {
        return this['_entity'].getAttribute(name);
    } else {
        if (assignment == 'unset') {
            this['_entity'].removeAttribute(name);
        } else {
            this['_entity'].setAttribute(name, assignment);
        }
        return this;
    }
};

Util.prototype.prop = function (name, assignment) {
    if (assignment === undefined) {
        return this[name];
    } else {
        if (assignment == 'unset') {
            this[name] = undefined;
        } else {
            this[name] = assignment;
        }
        return this;
    }
};

Util.prototype.css = function (name, assignment) {
    if (name == null) {
        return this.attr('style');
    } else {
        this.attr('style', this.attr('style') == null ? '' : this.attr('style'));
        let obj = Util.styleToObj(this.attr('style'));
        if (assignment === undefined) {
            return obj == null ? null : obj[name];
        } else {
            if (assignment == 'unset') {
                delete obj[name];
            } else {
                obj[name] = assignment;
            }
            this.attr('style', Util.objToStyle(obj));
            return this;
        }
    }
};

Util.prototype.remove = function () {
    this['_entity'].remove();
    this['_entity'] = undefined;
    return this;
};

Util.prototype.noFocus = function () {
    this.addEventHandler('focus', (event) => { this.entity().blur(); })
    return this;
};

Util.prototype.commands = function (_bufferSize, _handlers) {
    let handlers = [];
    let buffer = '';
    let element = this;

    if (typeof _handlers === 'object') {
        if (Array.isArray(_handlers)) {
            handlers = _handlers;
        } else {
            handlers.push(_handlers);
        }

        element.addEventHandler('keyup', async (event) => {
            if (event.target === element || (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA')) {
                if (event.key == 'Enter') {
                    for (let handler of handlers) {
                        if (['command', 'function'].every(key => handler.hasOwnProperty(key))) {
                            if (buffer.endsWith(handler['command'])) {
                                await handler['function']();
                            }
                        }
                    }
                } else {
                    buffer += event.key;
                    if (buffer.length > _bufferSize) {
                        buffer = buffer.slice(1);
                    }
                }
            }
        });
    }

    return this;
};

Util.prototype.holdKeys = function (_combinations, flushDelay = 1000) {
    let element = this;
    element.keys = [];
    element.holding = false;
    let combinations = (!Array.isArray(_combinations)) ? [...(_combinations || [])] : _combinations;

    let checkKeySet = function () {
        let reorder = function (arr) {
            let temp = [...arr];
            let last = temp.pop();
            temp = [...temp.sort(), ...(last != null ? [last] : [])];
            return temp;
        }
        for (let combination of combinations) {
            if (combination != null && combination.keySet != null && combination.handler != null) {
                if (JSON.stringify(reorder(combination.keySet)) == JSON.stringify(reorder(element.keys))) {
                    combination.handler.apply(element);
                }
            }
        }
    }

    let clean = function () {
        element.debounce(function () {
            element.keys = [];
        }, flushDelay)
    }

    element.addEventHandler('keydown', (event) => {
        if (element.keys.indexOf(event.key) < 0) {
            element.keys = [...new Set([...element.keys, event.key])]
            element.holding = true;
            checkKeySet();
            clean();
        }
    }).addEventHandler('keyup', (event) => {
        element.keys = element.keys.filter(key => key != event.key);
        element.holding = element.keys.length != 0;
        checkKeySet();
        clean();
    });

    return this;
}

export { Util };
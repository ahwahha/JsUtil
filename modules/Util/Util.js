import './Util.js'

function Util(entity) {
    this._entity = null;
    if (entity !== null) {
        if (typeof entity == 'string') {
            return Util.get(entity);
        } else if (entity instanceof HTMLElement) {
            this._entity = entity;
            return this;
        } else if (entity instanceof Util) {
            return entity;
        }
    }
}

Util.get = function (selector) {
    if (typeof selector == 'string') {
        if (selector.trim().startsWith("#")) {
            return new Util(document.querySelector(selector));
        } else {
            return new Util(document.querySelectorAll(selector));
        }
    } else {
        return null;
    }
}

Util.isObjectOrArray = function (arg) {
    return arg !== null && (typeof arg === 'object' || Array.isArray(arg));
}

Util.debounce = function (func, delay) {
    let timeout;
    return async function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(this, args);
        }, delay);
    };
}

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

Util.downloadAsCsv = function (jsonData, fileName = 'data.csv', delimiter = ',') {
    try {
        if (jsonData && jsonData.length > 0) {

            var jsonToCsv = function (jsonData) {
                let csv = '';
                let headers = Object.keys(jsonData[0]).sort((a, b) => { return a.localeCompare(b); });
                // Add the data
                jsonData.forEach(function (row) {
                    let data = headers.map(header => JSON.stringify(row[header])).join(delimiter);
                    csv += (csv == '' ? '' : '\n') + data;
                });
                // Get the headers
                csv = headers.join(delimiter) + '\n' + csv;
                return csv;
            }

            // Convert JSON data to CSV
            let csvData = jsonToCsv(jsonData);
            // Create a CSV file and allow the user to download it
            let blob = new Blob([csvData], { type: 'text/csv' });
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            // Clean up
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        }
    } catch (error) {
        throw new Error("error caught @ downloadAsCsv: " + error);
    }
}

Util.clone = function (input) {
    if (Array.isArray(input)) {
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
}

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
}

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
}

Util.prototype.parent = function () {
    return new Util(this._entity.parentElement);
}

Util.prototype.entity = function (entity) {
    if (entity == undefined) {
        return this._entity;
    } else {
        this._entity = entity;
        return this;
    }
}

Util.prototype.hide = function () {
    if (this._entity) {
        this._entity.style.display = 'none';
    }
    return this;
};

Util.prototype.show = function () {
    if (this._entity) {
        this._entity.style.display = 'revert';
    }
    return this;
};

Util.prototype.clear = function () {
    if (this._entity) {
        this._entity.innerHTML = '';
    }
    return this;
};

Util.prototype.fireEvent = function (event) {
    if (this._entity) {
        this._entity.dispatchEvent(new Event(event));
    }
    return this;
};

Util.prototype.addEventHandler = function (events, func) {
    try {
        if (typeof events === 'string') {
            this._entity.addEventListener(events, func);
        } else if (Array.isArray(events)) {
            events.forEach((event) => {
                if (typeof event === 'string') {
                    this._entity.addEventListener(event, func);
                } else {
                    throw 'invalid events in input list:' + events;
                }
            });
        } else {
            throw 'invalid event input list:' + events;
        }
        return this;
    } catch (error) {
        throw '@ addEventHandler: ' + error;
    }
};

Util.prototype.addEventHandlerIf = function (events, func, bool) {
    if (bool) {
        this.addEventHandler(events, func);
    }
    return this;
};

Util.prototype.content = function (content) {
    if (content === undefined) {
        return this._entity.innerHTML;
    } else {
        if (content) {
            this._entity.innerHTML = content;
        }
    }
}

Util.prototype.appendContent = function (content) {
    try {
        if (content !== null && content !== undefined) {
            if (typeof content === 'string') {
                this._entity.append(content);
            } else if (typeof content === 'number') {
                this._entity.append(content);
            } else if (content instanceof Util) {
                this._entity.appendChild(content.entity());
            } else if (content instanceof HTMLElement) {
                this._entity.appendChild(content);
            } else {
                throw 'content must be a string or number or Util or HTMLElement';
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
}

Util.prototype.appendFileElement = function (name, attributes) {
    return this.appendContent(Util.createFileElement(name, attributes));
};

Util.createFileElement = function (name, attributes) {
    return Util.create('div', (attributes['container'] || {}))
        .appendContent(
            Util.create('div', {
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
                },
                ...(attributes['subContainer'] || {})
            })
                .appendContent(
                    Util.create('input', {
                        ...{
                            'type': 'file',
                            'name': name,
                            'style': Util.objToStyle(
                                { 'width': 'calc(100% - 30px)' },
                            )
                        },
                        ...(attributes['input'])
                    })
                )
                .appendContent(
                    Util.create('button', {
                        ...{
                            'type': 'button',
                            'style': Util.objToStyle({
                                'width': '30px',
                                'height': '20px',
                                'display': 'flex',
                                'flex-flow': 'row nowrap',
                                'justify-content': 'center',
                                'align-items': 'center',
                                'font-size': '15px',
                                'font-weight': 'bold'
                            })
                        },
                        ...(attributes['removeButton'] || {})
                    })
                        .appendContent("✕")
                        .addEventHandler('click', (event) => { event.target.parentElement.parentElement.remove(); })
                )
        );
};

Util.prototype.appendFileGroup = function (name, attributes, initial, max) {
    this.appendContent(Util.createFileGroup(name, attributes, initial, max));
    return this;
};

Util.createFileGroup = function (name = '', attributes, initial, max) {

    let columnElementStyle = {
        'width': '100%',
        'display': 'flex',
        'flex-flow': 'column nowrap',
        'justify-content': 'flex-start',
        'align-items': 'flex-start'
    };

    let files = Util.create('div', {
        ...{ style: Util.objToStyle(columnElementStyle) },
        ...(attributes['files'] || {})
    });

    let addButton = Util.create('button', {
        ...{ type: 'button' },
        ...(attributes['addButton'] || {})
    })
        .appendContent("Add")
        .addEventHandler('click', (event) => {
            if (max == null || files.entity().children.length < max) {
                files.appendFileElement(name, {
                    ...{
                        container: { style: Util.objToStyle({ 'width': '100%', 'padding-bottom': '3px' }) }
                    },
                    ...(attributes['file'] || {})
                });
            }
        });

    new MutationObserver(() => {
        if (files.entity().children.length < max && addButton.style.display === 'none') {
            addButton.show();
        } else if (files.entity().children.length == max && addButton.style.display !== 'none') {
            addButton.hide();
        }
    }).observe(files.entity(), { attributes: !true, childList: true, subtree: true })

    for (let i = 0; i < initial; i++) {
        files.appendFileElement(name, {
            ...{
                container: { style: Util.objToStyle({ 'width': '100%', 'padding-bottom': '3px' }) }
            },
            ...(attributes['file'] || {})
        })
    }

    return Util.create('div', (attributes['container'] || {})).appendContent(
        Util.create('div', { ...{ style: Util.objToStyle(columnElementStyle) }, ...(attributes['subContainer'] || {}) })
            .appendContent(files)
            .appendContent(addButton)
    );
};

Util.prototype.appendSelect = function (items) {
    return this.appendContent(Util.createSelect(items));
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
}

Util.prototype.preventDefault = function (eventType) {
    this.addEventHandler(eventType, function (event) { event.preventDefault(); });
    return this;
}

Util.prototype.attr = function (name, assignment) {
    if (assignment == null) {
        return this._entity.getAttribute(name);
    } else {
        if (assignment == 'unset') {
            this._entity.removeAttribute(name);
        } else {
            this._entity.setAttribute(name, assignment);
        }
        return this;
    }
}

Util.prototype.css = function (name, assignment) {
    if (name == null) {
        return this.attr('style');
    } else {
        this.attr('style', this.attr('style') == null ? '' : this.attr('style'));
        let obj = Util.styleToObj(this.attr('style'));
        if (assignment == null) {
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
}

export { Util };
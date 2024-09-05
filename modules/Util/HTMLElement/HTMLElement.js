import { Util } from '../Util.js';

HTMLElement.prototype.hide = function () {
    if (this) {
        this.style.display = 'none';
    }
    return this;
};

HTMLElement.prototype.show = function () {
    if (this) {
        this.style.display = 'revert';
    }
    return this;
};

HTMLElement.prototype.clear = function () {
    this.innerHTML = '';
    return this;
};

HTMLElement.prototype.fireEvent = function (event) {
    this.dispatchEvent(new Event(event));
    return this;
};

HTMLElement.prototype.addEventListeners = function (events, func) {
    if (typeof events === 'string') {
        this.addEventListener(events, func);
    } else if (Array.isArray(events)) {
        events.forEach((event) => {
            if (typeof event === 'string') {
                this.addEventListener(event, func);
            } else {
                throw 'invalid events in input list:' + e;
            }
        });
    } else {
        throw 'invalid event input list:' + e;
    }
    return this;
};

HTMLElement.prototype.addEventListenersIf = function (events, func, bool) {
    if (bool) {
        this.addEventListeners(events, func);
    }
    return this;
};

HTMLElement.prototype.appendContent = function (content) {
    try {
        if (content !== null && content !== undefined) {
            if (typeof content === 'string') {
                this.append(content);
            } else if (typeof content === 'number') {
                this.append(content);
            } else if (content instanceof HTMLElement) {
                this.appendChild(content);
            } else {
                throw 'content must be a string or number or HTMLElement.';
            }
        }
    } catch (error) {
        throw ("@ appendContent(" + content + "): " + error);
    }
    return this;
};

HTMLElement.prototype.appendContentIf = function (content, condition = true) {
    try {
        if (condition) {
            this.appendContent(content);
        }
    } catch (error) {
        throw ("@ appendContentIf(" + content + "): " + error);
    }
    return this;
};

HTMLElement.prototype.appendContentOf = function (list, funcValue = function (item) { return item; }, funcCondition = function (item) { return true; }) {
    try {
        for (let item of list) {
            this.appendContentIf(funcValue(item), funcCondition(item));
        }
    } catch (error) {
        throw ("@ appendContentOf(" + list + ", " + func + "): " + error);
    }
}

HTMLElement.prototype.appendFileElement = function (name, attributes) {
    return this.appendContent(
        Util.newElement('div', (attributes['container'] || {}))
            .appendContent(
                Util.newElement('div', {
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
                        Util.newElement('input', {
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
                        Util.newElement('button', {
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
                            .addEventListeners('click', (event) => { event.target.parentElement.parentElement.remove(); })
                    )
            )
    );
};

HTMLElement.prototype.appendFileGroup = function (name, attributes, initial, max) {

    let columnElementStyle = {
        'width': '100%',
        'display': 'flex',
        'flex-flow': 'column nowrap',
        'justify-content': 'flex-start',
        'align-items': 'flex-start'
    };

    let files = Util.newElement('div', {
        ...{ style: Util.objToStyle(columnElementStyle) },
        ...(attributes['files'] || {})
    });

    let addButton = Util.newElement('button', {
        ...{ type: 'button' },
        ...(attributes['addButton'] || {})
    })
        .appendContent("Add")
        .addEventListeners('click', (event) => {
            if (max == null || files.children.length < max) {
                files.appendFileElement(name, {
                    ...{
                        container: { style: Util.objToStyle({ 'width': '100%', 'padding-bottom': '3px' }) }
                    },
                    ...(attributes['file'] || {})
                });
            }
        });

    new MutationObserver(() => {
        if (files.children.length < max && addButton.style.display === 'none') {
            addButton.show();
        } else if (files.children.length == max && addButton.style.display !== 'none') {
            addButton.hide();
        }
    }).observe(files, { attributes: !true, childList: true, subtree: true })

    for (let i = 0; i < initial; i++) {
        files.appendFileElement(name, {
            ...{
                container: { style: Util.objToStyle({ 'width': '100%', 'padding-bottom': '3px' }) }
            },
            ...(attributes['file'] || {})
        })
    }

    this.appendContent(
        Util.newElement('div', (attributes['container'] || {})).appendContent(
            Util.newElement('div', { ...{ style: Util.objToStyle(columnElementStyle) }, ...(attributes['subContainer'] || {}) })
                .appendContent(files)
                .appendContent(addButton)
        )
    );

    return this;
};

HTMLElement.prototype.preventDefault = function (eventType) {
    this.addEventListener(eventType, function (event) { event.preventDefault(); });
    return this;
}

HTMLElement.prototype.attr = function (name, assignment = null) {
    if (assignment == null) {
        return this.getAttribute(name);
    } else {
        if (assignment == 'unset') {
            this.removeAttribute(name);
        } else {
            this.setAttribute(name, assignment);
        }
        return this;
    }
}

HTMLElement.prototype.css = function (name = null, assignment = null) {
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
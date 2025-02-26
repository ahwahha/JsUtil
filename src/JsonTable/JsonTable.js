import { Util } from '../Util.js';

function JsonTable(c = null) {

    let body = Util.get('body')[0];
    let table;
    let shield;
    let controlGroup;
    let tableBody;
    let paginationGroup;
    let container = c instanceof Util ? c : new Util(c);
    let tableData = null;
    let originalTableData = null;
    let haveSelection = false;
    let haveRemoval = false;
    let edited = false;
    let inserted = false;
    let insertCount = 0;
    let tableDefaultSettings = {
        label: "",
        columns: [
            {
                header: "Header",
                data: "",
                filter: "",
                filterPlaceholder: "---",
                // modifier: (row) => { return 'data:' + JSON.stringify(row); }, //example
                headerStyle: {},
                filterStyle: {},
                rowsStyle: {},
                sortable: true,
                filterEditable: true,
                class: ""
            }
        ],
        sortedBy: '###row-index',
        ascending: true,
        start: 1,
        defaultStart: 1,
        end: 10,
        defaultEnd: 10,
        maxRows: 100,
        tableClass: 'jsonTable',
        buttonClass: 'button',
        showSelectingGroup: true,
        multiSelect: true,
        actionsGroupStyle: {},
        paginationGroupStyle: { 'width': '100%', 'text-align': 'center' },
        maxHeight: undefined,
        selectAllFiltered: 'Select all filtered',
        unselectAllFiltered: 'Unselect all filtered',
        selectAllInserted: 'Select all inserted',
        noOfSelected: 'No. of selected: ',
        noOfEdited: 'No. of edited: ',
        resetFilters: 'Reset filters',
        resetData: 'Reset data',
        resetSelectedData: 'Reset selected data',
        selectAllEdited: 'Select all edited',
        editFilter: 'Edit filter value:',
        toBegining: '<<',
        previousPage: Util.create('span', { style: 'padding:0px 8px;' }).appendContent('<'),
        nextPage: Util.create('span', { style: 'padding:0px 8px;' }).appendContent('>'),
        toEnding: '>>',
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
        },
        filtersStyle: {
            "width": "calc(100% - 2px)",
            "border-radius": "5px",
            "border": "hsl(0, 0%, 75%) solid 1px",
            "margin": "1px",
            "text-align": "center",
            "font-size": "11px",
            "overflow": "hidden",
            "cursor": "help"
        },
        rowsStyle: {
            "text-align": "center",
        },
        oddRowsStyle: {},
        evenRowsStyle: {
            "background-color": "hsl(0, 0%, 95%)"
        },
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
        },
        insertedStyle: {
            "background-image": "linear-gradient(to bottom, hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(160, 90%, 50%, 0.03), hsla(160, 90%, 50%, 0.05), hsla(160, 90%, 50%, 0.1), hsla(160, 90%, 50%, 0.15), hsla(160, 90%, 50%, 0.25), hsla(160, 90%, 50%, 0.5))",
        },
        removedStyle: {
            "text-decoration": "line-through",
            "text-decoration-color": "hsl(0, 80%, 50%)",
            "background-image": "linear-gradient(to bottom, hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, 0), hsla(0, 30%, 50%, 0.03), hsla(0, 30%, 50%, 0.05), hsla(0, 30%, 50%, 0.1), hsla(0, 30%, 50%, 0.15), hsla(0, 30%, 50%, 0.25), hsla(0, 30%, 50%, 0.5))"
        },
        filterDebounce: 500,
        sortingDebounce: 250,
        shieldRefreshGap: 100,
        filterFunction: function (data, filter) {
            try {
                if (data == null) {
                    // null
                    return false;
                } else if (typeof data === 'boolean') {
                    // boolean
                    return filter.trim() == '' ? true : (
                        Util.matchText(String(data), filter.trim(), '`', false)
                    );
                } else if (!isNaN(data)) {
                    // number
                    return filter.trim() == '' ? true : (
                        Util.match(data, filter.trim(), '`', filterNumbers)
                        || Util.matchText(String(data), filter.trim(), '`')
                    );
                } else if (isDateString(data)) {
                    // date
                    return filter.trim() == '' ? true : (
                        Util.match(data, filter.trim(), '`', filterDates)
                        || Util.matchText(String(data), filter.trim(), '`')
                    );
                } else {
                    // string
                    return filter.trim() == '' ? true : Util.matchText(typeof data === 'object' ? JSON.stringify(data) : String(data), filter.trim(), '`');
                }
            } catch (e) {
                // error
                return filter.trim() == '' ? true : Util.matchText(typeof data === 'object' ? JSON.stringify(data) : String(data), filter.trim(), '`');
            }
        },
        controlGroupEventHandlers: [],
        tableBodyEventHandlers: [],
        paginationGroupEventHandlers: [],
        onrefresh: null
    };

    let filterGuide = "Filtering Guide:\n\n"
        + "1. Boolean\n    'true' / 'false'\n\n"
        + "2. Numbers\n    '<' / '<=' / '=' / '>' / '>=' + (number string)\n\n"
        + "3. Dates\n    '<' / '<=' / '=' / '>' / '>=' + dd-MM-yyyy / yyyy-MM-dd / yyyy-MM-dd hh:mm / yyyy-MM-dd hh:mm:ss\n\n"
        + "4. Text\n    any successive characters that included\n\n"
        + "5. Combined conditions (of all above)\n"
        + "    String Separator: Space ( )\n"
        + "    Delimiter: Backtick (`)\n"
        + "    A condition clause:\n"
        + "        Include Strings: Space-separated strings that to be included.\n"
        + "        Exclude Strings: Space-separated strings that to be excluded, placed after a backtick (`) after the Include Strings.\n"
        + "        Strings between double quotes are treated as a single string (eg. \"mango tart\")\n"
        + "        example: (apple pear ` tart)\n"
        + "    Multiple Condition Clauses:\n"
        + "        multiple condition clauses separate by double backticks (``).\n"
        + "        example: (apple pear ` tart `` \"mango tart\")\n"
        + "    Example:\n"
        + "        data strings: [\"apple pie with pear\", \"apple tart with pear\", \"mango apple tart\", \"apple mango tart\", \"chocolate pie\"]\n	Filter: (apple pear ` tart `` \"mango tart\" `` choco)\n"
        + "        filtering result: [\"apple pie with pear\", \"mango tart\", \"chocolate pie\"]";

    let tableSettings;

    let filterNumbers = function (a, b) {
        if (isNaN(a)) {
            throw '@ filterNumber: NaN';
        } else if (b === '___' && (a == null || a.trim() == '')) {
            return true;
        } else {
            let ft = b.trim();
            let f1 = ft.substring(1).trim();
            let f2 = ft.substring(2).trim();
            if (ft.startsWith('<') && !isNaN(f1)) {
                return a < parseFloat(f1);
            } else if (ft.startsWith('<=') && !isNaN(f2)) {
                return a <= parseFloat(f2);
            } else if (ft.startsWith('=') && !isNaN(f1)) {
                return a == parseFloat(f1);
            } else if (ft.startsWith('>=') && !isNaN(f2)) {
                return a >= parseFloat(f2);
            } else if (ft.startsWith('>') && !isNaN(f1)) {
                return a > parseFloat(f1);
            } else {
                return Sting(a).trim().indexOf(ft);
            }
        }
    }

    let filterDates = function (a, b) {
        if (b === '___' && (a == null || a.trim() == '')) {
            return true;
        } else {
            let dt = a.trim();
            let ft = b.trim();
            let f1 = ft.substring(1).trim();
            let f2 = ft.substring(2).trim();
            if (ft.startsWith('<') && isDateString(f1)) {
                return parseDate(dt) < parseDate(f1);
            } else if (ft.startsWith('<=') && isDateString(f2)) {
                return parseDate(dt) <= parseDate(f2);
            } else if (ft.startsWith('=') && isDateString(f1)) {
                return parseDate(dt) == parseDate(f1);
            } else if (ft.startsWith('>=') && isDateString(f2)) {
                return parseDate(dt) >= parseDate(f2);
            } else if (ft.startsWith('>') && isDateString(f1)) {
                return parseDate(dt) > parseDate(f1);
            } else {
                return Sting(a).trim().indexOf(ft);
            }
        }
    }

    let setContainer = function (c) {
        if (container) {
            container.clear();
        }
        container = c instanceof Util ? c : new Util(c);
        return this;
    }

    let getTableSettings = function () { return tableSettings; }

    let setData = function (data) {
        try {
            edited = false;
            if (data != null) {
                data.forEach((row, index) => {
                    row['###row-index'] = index + 1;
                    row['###row-filtered'] = true;
                    row['###row-selected'] = false;
                    row['###row-edited'] = false;
                    row['###row-inserted'] = false;
                    row['###row-removed'] = false;
                });
                tableData = data;
                originalTableData = Util.clone(data);
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setData(" + data + "): " + error);
        }
    }

    let resetData = function () {
        try {
            tableData = Util.clone(originalTableData);
            edited = false;
            return this;
        } catch (error) {
            throw new Error("error caught @ resetData(): " + error);
        }
    }

    let insertData = function (data) {
        try {
            inserted = true;
            if (tableData != null && Array.isArray(tableData)) {
                if (Array.isArray(data)) {
                    data.forEach((item) => {
                        let row = {
                            ...item, ...{
                                '###row-index': -1 * ++insertCount,
                                '###row-filtered': false,
                                '###row-selected': false,
                                '###row-edited': false,
                                '###row-inserted': true,
                                '###row-removed': false
                            }
                        };
                        tableData.push(row);
                        originalTableData.push(Util.clone(row));
                    })
                } else {
                    let row = {
                        ...data, ...{
                            '###row-index': -1 * ++insertCount,
                            '###row-filtered': false,
                            '###row-selected': false,
                            '###row-edited': false,
                            '###row-inserted': true,
                            '###row-removed': false
                        }
                    };
                    tableData.push(row);
                    originalTableData.push(Util.clone(row));
                }
                edited = true;
                setEdited();
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ insertData(): " + error);
        }
    }

    let resetSelectedData = function () {
        try {
            let rows = getEdited(getSelected());
            for (let row of rows) {
                let oriRow = originalTableData.find(origDataRow => origDataRow['###row-index'] === row['###row-index']);
                if (tableData != null && Array.isArray(tableData)) {
                    let dataRow = tableData.find(dataRow => dataRow['###row-index'] === row['###row-index']);
                    Object.assign(dataRow, oriRow);
                }
            }
            setEdited();
            return this;
        } catch (error) {
            throw new Error("error caught @ resetSelectedData(): " + error);
        }
    }

    let setTableSettings = function (newSettings) {
        try {
            tableSettings = { ...tableDefaultSettings, ...newSettings };

            tableSettings['headersStyle'] = { ...tableDefaultSettings['headersStyle'], ...newSettings['headersStyle'] };
            tableSettings['filtersStyle'] = { ...tableDefaultSettings['filtersStyle'], ...newSettings['filtersStyle'] };
            tableSettings['rowsStyle'] = { ...tableDefaultSettings['rowsStyle'], ...newSettings['rowsStyle'] };
            tableSettings['oddRowsStyle'] = { ...tableDefaultSettings['oddRowsStyle'], ...newSettings['oddRowsStyle'] };
            tableSettings['evenRowsStyle'] = { ...tableDefaultSettings['evenRowsStyle'], ...newSettings['evenRowsStyle'] };
            tableSettings['editedStyle'] = { ...tableDefaultSettings['editedStyle'], ...newSettings['editedStyle'] };
            tableSettings['insertedStyle'] = { ...tableDefaultSettings['insertedStyle'], ...newSettings['insertedStyle'] };
            tableSettings['removedStyle'] = { ...tableDefaultSettings['removedStyle'], ...newSettings['removedStyle'] };

            for (let i = 0; i < tableSettings['columns'].length; i++) {
                tableSettings['columns'][i] = { ...tableDefaultSettings.columns[0], ...tableSettings['columns'][i] };
            }

            return this;
        } catch (error) {
            throw new Error("error caught @ setTableSettings(" + newSettings + "): " + error);
        }
    }

    let setSelected = function (index, selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-index'] === index ? { ...row, '###row-selected': selected } : row)
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setSelected(" + index + ", " + selected + "): " + error);
        }
    }

    let setRemoved = function (index, removed) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-index'] === index ? { ...row, ...{ '###row-removed': removed, '###row-selected': false } } : row)
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setRemoved(" + index + ", " + selected + "): " + error);
        }
    }

    let setAllSelected = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => ({ ...row, '###row-selected': row['###row-removed'] ? false : selected }));
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllSelected(" + selected + "): " + error);
        }
    }

    let setAllFilteredSelected = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-filtered'] ? { ...row, '###row-selected': row['###row-removed'] ? false : selected } : row);
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllFilteredSelected(" + selected + "): " + error);
        }
    }

    let setAllEditedSelected = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-edited'] ? { ...row, '###row-selected': row['###row-removed'] ? false : selected } : row);
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllFilteredSelected(" + selected + "): " + error);
        }
    }

    let setAllInsertedSelected = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-inserted'] ? { ...row, '###row-selected': row['###row-removed'] ? false : selected } : row);
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllInsertedSelected(" + selected + "): " + error);
        }
    }

    let deepFilter = function (arr, predicate) {
        try {
            if (arr != null && Array.isArray(arr)) {
                let filteredArr = [];
                for (let obj of arr) {
                    if (predicate(obj)) {
                        filteredArr.push(Util.clone(obj));
                    }
                }
                return filteredArr;
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ deepFilter(" + arr + ", " + predicate + "): " + error);
        }
    }

    let setEdited = function (arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                edited = false;
                for (let i = 0; i < arr.length; i++) {
                    let row = arr[i];
                    let oriRow = originalTableData.find(origDataRow => origDataRow['###row-index'] === row['###row-index']);
                    let isEdited = false;
                    for (let key in row) {
                        if (!key.startsWith('###row-') && !key.startsWith('###ori-')) {
                            if ((typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key]) != (typeof oriRow[key] === 'object' ? JSON.stringify(oriRow[key]) : oriRow[key])) {
                                isEdited = true;
                                break;
                            }
                        }
                    }
                    row['###row-edited'] = isEdited;
                    edited = !(!edited && !isEdited);
                }
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setEdited(): " + error.toString());
        }
    }

    let getData = function () {
        try {
            return tableData;
        } catch (error) {
            throw new Error("error caught @ getData(): " + error.toString());
        }
    }

    let getSelected = function (bool = true, arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                return deepFilter(arr, row => bool ? row['###row-selected'] : !row['###row-selected']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getSelected(): " + error.toString());
        }
    }

    let getFiltered = function (bool = true, arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                return deepFilter(arr, row => bool ? row['###row-filtered'] : !row['###row-filtered']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getFiltered(): " + error.toString());
        }
    }

    let getRemoved = function (bool = true, arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                let temp = deepFilter(
                    deepFilter(
                        arr
                        , row => bool ? row['###row-removed'] : !row['###row-removed']
                    )
                    , row => (bool ? !row['###row-inserted'] : true)
                );
                for (let item of temp) {
                    for (let key of Object.keys(item)) {
                        if (!key.startsWith('###ori-') && item['###ori-' + key]) {
                            item[key] = item['###ori-' + key];
                        }
                    };
                }
                return JsonTable.cleanKeys(temp);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getRemoved(): " + error.toString());
        }
    }

    let getInserted = function (bool = true, arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                let temp = deepFilter(
                    deepFilter(
                        arr
                        , row => bool ? row['###row-inserted'] : !row['###row-inserted']
                    )
                    , row => !row['###row-removed']
                );
                return JsonTable.cleanKeys(temp);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getInserted(): " + error.toString());
        }
    }

    let getEdited = function (bool = true, arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                setEdited(arr);
                let temp = deepFilter(
                    deepFilter(
                        deepFilter(
                            arr
                            , row => bool ? row['###row-edited'] : !row['###row-edited']
                        )
                        , row => !row['###row-removed']
                    )
                    , row => !row['###row-inserted']
                );
                let output = [];
                for (let item of temp) {
                    let obj = { ori: {}, current: {} };
                    for (let key of Object.keys(item)) {
                        if (!key.startsWith('###')) {
                            obj.ori[key] = item.hasOwnProperty('###ori-' + key) ? item['###ori-' + key] : item[key];
                            obj.current[key] = item[key];
                        }
                    }
                    output.push(obj);
                }
                return output;
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getEdited(): " + error.toString());
        }
    }

    let sortAsOriginal = function () {
        try {
            setSorting('###row-index', true);
            return this;
        } catch (error) {
            throw new Error("error caught @ sortAsOriginal(): " + error);
        }
    }

    let filterRows = function () {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData.forEach((row) => {
                    if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        let isFiltered = true;
                        for (let col of tableSettings['columns']) {
                            let data = row[col['data']] == null ? '' : typeof row[col['data']] === 'object' ? JSON.stringify(row[col['data']]) : row[col['data']];
                            let filter = col['filter'] == null ? '' : typeof col['filter'] === 'object' ? JSON.stringify(col['filter']) : col['filter'];
                            let matching = tableSettings['filterFunction'](data, filter);
                            if (!matching) {
                                isFiltered = false;
                                break;
                            }
                        }
                        row["###row-filtered"] = isFiltered;
                    }
                });
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ filterRows(): " + error);
        }
    }

    let setSorting = function (data, order) {
        tableSettings['sortedBy'] = data;
        tableSettings['ascending'] = order;
        return this;
    }

    let sortRows = function () {
        try {
            let dataList = Array.isArray(tableSettings['sortedBy']) ? tableSettings['sortedBy'] : [tableSettings['sortedBy']];
            let order = tableSettings['ascending'];
            if (tableData != null && Array.isArray(tableData) && dataList.length > 0) {
                let sortedData = null;
                for (let data of [...dataList].reverse()) {
                    sortedData = tableData.sort((a, b) => {
                        if (a[data] == null || b[data] == null) {
                            // null exists
                            if (a[data] == null && b[data] == null) {
                                return 0;
                            } else {
                                return order ? (a[data] == null ? 1 : -1) : (a[data] == null ? -1 : 1);
                            }
                        } else if (typeof a[data] === 'boolean' && typeof b[data] === 'boolean') {
                            // both boolean
                            if (a[data] == b[data]) {
                                return 0;
                            } else {
                                return order ? (a[data] ? 1 : -1) : (a[data] ? -1 : 1);
                            }
                        } else if (a[data] != '' && b[data] != '' && !isNaN(a[data]) && !isNaN(b[data])) {
                            // both number
                            if (parseFloat(a[data]) == parseFloat(b[data])) {
                                return 0;
                            } else {
                                return order ? parseFloat(a[data]) - parseFloat(b[data]) : parseFloat(b[data]) - parseFloat(a[data]);
                            }
                        } else if (typeof a[data] === 'object' && typeof b[data] === 'object') {
                            // both object
                            let va = JSON.stringify(a[data]);
                            let vb = JSON.stringify(b[data]);
                            if (va == vb) {
                                return 0;
                            } else {
                                return order ? va - vb : vb - va;
                            }
                        } else {
                            // else treat as strings
                            let va = String(a[data]);
                            let vb = String(b[data]);
                            if (isDateString(va) && isDateString(vb)) {
                                console.log();
                                let aNumber = parseDate(va);
                                let bNumber = parseDate(vb);
                                if (!isNaN(aNumber) && !isNaN(bNumber)) {
                                    return order ? aNumber - bNumber : bNumber - aNumber;
                                }
                            } else {
                                return order ? va.localeCompare(vb) : vb.localeCompare(va);
                            }
                        }
                        return 0;
                    });
                }
                tableData = sortedData;
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ sort(" + tableSettings['sortedBy'] + ", " + order + "): " + error);
        }
    }

    let isDateString = function (value) {
        try {
            return !isNaN(parseDate(value));
        } catch (error) {
            throw new Error("error caught @ isDateString(" + value + "): " + error);
        }
    }

    let parseDate = function (value) {
        try {
            let date = new Date(value);
            return date.getTime();
        } catch (error) {
            return NaN;
        }
    }


    let setStart = function (start) {
        try {
            let rowNumber = parseInt(start);
            if (!Number.isNaN(rowNumber)) {
                tableSettings = {
                    ...tableSettings
                    , start: Math.max(
                        //lower bound
                        Math.min(
                            rowNumber,
                            tableSettings['end']
                        ),
                        //maximum possible
                        Math.max(
                            (getFiltered().length === 0 ? 0 : 1),
                            tableSettings['end'] - tableSettings['maxRows'] + 1
                        )
                    )
                };
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ setStart(" + start + ") - " + err);
        }
    }

    let setEnd = function (end) {
        try {
            let rowNumber = parseInt(end);
            if (!Number.isNaN(rowNumber)) {
                tableSettings = {
                    ...tableSettings
                    , end: Math.min(
                        //lower bound
                        Math.max(
                            rowNumber,
                            tableSettings['start']
                        ),
                        //minimum possible
                        Math.min(
                            getFiltered().length,
                            tableSettings['start'] + tableSettings['maxRows'] - 1
                        )
                    )
                };
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ setEnd(" + end + ") - " + err);
        }
    }

    let toBegining = function () {
        try {
            let length = tableSettings['end'] - tableSettings['start'] + 1;
            tableSettings['start'] = getFiltered().length === 0 ? 0 : 1;
            tableSettings['end'] = Math.min(getFiltered().length, tableSettings['start'] + length - 1);
            return this;
        } catch (err) {
            throw new Error("error caught @ toBegining() - " + err);
        }
    }

    let priviousPage = function () {
        try {
            if (tableData != null && Array.isArray(tableData) && tableSettings != null) {
                let length = tableSettings['end'] - tableSettings['start'] + 1;
                tableSettings['start'] = Math.max(getFiltered().length === 0 ? 0 : 1, tableSettings['start'] - length);
                tableSettings['end'] = Math.min(tableData.length, tableSettings['start'] + length - 1);
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ priviousPage() - " + err);
        }
    }

    let nextPage = function () {
        try {
            if (tableSettings != null) {
                let length = tableSettings['end'] - tableSettings['start'] + 1;
                tableSettings['end'] = Math.min(getFiltered().length, tableSettings['end'] + length);
                tableSettings['start'] = Math.max(1, tableSettings['end'] - length + 1);
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ nextPage() - " + err);
        }
    }

    let toEnding = function () {
        try {
            if (tableSettings != null) {
                let length = tableSettings['end'] - tableSettings['start'] + 1;
                tableSettings['end'] = getFiltered().length;
                tableSettings['start'] = Math.max(1, tableSettings['end'] - length + 1);
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ priviousPage() - " + err);
        }
    }

    let createSelectBox = function (row) {
        try {
            if (!haveSelection) {
                haveSelection = true;
            }
            let output = Util.create('input', { ...{ type: 'checkbox' }, ...(row['###row-selected'] ? { checked: '' } : {}) })
                .addEventHandler('click', async (event) => {
                    await shieldOn();
                    if (typeof tableSettings['multiSelect'] === "boolean" && !tableSettings['multiSelect']) {
                        setAllSelected(false);
                    }
                    setSelected(row['###row-index'], event.target.checked);
                    refreshTable();
                });
            return output;
        } catch (error) {
            throw new Error("error caught @ createSelectBox(" + row + "): " + error);
        }
    }

    let createRemoveBox = function (row) {
        try {
            if (!haveRemoval) {
                haveRemoval = true;
            }
            let output = Util.create('input', { ...{ type: 'checkbox' }, ...(row['###row-removed'] ? { checked: '' } : {}) })
                .addEventHandler('click', async (event) => {
                    await shieldOn();
                    setRemoved(row['###row-index'], event.target.checked);
                    refreshTable();
                });
            return output;
        } catch (error) {
            throw new Error("error caught @ createRemoveBox(" + row + "): " + error);
        }
    }

    let createSelectingGroup = function () {
        let output = null;
        try {
            if (tableData != null && Array.isArray(tableData)) {
                let selectedRows = tableData.filter(row => row['###row-selected']);
                let noOfSelected = selectedRows.length;
                if (tableSettings['multiSelect'] == true && haveSelection) {
                    output = Util.create('div', { style: Util.objToStyle({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                        .appendContent(
                            Util.create('div', (noOfSelected > 0 ? {} : { style: 'display:none' }))
                                .appendContent(tableSettings.noOfSelected + noOfSelected.toString())
                        )
                        .appendContent(
                            Util.create('div', { style: Util.objToStyle({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                                .appendContent(
                                    Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventHandler('click', async (event) => { await shieldOn(); setAllFilteredSelected(true); refreshTable(); })
                                        .appendContent(tableSettings.selectAllFiltered)
                                )
                                .appendContent(
                                    Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventHandler('click', async (event) => { await shieldOn(); setAllFilteredSelected(false); refreshTable(); })
                                        .appendContent(tableSettings.unselectAllFiltered)
                                )
                                .appendContentIf(
                                    Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventHandler('click', async (event) => { await shieldOn(); setAllEditedSelected(true); refreshTable(); })
                                        .appendContent(tableSettings.selectAllEdited)
                                    , edited
                                )
                                .appendContentIf(
                                    Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventHandler('click', async (event) => { await shieldOn(); setAllInsertedSelected(true); refreshTable(); })
                                        .appendContent(tableSettings.selectAllInserted)
                                    , inserted
                                )
                        );
                }
            }
            return output;
        } catch (err) {
            throw new Error("error caught @ createSelectingGroup() - " + err);
        }
    }

    let createResetFiltersButton = function () {
        let output = null;
        if (tableSettings != null) {
            try {
                output = Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                    .addEventHandler('click', async (event) => { await shieldOn(); resetFilters(); filterRows(); refreshTable(true); })
                    .appendContent(tableSettings.resetFilters);
            } catch (err) {
                throw new Error("error caught @ createResetFiltersButton() - " + err);
            }
        }
        return output;
    }

    let createEditedGroup = function () {
        let output = null;
        if (tableData != null && Array.isArray(tableData) && tableSettings != null) {
            try {
                let editedRows = tableData.filter(row => row['###row-edited']);
                let noOfEdited = editedRows.length;
                output = Util.create('div', { style: Util.objToStyle({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                    .appendContentIf(
                        tableSettings.noOfEdited + noOfEdited
                        , edited
                    )
                    .appendContentIf(
                        Util.create('div', { style: Util.objToStyle({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                            .appendContent(
                                Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventHandler('click', async (event) => { await shieldOn(); resetData(); refreshTable(); })
                                    .appendContent(tableSettings.resetData)
                            )
                            .appendContent(
                                Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventHandler('click', async (event) => { await shieldOn(); resetSelectedData(); refreshTable(); })
                                    .appendContent(tableSettings.resetSelectedData)
                            )
                        , edited
                    );
            } catch (err) {
                throw new Error("error caught @ createSelectingGroup() - " + err);
            }
        }
        return output;
    }

    let createPaginationGroup = function () {
        let output = null;
        if (tableData != null && Array.isArray(tableData) && tableSettings != null) {
            try {
                output = Util.create('div', { style: Util.objToStyle(tableSettings['paginationGroupStyle']) })
                    .appendContent(
                        Util.create('div', { style: Util.objToStyle({ 'width': '100%', 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'center', 'align-items': 'center', 'column-gap': '3px' }) })
                            .appendContent(
                                Util.create('div')
                                    //toBeginingButton
                                    .appendContent(
                                        Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', async (event) => { await shieldOn(); toBegining(); refreshTable(); })
                                            .appendContent(tableSettings['toBegining'])
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.create('span', { style: "border: 1px solid #AAAAAA; margin-left:5px;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', async (event) => { await shieldOn(); priviousPage(); refreshTable(); })
                                            .appendContent(tableSettings['previousPage'])
                                    )
                            )
                            .appendContent(
                                Util.create('div')
                                    //startInput
                                    .appendContent(
                                        Util.create('input', {
                                            type: 'text',
                                            style: Util.objToStyle({
                                                'text-align': 'center',
                                                'padding': '3px 8px',
                                                'width': (Math.max(1, Math.ceil(Math.log10(tableData.length + 1))) * 8 + 20) + 'px'
                                            }),
                                            value: tableSettings['start']
                                        }).addEventHandler('change', async (event) => { await shieldOn(); setStart(event.target.value); refreshTable(); })
                                    )
                                    .appendContent(
                                        Util.create('span', { style: 'margin: 0px 5px;' })
                                            .appendContent('-')
                                    )
                                    //endInput
                                    .appendContent(
                                        Util.create('input', {
                                            type: 'text',
                                            style: Util.objToStyle({
                                                'text-align': 'center',
                                                'padding': '3px 8px',
                                                'width': (Math.max(1, Math.ceil(Math.log10(tableData.length + 1))) * 8 + 20) + 'px'
                                            }),
                                            value: tableSettings['end']
                                        }).addEventHandler('change', async (event) => { await shieldOn(); setEnd(event.target.value); refreshTable(); })
                                    )
                                    .appendContent(
                                        Util.create('span', { style: 'margin: 0px 5px;' })
                                            .appendContent('/')
                                    )
                                    .appendContent(getFiltered().length)
                            )
                            .appendContent(
                                Util.create('div')
                                    //toBeginingButton
                                    .appendContent(
                                        Util.create('span', { style: "border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', async (event) => { await shieldOn(); nextPage(); refreshTable(); })
                                            .appendContent(tableSettings['nextPage'])
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.create('span', { style: "border: 1px solid #AAAAAA; margin-left:5px;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .preventDefault('click')
                                            .addEventHandler('click', async (event) => { await shieldOn(); toEnding(); refreshTable(); })
                                            .appendContent(tableSettings['toEnding'])
                                    )
                            )
                    );
            } catch (err) {
                throw new Error("error caught @ createPaginationGroup() - " + err);
            }
        }
        return output;
    }

    let setFilter = function (index, value) {
        try {
            if (tableSettings != null && tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                tableSettings['columns'][index]['filter'] = value;
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ setFilter(" + index + ", " + value + ") - " + err);
        }
    }

    let resetFilters = function () {
        try {
            if (tableSettings != null && tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                tableSettings['columns'].forEach((col) => {
                    col['filter'] = "";
                });
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ resetFilters() - " + err);
        }
    }

    let resetPageNumbers = function () {
        try {
            if (tableSettings != null) {
                let length = tableSettings['end'] - tableSettings['start'] + 1;
                let start = getFiltered().length === 0 ? 0 : 1;
                let end = Math.max(length, tableSettings['defaultEnd']);
                tableSettings['start'] = start;
                tableSettings['end'] = end;
                setStart(start);
                setEnd(end);
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ resetPageNumbers() - " + err);
        }
    }

    let editData = function (index, data, value) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                let row = tableData.find((row) => {
                    return row['###row-index'] === index;
                });
                if ((typeof row[data] === 'object' ? JSON.stringify(row[data]) : String(row[data])) != (typeof value === 'object' ? JSON.stringify(value) : String(value))) {
                    if (row['###ori-' + data] === undefined) {
                        row['###ori-' + data] = row[data] || '';
                    } else if (row['###ori-' + data] === value) {
                        delete row['###ori-' + data];
                    }
                    row[data] = value;
                    setEdited([row]);
                }
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ editData(" + index + ", " + data + ", " + value + "): " + err);
        }
    }

    let stringToAscii = function (str) {
        try {
            let ascii = "";
            for (let i = 0; i < str.length; i++) {
                let charCode = str.charCodeAt(i);
                ascii += "&#" + charCode + ";";
            }
            return ascii;
        } catch (err) {
            throw new Error("error caught @ stringToAscii(" + str + "): " + err);
        }
    }

    let filters;
    let createTable = function () {
        let output = null;
        if (true || (tableData != null && Array.isArray(tableData) && tableSettings != null)) {
            try {
                let tbody = Util.create('tbody', null);

                let selectSortedBy = async function (col) {
                    await shieldOn();
                    setSorting(col['data'], (tableSettings['sortedBy'] === col['data'] ? !tableSettings['ascending'] : tableSettings['ascending']));
                    refreshTable();
                }

                let amendSortedBy = async function (col) {
                    let list = Array.isArray(tableSettings['sortedBy']) ? tableSettings['sortedBy'] : [tableSettings['sortedBy']];
                    list = list.includes(col['data']) ? list.filter(item => item != col['data']) : [...new Set([...list, col['data']])];
                    await shieldOn();
                    setSorting(list, tableSettings['ascending']);
                    refreshTable();
                }

                let removeSortedBy = async function () {
                    await shieldOn();
                    setSorting(undefined, tableSettings['ascending']);
                    refreshTable();
                }

                /* headers */
                try {
                    if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        let headers = Util.create('tr', null);
                        tableSettings['columns'].forEach((col) => {
                            let headerStyle = { ...(tableSettings['headersStyle'] || {}), ...(col['headerStyle'] || {}) };
                            headers.appendContent(
                                Util.create('td', { class: col['class'] })
                                    .appendContent(
                                        Util.create('div', {
                                            tabindex: '0',
                                            style: Util.objToStyle(headerStyle),
                                            class: tableSettings['tableClass'] + ' ' + 'sort-header ' + (tableSettings['sortedBy'] === col['data'] ? 'sorting' : '')
                                        }).appendContent(
                                            Util.create('div', { style: 'flex:1;' })
                                        ).appendContent(
                                            col.header + ((Array.isArray(tableSettings['sortedBy']) ? tableSettings['sortedBy'] : [tableSettings['sortedBy']]).includes(col['data']) ? (tableSettings['ascending'] ? '▲' : '▼') : '')
                                        ).appendContent(
                                            Util.create('div', { style: 'flex:1;' })
                                        ).appendContent(
                                            Util.create('div', { style: 'position:absolute; left: 0px; top: 0px; width: 100%; height:100%; z-index: 999;' })
                                                .countClicks([
                                                    async function (event) { if (col['sortable']) { if (body.keys.length == 1 && body.keys[0] == 'Control') { await amendSortedBy(col); } else { await selectSortedBy(col); } } },
                                                    async function (event) { if (col['sortable']) { await amendSortedBy(col); } },
                                                    async function (event) { await removeSortedBy() }
                                                ], tableSettings['sortingDebounce'])
                                        )
                                    )
                            );
                        });
                        tbody.appendContent(headers);
                    }
                } catch (e) {
                    throw '@ headers: ' + e
                }

                /* filters */
                try {
                    if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        filters = Util.create('tr', null);
                        let overlay;
                        tableSettings['columns'].forEach((col) => {
                            let filterStyle = Util.objToStyle({ ... { ...(tableSettings['filtersStyle'] || {}), ...(col['filterStyle'] || {}) }, ...(col['filterEditable'] ? {} : { 'background-color': '#DDD' }) });
                            let filterValue = col['filter'] || '';
                            col['filterElement'] = Util.create('input', {
                                ...{ style: 'display:block; ' + filterStyle, value: filterValue, placeholder: (col['filterPlaceholder'] || '') }
                                , ...(col['filterEditable'] ? {} : { 'disabled': 'true' })
                            }).addEventHandler('dblclick', (e) => {
                                e.preventDefault();
                                Util.get('html')[0].appendContent(
                                    overlay = Util.create('div', { "style": Util.objToStyle({ 'position': 'fixed', 'top': '0px', 'left': '0px', 'width': '100%', 'height': '100%', 'z-index': '9998', 'background-color': 'hsla(0, 100%, 0%, 0.1)', 'display': 'flex', 'flex-flow': 'column nowrap', 'justify-content': 'center', 'align-items': 'center' }) })
                                        .appendContent(
                                            Util.create('textarea', { style: "padding:10px; background-color:#FFF; width:800px; height:410px; font-size:85%; border:1px solid #AAA;" })
                                                .appendContent(filterGuide)
                                        )
                                        .appendContent(
                                            Util.create('span', { style: "margin-top: 20px; background-color: #fff; padding: 5px;" })
                                                .appendContent('Click to close')
                                        )
                                        .appendContent(
                                            Util.create('span', { style: Util.objToStyle({ 'position': 'fixed', 'top': '0px', 'left': '0px', 'width': '100%', 'height': '100%', 'z-index': '9999' }) })
                                                .addEventHandler('click', (e) => { e.preventDefault(); overlay.remove(); })
                                        )
                                )
                            });
                            filters.appendContent(Util.create('td', { class: col['class'] }).appendContent(col['filterElement']));
                        });
                        tbody.appendContent(filters);
                    }
                } catch (e) {
                    throw '@ filters: ' + e
                }

                /* rows */
                try {
                    let start = tableSettings['start'];
                    let end = tableSettings['end'];
                    let filteredData = getFiltered();
                    if (filteredData != null && Array.isArray(filteredData) && tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        filteredData.slice(start - 1, end).forEach((row, index) => {
                            try {
                                let rowsStyle = (col) => {
                                    return { ...(tableSettings.rowsStyle || ''), ...(col.rowsStyle || '') };
                                };
                                let oddEvenRowsStyle = (index % 2 === 1 ? tableSettings.evenRowsStyle : tableSettings.oddRowsStyle);
                                let tableRow = null;
                                if (!row['###row-removed']) {
                                    try {
                                        tableRow = Util.create('tr', { style: Util.objToStyle({ ...oddEvenRowsStyle, ...(row['###row-inserted'] ? tableSettings.insertedStyle : {}) }) });

                                        tableSettings['columns'].forEach((col) => {
                                            let cellData = row[col['data']] != null ? (typeof row[col['data']] === 'object' ? JSON.stringify(row[col['data']]) : String(row[col['data']])) : '';
                                            let oriData = row['###ori-' + col['data']];
                                            if (col.modifier) {
                                                try {
                                                    if (typeof col.modifier === 'function') {
                                                        let clone = Object.assign({}, row);
                                                        cellData = col.modifier(clone);
                                                    }
                                                } catch (e) {
                                                    throw "@ col.modifier: " + e;
                                                }
                                            }
                                            let t;
                                            let showOri = row['###row-edited'] && oriData !== undefined;
                                            tableRow.appendContent(
                                                Util.create('td', { class: col['class'], style: Util.objToStyle(rowsStyle(col)) })
                                                    .appendContent(cellData)
                                                    .appendContentIf(Util.create('br'), showOri)
                                                    .appendContentIf(
                                                        t = Util.create('textarea', { style: Util.objToStyle({ ...rowsStyle(col), ...tableSettings.editedStyle }) }).attr('readonly', '')
                                                            .appendContent('(' + (typeof oriData === 'string' ? '"' + oriData + '"' : JSON.stringify(oriData)) + ')')
                                                            .addEventHandler(['focus', 'blur'], () => {
                                                                t.css('height', '0px').css('height', t.entity().scrollHeight + 2 + 'px')
                                                            }),
                                                        showOri
                                                    )
                                            )
                                        });
                                    } catch (e) {
                                        throw '@ not ###row-removed: ' + e;
                                    }
                                } else {
                                    try {
                                        tableRow = Util.create('tr', { style: Util.objToStyle({ ...oddEvenRowsStyle, ...tableSettings.removedStyle }) });
                                        tableSettings['columns'].forEach((col) => {
                                            try {
                                                let cellData = row[col['data']] !== undefined ? (typeof row[col['data']] === 'object' ? JSON.stringify(row[col['data']]) : String(row[col['data']])) : '';
                                                if (col['data'] === '###row-removed') {
                                                    if (typeof col.modifier === 'function') {
                                                        let clone = Object.assign({}, row);
                                                        cellData = col.modifier(clone);
                                                    }
                                                } else if (col['data'] === '###row-selected') {
                                                    cellData = "";
                                                }
                                                tableRow.appendContent(
                                                    Util.create('td', { class: col['class'], style: Util.objToStyle(rowsStyle(col)) })
                                                        .appendContent(
                                                            Util.create('span')
                                                                .appendContent(cellData)
                                                        )
                                                )
                                            } catch (e) {
                                                throw "@ col['data'] = " + col['data'] + ': ' + e;
                                            }
                                        });
                                    } catch (e) {
                                        throw '@ ###row-removed: ' + e;
                                    }
                                }
                                tbody.appendContent(tableRow);
                            } catch (e) {
                                throw '@ index ' + index + ', content: ' + e;
                            }
                        });
                    }
                } catch (e) {
                    throw '@ rows: ' + e
                }

                try {
                    table = output = Util.create('div', { style: Util.objToStyle({ 'position': 'relative', 'width': '100%', 'display': 'flex', 'flex-flow': 'column nowrap', 'justify-content': 'flex-start', 'align-items': 'center', 'row-gap': '3px', 'background-color': '#fff' }) })
                        .appendContent(
                            controlGroup = Util.create('div', { style: Util.objToStyle({ 'width': '100%', 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                                .appendContent(Util.create('div').appendContent(tableSettings['label']))
                                .appendContent(Util.create('div', { style: 'flex:1' }))
                                .appendContent(
                                    Util.create('div', { style: Util.objToStyle(tableSettings['actionsGroupStyle']) }).appendContent(
                                        Util.create('div', { style: Util.objToStyle({ display: 'flex', 'flex-flow': (edited ? "column" : "row") + ' wrap', 'justify-content': 'flex-start', 'align-items': 'flex-end', 'column-gap': '3px' }) })
                                            .appendContentIf(createSelectingGroup(), tableSettings['showSelectingGroup'])
                                            .appendContent(createEditedGroup())
                                            .appendContent(createResetFiltersButton())
                                    )
                                )
                        )
                        .appendContent(
                            tableBody = Util.create('div', {
                                style: 'width:100%;overflow:auto;' + (tableSettings['maxHeight'] ? " max-height:" + tableSettings['maxHeight'] + ";" : "")
                            }).appendContent(
                                Util.create('table', {
                                    style: Util.objToStyle({
                                        'width': '100%',
                                        'height': 'min-content',
                                        'border-collapse': 'collapse'
                                    })
                                }).appendContent(tbody))
                        )
                        .appendContent(
                            paginationGroup = createPaginationGroup()
                        )
                        .css('position', 'relative')
                        .appendContent(shield = Util.create('span', { style: "position:absolute; left: 0px; top: 0px; width: 100%; height:100%; z-index: 999; display:none;" })
                            .css('background-color', 'hsla(0, 100%, 0%, 0.1)')
                        );
                } catch (e) {
                    throw '@ output: ' + e
                }
            } catch (err) {
                throw new Error("error caught @ createTable(): " + err);
            }
        }
        return output;
    }

    let refreshTable = function (resetPage = false) {
        try {
            if (container != null) {
                sortRows();
                filterRows();
                if (resetPage) { resetPageNumbers(); }
                container.clear().appendContent(createTable());
                loadHandlers();
                if (typeof tableSettings['onrefresh'] === 'function') {
                    tableSettings['onrefresh']();
                }
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ refreshTable(): " + err);
        }
    }

    let loadHandlers = function () {
        let events = ['keyup', 'dragend'];
        if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
            for (let col of tableSettings['columns']) {
                let element = col['filterElement'];
                if (element) {
                    element.addEventHandler(events, () => {
                        setFilter(tableSettings['columns'].indexOf(col), element.entity().value);
                        filters.debounce(
                            (event) => {
                                //cursor position
                                let selectionStart = element.entity().selectionStart;
                                let selectionEnd = element.entity().selectionEnd;

                                //refresh table
                                filterRows();
                                refreshTable(true);

                                //set cursor position
                                let e = tableSettings['columns'][tableSettings['columns'].indexOf(col)]['filterElement'].entity();
                                element.entity(e);
                                e.setSelectionRange(selectionStart, selectionEnd);
                                e.focus();
                            }
                            , tableSettings.filterDebounce);
                    });
                }
            }
        }
        if (tableSettings['controlGroupEventHandlers'] != null && Array.isArray(tableSettings['controlGroupEventHandlers'])) {
            for (let handler of tableSettings['controlGroupEventHandlers']) {
                controlGroup.addEventHandler(handler['event'], handler['function']);
            }
        }
        if (tableSettings['tableBodyEventHandlers'] != null && Array.isArray(tableSettings['tableBodyEventHandlers'])) {
            for (let handler of tableSettings['tableBodyEventHandlers']) {
                controlGroup.addEventHandler(handler['event'], handler['function']);
            }
        }
        if (tableSettings['paginationGroupEventHandlers'] != null && Array.isArray(tableSettings['paginationGroupEventHandlers'])) {
            for (let handler of tableSettings['paginationGroupEventHandlers']) {
                controlGroup.addEventHandler(handler['event'], handler['function']);
            }
        }
    }

    let shieldOn = async function () {
        try {
            shield.show();
        } catch (e) { } finally {
            await Util.deferExec(tableSettings['shieldRefreshGap']); // to refresh rendering before exit
        }
        return this;
    }

    let shieldOff = function () {
        try {
            shield.hide();
        } catch (e) { }
        return this;
    }

    body.holdKeys();

    return {
        setData, getData, resetData, insertData,
        setTableSettings, getTableSettings, sortAsOriginal,
        getSelected, getFiltered, getEdited, getInserted, getRemoved,
        createSelectBox, createRemoveBox, editData, setContainer, refreshTable,
        shieldOn, shieldOff
    };

}

/**
 * remove all properties with keys starting with '###row-' and '###ori-' from input array
 * @param {*} arr array of objects
 * @returns 
 */
JsonTable.cleanKeys = function (arr) {
    try {
        let output = JsonTable.removeKeys(arr, '###%');
        return output;
    } catch (error) {
        throw new Error("error caught @ removeKeys(" + JSON.stringify(arr) + "): " + error.toString());
    }
}

/**
 * remove all properties with keys specified in the parameter 'keys' from input array 'arr'
 * @param {*} arr array of objects
 * @param {*} keys [String] or [String][]
 * @returns 
 */
JsonTable.removeKeys = function (arr, keys) {
    try {
        if (arr != null && Array.isArray(arr)) {
            if (typeof keys === 'string') {
                if (keys.endsWith('%')) {
                    let prefix = keys.slice(0, -1);
                    for (let i = 0; i < arr.length; i++) {
                        for (let key in arr[i]) {
                            if (key.startsWith(prefix)) {
                                delete arr[i][key];
                            }
                        }
                    }
                } else {
                    for (let i = 0; i < arr.length; i++) {
                        delete arr[i][keys];
                    }
                }
            } else if (Array.isArray(keys)) {
                for (let i = 0; i < arr.length; i++) {
                    for (let j = 0; j < keys.length; j++) {
                        if (keys[j].endsWith('%')) {
                            let prefix = keys[j].slice(0, -1);
                            for (let key in arr[i]) {
                                if (key.startsWith(prefix)) {
                                    delete arr[i][key];
                                }
                            }
                        } else {
                            delete arr[i][keys[j]];
                        }
                    }
                }
            } else {
                throw new Error("keys argument must be a string or an array of strings");
            }
        }
        return arr;
    } catch (error) {
        throw new Error("error caught @ removeKeys(" + JSON.stringify(arr) + ", " + JSON.stringify(keys) + "): " + error.toString());
    }
}

export { JsonTable };
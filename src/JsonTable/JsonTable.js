import { Util } from '../Util.js';

function JsonTable(c = null, kh = null) {

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
        tableClass: '',
        buttonClass: '',
        headersClass: '',
        filtersClass: '',
        actionsGroupClass: 'actionsGroup',
        showSelectingGroup: true,
        multiSelect: true,
        actionsGroupStyle: {},
        maxHeight: undefined,
        selectAllFiltered: '(Un)Select all filtered',
        selectAllInserted: '(Un)Select all inserted',
        selectAllEdited: '(Un)Select all edited',
        removeAllFiltered: '(Un)Remove all filtered',
        noOfSelected: 'No. of selected: ',
        noOfEdited: 'No. of edited: ',
        resetFilters: 'Reset filters',
        resetData: 'Reset data',
        resetSelectedData: 'Reset selected data',
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
        multiClickDebounce: 250,
        shieldRefreshGap: 100,
        filterFunction: function (data, filter) {
            try {
                if (data == null) {
                    // null
                    return false;
                } else if (typeof data === 'boolean') {
                    // boolean
                    return filter.trim() == '' ? true : (
                        Util.matchText(String(data), filter.trim(), '`', false, tableSettings['emptyRepresentation'])
                    );
                } else if (!isNaN(data)) {
                    // number
                    return filter.trim() == '' ? true : (
                        Util.match(data, filter.trim(), '`', filterNumbers)
                        || Util.matchText(String(data), filter.trim(), '`', false, tableSettings['emptyRepresentation'])
                    );
                } else if (isDateString(data)) {
                    // date
                    return filter.trim() == '' ? true : (
                        Util.match(data, filter.trim(), '`', filterDates)
                        || Util.matchText(String(data), filter.trim(), '`', false, tableSettings['emptyRepresentation'])
                    );
                } else {
                    // string
                    return filter.trim() == '' ? true : Util.matchText(typeof data === 'object' ? JSON.stringify(data) : String(data), filter.trim(), '`', false, tableSettings['emptyRepresentation']);
                }
            } catch (e) {
                // error
                return filter.trim() == '' ? true : Util.matchText(typeof data === 'object' ? JSON.stringify(data) : String(data), filter.trim(), '`', false, tableSettings['emptyRepresentation']);
            }
        },
        controlGroupEventHandlers: [],
        tableBodyEventHandlers: [],
        paginationGroupEventHandlers: [],
        onrefresh: null,
        emptyRepresentation: '___',
        overlayZIndex: 99
    };

    let filterGuide = "Filtering Guide:\n\n"
        + "1. Type Boolean\n'true' / 'false'\n\n"
        + "2. Type Numbers\n[ < / <= / = / > / >= ][number string]\ne.g. <100\n\n"
        + "3. Type Dates\n[ < / <= / = / > / >= ][ dd-MM-yyyy / yyyy-MM-dd / yyyy-MM-dd hh:mm / yyyy-MM-dd hh:mm:ss]\ne.g. >=01-07-1997\n\n"
        + "4. Type Text\n[ any successive characters / double quoted characters (e.g. \"mango tart\") ]\n\n"
        + "5. Combined conditions ( single type only )\n"
        + "String Separator: Space \" \" ( AND operator )\n"
        + "Delimiter: Backtick \"`\" ( NOT operator )\n"
        + "Condition:\n"
        + "[ Space-separated conditions to be included ] ` [ Space-separated conditions to be excluded ]\n"
        + "e.g. apple pear ` tart\n"
        + "Multiple Conditions:\n"
        + "multiple conditions separate by double backticks \"``\" ( OR operator ).\n"
        + "e.g. apple pear ` tart `` \"mango tart\" [ ... `` other conditions ]";

    let tableSettings;

    let filterNumbers = function (a, b) {
        if (isNaN(a)) {
            throw '@ filterNumber: NaN';
        } else if (b === tableSettings['emptyRepresentation'] && (a == null || a.trim() == '')) {
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
        if (b === tableSettings['emptyRepresentation'] && (a == null || a.trim() == '')) {
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
            let edits = getEdited(true, getSelected(true));
            for (let edit of edits) {
                let oriRow = originalTableData.find(origDataRow => origDataRow['###row-index'] === edit.index);
                tableData = tableData.map(row => row['###row-index'] === edit.index ? { ...oriRow } : row)
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
                tableSettings['columns'][i]['ori-filter'] = tableSettings['columns'][i]['filter'];
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

    let setAllFilteredRemoved = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-filtered'] ? { ...row, '###row-removed': selected } : row);
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllFilteredRemoved(" + selected + "): " + error);
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
                    let obj = { ori: {}, current: {}, index: item['###row-index'] };
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
                                // console.log();
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
            console.log(error);
            throw new Error("error caught @ isDateString(" + value + "): " + error);
        }
    }

    const parseDate = function (value) {
        if (typeof value !== 'string' || !value.trim()) {
            return NaN;
        }

        // Validate against common patterns first
        const patterns = [
            /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/,         // DD/MM/YYYY or MM/DD/YYYY
            /^\d{4}\/\d{2}\/\d{2}$/,         // YYYY/MM/DD
            /^\d{2}-\d{2}-\d{4}$/,           // DD-MM-YYYY or MM-DD-YYYY
        ];

        const matchesPattern = patterns.some(pattern => pattern.test(value));
        if (!matchesPattern) {
            return NaN;
        }

        const date = new Date(value);

        // Check if date is valid and matches input
        if (isNaN(date.getTime())) {
            return NaN;
        }

        // Validate the date components match input to catch rollovers
        const isoString = date.toISOString().split('T');
        const inputNormalized = value.replace(/\//g, '-');

        // For YYYY-MM-DD format, direct comparison
        if (/^\d{4}-\d{2}-\d{2}$/.test(inputNormalized)) {
            return isoString === inputNormalized ? date.getTime() : NaN;
        }

        return date.getTime();
    };



    let setStart = function (start) {
        try {
            let rowNumber = parseInt(start);
            if (!Number.isNaN(rowNumber)) {
                tableSettings['start'] = rowNumber > tableSettings['end']
                    ? tableSettings['end']
                    : (
                        rowNumber < tableSettings['end'] - tableSettings['maxRows'] + 1
                            ? tableSettings['end'] - tableSettings['maxRows'] + 1
                            : rowNumber < 1 ? 1 : rowNumber
                    );
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
                tableSettings['end'] = rowNumber < tableSettings['start']
                    ? tableSettings['start']
                    : (
                        rowNumber > tableSettings['start'] + tableSettings['maxRows'] - 1
                            ? tableSettings['start'] + tableSettings['maxRows'] - 1
                            : rowNumber
                    );
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ setEnd(" + end + ") - " + err);
        }
    }

    let toBegining = function () {
        try {
            let length = tableSettings['end'] - tableSettings['start'] + 1;
            tableSettings['start'] = 1;
            tableSettings['end'] = tableSettings['start'] + length - 1;
            return this;
        } catch (err) {
            throw new Error("error caught @ toBegining() - " + err);
        }
    }

    let priviousPage = function () {
        try {
            if (tableData != null && Array.isArray(tableData) && tableSettings != null) {
                let length = tableSettings['end'] - tableSettings['start'] + 1;
                tableSettings['start'] = Math.max(1, tableSettings['start'] - length);
                tableSettings['end'] = tableSettings['start'] + length - 1;
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ priviousPage() - " + err);
        }
    }

    let nextPage = function () {
        try {
            if (tableSettings != null) {
                let pageLength = tableSettings['end'] - tableSettings['start'] + 1;
                let listLength = getFiltered().length;
                tableSettings['end'] = tableSettings['end'] >= listLength ? tableSettings['end'] : tableSettings['end'] + pageLength;
                tableSettings['start'] = tableSettings['end'] - pageLength + 1;
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ nextPage() - " + err);
        }
    }

    let toEnding = function () {
        try {
            if (tableSettings != null) {
                let pageLength = tableSettings['end'] - tableSettings['start'] + 1;
                let listLength = getFiltered().length;
                tableSettings['end'] = Math.floor(listLength < 1 ? 0 : listLength / pageLength) * pageLength + (listLength % pageLength == 0 ? 0 : pageLength);
                tableSettings['start'] = tableSettings['end'] - pageLength + 1;
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
                output = Util.create('div', { style: Util.objToStyle({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                    .appendContent(
                        Util.create('div', (noOfSelected > 0 ? {} : { style: 'display:none' }))
                            .appendContent(tableSettings.noOfSelected + noOfSelected.toString())
                        , tableSettings['multiSelect'] == true && haveSelection)
                    .appendContent(
                        Util.create('div', { style: Util.objToStyle({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                            .appendContentIf(
                                Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .countClicks([
                                        async (event) => { await shieldOn(); setAllFilteredSelected(true); refreshTable(); },
                                        async (event) => { await shieldOn(); setAllFilteredSelected(false); refreshTable(); }
                                    ], tableSettings['multiClickDebounce'])
                                    .appendContent(tableSettings['selectAllFiltered'])
                                    .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
                                , haveSelection)
                            .appendContentIf(
                                Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .countClicks([
                                        async (event) => { await shieldOn(); setAllEditedSelected(true); refreshTable(); },
                                        async (event) => { await shieldOn(); setAllEditedSelected(false); refreshTable(); }
                                    ], tableSettings['multiClickDebounce'])
                                    .appendContent(tableSettings['selectAllEdited'])
                                    .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
                                , edited
                            )
                            .appendContentIf(
                                Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .countClicks([
                                        async (event) => { await shieldOn(); setAllInsertedSelected(true); refreshTable(); },
                                        async (event) => { await shieldOn(); setAllInsertedSelected(false); refreshTable(); }
                                    ], tableSettings['multiClickDebounce'])
                                    .appendContent(tableSettings['selectAllInserted'])
                                    .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
                                , inserted
                            )
                        , tableSettings['multiSelect'] == true && haveSelection)
                    .appendContentIf(
                        Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                            .countClicks([
                                async (event) => { await shieldOn(); setAllFilteredRemoved(true); refreshTable(); },
                                async (event) => { await shieldOn(); setAllFilteredRemoved(false); refreshTable(); }
                            ], tableSettings['multiClickDebounce'])
                            .appendContent(tableSettings['removeAllFiltered'])
                            .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
                        , haveRemoval
                    );
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
                output = Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                    .addEventHandler('click', async (event) => { await shieldOn(); resetFilters(); filterRows(); refreshTable(true); })
                    .appendContent(tableSettings.resetFilters)
                    .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }));
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
                                Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventHandler('click', async (event) => { await shieldOn(); resetData(); refreshTable(); })
                                    .appendContent(tableSettings.resetData)
                                    .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
                            )
                            .appendContent(
                                Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventHandler('click', async (event) => { await shieldOn(); resetSelectedData(); refreshTable(); })
                                    .appendContent(tableSettings.resetSelectedData)
                                    .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
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
                output = Util.create('div', { style: Util.objToStyle({ 'text-align': 'left' }) })
                    .appendContent(
                        Util.create('div', { style: Util.objToStyle({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                            .appendContent(
                                Util.create('div')
                                    //toBeginingButton
                                    .appendContent(
                                        Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', async (event) => { await shieldOn(); toBegining(); refreshTable(); })
                                            .appendContent(tableSettings['toBegining'])
                                            .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA; margin-left:5px;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', async (event) => { await shieldOn(); priviousPage(); refreshTable(); })
                                            .appendContent(tableSettings['previousPage'])
                                            .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
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
                                                'width': (Math.max(1, Math.floor(Math.log10(tableData.length) + 2)) * 8 + 20) + 'px'
                                            }),
                                            value: tableSettings['start']
                                        }).addEventHandler(['change', 'keydown'], async (event) => {
                                            if (event.type === 'change' || 'Escape' === event.key) {
                                                await shieldOn(); setStart(event.target.value); refreshTable();
                                            }
                                        })

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
                                                'width': (Math.max(1, Math.floor(Math.log10(tableData.length) + 2)) * 8 + 20) + 'px'
                                            }),
                                            value: tableSettings['end']
                                        }).addEventHandler(['change', 'keydown'], async (event) => {
                                            if (event.type === 'change' || 'Escape' === event.key) {
                                                await shieldOn(); setEnd(event.target.value); refreshTable();
                                            }
                                        })
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
                                        Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', async (event) => { await shieldOn(); nextPage(); refreshTable(); })
                                            .appendContent(tableSettings['nextPage'])
                                            .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.create('span', { style: "position: relative; border: 1px solid #AAAAAA; margin-left:5px;", class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .preventDefault('click')
                                            .addEventHandler('click', async (event) => { await shieldOn(); toEnding(); refreshTable(); })
                                            .appendContent(tableSettings['toEnding'])
                                            .appendContent(Util.create('span', { style: "position: absolute; left: 0px; top: 0px; width:100%; height:100%;" }))
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
                    col['filter'] = col['ori-filter'];
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
                        let headers = Util.create('tr', { class: tableSettings['headersClass'] });
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
                                            Util.create('div', { style: 'position:absolute; left: 0px; top: 0px; width: 100%; height:100%; z-index: ' + tableSettings['overlayZIndex'] + ';' })
                                                .countClicks([
                                                    async function (event) { if (col['sortable']) { if (kh && kh.keys && kh.keys.length == 1 && kh.keys[0] == 'Control') { await amendSortedBy(col); } else { await selectSortedBy(col); } } },
                                                    async function (event) { if (col['sortable']) { await amendSortedBy(col); } },
                                                    async function (event) { await removeSortedBy() }
                                                ], tableSettings['multiClickDebounce'])
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
                        filters = Util.create('tr', { class: tableSettings['filtersClass'] });
                        let overlay;
                        tableSettings['columns'].forEach((col) => {
                            let filterStyle = Util.objToStyle({ ... { ...(tableSettings['filtersStyle'] || {}), ...(col['filterStyle'] || {}) }, ...(col['filterEditable'] ? {} : { 'background-color': '#DDD' }) });
                            let filterValue = col['filter'] || '';
                            col['filterElement'] = Util.create('input', {
                                ...{ style: 'display:block; ' + filterStyle, value: filterValue, placeholder: (col['filterPlaceholder'] || '') }
                                , ...(col['filterEditable'] ? {} : { 'disabled': 'true' })
                            }).countClicks([null, function () {
                                this.preventDefault();
                                Util.get('html')[0].appendContent(
                                    overlay = Util.create('div', { "style": Util.objToStyle({ 'position': 'fixed', 'top': '0px', 'left': '0px', 'width': '100%', 'height': '100%', 'z-index': tableSettings['overlayZIndex'], 'background-color': 'hsla(0, 100%, 0%, 0.1)', 'display': 'flex', 'flex-flow': 'column nowrap', 'justify-content': 'center', 'align-items': 'center' }) })
                                        .appendContent(
                                            Util.create('textarea', { style: "padding:5px; background-color:#FFF; width:800px; max-width:95%; height:500px; border:1px solid #AAA;" })
                                                .appendContent(filterGuide)
                                        )
                                        .appendContent(
                                            Util.create('span', { style: "margin-top: 20px; background-color: #fff; padding: 5px;" })
                                                .appendContent('Double-Click to close')
                                        )
                                        .appendContent(
                                            Util.create('span', { style: Util.objToStyle({ 'position': 'fixed', 'top': '0px', 'left': '0px', 'width': '100%', 'height': '100%', 'z-index': tableSettings['overlayZIndex'] + 1 }) })
                                                .countClicks([null, function () { this.preventDefault(); overlay.remove(); }], tableSettings['multiClickDebounce'])
                                        )
                                )
                            }], tableSettings['multiClickDebounce']);
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
                        .appendContent(Util.create('div', { style: Util.objToStyle({ 'width': '100%;' }) }).appendContent(tableSettings['label']))
                        .appendContent(
                            controlGroup = Util.create('div', { style: Util.objToStyle({ 'width': '100%', 'display': 'flex', 'flex-flow': 'row wrap-reverse', 'justify-content': 'flex-start', 'align-items': 'flex-start', 'column-gap': '3px' }) })
                                .appendContent(paginationGroup = createPaginationGroup())
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
                        .css('position', 'relative')
                        .appendContent(shield = Util.create('span', { style: "position:absolute; left: 0px; top: 0px; width: 100%; height:100%; z-index: " + (tableSettings['overlayZIndex'] + 2) + "; display:none;" })
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

    return {
        setData, getData, resetData, insertData,
        setTableSettings, getTableSettings, sortAsOriginal,
        getSelected, getFiltered, getEdited, getInserted, getRemoved,
        createSelectBox, createRemoveBox, editData, setContainer, refreshTable, setFilter,
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
JsonTable.removeKeys = function (arr, _keys) {
    try {
        if (arr != null && Array.isArray(arr)) {
            let keys = Array.isArray(_keys) ? _keys : [_keys];
            if (keys.some(k => typeof k !== 'string')) throw new Error("keys argument must be a string or an array of strings");

            for (let i = 0; i < arr.length; i++) {
                keys.forEach(k => {
                    let regex = k.includes('%')
                        ? new RegExp('^' + k.replace(/([.+^${}()|[\]\\])/g, '\\$1').replace(/%/g, '.*') + '$')
                        : null;
                    Object.keys(arr[i]).forEach(key => {
                        if (regex ? regex.test(key) : key === k) {
                            delete arr[i][key];
                        }
                    });
                });
            }
        }
        return arr;
    } catch (error) {
        throw new Error("error caught @ removeKeys(" + JSON.stringify(arr) + ", " + JSON.stringify(_keys) + "): " + error.toString());
    }
}


export { JsonTable };
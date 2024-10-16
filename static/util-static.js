function JsonTable(c = null) {

    var container = c instanceof Util ? c : new Util(c);
    var tableData = null;
    var originalTableData = null;
    var haveSelection = false;
    var haveRemoval = false;
    var edited = false;
    var insertCount = 0;
    var tableDefaultSettings = {
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
            "border-radius": "5px",
            "border": "#aaa solid 1px",
            "height": "calc(100% - 8px)",
            "display": "flex",
            "flex-flow": "column nowrap",
            "padding": "3px",
            "margin": "1px",
            "text-align": "center",
            "font-weight": "bold",
            "background-color": "#add",
            "white-space": "nowrap"
        },
        filtersStyle: {
            "width": "calc(100% - 2px)",
            "border-radius": "5px",
            "border": "#aaa solid 1px",
            "margin": "1px",
            "text-align": "center",
            "font-size": "11px",
            "overflow": "hidden"
        },
        rowsStyle: {
            "text-align": "center",
        },
        oddRowsStyle: {},
        evenRowsStyle: {
            "background-color": "hsl(0 0 95)"
        },
        editedStyle: {
            "display": "revert",
            "color": "hsl(0, 100%, 30%)",
            "font-size": "70%"
        },
        insertedStyle: {
            "border": "2px solid hsl(160, 100%, 50%)",
        },
        removedStyle: {
            "text-decoration": "line-through",
            "text-decoration-color": "hsl(0, 100%, 30%)"
        },
        filterDebounceDelay: 500,
        negationChar: "`"
    };
    var tableSettings = tableDefaultSettings;

    var setContainer = function (c) {
        if (container) {
            container.clear();
        }
        container = c instanceof Util ? c : new Util(c);
        return this;
    }

    var getTableSettings = function () {
        return tableSettings;
    }

    var setData = function (data) {
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

    var resetData = function () {
        try {
            tableData = Util.clone(originalTableData);
            edited = false;
            return this;
        } catch (error) {
            throw new Error("error caught @ resetData(): " + error);
        }
    }

    var insertData = function (data) {
        try {
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

    var resetSelectedData = function () {
        try {
            var rows = getEdited(getSelected());
            for (let row of rows) {
                let oriRow = originalTableData.find(origDataRow => origDataRow['###row-index'] === row['###row-index']);
                if (tableData != null && Array.isArray(tableData)) {
                    let dataRow = tableData.find(dataRow => dataRow['###row-index'] === row['###row-index']);
                    let replacement = Util.clone(oriRow);
                    replacement['###row-selected'] = true;
                    Object.assign(dataRow, replacement);
                }
            }
            setEdited();
            return this;
        } catch (error) {
            throw new Error("error caught @ resetSelectedData(): " + error);
        }
    }

    var setTableSettings = function (newSettings) {
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

    var setSelected = function (index, selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-index'] === index ? { ...row, '###row-selected': selected } : row)
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setSelected(" + index + ", " + selected + "): " + error);
        }
    }

    var setRemoved = function (index, removed) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-index'] === index ? { ...row, ...{ '###row-removed': removed, '###row-selected': false } } : row)
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setRemoved(" + index + ", " + selected + "): " + error);
        }
    }

    var setAllSelected = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => ({ ...row, '###row-selected': row['###row-removed'] ? false : selected }));
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllSelected(" + selected + "): " + error);
        }
    }

    var setAllFilteredSelected = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-filtered'] ? { ...row, '###row-selected': row['###row-removed'] ? false : selected } : row);
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllFilteredSelected(" + selected + "): " + error);
        }
    }

    var setAllEditedSelected = function (selected) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData = tableData.map(row => row['###row-edited'] ? { ...row, '###row-selected': row['###row-removed'] ? false : selected } : row);
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ setAllFilteredSelected(" + selected + "): " + error);
        }
    }

    var deepFilter = function (arr, predicate) {
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

    var setEdited = function (arr) {
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
                            if ((typeof row[key] === 'string' ? row[key] : JSON.stringify(row[key])) !== ((typeof oriRow[key] === 'string' ? oriRow[key] : JSON.stringify(oriRow[key])))) {
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

    var getData = function () {
        try {
            return tableData;
        } catch (error) {
            throw new Error("error caught @ getData(): " + error.toString());
        }
    }

    var getSelected = function (arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                return deepFilter(arr, row => row['###row-selected']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getSelected(): " + error.toString());
        }
    }

    var getFiltered = function (arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                return deepFilter(arr, row => row['###row-filtered']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getFiltered(): " + error.toString());
        }
    }

    var getEdited = function (arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                setEdited(arr);
                return deepFilter(arr, row => row['###row-edited']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getedited(): " + error.toString());
        }
    }

    var getInserted = function (arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                return deepFilter(arr, row => row['###row-inserted']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getInserted(): " + error.toString());
        }
    }

    var getRemoved = function (arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                return deepFilter(arr, row => row['###row-removed']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getRemoved(): " + error.toString());
        }
    }

    var getNotRemoved = function (arr) {
        try {
            arr = (arr || tableData);
            if (arr != null && Array.isArray(arr)) {
                return deepFilter(arr, row => !row['###row-removed']);
            } else {
                return null;
            }
        } catch (error) {
            throw new Error("error caught @ getNotRemoved(): " + error.toString());
        }
    }

    var sortAsOriginal = function () {
        try {
            setSorting('###row-index', true)
            refreshTable();
            return this;
        } catch (error) {
            throw new Error("error caught @ sortAsOriginal(): " + error);
        }
    }

    var filterRows = function () {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                tableData.forEach((row) => {
                    if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        let isFiltered = true;
                        for (let col of tableSettings['columns']) {
                            let a = row[col['data']] == null ? '' : Util.isObjectOrArray(row[col['data']]) ? JSON.stringify(row[col['data']]) : row[col['data']].toString();
                            let b = col['filter'] == null ? '' : Util.isObjectOrArray(col['filter']) ? JSON.stringify(col['filter']) : col['filter'].toString();
                            let matching = match(a, b, false);
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

    var setSorting = function (data, order) {
        tableSettings['sortedBy'] = data;
        tableSettings['ascending'] = order;
        return this;
    }

    var sortRows = function () {
        try {
            let data = tableSettings['sortedBy'];
            let order = tableSettings['ascending'];
            if (tableData != null && Array.isArray(tableData)) {
                let sortedData = tableData.sort((a, b) => {
                    let aValue = a[data] == null ? '' : a[data].toString();
                    let bValue = b[data] == null ? '' : b[data].toString();
                    if (typeof aValue === 'boolean' || typeof bValue === 'boolean') {
                        if (aValue === bValue) {
                            return 0;
                        } else if (aValue && !bValue) {
                            return order ? -1 : 1;
                        } else {
                            return order ? 1 : -1;
                        }
                    } else if (isDateString(aValue) && isDateString(bValue)) {
                        let aNumber = parseDate(aValue);
                        let bNumber = parseDate(bValue);
                        if (!isNaN(aNumber) && !isNaN(bNumber)) {
                            return order ? aNumber - bNumber : bNumber - aNumber;
                        }
                    } else if (isNumberString(aValue) && isNumberString(bValue)) {
                        let aNumber = parseFloat(aValue);
                        let bNumber = parseFloat(bValue);
                        if (!isNaN(aNumber) && !isNaN(bNumber)) {
                            return order ? aNumber - bNumber : bNumber - aNumber;
                        }
                    } else if (isIntegerString(aValue) && isIntegerString(bValue)) {
                        let aInteger = parseInt(aValue);
                        let bInteger = parseInt(bValue);
                        if (!isNaN(aInteger) && !isNaN(bInteger)) {
                            return order ? aInteger - bInteger : bInteger - aInteger;
                        }
                    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                        return order ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                    }
                    return 0;
                });
                tableData = sortedData;
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ sort(" + data + ", " + order + "): " + error);
        }
    }

    var isDateString = function (value) {
        try {
            return /^(\d{2})[-\/](\d{2})[-\/](\d{4})$|^(\d{4})[-\/](\d{2})[-\/](\d{2})$|^(\d{2})[-\/](\d{2})[-\/](\d{4}) (\d{2}):(\d{2}):(\d{2})$/.test(value);
        } catch (error) {
            throw new Error("error caught @ isDateString(" + value + "): " + error);
        }
    }

    var isNumberString = function (value) {
        try {
            return /^(\d+|\d+\.\d+|\.\d+)$/.test(value);
        } catch (error) {
            throw new Error("error caught @ isNumberString(" + value + "): " + error);
        }
    }

    var isIntegerString = function (value) {
        try {
            return /^(\d+)$/.test(value);
        } catch (error) {
            throw new Error("error caught @ isIntegerString(" + value + "): " + error);
        }
    }

    var parseDate = function (value) {
        try {
            let match = null;
            let output = null;
            if (/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value)) {
                match = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.exec(value);
                if (match) {
                    output = new Date(match[3] + '-' + match[2] + '-' + match[1]).getTime();
                }
            } else if (/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/.test(value)) {
                match = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/.exec(value);
                if (match) {
                    output = new Date(match[1] + '-' + match[2] + '-' + match[3]).getTime();
                }
            } else if (/^(\d{2})[-\/](\d{2})[-\/](\d{4}) (\d{2}):(\d{2}):(\d{2})$/.test(value)) {
                match = /^(\d{2})[-\/](\d{2})[-\/](\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
                if (match) {
                    output = new Date(match[3] + '-' + match[2] + '-' + match[1] + 'T' + match[4] + ':' + match[5] + ':' + match[6]).getTime();
                }
            }
            return output;
        } catch (error) {
            throw new Error("error caught @ parseDate(" + value + "): " + error);
        }
    }

    var setStart = function (start) {
        try {
            let rowNumber = parseInt(start);
            if (!Number.isNaN(rowNumber)) {
                tableSettings = {
                    ...tableSettings
                    , start: Math.max(
                        Math.min(
                            rowNumber,
                            tableSettings['end']
                        ),
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

    var setEnd = function (end) {
        try {
            let rowNumber = parseInt(end);
            if (!Number.isNaN(rowNumber)) {
                tableSettings = {
                    ...tableSettings
                    , end: Math.min(
                        Math.max(
                            rowNumber,
                            tableSettings['start']
                        ),
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

    var toBegining = function () {
        try {
            let length = tableSettings['end'] - tableSettings['start'] + 1;
            tableSettings['start'] = getFiltered().length === 0 ? 0 : 1;
            tableSettings['end'] = Math.min(getFiltered().length, tableSettings['start'] + length - 1);
            return this;
        } catch (err) {
            throw new Error("error caught @ toBegining() - " + err);
        }
    }

    var priviousPage = function () {
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

    var nextPage = function () {
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

    var toEnding = function () {
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

    var createSelectBox = function (row) {
        try {
            if (!haveSelection) {
                haveSelection = true;
            }
            let output = Util.create('input', { ...{ type: 'checkbox' }, ...(row['###row-selected'] ? { checked: '' } : {}) })
                .addEventHandler('click', (event) => {
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

    var createRemoveBox = function (row) {
        try {
            if (!haveRemoval) {
                haveRemoval = true;
            }
            let output = Util.create('input', { ...{ type: 'checkbox' }, ...(row['###row-removed'] ? { checked: '' } : {}) })
                .addEventHandler('click', (event) => {
                    setRemoved(row['###row-index'], event.target.checked);
                    refreshTable();
                });
            return output;
        } catch (error) {
            throw new Error("error caught @ createRemoveBox(" + row + "): " + error);
        }
    }

    var createSelectingGroup = function () {
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
                                    Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventHandler('click', (event) => { setAllFilteredSelected(true); refreshTable(); })
                                        .appendContent(tableSettings.selectAllFiltered)
                                )
                                .appendContent(
                                    Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventHandler('click', (event) => { setAllFilteredSelected(false); refreshTable(); })
                                        .appendContent(tableSettings.unselectAllFiltered)
                                )
                                .appendContentIf(
                                    Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventHandler('click', (event) => { setAllEditedSelected(true); refreshTable(); })
                                        .appendContent(tableSettings.selectAllEdited)
                                    , edited
                                )
                        );
                }
            }
            return output;
        } catch (err) {
            throw new Error("error caught @ createSelectingGroup() - " + err);
        }
    }

    var createResetFiltersButton = function () {
        let output = null;
        if (tableSettings != null) {
            try {
                output = Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                    .addEventHandler('click', (event) => { resetFilters(); filterRows(); resetPageNumbers(); refreshTable(); })
                    .appendContent(tableSettings.resetFilters);
            } catch (err) {
                throw new Error("error caught @ createResetFiltersButton() - " + err);
            }
        }
        return output;
    }

    var createEditedGroup = function () {
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
                                Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventHandler('click', (event) => { resetData(); refreshTable(); })
                                    .appendContent(tableSettings.resetData)
                            )
                            .appendContentIf(
                                Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventHandler('click', (event) => { resetSelectedData(); refreshTable(); })
                                    .appendContent(tableSettings.resetSelectedData)
                                , haveSelection)
                        , edited
                    );
            } catch (err) {
                throw new Error("error caught @ createSelectingGroup() - " + err);
            }
        }
        return output;
    }

    var createPaginationGroup = function () {
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
                                        Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', (event) => { toBegining(); refreshTable(); })
                                            .appendContent(tableSettings['toBegining'])
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'], style: 'margin-left:5px;' })
                                            .addEventHandler('click', (event) => { priviousPage(); refreshTable(); })
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
                                        }).addEventHandler('change', (event) => { setStart(event.target.value); refreshTable(); })
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
                                        }).addEventHandler('change', (event) => { setEnd(event.target.value); refreshTable(); })
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
                                        Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventHandler('click', (event) => { nextPage(); refreshTable(); })
                                            .appendContent(tableSettings['nextPage'])
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.create('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'], style: 'margin-left:5px;' })
                                            .preventDefault('click')
                                            .addEventHandler('click', (event) => { toEnding(); refreshTable(); })
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

    var setFilter = function (index, value) {
        try {
            if (tableSettings != null && tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                tableSettings['columns'][index]['filter'] = value;
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ setFilter(" + index + ", " + value + ") - " + err);
        }
    }

    var resetFilters = function () {
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

    var resetPageNumbers = function () {
        try {
            if (tableSettings != null) {
                let length = tableSettings['end'] - tableSettings['start'] + 1;
                setStart(getFiltered().length === 0 ? 0 : 1);
                setEnd(Math.max(length, tableSettings['defaultEnd']));
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ resetPageNumbers() - " + err);
        }
    }

    var match = function (text, matchingText, caseSensitive) {
        let match = false;

        try {
            if (text == null && matchingText !== '') {
                return false;
            } else if (matchingText.trim() === "") {
                match = true;
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

                    let values = [];
                    let isQuoteOpen = false;
                    let currentWord = "";

                    for (let i = 0; i < matchingText.length; i++) {
                        let char = matchingText[i];

                        if (!isQuoteOpen && (char === " " || char === "," || char === "+" || char === "\t")) {
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

                    if (currentWord !== "") {
                        values.push(currentWord);
                    }

                    let exclusionSet = [];
                    let inclusionSet = [];

                    for (let value of values) {
                        if (value.startsWith(tableSettings['negationChar'])) {
                            exclusionSet.push(value.substring(1));
                        } else {
                            inclusionSet.push(value);
                        }
                    }

                    /*handle excludes*/
                    let exclusiveMatch = true;
                    for (let value of exclusionSet) {
                        exclusiveMatch = exclusiveMatch && text.indexOf(value) === -1;
                    }

                    /*handle includes*/
                    let inclusiveMatch = inclusionSet.length === 0;
                    for (let value of inclusionSet) {
                        inclusiveMatch = inclusiveMatch || text.indexOf(value) !== -1;
                    }

                    match = exclusiveMatch && inclusiveMatch;
                }
            }
        } catch (e) {
            throw new Error("error caught @ match(" + text + ", " + matchingText + ", " + (caseSensitive ? "true" : "false") + "): " + e);
        }

        return match;
    }

    var editData = function (index, data, value) {
        try {
            if (tableData != null && Array.isArray(tableData)) {
                let row = tableData.find((row) => {
                    return row['###row-index'] === index;
                });
                if (row[data] !== value) {
                    if (row['###ori-' + data] === undefined) {
                        row['###ori-' + data] = row[data];
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

    var stringToAscii = function (str) {
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

    var createTable = function () {
        let output = null;
        if (true || (tableData != null && Array.isArray(tableData) && tableSettings != null)) {
            try {

                sortRows();
                filterRows();

                let tbody = Util.create('tbody', null);

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
                                            style: Util.objToStyle(headerStyle),
                                            class: tableSettings['tableClass'] + ' ' + 'sort-header ' + (tableSettings['sortedBy'] === col['data'] ? 'sorting' : '')
                                        })
                                            .addEventHandlerIf('click', () => {
                                                setSorting(col['data'], (tableSettings['sortedBy'] === col['data'] ? !tableSettings['ascending'] : tableSettings['ascending']))
                                                refreshTable();
                                            }, undefined, col['sortable'])
                                            .appendContent(
                                                Util.create('div', { style: 'flex:1;' })
                                            )
                                            .appendContent(
                                                col.header + (tableSettings['sortedBy'] === col['data'] ? (tableSettings['ascending'] ? '▲' : '▼') : '')
                                            )
                                            .appendContent(
                                                Util.create('div', { style: 'flex:1;' })
                                            )
                                    )
                            )
                        });
                        tbody.appendContent(headers);
                    }
                } catch (e) {
                    throw '@ headers: ' + e
                }

                /* filters */
                try {
                    if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        let filters = Util.create('tr', null);
                        tableSettings['columns'].forEach((col) => {
                            let filterStyle = Util.objToStyle({ ... { ...(tableSettings['filtersStyle'] || {}), ...(col['filterStyle'] || {}) }, ...(col['filterEditable'] ? {} : { 'background-color': '#DDD' }) });
                            let filterValue = col['filter'] || '';
                            col['filterElement'] = Util.create('input', {
                                ...{ style: 'display:block; ' + filterStyle, value: filterValue, placeholder: (col['filterPlaceholder'] || '') }
                                , ...(col['filterEditable'] ? {} : { 'disabled': 'true' })
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
                    var filteredData = getFiltered();
                    if (filteredData != null && Array.isArray(filteredData) && tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        filteredData.slice(start - 1, end).forEach((row, index) => {
                            try {
                                var rowsStyle = (col) => {
                                    return { ...(tableSettings.rowsStyle || ''), ...(col.rowsStyle || '') };
                                };
                                var oddEvenRowsStyle = (col) => {
                                    return (index % 2 === 1 ? tableSettings.evenRowsStyle : tableSettings.oddRowsStyle);
                                };
                                let tableRow = null;
                                if (!row['###row-removed']) {
                                    try {
                                        tableRow = Util.create('tr', row['###row-inserted'] ? { style: Util.objToStyle(tableSettings.insertedStyle) } : null);

                                        tableSettings['columns'].forEach((col) => {
                                            var cellData = row[col['data']] != null ? String(row[col['data']]) : '';
                                            if (col.modifier) {
                                                if (typeof col.modifier === 'function') {
                                                    var clone = Object.assign({}, row);
                                                    cellData = col.modifier(clone);
                                                }
                                            }
                                            tableRow.appendContent(
                                                Util.create('td', { class: col['class'], style: Util.objToStyle({ ...oddEvenRowsStyle(col), ...rowsStyle(col) }) })
                                                    .appendContent(cellData)
                                                    .appendContentIf(Util.create('br'), row['###row-edited'])
                                                    .appendContentIf(
                                                        Util.create('span', { style: Util.objToStyle(tableSettings.editedStyle) })
                                                            .appendContentIf('(' + row['###ori-' + col['data']] + ')', row['###ori-' + col['data']] !== undefined),
                                                        row['###row-edited']
                                                    )
                                            )
                                        });
                                    } catch (e) {
                                        throw '@ not ###row-removed: ' + e;
                                    }
                                } else {
                                    try {
                                        tableRow = Util.create('tr', null);
                                        tableSettings['columns'].forEach((col) => {
                                            try {
                                                var cellData = row[col['data']] !== undefined ? String(row[col['data']]) : '';
                                                if (col['data'] === '###row-removed') {
                                                    if (typeof col.modifier === 'function') {
                                                        var clone = Object.assign({}, row);
                                                        cellData = col.modifier(clone);
                                                    }
                                                } else if (col['data'] === '###row-selected') {
                                                    cellData = "";
                                                }
                                                tableRow.appendContent(
                                                    Util.create('td', { class: col['class'], style: Util.objToStyle({ ...oddEvenRowsStyle(col), ...rowsStyle(col) }) })
                                                        .appendContent(
                                                            Util.create('span', { style: Util.objToStyle(tableSettings.removedStyle) })
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
                    output = Util.create('div', { style: Util.objToStyle({ 'position': 'relative', 'width': '100%', 'display': 'flex', 'flex-flow': 'column nowrap', 'justify-content': 'flex-start', 'align-items': 'center', 'row-gap': '3px', 'background-color': '#fff' }) })
                        .appendContent(
                            Util.create('div', { style: Util.objToStyle({ 'width': '100%', 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
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
                                .appendContent(
                                    Util.create('div', {
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
                                .appendContent(createPaginationGroup())
                        )
                } catch (e) {
                    throw '@ output: ' + e
                }
            } catch (err) {
                throw new Error("error caught @ createTable(): " + err);
            }
        }
        return output;
    }

    var fillTable = () => {
        try {
            if (container != null) {
                resetPageNumbers();
                refreshTable();
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ fillTable(): " + err);
        }
    }

    var refreshTable = () => {
        try {
            if (container != null) {
                container.clear().appendContent(createTable());
                loadFilterHandlers();
            }
            return this;
        } catch (err) {
            throw new Error("error caught @ refreshTable(): " + err);
        }
    }

    var loadFilterHandlers = function () {
        var events = ['keyup', 'dragend'];
        if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
            for (let col of tableSettings['columns']) {
                let element = col['filterElement'];
                if (element) {
                    element.addEventHandler(events,
                        Util.debounce(
                            (event) => {
                                let selectionStart = element.entity().selectionStart;
                                let selectionEnd = element.entity().selectionEnd;
                                setFilter(tableSettings['columns'].indexOf(col), element.entity().value);
                                filterRows();
                                resetPageNumbers();
                                refreshTable();
                                let e = tableSettings['columns'][tableSettings['columns'].indexOf(col)]['filterElement'].entity();
                                element.entity(e);
                                e.setSelectionRange(selectionStart, selectionEnd);
                                e.focus();
                            }
                            , tableSettings.filterDebounceDelay)
                    );
                }
            }
        }
    }

    return {
        setData, getData, resetData, insertData,
        setTableSettings, getTableSettings, sortAsOriginal,
        getSelected, getFiltered, getEdited, getInserted, getRemoved, getNotRemoved,
        createSelectBox, createRemoveBox, editData, setContainer, fillTable, refreshTable
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

//----------------------------------------------------------- divider -----------------------------------------------------------

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
}

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
}

Util.isObjectOrArray = function (arg) {
    return arg != null && (typeof arg === 'object' || Array.isArray(arg));
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
    return new Util(this['_entity'].parentElement);
}

Util.prototype.entity = function (entity) {
    if (entity == undefined) {
        return this['_entity'];
    } else {
        this['_entity'] = entity;
        return this;
    }
}

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

Util.prototype.addEventHandler = function (events, func, options) {
    try {
        this['_eventListenerList'] = this['_eventListenerList'] ? this['_eventListenerList'] : [];
        if (typeof events === 'string') {
            this['_entity'].addEventListener(events, func, options);
            this['_eventListenerList'].push({ type: events, listener: func, options: options });
        } else if (Array.isArray(events)) {
            events.forEach((event) => {
                if (typeof event === 'string') {
                    this['_entity'].addEventListener(event, func, options);
                    this['_eventListenerList'].push({ type: event, listener: func, options: options });
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
}

Util.prototype.content = function (content) {
    if (content === undefined) {
        return this['_entity'].innerHTML;
    } else {
        if (content) {
            this.clear().appendContent(content);
        }
        return this;
    }
}

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
}

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

Util.prototype.val = function (value) {
    if (value === undefined) {
        return this['_entity']['value'];
    } else {
        this['_entity']['value'] = value;
        return this;
    }
}

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
}

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
}

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
}

Util.prototype.remove = function () {
    this['_entity'].remove();
    this['_entity'] = undefined;
    return this;
}

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
}

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
}

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
}

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
}

Util.prototype.noFocus = function () {
    this.addEventHandler('focus', (event) => { this.entity().blur(); })
}

Util.loaded = function (func) {
    if (func != null && typeof func === 'function') {
        document.addEventListener('DOMContentLoaded', func);
    }
}

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

Util.prototype.appendMovableDiv = function (content) {
    this.css('position', 'relative')
        .appendContent(Util.createMovableDiv(content));
    return this;
}

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
}

Util.prototype.drag = function (target) {
    this.addEventHandler('mousedown', (e) => {
        this['hold'] = {};
        this['hold']['x'] = e.clientX;
        this['hold']['y'] = e.clientY;
    }).addEventHandler('mouseup', (e) => {
        this['hold'] = undefined;
    });
    Util.get('html')[0].css('position', 'relative').addEventHandler('mousemove', (e) => {
        if (this['hold']) {
            target.css('left', target.entity().offsetLeft + e.clientX - this['hold']['x'] + 'px');
            target.css('top', target.entity().offsetTop + e.clientY - this['hold']['y'] + 'px');
            this['hold']['x'] = e.clientX;
            this['hold']['y'] = e.clientY;
        }
    });
    return this;
}

Object.defineProperty(Util, 'directions', {
    value: { up: 0, right: 1, down: 2, left: 3 }
    , writable: false
    , configurable: false
    , enumerable: false
});

Util.createSplitedDiv = function (direction, firstSpan, adjustable) {
    direction = direction == null ? 1 : direction;
    firstSpan = firstSpan == null ? '50%' : firstSpan;
    adjustable = adjustable == null ? false : adjustable;

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
            'box-sizing': 'border-box'
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
        .css((direction % 2 === 0 ? 'height' : 'width'), '3px');

    if (adjustable) {
        divider.addEventHandler('mousedown', (e) => {
            divider['hold'] = {};
            divider['hold'][(direction % 2 === 0 ? 'y' : 'x')] = (direction % 2 === 0 ? e.clientY : e.clientX);
        }).addEventHandler('mouseup', (e) => {
            divider['hold'] = undefined;
        });
        Util.get('html')[0].addEventHandler('mousemove', (e) => {
            if (divider['hold']) {
                a.css((direction % 2 === 0 ? 'height' : 'width'), (a.entity()[(direction % 2 === 0 ? 'offsetHeight' : 'offsetWidth')] + (direction % 3 === 0 ? '-1' : '1') * (direction % 2 === 0 ? e.clientY : e.clientX) - (direction % 3 === 0 ? '-1' : '1') * divider['hold'][(direction % 2 === 0 ? 'y' : 'x')]) + 'px');
                divider['hold'][(direction % 2 === 0 ? 'y' : 'x')] = (direction % 2 === 0 ? e.clientY : e.clientX);
            }
        });
    }

    return container
        .prop('a', a)
        .prop('b', b)
        .prop('divider', divider)
        .appendContent(a)
        .appendContent(divider)
        .appendContent(b);
}
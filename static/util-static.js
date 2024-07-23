function JsonTable(c = null) {

    var container = c;
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
                filterPlaceholder: "placeholder",
                modifier: (row) => { return 'data:' + JSON.stringify(row); },
                headerStyle: {},
                filterStyle: {},
                rowsStyle: {},
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
        previousPage: Util.newElement('span', { style: 'padding:0px 8px;' }).appendContent('<'),
        nextPage: Util.newElement('span', { style: 'padding:0px 8px;' }).appendContent('>'),
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
        }
    };
    var tableSettings = tableDefaultSettings;

    var setContainer = function (c) {
        if (container) {
            container.clear();
        }
        container = c;
        return this;
    }

    var getTableSettings = function () {
        return tableSettings;
    }

    var setData = function (data) {
        try {
            edited = false;
            if (data != null && data.length > 0) {
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
            if (data != null && Array.isArray(data) && tableData != null && Array.isArray(tableData)) {
                tableData.push({
                    ...data, ...{
                        '###row-index': -1 * ++insertCount,
                        '###row-filtered': false,
                        '###row-selected': false,
                        '###row-edited': false,
                        '###row-inserted': true,
                        '###row-removed': false
                    }
                });
                edited = true;
            }
            return this;
        } catch (error) {
            throw new Error("error caught @ insertData(): " + error);
        }
    }

    var resetSelectedData = function () {
        try {
            var rows = getEdited(getSelected());
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
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
                            if (row[key] !== oriRow[key] || row[key].length !== oriRow[key].length) {
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
                            let a = (row[col['data']] === undefined || row[col['data']] === null ? '' : row[col['data']]).toString();
                            let b = (col['filter'] === undefined || row[col['filter']] === null ? '' : col['filter']).toString();
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
                    let aValue = a[data] === undefined || a[data] === null ? '' : a[data].toString();
                    let bValue = b[data] === undefined || b[data] === null ? '' : b[data].toString();
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
            let output = Util.newElement('input', { ...{ type: 'checkbox' }, ...(row['###row-selected'] ? { checked: '' } : {}) })
                .addEventListeners('click', (event) => {
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
            let output = Util.newElement('input', { ...{ type: 'checkbox' }, ...(row['###row-removed'] ? { checked: '' } : {}) })
                .addEventListeners('click', (event) => {
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
                    output = Util.newElement('div', { style: Util.toStyleString({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                        .appendContent(
                            Util.newElement('div', (noOfSelected > 0 ? {} : { style: 'display:none' }))
                                .appendContent(tableSettings.noOfSelected + noOfSelected.toString())
                        )
                        .appendContent(
                            Util.newElement('div', { style: Util.toStyleString({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                                .appendContent(
                                    Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventListeners('click', (event) => { setAllFilteredSelected(true); refreshTable(); })
                                        .appendContent(tableSettings.selectAllFiltered)
                                )
                                .appendContent(
                                    Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventListeners('click', (event) => { setAllFilteredSelected(false); refreshTable(); })
                                        .appendContent(tableSettings.unselectAllFiltered)
                                )
                                .appendContentIf(
                                    Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                        .addEventListeners('click', (event) => { setAllEditedSelected(true); refreshTable(); })
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
                output = Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                    .addEventListeners('click', (event) => { resetFilters(); filterRows(); resetPageNumbers(); refreshTable(); })
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
                output = Util.newElement('div', { style: Util.toStyleString({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                    .appendContentIf(
                        tableSettings.noOfEdited + noOfEdited
                        , edited
                    )
                    .appendContentIf(
                        Util.newElement('div', { style: Util.toStyleString({ 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                            .appendContent(
                                Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventListeners('click', (event) => { resetData(); refreshTable(); })
                                    .appendContent(tableSettings.resetData)
                            )
                            .appendContent(
                                Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                    .addEventListeners('click', (event) => { resetSelectedData(); refreshTable(); })
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

    var createPaginationGroup = function () {
        let output = null;
        if (tableData != null && Array.isArray(tableData) && tableSettings != null) {
            try {
                output = Util.newElement('div', { style: Util.toStyleString(tableSettings['paginationGroupStyle']) })
                    .appendContent(
                        Util.newElement('div', { style: Util.toStyleString({ 'width': '100%', 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'center', 'align-items': 'center', 'column-gap': '3px' }) })
                            .appendContent(
                                Util.newElement('div', null)
                                    //toBeginingButton
                                    .appendContent(
                                        Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventListeners('click', (event) => { toBegining(); refreshTable(); })
                                            .appendContent(tableSettings['toBegining'])
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'], style: 'margin-left:5px;' })
                                            .addEventListeners('click', (event) => { priviousPage(); refreshTable(); })
                                            .appendContent(tableSettings['previousPage'])
                                    )
                            )
                            .appendContent(
                                Util.newElement('div', null)
                                    //startInput
                                    .appendContent(
                                        Util.newElement('input', {
                                            type: 'text',
                                            style: Util.toStyleString({
                                                'text-align': 'center',
                                                'padding': '3px 8px',
                                                'width': (Math.max(1, Math.ceil(Math.log10(tableData.length))) * 8 + 20) + 'px'
                                            }),
                                            value: tableSettings['start']
                                        }).addEventListeners('change', (event) => { setStart(event.target.value); refreshTable(); })
                                    )
                                    .appendContent(
                                        Util.newElement('span', { style: 'margin: 0px 5px;' })
                                            .appendContent('-')
                                    )
                                    //endInput
                                    .appendContent(
                                        Util.newElement('input', {
                                            type: 'text',
                                            style: Util.toStyleString({
                                                'text-align': 'center',
                                                'padding': '3px 8px',
                                                'width': (Math.max(1, Math.ceil(Math.log10(tableData.length))) * 8 + 20) + 'px'
                                            }),
                                            value: tableSettings['end']
                                        }).addEventListeners('change', (event) => { setEnd(event.target.value); refreshTable(); })
                                    )
                                    .appendContent(
                                        Util.newElement('span', { style: 'margin: 0px 5px;' })
                                            .appendContent('/')
                                    )
                                    .appendContent(getFiltered().length)
                            )
                            .appendContent(
                                Util.newElement('div', null)
                                    //toBeginingButton
                                    .appendContent(
                                        Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'] })
                                            .addEventListeners('click', (event) => { nextPage(); refreshTable(); })
                                            .appendContent(tableSettings['nextPage'])
                                    )
                                    //previousButton
                                    .appendContent(
                                        Util.newElement('span', { class: tableSettings['tableClass'] + ' ' + tableSettings['buttonClass'], style: 'margin-left:5px;' })
                                            .preventDefault('click')
                                            .addEventListeners('click', (event) => { toEnding(); refreshTable(); })
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
            if (text === null && matchingText !== '') {
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
                        if (value.startsWith("-")) {
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

                let tbody = Util.newElement('tbody', null);

                /* headers */
                try {
                    if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
                        let headers = Util.newElement('tr', null);
                        tableSettings['columns'].forEach((col) => {
                            let headerStyle = { ...(tableSettings['headersStyle'] || {}), ...(col['headerStyle'] || {}) };
                            headers.appendContent(
                                Util.newElement('td', null)
                                    .appendContent(
                                        Util.newElement('div', {
                                            style: Util.toStyleString(headerStyle),
                                            class: tableSettings['tableClass'] + ' ' + 'sort-header ' + (tableSettings['sortedBy'] === col['data'] ? 'sorting' : '')
                                        })
                                            .addEventListeners('click', () => {
                                                setSorting(col['data'], (tableSettings['sortedBy'] === col['data'] ? !tableSettings['ascending'] : tableSettings['ascending']))
                                                refreshTable();
                                            })
                                            .appendContent(
                                                Util.newElement('div', { style: 'flex:1;' })
                                            )
                                            .appendContent(
                                                col.header + (tableSettings['sortedBy'] === col['data'] ? (tableSettings['ascending'] ? '▲' : '▼') : '')
                                            )
                                            .appendContent(
                                                Util.newElement('div', { style: 'flex:1;' })
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
                        let filters = Util.newElement('tr', null);
                        tableSettings['columns'].forEach((col) => {
                            let filterStyle = Util.toStyleString({ ...(tableSettings['filtersStyle'] || {}), ...(col['filterStyle'] || {}) });
                            let filterValue = col['filter'] || '';
                            col['filterElement'] = Util.newElement('input', {
                                style: 'display:block; ' + filterStyle,
                                value: filterValue,
                                placeholder: (col['filterPlaceholder'] || '')
                            });
                            filters.appendContent(Util.newElement('td', null).appendContent(col['filterElement']));
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
                                        tableRow = Util.newElement('tr', row['###row-inserted'] ? { style: Util.toStyleString(tableSettings.insertedStyle) } : null);

                                        tableSettings['columns'].forEach((col) => {
                                            var cellData = row[col['data']] !== null ? String(row[col['data']]) : '';
                                            if (col.modifier) {
                                                if (typeof col.modifier === 'function') {
                                                    var clone = Object.assign({}, row);
                                                    cellData = col.modifier(clone);
                                                }
                                            }
                                            tableRow.appendContent(
                                                Util.newElement('td', { style: Util.toStyleString({ ...oddEvenRowsStyle(col), ...rowsStyle(col) }) })
                                                    .appendContent(cellData)
                                                    .appendContentIf(Util.newElement('br'), row['###row-edited'])
                                                    .appendContentIf(
                                                        Util.newElement('span', { style: Util.toStyleString(tableSettings.editedStyle) })
                                                            .appendContentIf('(' + row['###ori-' + col['data']] + ')', (row['###ori-' + col['data']] != undefined && row['###ori-' + col['data']] != null)),
                                                        row['###row-edited']
                                                    )
                                            )
                                        });
                                    } catch (e) {
                                        throw '@ not ###row-removed: ' + e;
                                    }
                                } else {
                                    try {
                                        tableRow = Util.newElement('tr', null);
                                        tableSettings['columns'].forEach((col) => {
                                            try {
                                                var cellData = row[col['data']] !== null ? String(row[col['data']]) : '';
                                                if (col['data'] == '###row-removed') {
                                                    if (typeof col.modifier === 'function') {
                                                        var clone = Object.assign({}, row);
                                                        cellData = col.modifier(clone);
                                                    }
                                                }
                                                tableRow.appendContent(
                                                    Util.newElement('td', { style: Util.toStyleString({ ...oddEvenRowsStyle(col), ...rowsStyle(col) }) })
                                                        .appendContent(
                                                            Util.newElement('span', { style: Util.toStyleString(tableSettings.removedStyle) })
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
                    output = Util.newElement('div', { style: Util.toStyleString({ 'position': 'relative', 'width': '100%', 'display': 'flex', 'flex-flow': 'column nowrap', 'justify-content': 'flex-start', 'align-items': 'center', 'row-gap': '3px' }) })
                        .appendContent(
                            Util.newElement('div', { style: Util.toStyleString({ 'width': '100%', 'display': 'flex', 'flex-flow': 'row wrap', 'justify-content': 'flex-start', 'align-items': 'center', 'column-gap': '3px' }) })
                                .appendContent(Util.newElement('div', null).appendContent(tableSettings['label']))
                                .appendContent(Util.newElement('div', { style: 'flex:1' }))
                                .appendContent(
                                    Util.newElement('div', { style: Util.toStyleString(tableSettings['actionsGroupStyle']) }).appendContent(
                                        Util.newElement('div', { style: Util.toStyleString({ display: 'flex', 'flex-flow': (edited ? "column" : "row") + ' wrap', 'justify-content': 'flex-start', 'align-items': 'flex-end', 'column-gap': '3px' }) })
                                            .appendContent(createSelectingGroup())
                                            .appendContent(createEditedGroup())
                                            .appendContent(createResetFiltersButton())
                                    )
                                )
                                .appendContent(
                                    Util.newElement('div', {
                                        style: 'width:100%;overflow:auto;' + (tableSettings['maxHeight'] ? " max-height:" + tableSettings['maxHeight'] + ";" : "")
                                    }).appendContent(
                                        Util.newElement('table', {
                                            style: Util.toStyleString({
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
            if (container) {
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
        var events = ['change', 'keyup', 'dragend', 'selectionchange'];
        if (tableSettings['columns'] != null && Array.isArray(tableSettings['columns'])) {
            for (let col of tableSettings['columns']) {
                let element = col['filterElement'];
                if (element) {
                    element.addEventListeners(events, () => {
                        let selectionStart = element.selectionStart;
                        let selectionEnd = element.selectionEnd;
                        setFilter(tableSettings['columns'].indexOf(col), element.value);
                        filterRows();
                        resetPageNumbers();
                        refreshTable();
                        element = tableSettings['columns'][tableSettings['columns'].indexOf(col)]['filterElement'];
                        element.setSelectionRange(selectionStart, selectionEnd);
                        element.focus();
                    });
                }
            }
        }
    }

    return {
        setData, getData, resetData, insertData,
        setTableSettings, getTableSettings, sortAsOriginal,
        getSelected, getFiltered, getEdited, getInserted, getRemoved,
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

function Util() {
};

Util.newElement = function (type, attributes) {
    let e = document.createElement(type);
    if (attributes !== null && typeof attributes === 'object') {
        for (let key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                e.setAttribute(key, attributes[key]);
            }
        }
    }
    return e;
};

Util.toStyleString = function (obj) {
    var output = null;
    try {
        output = '';
        for (let key in (obj || {})) {
            output += (output ? ' ' : '') + key + ':' + obj[key] + ';';
        }
    } catch (error) {
        throw new Error("error caught @ toStyleString(" + obj + "): " + error);
    }
    return output;
};

Util.downloadAsCsv = function (jsonData = null, fileName = 'data.csv', delimiter = ',') {
    if (jsonData) {

        var jsonToCsv = function (jsonData) {
            let csv = '';
            let headers = Object.keys(jsonData[0]);
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
}

Util.clone = function (input) {
    if (Array.isArray(input)) {
        return input.map(Util.clone);
    } else if (typeof input === 'object' && input !== null) {
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

HTMLElement.prototype.appendContentFor = function (list, funcValue = function (item) { return item; }, funcCondition = function (item) { return true; }) {
    try {
        for (let item of list) {
            this.appendContentIf(funcValue(item), funcCondition(item));
        }
    } catch (error) {
        throw ("@ appendContentFor(" + list + ", " + func + "): " + error);
    }
}

HTMLElement.prototype.appendFileElement = function (name, attributes) {
    return this.appendContent(
        Util.newElement('div', (attributes['container'] || {}))
            .appendContent(
                Util.newElement('div', {
                    ...{
                        'style': Util.toStyleString({
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
                                'style': Util.toStyleString(
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
                                'style': Util.toStyleString({
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
        ...{ style: Util.toStyleString(columnElementStyle) },
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
                        container: { style: Util.toStyleString({ 'width': '100%', 'padding-bottom': '3px' }) }
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
                container: { style: Util.toStyleString({ 'width': '100%', 'padding-bottom': '3px' }) }
            },
            ...(attributes['file'] || {})
        })
    }

    this.appendContent(
        Util.newElement('div', (attributes['container'] || {})).appendContent(
            Util.newElement('div', { ...{ style: Util.toStyleString(columnElementStyle) }, ...(attributes['subContainer'] || {}) })
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

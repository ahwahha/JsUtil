import './HTMLElement/HTMLElement.js'

function Util() {
};

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

Util.newElement = function (type, attributes = null) {
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

Util.downloadAsCsv = function (jsonData = null, fileName = 'data.csv', delimiter = ',') {
	try {
		if (jsonData) {

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

Util.get = function (selector) {
	if (selector != null && selector.trim().startsWith("#")) {
		return document.querySelector(selector);
	} else {
		return document.querySelectorAll(selector);
	}
};

export { Util };
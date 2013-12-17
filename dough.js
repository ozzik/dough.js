/*! Dough.js - by Oz Pinhas @ 2013 (Version 1.0)
 *  https://github.com/ozzik/dough.js
 *  Licensed under the MIT license. */
(function(w) {
	// Dough object
	function Dough() {}

	/* ==== Private shenanigans ==== */
	var _listeners = {}, // Saved event listeners methods
		_crumbs = 1, // Unique ID index (given to every DOM element for identifying it in listeners object)
		_htmlDivElement = document.createElement("div"), // Dummy div element for HTML creation
		_core;

	_core = {
		/* ==== Core methods ==== */
		/* Retrieves elements from DOM into a Dough object  */
		find: function(selector, base) {
			var dough = new Dough(), // Dough object to be returned
				e = [];

			// Someday there will be an efficient query method selection
			// (keep in mind: /^#[\w-]+$/i.test(selector))
			if (typeof selector === "string") {
				e = (base || document).querySelectorAll(selector);
			} else if (selector instanceof NodeList || Array.isArray(selector)) {
				e = selector;
			} else if (selector instanceof HTMLElement) {
				e[0] = selector;
			}

			// Storing elements in dough object as keys (=elements collection)
			for (var i = 0, len = e.length; i < len; i++) {
				dough[i] = e[i];
			}
			dough.length = e.length;

			return dough;
		},

		/* ==== DOM methods ==== */
		each: function(e, fn, args) {
			for (var i = 0; i < e.length; i++) {
				fn(e[i], args);
			}
		},

		/* ==== CSS-related methods ==== */
		/* Mingles with the CSS selector class(es) of every element in the collection */
		/* Fallback method is defined later on */
		edit_classes: function(e, action, classes) {
			classes = classes.split(" ");

			for (var i = 0; i < e.length; i++) {
				for (var j = 0, jLen = classes.length; j < jLen; j++) {
					e[i].classList[action](classes[j]);
				}
			}
		},

		/* Parses a given HTML string to DOM elements */
		parse_content: function(content) {
			var childNodes,
				returnedNodes = [];

			if (content instanceof HTMLElement) {
				return [content];
			} else {
				_htmlDivElement.innerHTML = content;
				childNodes = _htmlDivElement.childNodes;

				for (var i = 0, len = childNodes.length; i < len; i++) {
					returnedNodes[i] = childNodes[i];
				}

				return returnedNodes;
			}
		},

		/* Gets the sibling node element of a given element */
		get_sibling: function(e, isNext) {
			var property = (isNext ? "next" : "previous") + "Sibling",
				sibling = e[property];

			while (sibling && sibling.nodeType !== Node.ELEMENT_NODE) {
				sibling = sibling[property];
			}

			return sibling;
		},

		/* Inserts an HTTP parameter and its value to a given string */
		add_http_parameter: function(data, parameter, value) {
			return (data ? data + "&" : "") + parameter + "=" + value;
		},

		/* Creates an HTTP parameters string based on a given parameters object */
		generate_http_parameters: function(data) {
			var dataKeys = Object.keys(data),
				params = "";

			for (var i = 0, len = dataKeys.length; i < len; i++) {
				params = _core.add_http_parameter(params, dataKeys[i], data[dataKeys[i]]);
			}

			return params;
		}
	};

	// Logging and such
	function log(str, isBadUsage) {
		str += (isBadUsage) ? " god damned it!" : "";
		console.warn ? console.warn(str) : console.log(str);
	}

	/* ==== Exposed thingies ==== */
	// Exposed methods
	Dough.prototype = {
		/* ==== Retrieval methods ==== */
		/* Retrieves descendant element(s) as a new Dough object */
		/* (from the first element in the collection) */
		find: function(selector) {
			return _core.find(selector, this[0]);
		},

		/* Retrieves the successor element to an element */
		/* (relative to the first element in the collection) */
		next: function() {
			return doughFn(_core.get_sibling(this[0], true));
		},

		/* Retrieves the predecessor element of an element */
		/* (relative to the first element in the collection) */
		previous: function() {
			return doughFn(_core.get_sibling(this[0]));
		},

		/* ==== Style methods ==== */
		/* Adds a CSS selector class(es) to the collection's elements */
		addClass: function(classes) {
			_core.edit_classes(this, "add", classes.trim());

			return this;
		},

		/* Removes a CSS selector class(es) from the collection's elements */
		removeClass: function(classes) {
			_core.edit_classes(this, "remove", classes.trim());

			return this;
		},

		/* Adds/removes a CSS selector class(es) from/to collection's elements */
		toggleClass: function(classes) {
			_core.edit_classes(this, "toggle", classes.trim());

			return this;
		},

		/* Determines whether an element has a given CSS selector class(es) */
		/* (validates only against the first element in the collection) */
		hasClass: function(classes) {
			var hasClass = true;
			classes = classes.split(" ");

			for (var i = 0, len = classes.length; i < len && hasClass; i++) {
				hasClass = hasClass && this[0].classList.contains(classes[i]);
			}

			return hasClass;
		},

		/* Sets inline styling to the collection's elements */
		/* Invoking the method without any arguments clears all inline styling */
		css: function(styles, value) {
			var properties = [];

			// Prettifying styles object
			if (typeof styles === "object") {
				properties = Object.keys(styles);
			} else {
				properties = [styles];
				styles = {};
				styles[properties[0]] = value ? value : "";
			}

			for (var i = 0; i < this.length; i++) {
				for (var j = 0, jLen = properties['length']; j < jLen; j++) {
					this[i].style[properties[j]] = styles[properties[j]];
				}

				if (!styles) {
					this[i].removeAttribute("style");
				}
			}
		},

		/* ==== Structure methods ==== */
		/* Sets or removes an attribute to/from collection's elements */
		/* (Notice: not passing a value will trigger removal of the attribute) */
		attr: function(name, value) {
			for (var i = 0; i < this.length; i++) {
				this[i][(value ? "set" : "remove") + "Attribute"](name, value);
			}
		},

		/* Sets the HTML contents of collection's elements */
		html: function(value) {
			if (value === undefined) {
				log("Use .innerHTML", true);
				return;
			}
			
			for (var i = 0; i < this.length; i++) {
				this[i].innerHTML = value;
			}
		},

		/* Appends an element before every element in the collection */
		before: function(content) {
			content = _core.parse_content(content);

			for (var i = 0; i < this.length; i++) {
				for (var j = 0, jLen = content.length; j < jLen; j++) {
					this[i].parentNode.insertBefore(content[j].cloneNode(true), this[i]);
				}
			}
		},

		/* Appends an element before every element in the collection */
		after: function(content) {
			var successor;

			content = _core.parse_content(content);

			for (var i = 0; i < this.length; i++) {
				successor = _core.get_sibling(this[i], true);

				for (var j = 0, jLen = content.length; j < jLen; j++) {
					if (successor) {
						this[i].parentNode.insertBefore(content[j].cloneNode(true), successor);
					} else {
						this[i].parentNode.appendChild(content[j].cloneNode(true));
					}
				}
			}
		},

		/* ==== Events methods ==== */
		/* Sets a function to be executed on an element's event */
		on: function(event, fn, options) {
			for (var i = 0; i < this.length; i++) {
				// Attaching a unique identifier for the element + saving its function
				if (!this[i]._crumb) {
					this[i]._crumb = _crumbs++;
				} else if (_listeners[this[i]._crumb][event]) { // Removing already defined event listener
					Dough.prototype.off.apply(this, [event]);
				}
				_listeners[this[i]._crumb] = _listeners[this[i]._crumb] || {};
				_listeners[this[i]._crumb][event] = fn;

				// Fuck IE8-
				this[i].addEventListener(event, fn, options && options.isCapture);
			}
		},

		/* Removes previously set-up event function from an element */
		off: function(event) {
			for (var i = 0; i < this.length; i++) {
				if (this[i]._crumb && _listeners[this[i]._crumb][event]) {
					// Fuck IE8-
					this[i].removeEventListener(event, _listeners[this[i]._crumb][event]);

					delete _listeners[this[i]._crumb][event];
				}
			}
		},

		/* Invokes attached function to an element's event */
		trigger: function(event) {
			for (var i = 0; i < this.length; i++) {
				if (this[i]._crumb && _listeners[this[i]._crumb][event]) {
					_listeners[this[i]._crumb][event]();
				}
			}
		},

		/* ==== Collection methods ==== */
		each: function(fn) {
			for (var i = 0; i < this.length; i++) {
				fn(this[i]);
			}

			return this;
		}
	};

	// Conditional methods
	// No support for classList API -> using regex fallback
	if (document.body['classList']) {
		_core.edit_classes = function(e, action, classes) {
			var regex,
				removeRegex,
				hasClass;
			classes = classes.split(" ");

			// Processing classes for each element
			for (var i = 0, len = classes.length; i < len; i++) {
				regex = new RegExp("\\b" + classes[i] + "\\b");
				removeRegex = new RegExp("( \\b" + classes[i] + "\\b|\\b" + classes[i] + "\\b |^" + classes[i] + "$)");

				for (var j = 0; j < e.length; j++) {
					hasClass = regex.test(e[j].className);

					// Validating existence of class Name
					if ((action === "add" || action === "toggle") && !hasClass) {
						e[j].className += (e[j].className ? " " : "") + classes[i];
					} else if ((action === "remove" || action === "toggle") && hasClass) {
						e[j].className = e[j].className.replace(removeRegex, "");
					}
				}
			}
		}

		Dough.prototype.hasClass = function(classes) {
			var regex,
				hasClass = true;
			classes = classes.split(" ");

			for (var i = 0, len = classes.length; i < len && hasClass; i++) {
				regex = new RegExp("\\b" + classes[i] + "\\b");
				hasClass = hasClass && regex.test(this[0].className);
			}

			return hasClass;
		}
	}

	// Static methods
	/* Performs an asynchronus HTTP request */
	doughFn.ajax = function(params) {
		var midget = new XMLHttpRequest(),
			data = "",
			isJSON = (params.contentType === undefined || params.contentType === "application/json");

		params.type = params.type.toLowerCase();
		params.contentType = (isJSON) ? "application/json" : params.contentType; // Setting deafult to JSON
		params.contentType = (params.type !== "get") ? "application/x-www-form-urlencoded" : params.contentType;
		params.charset = (params.charset) ? params.charset : "UTF-8";

		midget.open(params.type, params.url, true);
		midget.setRequestHeader("Content-Type", params.contentType + ";charset=" + params.charset);

		midget.onreadystatechange = function() {
			if (midget.readyState === 4) {
				if (midget.status === 200) {
					var json;

					if (isJSON) {
						try {
							json = JSON.parse(midget.responseText);
						} catch (e) {
							params.parseError ? params.parseError(midget.status) : log("Dough JSON parsing error: " + e.name + " - " + e.message + ". You should handle this error with a .parseError method", true);
							return;
						}
					}

					params.success((isJSON) ? json : midget.responseText); // Success
				} else {
					params.error ? params.error(midget.status) : log("Dough AJAX error: Returned " + midget.status + ". You should handle this error with a .error method", true);
				}
			}
		};

		if (typeof params.data === "object" && params.type !== "get") {
			data = _core.generate_http_parameters(params.data);
		}

		midget.send(data);
	};
	// Programmatically creating HTTP-matching methods
	var httpMethods = ["get", "post", "put", "delete"];

	for (var i = 0, len = httpMethods.length; i < len; i++) {
		(function(method) {
			doughFn[method] = function(params) {
				params.type = method;
				doughFn.ajax(params);
			};
		})(httpMethods[i]);
	}

	/* Performs a cross-site request by injecting the request as a script */
	doughFn.jsonp = function(params) {
		var script = document.createElement("script");

		script.src = params.url + "?" + (params.callbackParam ? params.callbackParam : "callback") + "=" + params.callback + (params.data ? "&" + _core.generate_http_parameters(params.data) : "");
		script.type = "text/javascript";

		document.head.appendChild(script);
	};

	// Trigger function ($)
	function doughFn(selector) {
		return _core.find(selector);
	}

	window['$'] = (!window['$']) ? doughFn : window['$'];
    window['Dough'] = doughFn;
})(window);
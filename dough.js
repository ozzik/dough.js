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
	    _renderEngine,
	    _eventPointerStart,
	    _eventPointerMove,
	    _eventPointerEnd;

	/* ==== Core methods ==== */
    /* Retrieves elements from DOM into a Dough object  */
    function _find(selector, base) {
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
    }

    function _each(e, fn, args) {
        for (var i = 0; i < e.length; i++) {
            fn(e[i], args);
        }
    }

    /* ==== CSS-related methods ==== */
    /* Mingles with the CSS selector class(es) of every element in the collection */
    /* Fallback method is defined later on */
    function _edit_classes(e, action, classes) {
        classes = classes.split(" ");

        for (var i = 0; i < e.length; i++) {
            for (var j = 0, jLen = classes.length; j < jLen; j++) {
                e[i].classList[action](classes[j]);
            }
        }
    }

    /* Parses a given HTML string to DOM elements */
    function _parse_content(content) {
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
    }

    /* Gets the sibling node element of a given element */
    function _get_sibling(e, isNext) {
        var property = (isNext ? "next" : "previous") + "Sibling",
            sibling = e[property];

        while (sibling && sibling.nodeType !== Node.ELEMENT_NODE) {
            sibling = sibling[property];
        }

        return sibling;
    }

    /* Inserts an HTTP parameter and its value to a given string */
    function _add_http_parameter(data, parameter, value) {
        return (data ? data + "&" : "") + parameter + "=" + value;
    }

    /* Creates an HTTP parameters string based on a given parameters object */
    function _generate_http_parameters(data) {
        var dataKeys = Object.keys(data),
            params = "";

        for (var i = 0, len = dataKeys.length; i < len; i++) {
            params = _add_http_parameter(params, dataKeys[i], data[dataKeys[i]]);
        }

        return params;
    }

    /* Internal message printing */
    function _log(str, isBadUsage) {
        str += (isBadUsage) ? " god damned it!" : "";
        console.warn ? console.warn(str) : console.log(str);
    }

    /* Identifies the browser's rendering engine */
    function _detect_engine() {
        var ua = navigator.userAgent,
            value = "";

        if (ua.indexOf("webkit")) {
            value = "webkit";
        } else if (ua.indexOf("Firefox")) {
            value = "moz";
        }

        return value;
    }

	/* ==== Exposed thingies ==== */
	// Exposed methods
	Dough.prototype = {
		/* ==== Retrieval methods ==== */
		/* Retrieves descendant element(s) as a new Dough object */
		/* (from the first element in the collection) */
		find: function(selector) {
			return _find(selector, this[0]);
		},

		/* Retrieves the successor element to an element */
		/* (relative to the first element in the collection) */
		next: function() {
			return doughFn(_get_sibling(this[0], true));
		},

		/* Retrieves the predecessor element of an element */
		/* (relative to the first element in the collection) */
		previous: function() {
			return doughFn(_get_sibling(this[0]));
		},

		/* ==== Style methods ==== */
		/* Adds a CSS selector class(es) to the collection's elements */
		addClass: function(classes) {
			_edit_classes(this, "add", classes.trim());

			return this;
		},

		/* Removes a CSS selector class(es) from the collection's elements */
		removeClass: function(classes) {
			_edit_classes(this, "remove", classes.trim());

			return this;
		},

		/* Adds/removes a CSS selector class(es) from/to collection's elements */
		toggleClass: function(classes, isAdd) {
		    var action = (isAdd === undefined) ? "toggle" : (isAdd ? "add" : "remove");
		    _edit_classes(this, action, classes.trim());

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

            return this;
		},

		/* Sets the CSS transform property of the collection's elements */
		transform: function(transformFn) {
		    for (var i = 0; i < this.length; i++) {
		        this[i].style[_renderEngine + "Transform"] = transformFn;
		    }
		},

		/* Sets a CSS translate3d method to the collection's elements */
		translate: function(x, y, z) {
		    for (var i = 0; i < this.length; i++) {
		        this[i].style[_renderEngine + "Transform"] = "translate3d(" + (x || 0) + "px," + (y || 0) + "px," + (z || 0) + "px)";
		    }
		},

		/* Removes a CSS translate3d method from the collection's elements */
		reset_translate: function() {
		    for (var i = 0; i < this.length; i++) {
		        this[i].style[_renderEngine + "Transform"] = "";
		    }
		},

		/* ==== Structure methods ==== */
		/* Sets or removes an attribute to/from collection's elements */
		/* (Notice: not passing a value will trigger removal of the attribute) */
		attr: function(name, value) {
			for (var i = 0; i < this.length; i++) {
				this[i][(value ? "set" : "remove") + "Attribute"](name, value);
			}

            return this;
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

            return this;
		},

		/* Appends an element before every element in the collection */
		before: function(content) {
			content = _parse_content(content);

			for (var i = 0; i < this.length; i++) {
				for (var j = 0, jLen = content.length; j < jLen; j++) {
					this[i].parentNode.insertBefore(content[j].cloneNode(true), this[i]);
				}
			}

            return this;
		},

		/* Appends an element before every element in the collection */
		after: function(content) {
			var successor;

			content = _parse_content(content);

			for (var i = 0; i < this.length; i++) {
				successor = _get_sibling(this[i], true);

				for (var j = 0, jLen = content.length; j < jLen; j++) {
					if (successor) {
						this[i].parentNode.insertBefore(content[j].cloneNode(true), successor);
					} else {
						this[i].parentNode.appendChild(content[j].cloneNode(true));
					}
				}
			}

            return this;
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

            return this;
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

            return this;
		},

		/* Invokes attached function to an element's event */
		trigger: function(event) {
			for (var i = 0; i < this.length; i++) {
				if (this[i]._crumb && _listeners[this[i]._crumb][event]) {
					_listeners[this[i]._crumb][event]();
				}
			}

            return this;
		},

		/* ==== Action methods ==== */
		/* Creates a click/tap event listener */
		click: function(fn) {
		    this.on(_eventPointerStart, function(e) {
		        e.preventDefault();

		        this._$e = $(this);
		        this._startX = (_isTouch) ? e.touches[0].pageX : e.pageX;
		        this._startY = (_isTouch) ? e.touches[0].pageY : e.pageY;
		        this._didMove = false;
		        this._isPointerDown = true;

		        this._$e.addClass("pressed");
		    });

		    this.on(_eventPointerMove, function(e) {
		        if (!this._isPointerDown) { return; }

		        var x = (_isTouch) ? e.touches[0].pageX : e.pageX,
		            y = (_isTouch) ? e.touches[0].pageY : e.pageY;

		        this._didMove = (Math.abs(x - this._startX) >= 10) || (Math.abs(y - this._startY) >= 10);
		        if (this._didMove) {
		            this._$e.removeClass("pressed");
		        }
		    });

		    this.on(_eventPointerEnd, function(e) {
		        this._isPointerDown = false;

		        if (!this._didMove) {
		            this._$e.removeClass("pressed");

		            fn(this._$e);
		        }
		    });

		    return this;
		},

		/* ==== Collection methods ==== */
		/* Executes a given method on the collection's elements */
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
		_edit_classes = function(e, action, classes) {
			var regex,
				hasClass;
			classes = classes.split(" ");

			// Processing classes for each element
			for (var i = 0, len = classes.length; i < len; i++) {
				regex = new RegExp("( \\b" + classes[i] + "\\b|\\b" + classes[i] + "\\b |^" + classes[i] + "$)");

				for (var j = 0; j < e.length; j++) {
					hasClass = regex.test(e[j].className);

					// Validating existence of class Name
					if ((action === "add" || action === "toggle") && !hasClass) {
						e[j].className += (e[j].className ? " " : "") + classes[i];
					} else if ((action === "remove" || action === "toggle") && hasClass) {
						e[j].className = e[j].className.replace(regex, "");
					}
				}
			}
		}

		Dough.prototype.hasClass = function(classes) {
			var regex,
				hasClass = true;
			classes = classes.split(" ");

			for (var i = 0, len = classes.length; i < len && hasClass; i++) {
				regex = new RegExp("( \\b" + classes[i] + "\\b|\\b" + classes[i] + "\\b |^" + classes[i] + "$)");
				hasClass = hasClass && regex.test(this[0].className);
			}

			return hasClass;
		}
	}
	_renderEngine = _detect_engine();
	_isTouch = "ontouchstart" in document;

	_eventPointerStart = _isTouch ? "touchstart" : "mousedown";
	_eventPointerMove = _isTouch ? "touchmove" : "mousemove";
	_eventPointerEnd = _isTouch ? "touchend" : "mouseup";

	// Static methods
	doughFn.engine = _renderEngine;

	doughFn.parseJSON = function(text) {
	    var result = {
	        isSuccess: false,
	        json: null
	    };

	    try {
	        result.json = JSON.parse(text);
	        result.isSuccess = true;
	    } catch (e) {
	        result.error = e;
	    }

	    return result;
	};

	/* Performs an asynchronus HTTP request */
	doughFn.ajax = function(options) {
        var midget = new XMLHttpRequest(),
            data = "",
            isJSON = (options.contentType === undefined || options.contentType === "application/json");

        options.type = options.type.toLowerCase();
        options.contentType = (isJSON) ? "application/json" : options.contentType; // Setting deafult to JSON
        options.contentType = (options.type !== "get") ? "application/x-www-form-urlencoded" : options.contentType;
        options.charset = (options.charset) ? options.charset : "UTF-8";

        midget.open(options.type, options.url, true);
        midget.setRequestHeader("Content-Type", options.contentType + ";charset=" + options.charset);

        midget.onreadystatechange = function() {
            if (midget.readyState === 4) {
                if (midget.status === 200) {
                    var result;

                    if (isJSON) {
                        result = doughFn.parseJSON(midget.responseText);

                        if (result.isSuccess) {
                            result = result.json;
                        } else {
                            console.log(result);
                            options.parseError ? options.parseError(result.e) : _log("Dough JSON parsing error: " + result.error.name + " - " + result.error.message + ". You should handle this error with a .parseError method", true);
                            return;
                        }
                    }

                    options.success((isJSON) ? result : midget.responseText); // Success
                } else {
                    options.error ? options.error(midget.status) : _log("Dough AJAX error: Returned " + midget.status + ". You should handle this error with a .error method", true);
                }
            }
        };

        if (typeof options.data === "object" && options.type !== "get") {
            data = _generate_http_parameters(options.data);
        }

        midget.send(data);
    };
	// Programmatically creating HTTP-matching methods
	var httpMethods = ["get", "post", "put", "delete"];

	for (var i = 0, len = httpMethods.length; i < len; i++) {
		(function(method) {
			doughFn[method] = function(options) {
				options.type = method;
				doughFn.ajax(options);
			};
		})(httpMethods[i]);
	}

	/* Gets a JSON file locally */
	doughFn.getJSON = function(options) {
	    doughFn.get({
	        url: options.url,
	        contentType: "text/plain",
	        success: function(data) {
	            // Network success
	            var result = doughFn.parseJSON(data);

	            if (result.isSuccess) {
	                options.success(result.json);
	            } else {
	                (options.parseError) ? options.parseError(result.error) : _log("Dough JSON parsing error: " + result.error.name + " - " + result.error.message + ". You should handle this error with a .parseError method", true);
	            }
	        },
	        error: function(error) {
	            options.error ? options.error(error) : _log("Dough AJAX error: Returned " + error + ". You should handle this error with a .error method", true);
	        }
	    });
	};

	/* Performs a cross-site request by injecting the request as a script */
	doughFn.jsonp = function(options) {
		var script = document.createElement("script");

		script.src = options.url + "?" + (options.callbackParam ? options.callbackParam : "callback") + "=" + options.callback + (options.data ? "&" + _generate_http_parameters(options.data) : "");
		script.type = "text/javascript";

		document.head.appendChild(script);
	};

	// Trigger function ($)
	function doughFn(selector) {
		return _find(selector);
	}

	window['$'] = (!window['$']) ? doughFn : window['$'];
    window['Dough'] = doughFn;
})(window);
/*! Dough.js - by Oz Pinhas @ 2014 (Version 0.1.5)
 *  https://ozzik.github.com/dough.js
 *  Licensed under the MIT license. */
(function(w) {
	// Dough object
	function Dough() {}

	/* ==== Private shenanigans ==== */
	// Events
	var _listeners = {}, // Saved event listeners methods
		_crumbs = 1, // Unique ID index (given to every DOM element for identifying it in listeners object)
		_eventPointerStart,
		_eventPointerMove,
		_eventPointerEnd;
	// Transitions + animations
	var _PREFIXED_EVENTS = {
			AnimationEnd: [ "webkit" ],
			TransitionEnd: [ "webkit" ]
		}, // Browser engines which require prefixed event names
        _PREFIXED_PROPERTIES = {
            transform: [ "webkit", "ms" ]
        }, // Browser engines which require prefixed CSS property names
		_transitions = {}, // Queued transition callback data for transition end events
		_transitionProperties = {}, // Names of queued transition properties
		_tCrumbs = 1, // Unique ID for transitions
		_didSetupTransitionEnd,
		_animation = {},
		_didSetupAnimationEnd;
	// Shared + others
	var _renderEngine,
		_renderEngineStylePrefix,
		_device = {
			isWebkit: false,
			isGecko: false,
			isTrident: false,
			isTouch: false
		},
	   _htmlDivElement = document.createElement("div"); // Dummy div element for HTML creation

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

	/* Performs a method on the collection or on a given element within it */
	function _each(e, fn, index, args) {
		for (var i = index || 0, len = (index !== undefined ? index + 1 : e.length); i < len; i++) {
			fn(e[i], args);
		}
	}

	/* ==== CSS-related methods ==== */
	/* Mingles with the CSS selector class(es) of every element in the collection */
	/* Fallback method is defined later on */
	function _edit_classes(e, action, classes, index) {
		classes = classes.split(" ");

		_each(e, function(e) {
			for (var i = 0, len = classes.length; i < len; i++) {
				e.classList[action](classes[i]);
			}
		}, index);
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

	/* Adds an event listener to a given element */
	function _attach_listener(e, event, fn, options) {
		// Attaching a unique identifier for the element + saving its function
		if (!e._crumb) {
			e._crumb = _crumbs++;
		} else if (_listeners[e._crumb][event]) { // Removing already defined event listener
			Dough.prototype.off.apply(this, [event]);
		}
		_listeners[e._crumb] = _listeners[e._crumb] || {};
		_listeners[e._crumb][event] = fn;

		// Fuck IE8-
		e.addEventListener(event, fn, options && options.isCapture);
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
		var ua = navigator.userAgent.toLowerCase(),
			engine = "";

		if (ua.indexOf("webkit") !== -1) {
			engine = "webkit";
			stylePrefix = "webkit";
			_device.isWebkit = true;
		} else if (ua.indexOf("trident") !== -1) {
			engine = "ms";
			stylePrefix = "ms";
			_device.isTrident = true;
		} else if (ua.indexOf("firefox") !== -1) {
			engine = "moz";
			stylePrefix = "Moz";
			_device.isGecko = true;
		}

		return {
			engine: engine,
			stylePrefix: stylePrefix
		};
	}

	/* Prettifies a given CSS property name according with possible required vendor prefix */
	function _synthasize_property(property) {
		if (_PREFIXED_PROPERTIES[property] && _PREFIXED_PROPERTIES[property].indexOf(_renderEngine) !== -1) {
            return "-" + _renderEngine + "-" + property;
		} else {
			return property;
		}
	}

	/* Prettifies a given JS event name according with possible required vendor prefix */
	function _synthasize_event(event) {
		if (_PREFIXED_EVENTS[event].indexOf(_renderEngine) !== -1) {
			return _renderEngine + event;
		} else {
			return event.toLowerCase();
		}
	}

	/* Attaches an event listener for handling the finish of a CSS transition */
	function _setup_transition_end_listener() {
		document.body.addEventListener(_synthasize_event("TransitionEnd"), function(e) {
			if (!_transitionProperties[e.propertyName]) { return; } // Property that wasn't selected for detection

			// Finding queued transition
			var transition = _transitions[e.target._tCrumb];
			if (!transition) { return; }

			transition.finished++;

			if (transition.finished == transition.required) {
				// Marking transition as completed
				delete _transitions[e.target._tCrumb];
				_transitionProperties[e.property]--;

				transition.callback && setTimeout(transition.callback, transition.delay || 0);;
			}
		});

		_didSetupTransitionEnd = true;
	}

	/* Attaches an event listener for handling the finish of a CSS animation */
	function _setup_animation_end_listener() {
		document.body.addEventListener(_synthasize_event("AnimationEnd"), function(e) {
			if (e.animationName !== _animation.name) { return; }

			_animation.finished++;

			if (_animation.finished == _animation.required) {
				_animation.name = null;
				if (!_animation.delay) {
					_animation.callback();
				} else {
					setTimeout(_animation.callback, _animation.delay);
				}
				_animation = {};
			}
		});

		_didSetupAnimationEnd = true;
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
		addClass: function(classes, index) {
			_edit_classes(this, "add", classes.trim(), index);

			return this;
		},

		/* Removes a CSS selector class(es) from the collection's elements */
		removeClass: function(classes, index) {
			_edit_classes(this, "remove", classes.trim(), index);

			return this;
		},

		/* Adds/removes a CSS selector class(es) from/to collection's elements */
		toggleClass: function(classes, isAdd, index) {
			var action = "toggle";

			if (typeof isAdd === "boolean") {
				action = (isAdd) ? "add" : "remove";
			} else {
				index = isAdd;
			}

			_edit_classes(this, action, classes.trim(), index);

			return this;
		},

		/* Determines whether every element in the collection has a given CSS selector class(es) */
		hasClass: function(classes, index) {
			var hasClass = true;
			classes = classes.split(" ");

			for (var i = index || 0, len = (index !== undefined ? index + 1 : this.length); i < len; i++) {
				for (var j = 0, jLen = classes.length; j < jLen && hasClass; j++) {
					hasClass = hasClass && this[i].classList.contains(classes[j]);
				}
			}

			return hasClass;
		},

		/* Sets inline styling to the collection's elements */
		/* Invoking the method without any arguments clears all inline styling */
		css: function(styles, value, index) {
			var properties = [];

			// Prettifying styles object
			if (typeof styles === "object") {
				properties = Object.keys(styles);
				index = value; // Optional
			} else {
				properties = [styles];
				styles = {};
				styles[properties[0]] = value ? value : "";
			}

			_each(this, function(e) {
				for (var i = 0, len = properties['length']; i < len; i++) {
					e.style[properties[i]] = styles[properties[i]];
				}

				if (!styles) {
					e.removeAttribute("style");
				}
			}, index);

			return this;
		},

		/* Sets the CSS transform property of the collection's elements */
		transform: function(transformFn, index) {
			_each(this, function(e) {
				e.style[_renderEngineStylePrefix + "Transform"] = transformFn;
			}, index);

			return this;
		},

		/* Sets a CSS translate3d method to the collection's elements */
		translate: function(x, y, z, index) {
			_each(this, function(e) {
				e.style[_renderEngineStylePrefix + "Transform"] = "translate3d(" + (x || 0) + "px," + (y || 0) + "px," + (z || 0) + "px)";
			}, index);

			return this;
		},

		/* ==== Structure methods ==== */
		/* Sets or removes an attribute to/from collection's elements */
		/* (Notice: not passing a value will trigger removal of the attribute) */
		attr: function(name, value, index) {
			_each(this, function(e) {
				e[(value !== undefined ? "set" : "remove") + "Attribute"](name, value);
			}, index);

			return this;
		},

		/* Sets the HTML contents of collection's elements */
		html: function(value, index) {
			if (value === undefined) {
				log("Use .innerHTML", true);
				return;
			}
			
			_each(this, function(e) {
				e.innerHTML = value;
			}, index);

			return this;
		},

		/* Appends an element before every element in the collection */
		before: function(content, index) {
			content = _parse_content(content);

			_each(this, function(e) {
				for (var i = 0, len = content.length; i < len; i++) {
					e.parentNode.insertBefore(content[i].cloneNode(true), e);
				}
			}, index);

			return this;
		},

		/* Appends an element before every element in the collection */
		after: function(content, index) {
			var successor;

			content = _parse_content(content);

			_each(this, function(e) {
				successor = _get_sibling(e, true);

				for (var i = 0, len = content.length; i < len; i++) {
					if (successor) {
						e.parentNode.insertBefore(content[i].cloneNode(true), successor);
					} else {
						e.parentNode.appendChild(content[i].cloneNode(true));
					}
				}
			}, index);

			return this;
		},

		/* ==== Events methods ==== */
		/* Sets a function to be executed on an element's event */
		on: function(event, fn, options, index) {
			index = (typeof options !== "object") ? options : index; // Optional

			_each(this, function(e) {
				_attach_listener(e, event, fn, options);
			}, index);

			return this;
		},

		/* Removes previously set-up event function from an element */
		off: function(event, index) {
			_each(this, function(e) {
				if (e._crumb && _listeners[e._crumb][event]) {
					// Fuck IE8-
					e.removeEventListener(event, _listeners[e._crumb][event]);

					delete _listeners[e._crumb][event];
				}
			}, index);

			return this;
		},

		/* Invokes attached function to an element's event */
		trigger: function(event, index) {
			_each(this, function(e) {
				if (this[i]._crumb && _listeners[this[i]._crumb][event]) {
					_listeners[this[i]._crumb][event]();
				}
			}, index);

			return this;
		},

		/* ==== Action methods ==== */
		/* Creates a click/tap event listener */
		click: function(fn, index) {
			this.on(_eventPointerStart, function(e) {
				e.preventDefault();

				this._$e = $(this);
				this._startX = (_device.isTouch) ? e.touches[0].pageX : e.pageX;
				this._startY = (_device.isTouch) ? e.touches[0].pageY : e.pageY;
				this._didMove = false;
				this._isPointerDown = true;

				this._$e.addClass("pressed");
			}, index);

			this.on(_eventPointerMove, function(e) {
				if (!this._isPointerDown) { return; }

				var x = (_device.isTouch) ? e.touches[0].pageX : e.pageX,
					y = (_device.isTouch) ? e.touches[0].pageY : e.pageY;

				this._didMove = (Math.abs(x - this._startX) >= 10) || (Math.abs(y - this._startY) >= 10);
				if (this._didMove && this._$e) {
					this._$e.removeClass("pressed");
				}
			}, index);

			this.on(_eventPointerEnd, function(e) {
				this._isPointerDown = false;

				if (!this._didMove) {
					this._$e.removeClass("pressed");

					fn(this._$e);
				}
			}, index);

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
	if (!document.body['classList']) {
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

	var _renderEngineInfo = _detect_engine(); // Temporary holder

	_renderEngine = _renderEngineInfo.engine;
	_renderEngineStylePrefix = _renderEngineInfo.stylePrefix;
	_device.isTouch = "ontouchstart" in document;

	_eventPointerStart = _device.isTouch ? "touchstart" : "mousedown";
	_eventPointerMove = _device.isTouch ? "touchmove" : "mousemove";
	_eventPointerEnd = _device.isTouch ? "touchend" : "mouseup";

	// Static methods
	doughFn.engine = _renderEngine;
	doughFn.device = _device;

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
	var httpMethods = ["get", "post", "put", "delete"],
		httpMethodNames = ["get", "post", "put", "del"];

	for (var i = 0, len = httpMethods.length; i < len; i++) {
		(function(name, method) {
			doughFn[name] = function(options) {
				options.type = method;
				doughFn.ajax(options);
			};
		})(httpMethodNames[i], httpMethods[i]);
	}

	/* Performs a cross-site request by injecting the request as a script */
	doughFn.jsonp = function(options) {
		var script = document.createElement("script");

		script.src = options.url + "?" + (options.cbParam ? options.cbParam : "callback") + "=" + options.callback + (options.data ? "&" + _generate_http_parameters(options.data) : "");
		script.type = "text/javascript";

		document.head.appendChild(script);
	};

	/* Sets a method to be executed upon the finish of a CSS transition */
	doughFn.transitionEnd = function(property, items, callback, delay) {
		// Setting up transition end handling method
		!_didSetupTransitionEnd && _setup_transition_end_listener();

		// Actual callback
		property = _synthasize_property(property);

		_tCrumbs++;
		var transition = {
			id: _tCrumbs,
			finished: 0,
			required: items.length || 1,
			callback: callback,
			delay: delay
		};
		
		// Marking items
		if (!items.length) {
			items._tCrumb = _tCrumbs;
		} else {
			for (var i = 0; i < items.length; i++) {
				items[i]._tCrumb = _tCrumbs;
			}
		}
		
		_transitions[_tCrumbs] = transition;

		if (!_transitionProperties[property]) {
			_transitionProperties[property] = 0;
		}
		_transitionProperties[property]++;
	};

	/* Sets a method to be executed upon the finish of a CSS animation */
	doughFn.animationEnd = function(name, required, callback, delay) {
		// Setting up animation end handling method
		!_didSetupAnimationEnd && _setup_animation_end_listener();
		
		_animation = {
			name: name,
			finished: 0,
			required: required,
			callback: callback,
			delay: delay
		};
	};

	// Trigger function ($)
	function doughFn(selector) {
		return _find(selector);
	}

	window['$'] = (!window['$']) ? doughFn : window['$'];
	window['Dough'] = doughFn;
})(window);
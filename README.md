# Dough.js
A Differently-small many-in-one JavaScript library for DOM manipulation and AJAX network requests.

**Browser support**: Modern desktop browsers, IE9+, iOS and Android.

## Notice

This library is mainly for bulk manipulations and is based on the principle of doing things natively whenever possible; hence some methods won't work as expected. For example, `$(".my-img").attr("width")` **won't** return the value of the `width` attribute because that can and should be done natively with `$(".my-img")[0].getAttribute("width")` or even with `document.querySelector(".my-img").getAttribute("width")`. 

Also, executing Dough queries in the Browser console returns an object and not an array like jQuery and Zepto.

## API Documentation

### $(*selector*) or Dough(*selector*)

Parameters:
* `selector` - (string) CSS selector, (object) DOM element(s) or an array of DOM element objects.

Matches elements in the DOM with the given selector or wraps the a given DOM element object in a Dough object. Either way, returns a Dough object.

```javascript
$("a"); // CSS selector

element.addEventListener("click", function(this) {
  var me = $(this); // Dom element
}

$(document.querySelectorAll("a")); // Dom elements
```

### addClass(*classes*)

Parameters:
* `classes` - (string) CSS selector class(es).

Adds one or more CSS selector classes to every element in the collection.
Returns the same Dough object for further method chaining.

```javascript
$("a").addClass("sugar-free carbon-free");
```

### removeClass(*classes*)

Parameters:
* `classes` - (string) CSS selector class(es).

Removes one or more CSS selector classes from every element in the collection.
Returns the same Dough object for further method chaining.

```javascript
$("a").toggleClass("sugar carbon");
```

### removeClass(*classes*)

Parameters:
* `classes` - (string) CSS selector class(es).

Adds or removes one or more CSS selector classes from every element in the collection, according to its presence.
Returns the same Dough object for further method chaining.

```javascript
$("a").toggleClass("diet zero");
```

### hasClass(*classes*)

Parameters:
* `classes` - (string) CSS selector class(es).

Determines whether the first element in the collection has one or more CSS selector classes. Returns a boolean value for the presence of the CSS selector class(es).

```javascript
$("a").hasClass("light lite");
```

### css(*styles*, [*value*])

Parameters:
* `styles` - (object) Key-value pairs of CSS properties and their matching values, or (string) the name of a specific CSS property name.
* `value` - (string) Value for a specific CSS property (when `styles` is a property name).

Sets or removes inline styling for every element in the collection, based on the given parameters. Returns the same Dough object for further method chaining. **Notice**: When `styles` is the name of a single CSS property and no `value` is set - the method will **remove** that property and **won't return the value of that property** (use `$("a")[0].styles.color` instead).

```javascript
$("a").css("color", "mileycyrus"); // Specific property

$("a").css({
  "color", "selenagomez",
  "letterSpacing": "1.5em"
}); // Multiple properties

$("a").css("color"); // Removes the property
```

### attr(*name*, *value*)

Parameters:
* `name` - (string) Name of the attribute to modify.
* `value` - (string) Value to set to the attribute.

Sets or removes an attribute for every element in the collection, based on the given parameters. Returns the same Dough object for further method chaining. **Notice**: When no `value` is set - the method will **remove** that attribute and **won't return the value of that attribute** (use `$("a")[0].getAttribute("href")` instead).

```javascript
$("a").attr("href", "http://pleasehelpmebeyonce.com"); // Sets the href attribute

$("a").attr("href"); // Removes the attribute
```

### html(*value*)

Parameters:
* `value` - (string) HTML to set as the content.

Sets the HTML contents of every element in the collection. Returns the same Dough object for further method chaining. **Notice**: When no `value` is set - the method **won't return the HTML contents** (use `$("a")[0].innerHTML` instead).

```javascript
$("a").html("Beyoncé Beyoncé, Shakira Shakira");
```

### before(*content*)

Parameters:
* `content` - (string) HTML to add as the content, or (object) DOM element(s) to add as the content.

Appends content to the page before every element in the collection. Returns the same Dough object for further method chaining.

```javascript
$("li").before("<li>I'm lazy!</li>"); // HTML string

var e = document.createElement("li");
li.innerHTML = "I'm fine";
$("li").before(e); // DOM element object
```

### after(*content*)

Parameters:
* `content` - (string) HTML to add as the content, or (object) DOM element(s) to add as the content. Returns the same Dough object for further method chaining.

Appends content to the page after every element in the collection.

```javascript
$("li").after("<li>I'm lazy!</li>"); // HTML string

var e = document.createElement("li");
li.innerHTML = "I'm fine";
$("li").after(e); // DOM element object
```

### find(*selector*)

Parameters:
* `selector` - (string) CSS selector.

Matches elements in the first element in the collection with the given selector. Returns a Dough object.

```javascript
$(".my-list").find("li").addClass("ghosts");
```

### next()

Parameters: (none).

Gets the successor element of the first element in the collection. Returns the same Dough object for further method chaining.

```javascript
$(".my-li").next().addClass("bitch");
```

### previous()

Parameters: (none).

Gets the predecessor element of the first element in the collection. Returns the same Dough object for further method chaining.

```javascript
$(".my-li").previous().addClass("queen");
```

### on(*event*, *fn*, [*options*])

Parameters:
* (string) Name of event to attach the method to.
* (function) Method to execute when event is triggered.
* (object) Key-value pairs of events properties.

Attaches an event-handling method for every element in the collection. Supported options are `isCaptured` for creating an event listener using the capture event processing. **Notice**: `on()` will detach any previously set event handlers configured by `on()`.

```javascript
$(".button-heavy").on("click", function() {
	alert("Bootylicious");
});
```

### off(*event*);

Parameters:
* (string) Name of event to detach its event handler.

Detaches a previously set event-handling method from every element in the collection.

```javascript
$(".super-form").off("submit");
```

### trigger(*event*);

Parameters:
* (string) Name of event to invoke its event handler.

Invokes a previously set event-handling method for every element in the collection.

```javascript
$(".button-heavy").trigger("click");
```
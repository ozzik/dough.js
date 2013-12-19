# Dough.js
A Differently-small many-in-one JavaScript library for DOM manipulation and AJAX network requests.

**Browser support**: Modern desktop browsers, IE9+, iOS and Android.

## Notice

This library is mainly for bulk manipulations and is based on the principle of doing things natively whenever possible; hence some methods won't work as expected. For example, `$(".my-img").attr("width")` **won't** return the value of the `width` attribute because that can and should be done natively with `$(".my-img")[0].getAttribute("width")` or even with `document.querySelector(".my-img").getAttribute("width")`. 

Also, executing Dough queries in the Browser console returns an object and not an array like jQuery and Zepto.

## API Documentation

### $(selector) or Dough(selector)

Parameters:

* `selector` - (string) CSS selector, (object) DOM element(s) or an array of DOM element objects.

Matches elements in the DOM with the given selector string or wraps the a given DOM element object in a Dough object. Either way, returns a Dough object.

```javascript
$("a"); // CSS selector

element.addEventListener("click", function(this) {
  var me = $(this); // Dom element
}

$(document.querySelectorAll("a")); // Dom elements
```

### addClass(classes)

Parameters:
* `classes` - (string) CSS selector class(es).

Adds one or more CSS selector classes to every element in the collection.
Returns the same Dough object for further method chaining.

```javascript
$("a").addClass("sugar-free carbon-free");
```

### removeClass(classes)

Parameters:
* `classes` - (string) CSS selector class(es).

Removes one or more CSS selector classes from every element in the collection.
Returns the same Dough object for further method chaining.

```javascript
$("a").toggleClass("sugar carbon");
```

### removeClass(classes)

Parameters:
* `classes` - (string) CSS selector class(es).

Adds or removes one or more CSS selector classes from every element in the collection, according to its presence.
Returns the same Dough object for further method chaining.

```javascript
$("a").toggleClass("diet zero");
```

### hasClass(classes)

Parameters:
* `classes` - (string) CSS selector class(es).

Determines whether the first element in the collection has one or more CSS selector classes. Returns a boolean value for the presence of the CSS selector class(es).

```javascript
$("a").hasClass("light lite");
```

### css(styles, [value])

Parameters:
* `styles` - (object) Key-value pairs of CSS properties and their matching values, or (string) the name of a specific CSS property name.
* `value` - (string) Value for a specific CSS property (when `styles` is a property name).

Sets or removes inline styling for every element in the collection, based on the given parameters. **Notice**: When `styles` is the name of a single CSS property and no `value` is defined - the method will **remove** that property and **won't return the value of that property** (for reteriving the value, use `$("a")[0].styles.color`).

```javascript
$("a").css("color", "mileycyrus"); // Specific property

$("a").css({
  "color", "selenagomez",
  "letterSpacing": "1.5em"
}); // Multiple properties

$("a").css("color"); // Removes property

```

# Dough.js
A Differently-small many-in-one JavaScript library for DOM manipulation and AJAX network requests.

**Browser support**: Modern desktop browsers, IE9+, iOS and Android.

## Notice

This library is mainly for bulk manipulations and is based on the principle of doing things natively whenever possible; hence some methods won't work as expected. For example, `$(".my-img").attr("width")` **won't** return the value of the `width` attribute because that can and should be done natively with `$(".my-img")[0].getAttribute("width")` or even with `document.querySelector(".my-img").getAttribute("width")`. 

Also, executing Dough queries in the Browser console returns an object and not an array like jQuery and Zepto.

## API Documentation

### $(selector) or Dough(selector)

Parameters:

* `selector` - String of a CSS selector, DOM element(s) object or an array of DOM element objects.

Matches elements in the DOM with the given selector string or wraps the a given DOM element object in a Dough object. Either returns a Dough object.

```
$("a"); // CSS selector


element.addEventListener("click", function(this) {
  var me = $(this); // Dom element
}

$(document.querySelectorAll("a")); // Dom elements
```

### addClass(classes)

Parameters:
* `classes` - String of a CSS selector class(es).

Adds one or more CSS selector classes to every element in the collection.

```
$("a").addClass("sugar-free carbon-free");
```

### removeClass(classes)

Parameters:
* `classes` - String of a CSS selector class(es).

Removes one or more CSS selector classes from every element in the collection.

```
$("a").toggleClass("sugar carbon");
```

### removeClass(classes)

Parameters:
* `classes` - String of a CSS selector class(es).

Adds or removes one or more CSS selector classes from every element in the collection, according to its presence.

```
$("a").toggleClass("diet zero");
```

### hasClass(classes)

Parameters:
* `classes` - String of a CSS selector class(es).

Determines whether the first element in the collection has one or more CSS selector classes.

```
$("a").hasClass("light lite");
```
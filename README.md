# Dough.js
A Differently-small many-in-one JavaScript library for DOM manipulation and AJAX network requests.

## Comptability
Modern desktop browsers, IE9+, iOS and Android.

## Notice

This library is mainly for bulk manipulations and is based on the principle of doing things natively whenever possible; hence some methods won't work as expected. For example, `$(".my-img").attr("width")` **won't** return the value of the `width` attribute because that can and should be done natively with `$(".my-img")[0].getAttribute("width")` or even with `document.querySelector(".my-img").getAttribute("width")`. 

Also, executing Dough queries in the Browser console returns an object and not an array like jQuery and Zepto.

# API Documentation
**`Dough()` / `$()`**

Parameters: *string* or *DOM element object*

Matches elements in the DOM with the given selector string or wraps the a given DOM element object in a Dough object.

Returns a Dough object.
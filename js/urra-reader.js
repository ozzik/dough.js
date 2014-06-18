/* ===== Main thingies ===== */

var Pager = {};

(function() {
    var _ePages,
        _stepFactor,
        _pages = [],
        _activePage = 0,
        _pager,
        _rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };

    Pager.init = function() {
        _ePages = $(".ur-pages");
        _pages = document.querySelectorAll(".ur-page");
        _stepFactor = 100 / _pages.length;

        // window.addEventListener("mousewheel", function(e) {
        //     e.preventDefault();
            
        //     _move(e.wheelDelta < 0);
        // });
        // window.addEventListener("keyup", function(e) {
        //     var isNext = e.which === 39 || e.which === 40,
        //         isPrevious = e.which === 37 || e.which === 38;

        //     if (isNext || isPrevious) {
        //         _move(isNext);
        //     }
        // });

        _createPager();
        // Pager.gotoPage(0);

        // Setting up custom animated scroll links
        $(".animate-scroll").on("click", function(e) {
            e.preventDefault();

            var pageName = this.getAttribute("href").substring(1),
                page = document.querySelector("a[name='" + pageName + "']");

            _animate_scroll(page);

            window.location.hash = pageName;
        });
    }

    Pager.gotoPage = function(page) {
        page = document.querySelector(".ur-page[data-index='" + page + "']");

        _animate_scroll(page);

        // Other metadata
        _activePage = page;
        window.location.hash = page.getAttribute("data-id");
    }

    function _easeInOutCubic(t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    }

    /* RequestAnimationFrame-based scroll from (https://gist.github.com/james2doyle/5694700) */
    function _animate_scroll(element) {
        var eDoc = (navigator.userAgent.indexOf('Firefox') != -1 || navigator.userAgent.indexOf('MSIE') != -1) ? document.documentElement : document.body,
            scrollStart = eDoc.scrollTop,
            scrollEnd = element.offsetTop,
            change = scrollEnd - scrollStart,
            tick = 0,
            duration = 300;

        function scroll_a_bit() {
            tick += 20;
            eDoc.scrollTop = _easeInOutCubic(tick, scrollStart, change, duration);

            if (tick < duration) {
                _rAF(scroll_a_bit);
            }
        }
        (scrollStart !== scrollEnd) && scroll_a_bit();
    }

    function _move(isForwards) {
        if (isForwards && _activePage !== _pages.length - 1 || !isForwards && _activePage !== 0) {
            Pager.gotoPage(_activePage + (isForwards ? 1 : -1));
        }
    }

    function _createPager() {
        // Reviving
        _pager = $(".ur-pager");

        _pager.on("mouseover", function(e) {
            $(this).addClass("active");
        });
        _pager.on("mousemove", function(e) {
            clearTimeout(_pager._revealTimer);

            if (_pager._isRevealed) { return; }

            _pager._revealTimer = setTimeout(function() {
                _pager._isRevealed = true;
                _pager.addClass("reveal");
            }, 500);
        });
        _pager.on("mouseout", function(e) {
            if (!e.toElement || e.toElement.className.indexOf("ur-pager") !== -1) { return; }

            $(this).removeClass("active");

            clearTimeout(_pager._revealTimer);
            _pager.removeClass("reveal");
            _pager._isRevealed = false;
        });

        _pager.find(".ur-pager-link").on("click", function(e) {
            e.preventDefault();
            Pager.gotoPage(parseInt(this.getAttribute("data-index"), 10));
        });
    }
})()
/* ===== Main thingies ===== */

var UR = {};

(function() {
    UR.book = null; // Book reference
    UR.PAGE_TYPES = {
        COVER: "cover",
        CHAPTER: "chapter",
        INDEX: "index"
    };

    /* Loads up reader when not using author */
    UR.init = function() {
        if (!window.UA) {
            UR.start();
        }
    }

    /* Initializes reader UI */
    UR.start = function(book) {
        console.log("reader start");

        UR.book = book;
        Pager.init();

        // Custom methods
        window['_urReady'] && window['_urReady']();
    }
})()

document.addEventListener("DOMContentLoaded", UR.init);
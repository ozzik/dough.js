/* ===== Main thingies ===== */

var Pager = {};

(function() {
    var _ePages,
        _stepFactor,
        _pages = [],
        _activePage = 0,
        _pager;

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
        Pager.gotoPage(0);
    }

    Pager.gotoPage = function(page) {
        // _ePages.transform("translate3d(-" + (_stepFactor * page) +"%,0,0)");

        // // Updating pager
        // _pager.find(".ur-pager-item:nth-child(" + (_activePage + 1) + ")").removeClass("ur-active");
        // _pager.find(".ur-pager-item:nth-child(" + (page + 1) + ")").addClass("ur-active");

        // _ePages.find(".ur-page[data-index='" + _activePage + "']").removeClass("ur-active");
        // _ePages.find(".ur-page[data-index='" + page + "']").addClass("ur-active");

        _activePage = page;
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
        _pager.on("mouseout", function(e) {
            $(this).removeClass("active");

        });

        _pager.find(".ur-pager-link").on("click", function(e) {
            Pager.gotoPage(parseInt(this.getAttribute("data-index"), 10));
        });
    }
})()

var Publisher = {};

(function() {
    var BOOK_TARGET_SELECTOR = ".ur-pages",
        _wrapperWidth;

    Publisher.post = function(fragment, bookConfig, bookCompiledData) {
        // Injecting book content into document
        document.querySelector(BOOK_TARGET_SELECTOR).appendChild(fragment)

        // Initializing reader + removing author signs from document
        UR.start(bookCompiledData);
        UA.remove();
    }

    Publisher.setupStyle = function(pageCount) {
        var style = "",
            wrapper = document.querySelector(".grid-column-3"),
            left = wrapper.offsetLeft + wrapper.offsetWidth,
            pagesHalf = parseInt(pageCount / 2),
            pagerOffset = 0;

        _urraDynamicStyle = document.getElementById("urraDynamicStyle");

        // Pager
        // style += ".ur-pager { left: " + left + "px; width: " + (window.innerWidth - left) + "px; }";

        // for (var i = 0; i < pagesHalf; i++) {
        //     style += ".ur-pager-item:nth-child(" + (pagesHalf + i) + "):not(.active) {";
        //     // style += "-webkit-transform: scale(1); }";
        //     style += ".ur-pager-item:nth-child(" + (pagesHalf - i) + "):not(.active) {";
        //     // style += "-webkit-transform: scale(1); }";
        //     style += ".ur-pager-item:nth-child(" + (pagesHalf + i) + "),";
        //     style += ".ur-pager-item:nth-child(" + (pagesHalf - i) + ") {";
        //     style += "-webkit-transition-delay: " + (i * .02) + "s; }";
        //     pagerOffset++;
        // }

        // Page size
        // style += "body { width: " + (pageCount * 100) + "%; }";
        // style += ".ur-page { width: " + (100 / pageCount) +"%; }"

        _urraDynamicStyle.innerHTML = style;
    }
})();

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
        Publisher.setupStyle();
        window['_urReady'] && window['_urReady']();
    }
})()

document.addEventListener("DOMContentLoaded", UR.init);
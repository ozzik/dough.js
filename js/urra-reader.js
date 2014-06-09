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

        return;
        window.addEventListener("mousewheel", function(e) {
            e.preventDefault();
            
            _move(e.wheelDelta < 0);
        });
        window.addEventListener("keyup", function(e) {
            var isNext = e.which === 39 || e.which === 40,
                isPrevious = e.which === 37 || e.which === 38;

            if (isNext || isPrevious) {
                _move(isNext);
            }
        });

        _createPager();
        Pager.gotoPage(0);
    }

    Pager.gotoPage = function(page) {
        _ePages.transform("translate3d(-" + (_stepFactor * page) +"%,0,0)");

        // Updating pager
        _pager.find(".ur-pager-item:nth-child(" + (_activePage + 1) + ")").removeClass("ur-active");
        _pager.find(".ur-pager-item:nth-child(" + (page + 1) + ")").addClass("ur-active");

        _ePages.find(".ur-page[data-index='" + _activePage + "']").removeClass("ur-active");
        _ePages.find(".ur-page[data-index='" + page + "']").addClass("ur-active");

        _activePage = page;
    }

    function _move(isForwards) {
        if (isForwards && _activePage !== _pages.length - 1 || !isForwards && _activePage !== 0) {
            Pager.gotoPage(_activePage + (isForwards ? 1 : -1));
        }
    }

    function _createPager() {
        // var fragment = document.createDocumentFragment(),
        var e = document.createElement("div"),
            html = "",
            page;

        // Elements creation
        html += '<ul class="ur-pager">';

        for (var i = 0; i < UR.book.pages.length; i++) {
            page = UR.book.pages[i];

            html += '<li class="ur-pager-item' + (i === _activePage ? ' ur-active' : "") + '"">';
            html += '<a class="ur-pager-link" href="#' + page.id +'" title="' + page.name +'" data-index="' + page.index + '">';

            if (page.type === UR.PAGE_TYPES.CHAPTER) {
                html += page.nameForPager || page.name;
            } else {
                // html += '<span class="ur-pager-dot"></span>';
                html += '<span class="ur-pager-dot">·</span>';
            }

            html += '</a></li>';
        }

        html += '</ul>';

        e.className = "ur-pager-wrapper";
        e.innerHTML = html;

        document.body.appendChild(e);

        // Reviving
        _pager = $(".ur-pager");

        _pager.find(".ur-pager-link").on("click", function(e) {
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
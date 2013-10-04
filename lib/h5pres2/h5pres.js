
/*
 * note: if rdfx has been defined in other rdfx libraries, 
 * merely defining a var here does no overwrite it.  The
 * subsequent check of rdfx creates an empty container
 * object only if necessary.
 */
var rdfx = rdfx ? rdfx : {};


rdfx.h5pres = (function () {
    "use strict";
    // private vars
    var slides, 
        nonslides,
        everything,
        presenting = false, 
        cascadingHeadings = true, 
        current = 0, 
        keys = { backspace : 8, tab: 9, escape : 27, pageup : 33, pagedown : 34, end : 35, home : 36, left : 37, up : 38, right : 39, down : 40, slash : 191, f_five : 116, sect: 167 },
        params = { slide : "s", debug : "debug" },
        debug = false,

    /* Analyse the query part of the URI returning an array of name value pairs. candidate for memoization.*/
    parseHash = function () {
        var i, arg, argObj = {}, args;

        if (location.hash) {
            args = location.hash.substring(1).split('&');
            for (i = 0; i < args.length; i = i + 1) {
                arg = args[i].split('=');
                argObj[arg[0]] = arg[1];
            }
        }
        return argObj;
    },

    /* return the value of a particular field in the query */
    readHash = function (name) {
        return parseHash()[name];
    },

    /* writes a value to the location URI. other existing values are not affected */
    writeHash = function (name, value) {
        var propName, generatedHash = [], argObj = parseHash();
        argObj[name] = value;

        for (propName in argObj) {
            if (argObj.hasOwnProperty(propName)) {
                generatedHash.push(propName + "=" + argObj[propName]);
            }
        }
        location.hash = generatedHash.join("&");
    },      

    setBg = function (elem) {
        if (elem) {
            // var articles = toArray( document.querySelectorAll("article") );
            // for (var i=0; i<articles.length; i++) {
            //  articles[i].setAttribute("style", "background: rgba(255,255,255,0.5);");
            // }

            var imgElem = elem.querySelectorAll("figure.bg img");
            if (imgElem && imgElem[0] && imgElem[0].src) {
                document.body.style.background = "url("+imgElem[0].src+")";
                document.body.style.backgroundSize = "cover";
            } else {
                document.body.style.backgroundImage = "";
                elem.style.background = "";
            }
            var shim = document.getElementById("presoshim");
            if (!shim) {
            } else {
                shim = document.createElement("div");
                shim.setAttribute("id", "presoshim");
                document.body.appendChild(shim);
                shim.style.display = "";
            }
        }
    },
    
    // addMeters = function() {
    //  var n, i, m, l=slides.length-1;
    //  for ( i =0; i<slides.length; i++) {
    //      m = document.createElement("meter");
    //      m.setAttribute("value", i);
    //      m.setAttribute("min", 0);
    //      m.setAttribute("max", l);
    //      m.setAttribute("title", "slide"+i);
    //      m.setAttribute("class", "sideme");
    //      m.appendChild(document.createTextNode(i+"/"+l));
    //      slides[i].insertBefore(m, slides[i].firstChild);
    //  }
    // },
    
    show = function (elem) {
        var n, i, cascaded;
        for ( i =0; i<everything.length; i++) {
            everything[i].classList.add("off");
        }
        
        for ( i =0; i<everything.length; i++) {
            n = elem.compareDocumentPosition(everything[i]);
            switch (n) {
                case 0:
                    // same node.
                    // just delete any display information to ensure it's not hidden
                    everything[i].classList.remove("off");
                    break;
                case 2:
                case 4:
                    // outside the tree of interest so hide it
                    break;                      
                case 10:
                        // elem within i, so show i
                        // just any display information from everything[i] to ensure it's not hidden
                        everything[i].classList.remove("off");
                        if (cascadingHeadings) {
                            cascaded = everything[i].querySelector("h1");
                            if (cascaded) {
                                cascaded.classList.remove("off");
;
                            }
                        }
                    break;
                default:
                    // everything[i] is within elem, so show everything[i] if it's not a section
                    if (everything[i].nodeName !== "SECTION") {
                        everything[i].classList.remove("off");
                        if (cascadingHeadings && everything[i].parentNode) {
                            cascaded = everything[i].parentNode.querySelector("h1");
                            if (cascaded) {
                                cascaded.classList.remove("off");;
                                cascaded.setAttribute("style", "font-size: -20%;");
                            }
                        }
                    } else {
                    }
            }
        }
        setBg(elem);

    },
    
    /* hides an element */
    hide = function (elem) {
        if (elem && elem.style) {
            elem.classList.add("off");
        }
    },
    
    simpleShow = function (elem) {
        elem.classList.remove("off");
    },
            
    changeCurrent = function (step) {
        var next;
        if (presenting) {
            // ensure that the next slide never has an index
            // that is out of range.
            next = current + step;
            next = Math.max(next, 0);
            next = Math.min(next, slides.length-1);

            // only aniate a slide change if necessary - first
            // and last slides that have reached the beginning
            // or end don't need animation.
            if (next !== current) {
                hide(slides[current]);
                show(slides[next]);
                writeHash(params.slide, next + 1);
            }
            current = next;
        }
    },
    
    toArray = function (x) {
        var i, result = [];
        for (i = 0; i < x.length; i++) {
            result.push(x[i]);
        }
        return result;
    },

    startPresenting = function () {
        console.log("Starting slideshow.")
        // hide everything except the current slide.
        slides.forEach(hide);
        show(slides[current]);

        presenting = true;

        // go fullscreen        
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }

        setTimeout(10, function() {
            window.addEventListener("fullscreenchange", rdfx.h5pres.stopPresenting);
            window.addEventListener("mozfullscreenchange", rdfx.h5pres.stopPresenting);
            window.addEventListener("webkitfullscreenchange", rdfx.h5pres.stopPresenting);
        });

    },

    stopPresenting = function () {
        console.log("Stopping slideshow.")
        everything.forEach(simpleShow);
        slides.forEach(simpleShow);
        presenting = false;
        document.body.style.backgroundImage = "";

        // exit fullscreen      
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }

        window.removeEventListener("fullscreenchange", rdfx.h5pres.stopPresenting);
        window.removeEventListener("mozfullscreenchange", rdfx.h5pres.stopPresenting);
        window.removeEventListener("webkitfullscreenchange", rdfx.h5pres.stopPresenting);


    },
    
    togglePresentation = function () {
        if (!presenting) {
            startPresenting();
        } else {
            stopPresenting();
        }
    },

    keypress = function (e) {
        /* Skip events with modifier keys */
        switch (e.keyCode) {
            case (keys.right):
            case (keys.down):
                this.changeCurrent(+1);
                break;
            case (keys.left):
            case (keys.up):
                this.changeCurrent(-1);
                break;
            case (keys.slash):
            case (keys.f_five):
                this.startPresenting();
                break;
        }

        return false;
    },
    // cascadingHeadings = !cascadingHeadings;
    // this.changeCurrent(-1);
    // this.changeCurrent(1);
    
    loaded = function () {
        console.log("Loaded");
        slides = toArray( document.querySelectorAll("article>section, section>section") );
        nonslides = toArray( document.getElementsByTagName("body") );
        everything = toArray( document.querySelectorAll("body *") ); 
        current = readHash(params.slide) ? parseInt(readHash(params.slide), 10) - 1 : 0;
        debug = readHash(params.debug) ? true : false;
        window.addEventListener('keydown', keypress.bind(rdfx.h5pres), false);
    };


    // return exposes some private functions as public
    return {
        loaded : loaded.bind(rdfx.h5pres),
        stopPresenting: stopPresenting.bind(rdfx.h5pres),
        startPresenting: startPresenting.bind(rdfx.h5pres),
        changeCurrent: changeCurrent.bind(this)
    };

}());

rdfx.h5pres.loaded();



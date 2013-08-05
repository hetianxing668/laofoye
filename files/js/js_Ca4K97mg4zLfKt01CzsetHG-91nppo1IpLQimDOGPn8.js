/*! HTML5 Shiv v3.6 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed */
;(function(window, document) {
/*jshint evil:true */
  /** Preset options */
  var options = window.html5 || {};

  /** Used to skip problem elements */
  var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Not all elements can be cloned in IE (this list can be shortend) **/
  var saveClones = /^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i;

  /** Detect whether the browser supports default html5 styles */
  var supportsHtml5Styles;

  /** Name of the expando, to work with multiple documents or to re-shiv one document */
  var expando = '_html5shiv';

  /** The id for the the documents expando */
  var expanID = 0;

  /** Cached data for each document */
  var expandoData = {};

  /** Detect whether the browser supports unknown elements */
  var supportsUnknownElements;

  (function() {
    try {
        var a = document.createElement('a');
        a.innerHTML = '<xyz></xyz>';
        //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
        supportsHtml5Styles = ('hidden' in a);

        supportsUnknownElements = a.childNodes.length == 1 || (function() {
          // assign a false positive if unable to shiv
          (document.createElement)('a');
          var frag = document.createDocumentFragment();
          return (
            typeof frag.cloneNode == 'undefined' ||
            typeof frag.createDocumentFragment == 'undefined' ||
            typeof frag.createElement == 'undefined'
          );
        }());
    } catch(e) {
      supportsHtml5Styles = true;
      supportsUnknownElements = true;
    }

  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {String} cssText The CSS text.
   * @returns {StyleSheet} The style element.
   */
  function addStyleSheet(ownerDocument, cssText) {
    var p = ownerDocument.createElement('p'),
        parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

    p.innerHTML = 'x<style>' + cssText + '</style>';
    return parent.insertBefore(p.lastChild, parent.firstChild);
  }

  /**
   * Returns the value of `html5.elements` as an array.
   * @private
   * @returns {Array} An array of shived element node names.
   */
  function getElements() {
    var elements = html5.elements;
    return typeof elements == 'string' ? elements.split(' ') : elements;
  }
  
    /**
   * Returns the data associated to the given document
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Object} An object of data.
   */
  function getExpandoData(ownerDocument) {
    var data = expandoData[ownerDocument[expando]];
    if (!data) {
        data = {};
        expanID++;
        ownerDocument[expando] = expanID;
        expandoData[expanID] = data;
    }
    return data;
  }

  /**
   * returns a shived element for the given nodeName and document
   * @memberOf html5
   * @param {String} nodeName name of the element
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived element.
   */
  function createElement(nodeName, ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createElement(nodeName);
    }
    if (!data) {
        data = getExpandoData(ownerDocument);
    }
    var node;

    if (data.cache[nodeName]) {
        node = data.cache[nodeName].cloneNode();
    } else if (saveClones.test(nodeName)) {
        node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
    } else {
        node = data.createElem(nodeName);
    }

    // Avoid adding some elements to fragments in IE < 9 because
    // * Attributes like `name` or `type` cannot be set/changed once an element
    //   is inserted into a document/fragment
    // * Link elements with `src` attributes that are inaccessible, as with
    //   a 403 response, will cause the tab/window to crash
    // * Script elements appended to fragments will execute when their `src`
    //   or `text` property is set
    return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
  }

  /**
   * returns a shived DocumentFragment for the given document
   * @memberOf html5
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived DocumentFragment.
   */
  function createDocumentFragment(ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createDocumentFragment();
    }
    data = data || getExpandoData(ownerDocument);
    var clone = data.frag.cloneNode(),
        i = 0,
        elems = getElements(),
        l = elems.length;
    for(;i<l;i++){
        clone.createElement(elems[i]);
    }
    return clone;
  }

  /**
   * Shivs the `createElement` and `createDocumentFragment` methods of the document.
   * @private
   * @param {Document|DocumentFragment} ownerDocument The document.
   * @param {Object} data of the document.
   */
  function shivMethods(ownerDocument, data) {
    if (!data.cache) {
        data.cache = {};
        data.createElem = ownerDocument.createElement;
        data.createFrag = ownerDocument.createDocumentFragment;
        data.frag = data.createFrag();
    }


    ownerDocument.createElement = function(nodeName) {
      //abort shiv
      if (!html5.shivMethods) {
          return data.createElem(nodeName);
      }
      return createElement(nodeName, ownerDocument, data);
    };

    ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
      'var n=f.cloneNode(),c=n.createElement;' +
      'h.shivMethods&&(' +
        // unroll the `createElement` calls
        getElements().join().replace(/\w+/g, function(nodeName) {
          data.createElem(nodeName);
          data.frag.createElement(nodeName);
          return 'c("' + nodeName + '")';
        }) +
      ');return n}'
    )(html5, data.frag);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Shivs the given document.
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv.
   * @returns {Document} The shived document.
   */
  function shivDocument(ownerDocument) {
    if (!ownerDocument) {
        ownerDocument = document;
    }
    var data = getExpandoData(ownerDocument);

    if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
      data.hasCSS = !!addStyleSheet(ownerDocument,
        // corrects block display not defined in IE6/7/8/9
        'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
        // adds styling not present in IE6/7/8/9
        'mark{background:#FF0;color:#000}'
      );
    }
    if (!supportsUnknownElements) {
      shivMethods(ownerDocument, data);
    }
    return ownerDocument;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `html5` object is exposed so that more elements can be shived and
   * existing shiving can be detected on iframes.
   * @type Object
   * @example
   *
   * // options can be changed before the script is included
   * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
   */
  var html5 = {

    /**
     * An array or space separated string of node names of the elements to shiv.
     * @memberOf html5
     * @type Array|String
     */
    'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video',

    /**
     * A flag to indicate that the HTML5 style sheet should be inserted.
     * @memberOf html5
     * @type Boolean
     */
    'shivCSS': (options.shivCSS !== false),

    /**
     * Is equal to true if a browser supports creating unknown/HTML5 elements
     * @memberOf html5
     * @type boolean
     */
    'supportsUnknownElements': supportsUnknownElements,

    /**
     * A flag to indicate that the document's `createElement` and `createDocumentFragment`
     * methods should be overwritten.
     * @memberOf html5
     * @type Boolean
     */
    'shivMethods': (options.shivMethods !== false),

    /**
     * A string to describe the type of `html5` object ("default" or "default print").
     * @memberOf html5
     * @type String
     */
    'type': 'default',

    // shivs the document according to the specified `html5` object options
    'shivDocument': shivDocument,

    //creates a shived element
    createElement: createElement,

    //creates a shived documentFragment
    createDocumentFragment: createDocumentFragment
  };

  /*--------------------------------------------------------------------------*/

  // expose html5
  window.html5 = html5;

  // shiv the document
  shivDocument(document);

}(this, document));;
(function($) { 
  $.fn.swipeEvents = function() {
    return this.each(function() {
      
      var startX,
          startY,
          $this = $(this);
      
      $this.bind('touchstart', touchstart);
      
      function touchstart(event) {
        var touches = event.originalEvent.touches;
        if (touches && touches.length) {
          startX = touches[0].pageX;
          startY = touches[0].pageY;
          $this.bind('touchmove', touchmove);
        }
      }
      
      function touchmove(event) {
        var touches = event.originalEvent.touches;
        if (touches && touches.length) {
          var deltaX = startX - touches[0].pageX;
          var deltaY = startY - touches[0].pageY;
          
          if (deltaX >= 50) {
            $this.trigger("swipeLeft");
            event.preventDefault();
          }
          if (deltaX <= -50) {
            $this.trigger("swipeRight");
            event.preventDefault();
          }
        }
      }
      
    });
  };
})(jQuery);
;
(function(c,n){var l="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function m(){var b=c(i),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function j(b,a){b.src===l||-1!==c.inArray(b,k)||(k.push(b),a?h.push(b):i.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(i),c(h)]),e.length===k.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),k=[],i=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){j(b.target,"error"===b.type)}).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)j(a,e.isBroken);else if(a.complete&&a.naturalWidth!==n)j(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=l,a.src=d}):m();return d?d.promise(g):
g}})(jQuery);
;
(function($) {

  /*!
   * jQuery lightweight plugin boilerplate
   * Original author: @ajpiano
   * Further changes, comments: @addyosmani
   * Licensed under the MIT license
   */

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
  ;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global
    // variable in ECMAScript 3 and is mutable (i.e. it can
    // be changed by someone else). undefined isn't really
    // being passed in so we can ensure that its value is
    // truly undefined. In ES5, undefined can no longer be
    // modified.

    // window and document are passed through as local
    // variables rather than as globals, because this (slightly)
    // quickens the resolution process and can be more
    // efficiently minified (especially when both are
    // regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'c_slideshow',
      defaults = {
        'bullet'         : false,
        'autorotate'     : false,
        'resize'         : false,
        'imgHeight'      : 900,
        'lightSwitch'    : false,
        'duration'       : 6500,
        'numberOfSlides' : false,
        'swipe'          : true
      };

    // The actual plugin constructor
    function Plugin( element, options ) {
      this.element = element;

      // jQuery has an extend method that merges the
      // contents of two or more objects, storing the
      // result in the first object. The first object
      // is generally empty because we don't want to alter
      // the default options for future instances of the plugin
      this.options = $.extend( {}, defaults, options) ;

      this._defaults = defaults;
      this._name = pluginName;

      this.init();
    }

    Plugin.prototype = {

      init: function() {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element
        // and this.options
        // you can add more functions like the one below and
        // call them like so: this.yourOtherFunction(this.element, this.options).

        this.lastSlide = $('ul:first > li', this.element).length - 1;
        this.currentSlide = 0;
        this.arrayOfSlides = [];

        if (this.lastSlide > 0) {

          var that = this;

          // Move every slide down except the first one
          $('ul:first > li:gt(0)', this.element).css( {'z-index': 1, 'visibility': 'hidden'} );
          // Move current slide above the others
          $('ul:first > li:eq(0)', this.element).css( {'z-index': 2, 'visibility': 'visible'} );
          // Create right and left navigation
          $(this.element)
            .prepend('<a href="#" class="sl-control sl-previous">Prev</a>')
            .append('<a href="#" class="sl-control sl-next">Next</a>');

          // Create thumbnail
          if (this.options.bullet) {
            $(this.element).append('<div class="sl-thumbs"></div>');
            // Create a button for each slide
            for (var i=0; i <= this.lastSlide; i += 1) {
              $('.sl-thumbs', this.element).append('<a href="#' +'" class="sl-control">' + (i+1) + '</a>');
            }
            // Add active class to the first button
            $('.sl-thumbs a:eq(0)', this.element).addClass('active');
          }

          // Auto-rotate.
          if (this.options.autorotate) {
            this.timeout = setTimeout( function () {that._autoRotate(); }, this.options.duration );
          }

          // Theme switch.
          if (this.options.lightSwitch) {
            this._toggleTheme(this.currentSlide);
          }

          $('.sl-previous', this.element).click( function () {
            if (that.currentSlide > 0) {
              that.slide( that.currentSlide-1, 1 );
            } else {
              that.slide( that.lastSlide, 1 );
            }
            return false;
          });

          $('.sl-next', this.element).click( function () {
            if (that.currentSlide < that.lastSlide) {
              that.slide( that.currentSlide+1, -1 );
            } else {
              that.slide( 0, -1 );
            }
            return false;
          });

          // Add swipe event on slideshow.
          if (this.options.swipe) {
            $(this.element).swipeEvents().bind("swipeLeft",  function(){
              if (that.currentSlide < that.lastSlide) {
                that.slide( that.currentSlide+1, -1 );
              } else {
                that.slide( 0, -1 );
              }
            });

            $(this.element).bind("swipeRight",  function(){
              if (that.currentSlide > 0) {
                that.slide( that.currentSlide-1, 1 );
              } else {
                that.slide( that.lastSlide, 1 );
              }
            });
          }

          // Action when a button is clicked
          $('.sl-thumbs a', this.element).click( function () {
            // slide to the left or right?
            var direction = $(this).index() > that.currentSlide ? -1 : 1 ;
            that.slide( $(this).index(), direction );
            return false;
          });

          $('.gallery .sl-control').click( function () {
            // slide to the left or right?
            var direction = $(this).parent().index() > that.currentSlide ? -1 : 1 ;
            that.slide( $(this).parent().index(), direction );
            return false;
          });

        }

        // Special case for the homepage slideshows
        if (this.options.resize) {

          var that = this;

          // Move slideshow under the header
          $('body').addClass('homepage');

          // Display specific slide on page load
          if(window.location.hash) {
            var hash = window.location.hash.substring(1); // Put hash in variable, remove the # character
            // Test if hash is a number (http://stackoverflow.com/a/1830844) and an existing slide
            if ( !isNaN(parseFloat(hash)) && isFinite(hash) && hash <= that.lastSlide ) {
              var direction = hash > that.currentSlide ? -1 : 1 ;
              that.slide( hash-1, direction );
            }
          }

          // Apply on load and resize events
          $(window).load(function(){
            that._resizeSlideshow();
          });
          $(window).resize(function() {
            that._resizeSlideshow();
          });
        }

        if (this.options.numberOfSlides) {

          this._putSlidesInArray();

          $(this.element)
            .find('.sl-previous')
            .wrap('<div class="sl-control-container" id="sl-previous-container" />');
          $("#sl-previous-container").append('<div class="info-number-slide info-number-slide-previous"></div>');

          $(this.element)
            .find('.sl-next')
            .wrap('<div class="sl-control-container" id="sl-next-container" />');

          $("#sl-next-container").append('<div class="info-number-slide info-number-slide-next"></div>');

          $("#sl-previous-container .info-number-slide-previous").text(this._countPrevious(this.arrayOfSlides, (this.currentSlide + 1))+'/'+(this.lastSlide + 1));
          $("#sl-next-container .info-number-slide-next").text(this._countNext(this.arrayOfSlides, (this.currentSlide + 1))+'/'+(this.lastSlide + 1));

          $('.sl-previous', this.element).mouseenter( function () {
            $('.info-number-slide-previous').stop(true, true).fadeIn();
          }).mouseleave(function () {
            $('.info-number-slide-previous').fadeOut();
          });

          $('.sl-next', this.element).mouseenter( function () {
            $('.info-number-slide-next').stop(true, true).fadeIn();
          }).mouseleave(function () {
            $('.info-number-slide-next').fadeOut();
          });
        }

      },

      _putSlidesInArray: function () {
        for (var i = 1; i <= (this.lastSlide + 1); i++) {
          this.arrayOfSlides.push(i);
        }
      },

      _countNext: function (p, start) {
        return p[($.inArray(start, p) + 1) % p.length];
      },

      _countPrevious: function (p, start) {
        return p[($.inArray(start, p) - 1 + p.length) % p.length];
      },

      _autoRotate: function () {
        if (this.currentSlide < this.lastSlide) {
          this.slide( this.currentSlide+1, -1 );
        } else {
          this.slide( 0, -1 );
        }
      },

      _toggleTheme: function (current) {
        if ($('ul:first > li:eq('+current+')', this.element).hasClass('light')) {
          $('body').addClass('light bridal');
        } else {
          $('body').removeClass('light bridal');
        }
      },

      // Recalculate the image dimensions when the browser window is resized
      _resizeSlideshow: function () {

        var that = this;

        // Determine maximum slide height
        var maxSlideHeight = $(window).height() -30,
          image = $('.sl-image', this.element),
          videoIndex,
          minHeight,
          videoMargin,
          pageWidth = $("#page").width();

        // Moving the arrows from slideshow at the left and right of the page
        $('.sl-next', this.element).css("right",- ((pageWidth - 980) / 2) + "px");
        $('.sl-previous', this.element).css("left",- ((pageWidth - 980) / 2) + "px");

        if ( maxSlideHeight < this.options.imgHeight ) { // If height is less than the real image size
          image.css('height', maxSlideHeight);
          if ( image.width() < $(window).width() ) { // The image must not be narrower than the window
            minHeight = $(window).width() < 1600 ? $(window).width() / 1.7777777 : 900 ; // 1600/900 ratio
            image.css('height', minHeight);
          }
          if ( image.width() < 980 ) { // The image must not be narrower than the main column
            image.css('height', 565);
          }
        } else { // If the window is higher than the real image height. 900 = original image's height
          image.css('height', this.options.imgHeight);
        }

        $(".video-wrapper-auto").each(function(){
          videoIndex = $(this).parents("li").data('playerId');
          jwplayer(videoIndex).resize( image.width(), image.height() );
          videoMargin = (1600 - image.width()) / 2;
          $(".video-wrapper-auto > div").css('margin-left', videoMargin); // Center the video
        });

        // Resize the containers to the same size as the images
        $('.hp-slideshow').css('height', image.height());
        $('.hp-slideshow ul:first > li').css( {'height': image.height()} );
        $('.hp-slideshow ul:first').css( {'height': image.height()} );

        // Move thumbnails above the fold
        if ( $(window).height() < minHeight && $(window).height() > 550 ) {
          $('.sl-thumbs', this.element).css( {'top': maxSlideHeight + "px"} );
        } else {
          $('.sl-thumbs', this.element).css( {'top': image.height() -30 + "px"} );
        }

      },

      slide: function (newSlide, direction) {

        var that = this;

        if ( newSlide !== this.currentSlide && !$(':animated', this.element).length ) { // No action if same slide or already running
          // Plays video when displayed, pauses when hidden
          var newVideo = $('ul > li:eq('+newSlide+')', that.element).data('playerId'),
              currentVideo = $('ul > li:eq('+this.currentSlide+')', that.element).data('playerId'),
              slideWidth = $('.sl-image:eq(0)', that.element).width();

          if ( newVideo ) { // Rewind and play the video
            jwplayer(currentVideo).seek(0);
            jwplayer(newVideo).pause(false);
          }

          $('.sl-thumbs a:eq(' +this.currentSlide+ ')', this.element).removeClass('active');
          // Move current and next slides
          $('ul:first > li:eq('+newSlide+')', this.element)
            .css( {'left': (direction * -slideWidth), 'z-index': '2', 'visibility': 'visible'} )
            .animate( {'left': 0 }, 1000, 'swing');
          $(this.element).trigger({
            'type': "slideOver",
            'current': this.currentSlide,
            'newSlide': newSlide,
            'nb': this.lastSlide
          });
          if (this.options.lightSwitch) {
            this._toggleTheme(newSlide);
          }
          $('ul:first > li:eq('+this.currentSlide+')', this.element)
            .css( {'left': 0, 'z-index': '2', 'visibility': 'visible'} )
            .animate( {'left': direction * slideWidth}, 1000, 'swing',
            function() { // Reset old slide when animation ends ('complete' callback)
              clearTimeout(that.timeout); // Clear the autoRotation then set new duration
              $('ul:first > li:eq('+that.currentSlide+')', that.element).css( {'left': 0, 'z-index': '1', 'visibility': 'hidden'} );
              $('.sl-thumbs a:eq(' +newSlide+ ')', that.element).addClass('active');
              if ( newVideo && that.options.autorotate) { // Get video length in seconds
                var getTime = function() {
                  var video_time = (jwplayer(currentVideo).getDuration()*1000) - 2000;
                  that.timeout = setTimeout( function () {that._autoRotate(); }, video_time );
                };
                setTimeout( getTime, 2000);
              } else {
                if (that.options.autorotate) {
                  that.timeout = setTimeout( function () {that._autoRotate(); }, that.options.duration );
                }
              }
              if ( currentVideo ) { // Stop the video once it's hidden
                jwplayer(currentVideo).pause(true);
              }
              that.currentSlide = newSlide;
              if (that.options.numberOfSlides) {
                $("#sl-previous-container .info-number-slide-previous").text(that._countPrevious(that.arrayOfSlides, (that.currentSlide + 1))+'/'+(that.lastSlide + 1));
                $("#sl-next-container .info-number-slide-next").text(that._countNext(that.arrayOfSlides, (that.currentSlide + 1))+'/'+(that.lastSlide + 1));
              }
            }
          );
        }
      }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
      var args = arguments;
      if (options === undefined || typeof options === 'object') {
        return this.each(function () {
          if (!$.data(this, 'plugin_' + pluginName)) {
            $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
          }
        });
      } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
        return this.each(function () {
          var instance = $.data(this, 'plugin_' + pluginName);
          if (instance instanceof Plugin && typeof instance[options] === 'function') {
            instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
          }
        });
      }
    };

  })( jQuery, window, document );

})(jQuery);
;
/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
 * Build: http://www.modernizr.com/download/#-shiv-cssclasses-teststyles-load
 */
;window.Modernizr=function(a,b,c){function v(a){j.cssText=a}function w(a,b){return v(prefixes.join(a+";")+(b||""))}function x(a,b){return typeof a===b}function y(a,b){return!!~(""+a).indexOf(b)}function z(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:x(f,"function")?f.bind(d||b):f}return!1}var d="2.5.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m={},n={},o={},p=[],q=p.slice,r,s=function(a,c,d,e){var f,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);return f=["&#173;","<style>",a,"</style>"].join(""),k.id=h,m.innerHTML+=f,m.appendChild(k),l||(m.style.background="",g.appendChild(m)),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},t={}.hasOwnProperty,u;!x(t,"undefined")&&!x(t.call,"undefined")?u=function(a,b){return t.call(a,b)}:u=function(a,b){return b in a&&x(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=q.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(q.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(q.call(arguments)))};return e});for(var A in m)u(m,A)&&(r=A.toLowerCase(),e[r]=m[A](),p.push((e[r]?"":"no-")+r));return v(""),i=k=null,function(a,b){function g(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function h(){var a=k.elements;return typeof a=="string"?a.split(" "):a}function i(a){var b={},c=a.createElement,e=a.createDocumentFragment,f=e();a.createElement=function(a){var e=(b[a]||(b[a]=c(a))).cloneNode();return k.shivMethods&&e.canHaveChildren&&!d.test(a)?f.appendChild(e):e},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+h().join().replace(/\w+/g,function(a){return b[a]=c(a),f.createElement(a),'c("'+a+'")'})+");return n}")(k,f)}function j(a){var b;return a.documentShived?a:(k.shivCSS&&!e&&(b=!!g(a,"article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio{display:none}canvas,video{display:inline-block;*display:inline;*zoom:1}[hidden]{display:none}audio[controls]{display:inline-block;*display:inline;*zoom:1}mark{background:#FF0;color:#000}")),f||(b=!i(a)),b&&(a.documentShived=b),a)}var c=a.html5||{},d=/^<|^(?:button|form|map|select|textarea)$/i,e,f;(function(){var a=b.createElement("a");a.innerHTML="<xyz></xyz>",e="hidden"in a,f=a.childNodes.length==1||function(){try{b.createElement("a")}catch(a){return!0}var c=b.createDocumentFragment();return typeof c.cloneNode=="undefined"||typeof c.createDocumentFragment=="undefined"||typeof c.createElement=="undefined"}()})();var k={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:j};a.html5=k,j(b)}(this,b),e._version=d,e.testStyles=s,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+p.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return o.call(a)=="[object Function]"}function e(a){return typeof a=="string"}function f(){}function g(a){return!a||a=="loaded"||a=="complete"||a=="uninitialized"}function h(){var a=p.shift();q=1,a?a.t?m(function(){(a.t=="c"?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){a!="img"&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l={},o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};y[c]===1&&(r=1,y[c]=[],l=b.createElement(a)),a=="object"?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),a!="img"&&(r||y[c]===2?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i(b=="c"?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),p.length==1&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&o.call(a.opera)=="[object Opera]",l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return o.call(a)=="[object Array]"},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,i){var j=b(a),l=j.autoCallback;j.url.split(".").pop().split("?").shift(),j.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]||h),j.instead?j.instead(a,e,f,g,i):(y[j.url]?j.noexec=!0:y[j.url]=1,f.load(j.url,j.forceCSS||!j.forceJS&&"css"==j.url.split(".").pop().split("?").shift()?"c":c,j.noexec,j.attrs,j.timeout),(d(e)||d(l))&&f.load(function(){k(),e&&e(j.origUrl,i,g),l&&l(j.origUrl,i,g),y[j.url]=2})))}function i(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var j,l,m=this.yepnope.loader;if(e(a))g(a,0,m,0);else if(w(a))for(j=0;j<a.length;j++)l=a[j],e(l)?g(l,0,m,0):w(l)?B(l):Object(l)===l&&i(l,m);else Object(a)===a&&i(a,m)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,b.readyState==null&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};;
/*
 * jQuery EasyTabs plugin 3.1.1
 *
 * Copyright (c) 2010-2011 Steve Schwartz (JangoSteve)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: Tue Jan 26 16:30:00 2012 -0500
 */
(function(a){a.easytabs=function(j,e){var f=this,q=a(j),i={animate:true,panelActiveClass:"active",tabActiveClass:"active",defaultTab:"li:first-child",animationSpeed:"normal",tabs:"> ul > li",updateHash:true,cycle:false,collapsible:false,collapsedClass:"collapsed",collapsedByDefault:true,uiTabs:false,transitionIn:"fadeIn",transitionOut:"fadeOut",transitionInEasing:"swing",transitionOutEasing:"swing",transitionCollapse:"slideUp",transitionUncollapse:"slideDown",transitionCollapseEasing:"swing",transitionUncollapseEasing:"swing",containerClass:"",tabsClass:"",tabClass:"",panelClass:"",cache:true,panelContext:q},h,l,v,m,d,t={fast:200,normal:400,slow:600},r;f.init=function(){f.settings=r=a.extend({},i,e);if(r.uiTabs){r.tabActiveClass="ui-tabs-selected";r.containerClass="ui-tabs ui-widget ui-widget-content ui-corner-all";r.tabsClass="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all";r.tabClass="ui-state-default ui-corner-top";r.panelClass="ui-tabs-panel ui-widget-content ui-corner-bottom"}if(r.collapsible&&e.defaultTab!==undefined&&e.collpasedByDefault===undefined){r.collapsedByDefault=false}if(typeof(r.animationSpeed)==="string"){r.animationSpeed=t[r.animationSpeed]}a("a.anchor").remove().prependTo("body");q.data("easytabs",{});f.setTransitions();f.getTabs();b();g();w();n();c();q.attr("data-easytabs",true)};f.setTransitions=function(){v=(r.animate)?{show:r.transitionIn,hide:r.transitionOut,speed:r.animationSpeed,collapse:r.transitionCollapse,uncollapse:r.transitionUncollapse,halfSpeed:r.animationSpeed/2}:{show:"show",hide:"hide",speed:0,collapse:"hide",uncollapse:"show",halfSpeed:0}};f.getTabs=function(){var x;f.tabs=q.find(r.tabs),f.panels=a(),f.tabs.each(function(){var A=a(this),z=A.children("a"),y=A.children("a").data("target");A.data("easytabs",{});if(y!==undefined&&y!==null){A.data("easytabs").ajax=z.attr("href")}else{y=z.attr("href")}y=y.match(/#([^\?]+)/)[0].substr(1);x=r.panelContext.find("#"+y);if(x.length){x.data("easytabs",{position:x.css("position"),visibility:x.css("visibility")});x.not(r.panelActiveClass).hide();f.panels=f.panels.add(x);A.data("easytabs").panel=x}else{f.tabs=f.tabs.not(A)}})};f.selectTab=function(x,C){var y=window.location,B=y.hash.match(/^[^\?]*/)[0],z=x.parent().data("easytabs").panel,A=x.parent().data("easytabs").ajax;if(r.collapsible&&!d&&(x.hasClass(r.tabActiveClass)||x.hasClass(r.collapsedClass))){f.toggleTabCollapse(x,z,A,C)}else{if(!x.hasClass(r.tabActiveClass)||!z.hasClass(r.panelActiveClass)){o(x,z,A,C)}else{if(!r.cache){o(x,z,A,C)}}}};f.toggleTabCollapse=function(x,y,z,A){f.panels.stop(true,true);if(u(q,"easytabs:before",[x,y,r])){f.tabs.filter("."+r.tabActiveClass).removeClass(r.tabActiveClass).children().removeClass(r.tabActiveClass);if(x.hasClass(r.collapsedClass)){if(z&&(!r.cache||!x.parent().data("easytabs").cached)){q.trigger("easytabs:ajax:beforeSend",[x,y]);y.load(z,function(C,B,D){x.parent().data("easytabs").cached=true;q.trigger("easytabs:ajax:complete",[x,y,C,B,D])})}x.parent().removeClass(r.collapsedClass).addClass(r.tabActiveClass).children().removeClass(r.collapsedClass).addClass(r.tabActiveClass);y.addClass(r.panelActiveClass)[v.uncollapse](v.speed,r.transitionUncollapseEasing,function(){q.trigger("easytabs:midTransition",[x,y,r]);if(typeof A=="function"){A()}})}else{x.addClass(r.collapsedClass).parent().addClass(r.collapsedClass);y.removeClass(r.panelActiveClass)[v.collapse](v.speed,r.transitionCollapseEasing,function(){q.trigger("easytabs:midTransition",[x,y,r]);if(typeof A=="function"){A()}})}}};f.matchTab=function(x){return f.tabs.find("[href='"+x+"'],[data-target='"+x+"']").first()};f.matchInPanel=function(x){return(x?f.panels.filter(":has("+x+")").first():[])};f.selectTabFromHashChange=function(){var y=window.location.hash.match(/^[^\?]*/)[0],x=f.matchTab(y),z;if(r.updateHash){if(x.length){d=true;f.selectTab(x)}else{z=f.matchInPanel(y);if(z.length){y="#"+z.attr("id");x=f.matchTab(y);d=true;f.selectTab(x)}else{if(!h.hasClass(r.tabActiveClass)&&!r.cycle){if(y===""||f.matchTab(m).length||q.closest(y).length){d=true;f.selectTab(l)}}}}}};f.cycleTabs=function(x){if(r.cycle){x=x%f.tabs.length;$tab=a(f.tabs[x]).children("a").first();d=true;f.selectTab($tab,function(){setTimeout(function(){f.cycleTabs(x+1)},r.cycle)})}};f.publicMethods={select:function(x){var y;if((y=f.tabs.filter(x)).length===0){if((y=f.tabs.find("a[href='"+x+"']")).length===0){if((y=f.tabs.find("a"+x)).length===0){if((y=f.tabs.find("[data-target='"+x+"']")).length===0){if((y=f.tabs.find("a[href$='"+x+"']")).length===0){a.error("Tab '"+x+"' does not exist in tab set")}}}}}else{y=y.children("a").first()}f.selectTab(y)}};var u=function(A,x,z){var y=a.Event(x);A.trigger(y,z);return y.result!==false};var b=function(){q.addClass(r.containerClass);f.tabs.parent().addClass(r.tabsClass);f.tabs.addClass(r.tabClass);f.panels.addClass(r.panelClass)};var g=function(){var y=window.location.hash.match(/^[^\?]*/)[0],x=f.matchTab(y).parent(),z;if(x.length===1){h=x;r.cycle=false}else{z=f.matchInPanel(y);if(z.length){y="#"+z.attr("id");h=f.matchTab(y).parent()}else{h=f.tabs.parent().find(r.defaultTab);if(h.length===0){a.error("The specified default tab ('"+r.defaultTab+"') could not be found in the tab set.")}}}l=h.children("a").first();p(x)};var p=function(z){var y,x;if(r.collapsible&&z.length===0&&r.collapsedByDefault){h.addClass(r.collapsedClass).children().addClass(r.collapsedClass)}else{y=a(h.data("easytabs").panel);x=h.data("easytabs").ajax;if(x&&(!r.cache||!h.data("easytabs").cached)){q.trigger("easytabs:ajax:beforeSend",[l,y]);y.load(x,function(B,A,C){h.data("easytabs").cached=true;q.trigger("easytabs:ajax:complete",[l,y,B,A,C])})}h.data("easytabs").panel.show().addClass(r.panelActiveClass);h.addClass(r.tabActiveClass).children().addClass(r.tabActiveClass)}};var w=function(){f.tabs.children("a").bind("click.easytabs",function(x){r.cycle=false;d=false;f.selectTab(a(this));x.preventDefault()})};var o=function(z,D,E,H){f.panels.stop(true,true);if(u(q,"easytabs:before",[z,D,r])){var A=f.panels.filter(":visible"),y=D.parent(),F,x,C,G,B=window.location.hash.match(/^[^\?]*/)[0];if(r.animate){F=s(D);x=A.length?k(A):0;C=F-x}m=B;G=function(){q.trigger("easytabs:midTransition",[z,D,r]);if(r.animate&&r.transitionIn=="fadeIn"){if(C<0){y.animate({height:y.height()+C},v.halfSpeed).css({"min-height":""})}}if(r.updateHash&&!d){window.location.hash="#"+D.attr("id")}else{d=false}D[v.show](v.speed,r.transitionInEasing,function(){y.css({height:"","min-height":""});q.trigger("easytabs:after",[z,D,r]);if(typeof H=="function"){H()}})};if(E&&(!r.cache||!z.parent().data("easytabs").cached)){q.trigger("easytabs:ajax:beforeSend",[z,D]);D.load(E,function(J,I,K){z.parent().data("easytabs").cached=true;q.trigger("easytabs:ajax:complete",[z,D,J,I,K])})}if(r.animate&&r.transitionOut=="fadeOut"){if(C>0){y.animate({height:(y.height()+C)},v.halfSpeed)}else{y.css({"min-height":y.height()})}}f.tabs.filter("."+r.tabActiveClass).removeClass(r.tabActiveClass).children().removeClass(r.tabActiveClass);f.tabs.filter("."+r.collapsedClass).removeClass(r.collapsedClass).children().removeClass(r.collapsedClass);z.parent().addClass(r.tabActiveClass).children().addClass(r.tabActiveClass);f.panels.filter("."+r.panelActiveClass).removeClass(r.panelActiveClass);D.addClass(r.panelActiveClass);if(A.length){A[v.hide](v.speed,r.transitionOutEasing,G)}else{D[v.uncollapse](v.speed,r.transitionUncollapseEasing,G)}}};var s=function(y){if(y.data("easytabs")&&y.data("easytabs").lastHeight){return y.data("easytabs").lastHeight}var z=y.css("display"),x=y.wrap(a("<div>",{position:"absolute",visibility:"hidden",overflow:"hidden"})).css({position:"relative",visibility:"hidden",display:"block"}).outerHeight();y.unwrap();y.css({position:y.data("easytabs").position,visibility:y.data("easytabs").visibility,display:z});y.data("easytabs").lastHeight=x;return x};var k=function(y){var x=y.outerHeight();if(y.data("easytabs")){y.data("easytabs").lastHeight=x}else{y.data("easytabs",{lastHeight:x})}return x};var n=function(){if(typeof a(window).hashchange==="function"){a(window).hashchange(function(){f.selectTabFromHashChange()})}else{if(a.address&&typeof a.address.change==="function"){a.address.change(function(){f.selectTabFromHashChange()})}}};var c=function(){var x;if(r.cycle){x=f.tabs.index(h);setTimeout(function(){f.cycleTabs(x+1)},r.cycle)}};f.init()};a.fn.easytabs=function(c){var b=arguments;return this.each(function(){var e=a(this),d=e.data("easytabs");if(undefined===d){d=new a.easytabs(this,c);e.data("easytabs",d)}if(d.publicMethods[c]){return d.publicMethods[c](Array.prototype.slice.call(b,1))}})}})(jQuery);
;
/**
 * jQuery.ScrollTo
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * Works with jQuery +1.2.6. Tested on FF 2/3, IE 6/7/8, Opera 9.5/6, Safari 3, Chrome 1 on WinXP.
 *
 * @author Ariel Flesler
 * @version 1.4.2
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
*		- A percentage of the container's dimension/s, for example: 50% to go to the middle.
 *		- The string 'max' for go-to-end. 
 * @param {Number} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends. 
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @dec Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @ Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');																   
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */
;(function( $ ){
	
	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn._scrollable = function(){
		return this.map(function(){
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if( !isWin )
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
			
			return $.browser.safari || doc.compatMode == 'BackCompat' ?
				doc.body : 
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };
			
		if( target == 'max' )
			target = 9e9;
			
		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;
		
		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this._scrollable().each(function(){
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target 
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;
					
					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
				}else{ 
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) == '%' ? 
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if( /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};

		}).end();
	};
	
	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function( elem, axis ){
		var Dim = axis == 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;
		
		if( !$(elem).is('html,body') )
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();
		
		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max( html[scroll], body[scroll] ) 
			 - Math.min( html[size]  , body[size]   );
			
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );;
/*
 * jScrollPane - v2.0.0beta11 - 2012-04-11
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT and GPL licenses.
 */
(function(b,a,c){b.fn.jScrollPane=function(e){function d(D,O){var ay,Q=this,Y,aj,v,al,T,Z,y,q,az,aE,au,i,I,h,j,aa,U,ap,X,t,A,aq,af,am,G,l,at,ax,x,av,aH,f,L,ai=true,P=true,aG=false,k=false,ao=D.clone(false,false).empty(),ac=b.fn.mwheelIntent?"mwheelIntent.jsp":"mousewheel.jsp";aH=D.css("paddingTop")+" "+D.css("paddingRight")+" "+D.css("paddingBottom")+" "+D.css("paddingLeft");f=(parseInt(D.css("paddingLeft"),10)||0)+(parseInt(D.css("paddingRight"),10)||0);function ar(aQ){var aL,aN,aM,aJ,aI,aP,aO=false,aK=false;ay=aQ;if(Y===c){aI=D.scrollTop();aP=D.scrollLeft();D.css({overflow:"hidden",padding:0});aj=D.innerWidth()+f;v=D.innerHeight();D.width(aj);Y=b('<div class="jspPane" />').css("padding",aH).append(D.children());al=b('<div class="jspContainer" />').css({width:aj+"px",height:v+"px"}).append(Y).appendTo(D)}else{D.css("width","");aO=ay.stickToBottom&&K();aK=ay.stickToRight&&B();aJ=D.innerWidth()+f!=aj||D.outerHeight()!=v;if(aJ){aj=D.innerWidth()+f;v=D.innerHeight();al.css({width:aj+"px",height:v+"px"})}if(!aJ&&L==T&&Y.outerHeight()==Z){D.width(aj);return}L=T;Y.css("width","");D.width(aj);al.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()}Y.css("overflow","auto");if(aQ.contentWidth){T=aQ.contentWidth}else{T=Y[0].scrollWidth}Z=Y[0].scrollHeight;Y.css("overflow","");y=T/aj;q=Z/v;az=q>1;aE=y>1;if(!(aE||az)){D.removeClass("jspScrollable");Y.css({top:0,width:al.width()-f});n();E();R();w()}else{D.addClass("jspScrollable");aL=ay.maintainPosition&&(I||aa);if(aL){aN=aC();aM=aA()}aF();z();F();if(aL){N(aK?(T-aj):aN,false);M(aO?(Z-v):aM,false)}J();ag();an();if(ay.enableKeyboardNavigation){S()}if(ay.clickOnTrack){p()}C();if(ay.hijackInternalLinks){m()}}if(ay.autoReinitialise&&!av){av=setInterval(function(){ar(ay)},ay.autoReinitialiseDelay)}else{if(!ay.autoReinitialise&&av){clearInterval(av)}}aI&&D.scrollTop(0)&&M(aI,false);aP&&D.scrollLeft(0)&&N(aP,false);D.trigger("jsp-initialised",[aE||az])}function aF(){if(az){al.append(b('<div class="jspVerticalBar" />').append(b('<div class="jspCap jspCapTop" />'),b('<div class="jspTrack" />').append(b('<div class="jspDrag" />').append(b('<div class="jspDragTop" />'),b('<div class="jspDragBottom" />'))),b('<div class="jspCap jspCapBottom" />')));U=al.find(">.jspVerticalBar");ap=U.find(">.jspTrack");au=ap.find(">.jspDrag");if(ay.showArrows){aq=b('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp",aD(0,-1)).bind("click.jsp",aB);af=b('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp",aD(0,1)).bind("click.jsp",aB);if(ay.arrowScrollOnHover){aq.bind("mouseover.jsp",aD(0,-1,aq));af.bind("mouseover.jsp",aD(0,1,af))}ak(ap,ay.verticalArrowPositions,aq,af)}t=v;al.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function(){t-=b(this).outerHeight()});au.hover(function(){au.addClass("jspHover")},function(){au.removeClass("jspHover")}).bind("mousedown.jsp",function(aI){b("html").bind("dragstart.jsp selectstart.jsp",aB);au.addClass("jspActive");var s=aI.pageY-au.position().top;b("html").bind("mousemove.jsp",function(aJ){V(aJ.pageY-s,false)}).bind("mouseup.jsp mouseleave.jsp",aw);return false});o()}}function o(){ap.height(t+"px");I=0;X=ay.verticalGutter+ap.outerWidth();Y.width(aj-X-f);try{if(U.position().left===0){Y.css("margin-left",X+"px")}}catch(s){}}function z(){if(aE){al.append(b('<div class="jspHorizontalBar" />').append(b('<div class="jspCap jspCapLeft" />'),b('<div class="jspTrack" />').append(b('<div class="jspDrag" />').append(b('<div class="jspDragLeft" />'),b('<div class="jspDragRight" />'))),b('<div class="jspCap jspCapRight" />')));am=al.find(">.jspHorizontalBar");G=am.find(">.jspTrack");h=G.find(">.jspDrag");if(ay.showArrows){ax=b('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp",aD(-1,0)).bind("click.jsp",aB);x=b('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp",aD(1,0)).bind("click.jsp",aB);
if(ay.arrowScrollOnHover){ax.bind("mouseover.jsp",aD(-1,0,ax));x.bind("mouseover.jsp",aD(1,0,x))}ak(G,ay.horizontalArrowPositions,ax,x)}h.hover(function(){h.addClass("jspHover")},function(){h.removeClass("jspHover")}).bind("mousedown.jsp",function(aI){b("html").bind("dragstart.jsp selectstart.jsp",aB);h.addClass("jspActive");var s=aI.pageX-h.position().left;b("html").bind("mousemove.jsp",function(aJ){W(aJ.pageX-s,false)}).bind("mouseup.jsp mouseleave.jsp",aw);return false});l=al.innerWidth();ah()}}function ah(){al.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function(){l-=b(this).outerWidth()});G.width(l+"px");aa=0}function F(){if(aE&&az){var aI=G.outerHeight(),s=ap.outerWidth();t-=aI;b(am).find(">.jspCap:visible,>.jspArrow").each(function(){l+=b(this).outerWidth()});l-=s;v-=s;aj-=aI;G.parent().append(b('<div class="jspCorner" />').css("width",aI+"px"));o();ah()}if(aE){Y.width((al.outerWidth()-f)+"px")}Z=Y.outerHeight();q=Z/v;if(aE){at=Math.ceil(1/y*l);if(at>ay.horizontalDragMaxWidth){at=ay.horizontalDragMaxWidth}else{if(at<ay.horizontalDragMinWidth){at=ay.horizontalDragMinWidth}}h.width(at+"px");j=l-at;ae(aa)}if(az){A=Math.ceil(1/q*t);if(A>ay.verticalDragMaxHeight){A=ay.verticalDragMaxHeight}else{if(A<ay.verticalDragMinHeight){A=ay.verticalDragMinHeight}}au.height(A+"px");i=t-A;ad(I)}}function ak(aJ,aL,aI,s){var aN="before",aK="after",aM;if(aL=="os"){aL=/Mac/.test(navigator.platform)?"after":"split"}if(aL==aN){aK=aL}else{if(aL==aK){aN=aL;aM=aI;aI=s;s=aM}}aJ[aN](aI)[aK](s)}function aD(aI,s,aJ){return function(){H(aI,s,this,aJ);this.blur();return false}}function H(aL,aK,aO,aN){aO=b(aO).addClass("jspActive");var aM,aJ,aI=true,s=function(){if(aL!==0){Q.scrollByX(aL*ay.arrowButtonSpeed)}if(aK!==0){Q.scrollByY(aK*ay.arrowButtonSpeed)}aJ=setTimeout(s,aI?ay.initialDelay:ay.arrowRepeatFreq);aI=false};s();aM=aN?"mouseout.jsp":"mouseup.jsp";aN=aN||b("html");aN.bind(aM,function(){aO.removeClass("jspActive");aJ&&clearTimeout(aJ);aJ=null;aN.unbind(aM)})}function p(){w();if(az){ap.bind("mousedown.jsp",function(aN){if(aN.originalTarget===c||aN.originalTarget==aN.currentTarget){var aL=b(this),aO=aL.offset(),aM=aN.pageY-aO.top-I,aJ,aI=true,s=function(){var aR=aL.offset(),aS=aN.pageY-aR.top-A/2,aP=v*ay.scrollPagePercent,aQ=i*aP/(Z-v);if(aM<0){if(I-aQ>aS){Q.scrollByY(-aP)}else{V(aS)}}else{if(aM>0){if(I+aQ<aS){Q.scrollByY(aP)}else{V(aS)}}else{aK();return}}aJ=setTimeout(s,aI?ay.initialDelay:ay.trackClickRepeatFreq);aI=false},aK=function(){aJ&&clearTimeout(aJ);aJ=null;b(document).unbind("mouseup.jsp",aK)};s();b(document).bind("mouseup.jsp",aK);return false}})}if(aE){G.bind("mousedown.jsp",function(aN){if(aN.originalTarget===c||aN.originalTarget==aN.currentTarget){var aL=b(this),aO=aL.offset(),aM=aN.pageX-aO.left-aa,aJ,aI=true,s=function(){var aR=aL.offset(),aS=aN.pageX-aR.left-at/2,aP=aj*ay.scrollPagePercent,aQ=j*aP/(T-aj);if(aM<0){if(aa-aQ>aS){Q.scrollByX(-aP)}else{W(aS)}}else{if(aM>0){if(aa+aQ<aS){Q.scrollByX(aP)}else{W(aS)}}else{aK();return}}aJ=setTimeout(s,aI?ay.initialDelay:ay.trackClickRepeatFreq);aI=false},aK=function(){aJ&&clearTimeout(aJ);aJ=null;b(document).unbind("mouseup.jsp",aK)};s();b(document).bind("mouseup.jsp",aK);return false}})}}function w(){if(G){G.unbind("mousedown.jsp")}if(ap){ap.unbind("mousedown.jsp")}}function aw(){b("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp");if(au){au.removeClass("jspActive")}if(h){h.removeClass("jspActive")}}function V(s,aI){if(!az){return}if(s<0){s=0}else{if(s>i){s=i}}if(aI===c){aI=ay.animateScroll}if(aI){Q.animate(au,"top",s,ad)}else{au.css("top",s);ad(s)}}function ad(aI){if(aI===c){aI=au.position().top}al.scrollTop(0);I=aI;var aL=I===0,aJ=I==i,aK=aI/i,s=-aK*(Z-v);if(ai!=aL||aG!=aJ){ai=aL;aG=aJ;D.trigger("jsp-arrow-change",[ai,aG,P,k])}u(aL,aJ);Y.css("top",s);D.trigger("jsp-scroll-y",[-s,aL,aJ]).trigger("scroll")}function W(aI,s){if(!aE){return}if(aI<0){aI=0}else{if(aI>j){aI=j}}if(s===c){s=ay.animateScroll}if(s){Q.animate(h,"left",aI,ae)
}else{h.css("left",aI);ae(aI)}}function ae(aI){if(aI===c){aI=h.position().left}al.scrollTop(0);aa=aI;var aL=aa===0,aK=aa==j,aJ=aI/j,s=-aJ*(T-aj);if(P!=aL||k!=aK){P=aL;k=aK;D.trigger("jsp-arrow-change",[ai,aG,P,k])}r(aL,aK);Y.css("left",s);D.trigger("jsp-scroll-x",[-s,aL,aK]).trigger("scroll")}function u(aI,s){if(ay.showArrows){aq[aI?"addClass":"removeClass"]("jspDisabled");af[s?"addClass":"removeClass"]("jspDisabled")}}function r(aI,s){if(ay.showArrows){ax[aI?"addClass":"removeClass"]("jspDisabled");x[s?"addClass":"removeClass"]("jspDisabled")}}function M(s,aI){var aJ=s/(Z-v);V(aJ*i,aI)}function N(aI,s){var aJ=aI/(T-aj);W(aJ*j,s)}function ab(aV,aQ,aJ){var aN,aK,aL,s=0,aU=0,aI,aP,aO,aS,aR,aT;try{aN=b(aV)}catch(aM){return}aK=aN.outerHeight();aL=aN.outerWidth();al.scrollTop(0);al.scrollLeft(0);while(!aN.is(".jspPane")){s+=aN.position().top;aU+=aN.position().left;aN=aN.offsetParent();if(/^body|html$/i.test(aN[0].nodeName)){return}}aI=aA();aO=aI+v;if(s<aI||aQ){aR=s-ay.verticalGutter}else{if(s+aK>aO){aR=s-v+aK+ay.verticalGutter}}if(aR){M(aR,aJ)}aP=aC();aS=aP+aj;if(aU<aP||aQ){aT=aU-ay.horizontalGutter}else{if(aU+aL>aS){aT=aU-aj+aL+ay.horizontalGutter}}if(aT){N(aT,aJ)}}function aC(){return -Y.position().left}function aA(){return -Y.position().top}function K(){var s=Z-v;return(s>20)&&(s-aA()<10)}function B(){var s=T-aj;return(s>20)&&(s-aC()<10)}function ag(){al.unbind(ac).bind(ac,function(aL,aM,aK,aI){var aJ=aa,s=I;Q.scrollBy(aK*ay.mouseWheelSpeed,-aI*ay.mouseWheelSpeed,false);return aJ==aa&&s==I})}function n(){al.unbind(ac)}function aB(){return false}function J(){Y.find(":input,a").unbind("focus.jsp").bind("focus.jsp",function(s){ab(s.target,false)})}function E(){Y.find(":input,a").unbind("focus.jsp")}function S(){var s,aI,aK=[];aE&&aK.push(am[0]);az&&aK.push(U[0]);Y.focus(function(){D.focus()});D.attr("tabindex",0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp",function(aN){if(aN.target!==this&&!(aK.length&&b(aN.target).closest(aK).length)){return}var aM=aa,aL=I;switch(aN.keyCode){case 40:case 38:case 34:case 32:case 33:case 39:case 37:s=aN.keyCode;aJ();break;case 35:M(Z-v);s=null;break;case 36:M(0);s=null;break}aI=aN.keyCode==s&&aM!=aa||aL!=I;return !aI}).bind("keypress.jsp",function(aL){if(aL.keyCode==s){aJ()}return !aI});if(ay.hideFocus){D.css("outline","none");if("hideFocus" in al[0]){D.attr("hideFocus",true)}}else{D.css("outline","");if("hideFocus" in al[0]){D.attr("hideFocus",false)}}function aJ(){var aM=aa,aL=I;switch(s){case 40:Q.scrollByY(ay.keyboardSpeed,false);break;case 38:Q.scrollByY(-ay.keyboardSpeed,false);break;case 34:case 32:Q.scrollByY(v*ay.scrollPagePercent,false);break;case 33:Q.scrollByY(-v*ay.scrollPagePercent,false);break;case 39:Q.scrollByX(ay.keyboardSpeed,false);break;case 37:Q.scrollByX(-ay.keyboardSpeed,false);break}aI=aM!=aa||aL!=I;return aI}}function R(){D.attr("tabindex","-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp")}function C(){if(location.hash&&location.hash.length>1){var aK,aI,aJ=escape(location.hash.substr(1));try{aK=b("#"+aJ+', a[name="'+aJ+'"]')}catch(s){return}if(aK.length&&Y.find(aJ)){if(al.scrollTop()===0){aI=setInterval(function(){if(al.scrollTop()>0){ab(aK,true);b(document).scrollTop(al.position().top);clearInterval(aI)}},50)}else{ab(aK,true);b(document).scrollTop(al.position().top)}}}}function m(){if(b(document.body).data("jspHijack")){return}b(document.body).data("jspHijack",true);b(document.body).delegate("a[href*=#]","click",function(aM){var aJ=this.href.substr(0,this.href.indexOf("#")),aK=location.href,aO,aL,aI,s;if(location.href.indexOf("#")!==-1){aK=location.href.substr(0,location.href.indexOf("#"))}if(aJ!==aK){return}aO=escape(this.href.substr(this.href.indexOf("#")+1));aL;try{aL=b("#"+aO+', a[name="'+aO+'"]')}catch(aN){return}if(!aL.length){return}aI=aL.closest(".jspScrollable");s=aI.data("jsp");s.scrollToElement(aL,true);if(aI[0].scrollIntoView){aI[0].scrollIntoView()}aM.preventDefault()})}function an(){var aJ,aI,aL,aK,aM,s=false;al.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp",function(aN){var aO=aN.originalEvent.touches[0];
aJ=aC();aI=aA();aL=aO.pageX;aK=aO.pageY;aM=false;s=true}).bind("touchmove.jsp",function(aQ){if(!s){return}var aP=aQ.originalEvent.touches[0],aO=aa,aN=I;Q.scrollTo(aJ+aL-aP.pageX,aI+aK-aP.pageY);aM=aM||Math.abs(aL-aP.pageX)>5||Math.abs(aK-aP.pageY)>5;return aO==aa&&aN==I}).bind("touchend.jsp",function(aN){s=false}).bind("click.jsp-touchclick",function(aN){if(aM){aM=false;return false}})}function g(){var s=aA(),aI=aC();D.removeClass("jspScrollable").unbind(".jsp");D.replaceWith(ao.append(Y.children()));ao.scrollTop(s);ao.scrollLeft(aI);if(av){clearInterval(av)}}b.extend(Q,{reinitialise:function(aI){aI=b.extend({},ay,aI);ar(aI)},scrollToElement:function(aJ,aI,s){ab(aJ,aI,s)},scrollTo:function(aJ,s,aI){N(aJ,aI);M(s,aI)},scrollToX:function(aI,s){N(aI,s)},scrollToY:function(s,aI){M(s,aI)},scrollToPercentX:function(aI,s){N(aI*(T-aj),s)},scrollToPercentY:function(aI,s){M(aI*(Z-v),s)},scrollBy:function(aI,s,aJ){Q.scrollByX(aI,aJ);Q.scrollByY(s,aJ)},scrollByX:function(s,aJ){var aI=aC()+Math[s<0?"floor":"ceil"](s),aK=aI/(T-aj);W(aK*j,aJ)},scrollByY:function(s,aJ){var aI=aA()+Math[s<0?"floor":"ceil"](s),aK=aI/(Z-v);V(aK*i,aJ)},positionDragX:function(s,aI){W(s,aI)},positionDragY:function(aI,s){V(aI,s)},animate:function(aI,aL,s,aK){var aJ={};aJ[aL]=s;aI.animate(aJ,{duration:ay.animateDuration,easing:ay.animateEase,queue:false,step:aK})},getContentPositionX:function(){return aC()},getContentPositionY:function(){return aA()},getContentWidth:function(){return T},getContentHeight:function(){return Z},getPercentScrolledX:function(){return aC()/(T-aj)},getPercentScrolledY:function(){return aA()/(Z-v)},getIsScrollableH:function(){return aE},getIsScrollableV:function(){return az},getContentPane:function(){return Y},scrollToBottom:function(s){V(i,s)},hijackInternalLinks:b.noop,destroy:function(){g()}});ar(O)}e=b.extend({},b.fn.jScrollPane.defaults,e);b.each(["mouseWheelSpeed","arrowButtonSpeed","trackClickSpeed","keyboardSpeed"],function(){e[this]=e[this]||e.speed});return this.each(function(){var f=b(this),g=f.data("jsp");if(g){g.reinitialise(e)}else{g=new d(f,e);f.data("jsp",g)}})};b.fn.jScrollPane.defaults={showArrows:false,maintainPosition:true,stickToBottom:false,stickToRight:false,clickOnTrack:true,autoReinitialise:false,autoReinitialiseDelay:500,verticalDragMinHeight:0,verticalDragMaxHeight:99999,horizontalDragMinWidth:0,horizontalDragMaxWidth:99999,contentWidth:c,animateScroll:false,animateDuration:300,animateEase:"linear",hijackInternalLinks:false,verticalGutter:4,horizontalGutter:4,mouseWheelSpeed:0,arrowButtonSpeed:0,arrowRepeatFreq:50,arrowScrollOnHover:false,trackClickSpeed:0,trackClickRepeatFreq:70,verticalArrowPositions:"split",horizontalArrowPositions:"split",enableKeyboardNavigation:true,hideFocus:false,keyboardSpeed:0,initialDelay:300,speed:30,scrollPagePercent:0.8}})(jQuery,this);;
/*! fancyBox v2.0.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function(t,m,e){var l=e(t),q=e(m),a=e.fancybox=function(){a.open.apply(this,arguments)},r=!1,s="undefined"!==typeof m.createTouch;e.extend(a,{version:"2.0.5",defaults:{padding:15,margin:20,width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,autoSize:!0,autoResize:!s,autoCenter:!s,fitToView:!0,aspectRatio:!1,topRatio:0.5,fixed:!(e.browser.msie&&6>=e.browser.version)&&!s,scrolling:"auto",wrapCSS:"fancybox-default",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,
autoPlay:!1,playSpeed:3E3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},keys:{next:[13,32,34,39,40],prev:[8,33,37,38],close:[27]},tpl:{wrap:'<div class="fancybox-wrap"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe class="fancybox-iframe" name="fancybox-frame{rnd}" frameborder="0" hspace="0"'+(e.browser.msie?' allowtransparency="true"':"")+"></iframe>",swf:'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="wmode" value="transparent" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{href}" /><embed src="{href}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="100%" height="100%" wmode="transparent"></embed></object>',
error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<div title="Close" class="fancybox-item fancybox-close"></div>',next:'<a title="Next" class="fancybox-nav fancybox-next"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",
nextEffect:"elastic",nextSpeed:300,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:300,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:{speedIn:0,speedOut:300,opacity:0.8,css:{cursor:"pointer"},closeClick:!0},title:{type:"float"}}},group:{},opts:{},coming:null,current:null,isOpen:!1,isOpened:!1,wrap:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(b,c){a.close(!0);b&&!e.isArray(b)&&(b=
b instanceof e?e(b).get():[b]);a.isActive=!0;a.opts=e.extend(!0,{},a.defaults,c);e.isPlainObject(c)&&"undefined"!==typeof c.keys&&(a.opts.keys=c.keys?e.extend({},a.defaults.keys,c.keys):!1);a.group=b;a._start(a.opts.index||0)},cancel:function(){a.coming&&!1===a.trigger("onCancel")||(a.coming=null,a.hideLoading(),a.ajaxLoad&&a.ajaxLoad.abort(),a.ajaxLoad=null,a.imgPreload&&(a.imgPreload.onload=a.imgPreload.onabort=a.imgPreload.onerror=null))},close:function(b){a.cancel();a.current&&!1!==a.trigger("beforeClose")&&
(a.unbindEvents(),!a.isOpen||b&&!0===b[0]?(e(".fancybox-wrap").stop().trigger("onReset").remove(),a._afterZoomOut()):(a.isOpen=a.isOpened=!1,e(".fancybox-item, .fancybox-nav").remove(),a.wrap.stop(!0).removeClass("fancybox-opened"),a.inner.css("overflow","hidden"),a.transitions[a.current.closeMethod]()))},play:function(b){var c=function(){clearTimeout(a.player.timer)},d=function(){c();a.current&&a.player.isActive&&(a.player.timer=setTimeout(a.next,a.current.playSpeed))},g=function(){c();e("body").unbind(".player");
a.player.isActive=!1;a.trigger("onPlayEnd")};if(a.player.isActive||b&&!1===b[0])g();else if(a.current&&(a.current.loop||a.current.index<a.group.length-1))a.player.isActive=!0,e("body").bind({"afterShow.player onUpdate.player":d,"onCancel.player beforeClose.player":g,"beforeLoad.player":c}),d(),a.trigger("onPlayStart")},next:function(){a.current&&a.jumpto(a.current.index+1)},prev:function(){a.current&&a.jumpto(a.current.index-1)},jumpto:function(b){a.current&&(b=parseInt(b,10),1<a.group.length&&a.current.loop&&
(b>=a.group.length?b=0:0>b&&(b=a.group.length-1)),"undefined"!==typeof a.group[b]&&(a.cancel(),a._start(b)))},reposition:function(b){a.isOpen&&a.wrap.css(a._getPosition(b))},update:function(b){a.isOpen&&(r||setTimeout(function(){var c=a.current;if(r&&(r=!1,c)){if(c.autoResize||b&&"orientationchange"===b.type)c.autoSize&&(a.inner.height("auto"),c.height=a.inner.height()),a._setDimension(),c.canGrow&&a.inner.height("auto");c.autoCenter&&a.reposition();a.trigger("onUpdate")}},100),r=!0)},toggle:function(){a.isOpen&&
(a.current.fitToView=!a.current.fitToView,a.update())},hideLoading:function(){e("#fancybox-loading").remove()},showLoading:function(){a.hideLoading();e('<div id="fancybox-loading"><div></div></div>').click(a.cancel).appendTo("body")},getViewport:function(){return{x:l.scrollLeft(),y:l.scrollTop(),w:l.width(),h:l.height()}},unbindEvents:function(){a.wrap&&a.wrap.unbind(".fb");q.unbind(".fb");l.unbind(".fb")},bindEvents:function(){var b=a.current,c=b.keys;b&&(l.bind("resize.fb, orientationchange.fb",
a.update),c&&q.bind("keydown.fb",function(b){var g;!b.ctrlKey&&!b.altKey&&!b.shiftKey&&!b.metaKey&&0>e.inArray(b.target.tagName.toLowerCase(),["input","textarea","select","button"])&&(g=b.keyCode,-1<e.inArray(g,c.close)?(a.close(),b.preventDefault()):-1<e.inArray(g,c.next)?(a.next(),b.preventDefault()):-1<e.inArray(g,c.prev)&&(a.prev(),b.preventDefault()))}),e.fn.mousewheel&&b.mouseWheel&&1<a.group.length&&a.wrap.bind("mousewheel.fb",function(b,c){var f=e(b.target).get(0);if(0===f.clientHeight||f.scrollHeight===
f.clientHeight&&f.scrollWidth===f.clientWidth)b.preventDefault(),a[0<c?"prev":"next"]()}))},trigger:function(b){var c,d=a[-1<e.inArray(b,["onCancel","beforeLoad","afterLoad"])?"coming":"current"];if(d){e.isFunction(d[b])&&(c=d[b].apply(d,Array.prototype.slice.call(arguments,1)));if(!1===c)return!1;d.helpers&&e.each(d.helpers,function(c,f){if(f&&"undefined"!==typeof a.helpers[c]&&e.isFunction(a.helpers[c][b]))a.helpers[c][b](f,d)});e.event.trigger(b+".fb")}},isImage:function(a){return a&&a.match(/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i)},
isSWF:function(a){return a&&a.match(/\.(swf)(.*)?$/i)},_start:function(b){var c={},d=a.group[b]||null,g,f,k;if(d&&(d.nodeType||d instanceof e))g=!0,e.metadata&&(c=e(d).metadata());c=e.extend(!0,{},a.opts,{index:b,element:d},e.isPlainObject(d)?d:c);e.each(["href","title","content","type"],function(b,f){c[f]=a.opts[f]||g&&e(d).attr(f)||c[f]||null});"number"===typeof c.margin&&(c.margin=[c.margin,c.margin,c.margin,c.margin]);c.modal&&e.extend(!0,c,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,mouseWheel:!1,
keys:null,helpers:{overlay:{css:{cursor:"auto"},closeClick:!1}}});a.coming=c;if(!1===a.trigger("beforeLoad"))a.coming=null;else{f=c.type;b=c.href||d;f||(g&&(k=e(d).data("fancybox-type"),!k&&d.className&&(f=(k=d.className.match(/fancybox\.(\w+)/))?k[1]:null)),!f&&"string"===e.type(b)&&(a.isImage(b)?f="image":a.isSWF(b)?f="swf":b.match(/^#/)&&(f="inline")),f||(f=g?"inline":"html"),c.type=f);if("inline"===f||"html"===f){if(c.content||(c.content="inline"===f?e("string"===e.type(b)?b.replace(/.*(?=#[^\s]+$)/,
""):b):d),!c.content||!c.content.length)f=null}else b||(f=null);c.group=a.group;c.isDom=g;c.href=b;"image"===f?a._loadImage():"ajax"===f?a._loadAjax():f?a._afterLoad():a._error("type")}},_error:function(b){a.hideLoading();e.extend(a.coming,{type:"html",autoSize:!0,minHeight:0,hasError:b,content:a.coming.tpl.error});a._afterLoad()},_loadImage:function(){a.imgPreload=new Image;a.imgPreload.onload=function(){this.onload=this.onerror=null;a.coming.width=this.width;a.coming.height=this.height;a._afterLoad()};
a.imgPreload.onerror=function(){this.onload=this.onerror=null;a._error("image")};a.imgPreload.src=a.coming.href;a.imgPreload.width||a.showLoading()},_loadAjax:function(){a.showLoading();a.ajaxLoad=e.ajax(e.extend({},a.coming.ajax,{url:a.coming.href,error:function(b,c){"abort"!==c?a._error("ajax",b):a.hideLoading()},success:function(b,c){"success"===c&&(a.coming.content=b,a._afterLoad())}}))},_preloadImages:function(){var b=a.group,c=a.current,d=b.length,g;if(c.preload&&!(2>b.length))for(var f=1;f<=
Math.min(c.preload,d-1);f++)if(g=b[(c.index+f)%d],g=e(g).attr("href")||g)(new Image).src=g},_afterLoad:function(){a.hideLoading();!a.coming||!1===a.trigger("afterLoad",a.current)?a.coming=!1:(a.isOpened?(e(".fancybox-item").remove(),a.wrap.stop(!0).removeClass("fancybox-opened"),a.inner.css("overflow","hidden"),a.transitions[a.current.prevMethod]()):(e(".fancybox-wrap").stop().trigger("onReset").remove(),a.trigger("afterClose")),a.unbindEvents(),a.isOpen=!1,a.current=a.coming,a.wrap=e(a.current.tpl.wrap).addClass("fancybox-"+
(s?"mobile":"desktop")+" fancybox-tmp "+a.current.wrapCSS).appendTo("body"),a.outer=e(".fancybox-outer",a.wrap).css("padding",a.current.padding+"px"),a.inner=e(".fancybox-inner",a.wrap),a._setContent())},_setContent:function(){var b,c,d=a.current,g=d.type;switch(g){case "inline":case "ajax":case "html":b=d.content;b instanceof e&&(b=b.show().detach(),b.parent().hasClass("fancybox-inner")&&b.parents(".fancybox-wrap").trigger("onReset").remove(),e(a.wrap).bind("onReset",function(){b.appendTo("body").hide()}));
d.autoSize&&(c=e('<div class="fancybox-tmp '+a.current.wrapCSS+'"></div>').appendTo("body").append(b),d.width=c.width(),d.height=c.height(),c.width(a.current.width),c.height()>d.height&&(c.width(d.width+1),d.width=c.width(),d.height=c.height()),b=c.contents().detach(),c.remove());break;case "image":b=d.tpl.image.replace("{href}",d.href);d.aspectRatio=!0;break;case "swf":b=d.tpl.swf.replace(/\{width\}/g,d.width).replace(/\{height\}/g,d.height).replace(/\{href\}/g,d.href)}if("iframe"===g){b=e(d.tpl.iframe.replace("{rnd}",
(new Date).getTime())).attr("scrolling",d.scrolling);d.scrolling="auto";if(d.autoSize){b.width(d.width);a.showLoading();b.data("ready",!1).appendTo(a.inner).bind({onCancel:function(){e(this).unbind();a._afterZoomOut()},load:function(){var b=e(this),c;try{this.contentWindow.document.location&&(c=b.contents().find("body").height()+12,b.height(c))}catch(g){d.autoSize=!1}!1===b.data("ready")?(a.hideLoading(),c&&(a.current.height=c),a._beforeShow(),b.data("ready",!0)):c&&a.update()}}).attr("src",d.href);
return}b.attr("src",d.href)}else if("image"===g||"swf"===g)d.autoSize=!1,d.scrolling="visible";a.inner.append(b);a._beforeShow()},_beforeShow:function(){a.coming=null;a.trigger("beforeShow");a._setDimension();a.wrap.hide().removeClass("fancybox-tmp");a.bindEvents();a._preloadImages();a.transitions[a.isOpened?a.current.nextMethod:a.current.openMethod]()},_setDimension:function(){var b=a.wrap,c=a.outer,d=a.inner,g=a.current,f=a.getViewport(),k=g.margin,h=2*g.padding,i=g.width,j=g.height,o=g.maxWidth,
l=g.maxHeight,p=g.minWidth,m=g.minHeight,n;f.w-=k[1]+k[3];f.h-=k[0]+k[2];-1<i.toString().indexOf("%")&&(i=(f.w-h)*parseFloat(i)/100);-1<j.toString().indexOf("%")&&(j=(f.h-h)*parseFloat(j)/100);k=i/j;i+=h;j+=h;g.fitToView&&(o=Math.min(f.w,o),l=Math.min(f.h,l));g.aspectRatio?(i>o&&(i=o,j=(i-h)/k+h),j>l&&(j=l,i=(j-h)*k+h),i<p&&(i=p,j=(i-h)/k+h),j<m&&(j=m,i=(j-h)*k+h)):(i=Math.max(p,Math.min(i,o)),j=Math.max(m,Math.min(j,l)));i=Math.round(i);j=Math.round(j);e(b.add(c).add(d)).width("auto").height("auto");
d.width(i-h).height(j-h);b.width(i);n=b.height();if(i>o||n>l)for(;(i>o||n>l)&&i>p&&n>m;)j-=10,g.aspectRatio?(i=Math.round((j-h)*k+h),i<p&&(i=p,j=(i-h)/k+h)):i-=10,d.width(i-h).height(j-h),b.width(i),n=b.height();g.dim={width:i,height:n};g.canGrow=g.autoSize&&j>m&&j<l;g.canShrink=!1;g.canExpand=!1;if(i-h<g.width||j-h<g.height)g.canExpand=!0;else if((i>f.w||n>f.h)&&i>p&&j>m)g.canShrink=!0;b=n-h;a.innerSpace=b-d.height();a.outerSpace=b-c.height()},_getPosition:function(b){var c=a.current,d=a.getViewport(),
e=c.margin,f=a.wrap.width()+e[1]+e[3],k=a.wrap.height()+e[0]+e[2],h={position:"absolute",top:e[0]+d.y,left:e[3]+d.x};if(c.fixed&&(!b||!1===b[0])&&k<=d.h&&f<=d.w)h={position:"fixed",top:e[0],left:e[3]};h.top=Math.ceil(Math.max(h.top,h.top+(d.h-k)*c.topRatio))+"px";h.left=Math.ceil(Math.max(h.left,h.left+0.5*(d.w-f)))+"px";return h},_afterZoomIn:function(){var b=a.current,c=b.scrolling;a.isOpen=a.isOpened=!0;a.wrap.addClass("fancybox-opened").css("overflow","visible");a.update();a.inner.css("overflow",
"yes"===c?"scroll":"no"===c?"hidden":c);if(b.closeClick||b.nextClick)a.inner.css("cursor","pointer").bind("click.fb",b.nextClick?a.next:a.close);b.closeBtn&&e(b.tpl.closeBtn).appendTo(a.outer).bind("click.fb",a.close);b.arrows&&1<a.group.length&&((b.loop||0<b.index)&&e(b.tpl.prev).appendTo(a.inner).bind("click.fb",a.prev),(b.loop||b.index<a.group.length-1)&&e(b.tpl.next).appendTo(a.inner).bind("click.fb",a.next));a.trigger("afterShow");a.opts.autoPlay&&!a.player.isActive&&(a.opts.autoPlay=!1,a.play())},
_afterZoomOut:function(){a.trigger("afterClose");a.wrap.trigger("onReset").remove();e.extend(a,{group:{},opts:{},current:null,isActive:!1,isOpened:!1,isOpen:!1,wrap:null,outer:null,inner:null})}});a.transitions={getOrigPosition:function(){var b=a.current,c=b.element,d=b.padding,g=e(b.orig),f={},k=50,h=50;!g.length&&b.isDom&&e(c).is(":visible")&&(g=e(c).find("img:first"),g.length||(g=e(c)));g.length?(f=g.offset(),g.is("img")&&(k=g.outerWidth(),h=g.outerHeight())):(b=a.getViewport(),f.top=b.y+0.5*(b.h-
h),f.left=b.x+0.5*(b.w-k));return f={top:Math.ceil(f.top-d)+"px",left:Math.ceil(f.left-d)+"px",width:Math.ceil(k+2*d)+"px",height:Math.ceil(h+2*d)+"px"}},step:function(b,c){var d,e,f;if("width"===c.prop||"height"===c.prop)e=f=Math.ceil(b-2*a.current.padding),"height"===c.prop&&(d=(b-c.start)/(c.end-c.start),c.start>c.end&&(d=1-d),e-=a.innerSpace*d,f-=a.outerSpace*d),a.inner[c.prop](e),a.outer[c.prop](f)},zoomIn:function(){var b=a.wrap,c=a.current,d,g;d=c.dim;"elastic"===c.openEffect?(g=e.extend({},
d,a._getPosition(!0)),delete g.position,d=this.getOrigPosition(),c.openOpacity&&(d.opacity=0,g.opacity=1),a.outer.add(a.inner).width("auto").height("auto"),b.css(d).show(),b.animate(g,{duration:c.openSpeed,easing:c.openEasing,step:this.step,complete:a._afterZoomIn})):(b.css(e.extend({},d,a._getPosition())),"fade"===c.openEffect?b.fadeIn(c.openSpeed,a._afterZoomIn):(b.show(),a._afterZoomIn()))},zoomOut:function(){var b=a.wrap,c=a.current,d;"elastic"===c.closeEffect?("fixed"===b.css("position")&&b.css(a._getPosition(!0)),
d=this.getOrigPosition(),c.closeOpacity&&(d.opacity=0),b.animate(d,{duration:c.closeSpeed,easing:c.closeEasing,step:this.step,complete:a._afterZoomOut})):b.fadeOut("fade"===c.closeEffect?c.closeSpeed:0,a._afterZoomOut)},changeIn:function(){var b=a.wrap,c=a.current,d;"elastic"===c.nextEffect?(d=a._getPosition(!0),d.opacity=0,d.top=parseInt(d.top,10)-200+"px",b.css(d).show().animate({opacity:1,top:"+=200px"},{duration:c.nextSpeed,easing:c.nextEasing,complete:a._afterZoomIn})):(b.css(a._getPosition()),
"fade"===c.nextEffect?b.hide().fadeIn(c.nextSpeed,a._afterZoomIn):(b.show(),a._afterZoomIn()))},changeOut:function(){var b=a.wrap,c=a.current,d=function(){e(this).trigger("onReset").remove()};b.removeClass("fancybox-opened");"elastic"===c.prevEffect?b.animate({opacity:0,top:"+=200px"},{duration:c.prevSpeed,easing:c.prevEasing,complete:d}):b.fadeOut("fade"===c.prevEffect?c.prevSpeed:0,d)}};a.helpers.overlay={overlay:null,update:function(){var a,c;this.overlay.width(0).height(0);e.browser.msie?(a=Math.max(m.documentElement.scrollWidth,
m.body.scrollWidth),c=Math.max(m.documentElement.offsetWidth,m.body.offsetWidth),a=a<c?l.width():a):a=q.width();this.overlay.width(a).height(q.height())},beforeShow:function(b){this.overlay||(b=e.extend(!0,{speedIn:"fast",closeClick:!0,opacity:1,css:{background:"black"}},b),this.overlay=e('<div id="fancybox-overlay"></div>').css(b.css).appendTo("body"),this.update(),b.closeClick&&this.overlay.bind("click.fb",a.close),l.bind("resize.fb",e.proxy(this.update,this)),this.overlay.fadeTo(b.speedIn,b.opacity))},
onUpdate:function(){this.update()},afterClose:function(a){this.overlay&&this.overlay.fadeOut(a.speedOut||0,function(){e(this).remove()});this.overlay=null}};a.helpers.title={beforeShow:function(b){var c;if(c=a.current.title)c=e('<div class="fancybox-title fancybox-title-'+b.type+'-wrap">'+c+"</div>").appendTo("body"),"float"===b.type&&(c.width(c.width()),c.wrapInner('<span class="child"></span>'),a.current.margin[2]+=Math.abs(parseInt(c.css("margin-bottom"),10))),c.appendTo("over"===b.type?a.inner:
"outside"===b.type?a.wrap:a.outer)}};e.fn.fancybox=function(b){var c=e(this),d=this.selector||"",g,f=function(f){var h=this,i="rel",j=h[i],l=g;!f.ctrlKey&&!f.altKey&&!f.shiftKey&&!f.metaKey&&(f.preventDefault(),j||(i="data-fancybox-group",j=e(h).attr("data-fancybox-group")),j&&""!==j&&"nofollow"!==j&&(h=d.length?e(d):c,h=h.filter("["+i+'="'+j+'"]'),l=h.index(this)),b.index=l,a.open(h,b))},b=b||{};g=b.index||0;d?q.undelegate(d,"click.fb-start").delegate(d,"click.fb-start",f):c.unbind("click.fb-start").bind("click.fb-start",
f);return this}})(window,document,jQuery);;

/* Author: Dan Linn */

// Test browser identity and capabilities
var Browser = {
  isiPad : /iPad/i.test(navigator.userAgent),
  isTabletUnder1024: function () {
    if (Modernizr.touch && window.innerWidth < 1025) {
      return true;
    } else {
      return false;
    }
  },
  supportAttrib: function (elem, attr) {
    var elm = document.createElement(elem);
    if (attr in elm) {
      return true;
    }
  }
};



(function ($) {
  if (Drupal.ajaxError) {
    var defaultAjaxError = Drupal.ajaxError;
    /**
    * Calls the original error message builder and logs the message,
    * while returning a generic error.
    */
    Drupal.ajaxError = function (xmlhttp, uri) {
      var originalMessage = defaultAjaxError(xmlhttp, uri);
      console.log(originalMessage);
      message = "\n" + Drupal.t("A technical error happened, please try again.");
      return message;
    };
  }

  $.fn.reactivateItem = function(selector) {
    jQuery(selector).removeAttr('disabled');
  };

  Drupal.behaviors.chromeInput = {
    attach: function (context, settings) {
      if (navigator.userAgent.toLowerCase().indexOf("chrome") >= 0) {
        $('input:-webkit-autofill').each(function(){
          var text = $(this).val();
          var name = $(this).attr('name');
          $(this).after(this.outerHTML).remove();
          $('input[name=' + name + ']').val(text);
        });
      }
    }
  }

  Drupal.behaviors.easyTabs = {
    attach: function (context, settings) {
      if($('#gallery-tab-container .tab').length > 1) {
        $('#gallery-tab-container').easytabs({
          updateHash: false,
          tabs: 'ul.tabs > li'
        });
      } else {
        $('#gallery-tab-container .tabs a').click(function(e) {
          e.preventDefault();
        });
      }
    }
  };

  Drupal.behaviors.listingsEasyTabs = {
    attach: function (context, settings) {
      if($('#listings-tab-container .tab').length > 1) {
        $('#listings-tab-container').easytabs({
          updateHash: false,
          tabs: 'ul.tabs > li'
        });
        $('#listings-tab-container').bind('easytabs:after', function () {
          $.scrollTo($('#listings-tab-container'), 800, {
            onAfter: function (){
              $('#link-to-top a').fadeIn(200);
            },
            offset: -100
          });
        });
      }
    }
  };

  Drupal.behaviors.sharePanelProductPage = {
    attach: function (context, settings) {
      $('.deploy-share-panel').once().click(function(e) {

        e.preventDefault();

        $('.share-options').toggle();
        $(this).parent().toggleClass('active');
      });
    }
  };

  Drupal.behaviors.bigSlideshow = {
    attach: function (context, settings) {
      $('.hp-slideshow').once().c_slideshow({'bullet': true, 'autorotate': true, 'resize': true, 'lightSwitch': true, 'swipe': true});
    }
  };

  Drupal.behaviors.searchBloc = {
      attach: function (context, settings) {
        $('#edit-search-api-views-fulltext').val($('.fake-label').html());
        $("#edit-search-api-views-fulltext").click(function() {
          $('#edit-search-api-views-fulltext').val('');
        });

      }
  };

  Drupal.behaviors.productPushSlideshow = {
        attach: function (context, settings) {
            $('.slideshow-product-pushes').once().c_slideshow({'bullet': true});
        }
    };

  Drupal.behaviors.languageSelect = {
    attach: function (context, settings) {
      /* Arthur : Language menu in footer */

      function selectcountry() {
        var heightChild,
            iNbChild = $('.language-select .sub-menu li').length - 1,
            nbChild = $('.language-select .sub-menu li').length,
            state = "not",
            currentDevice = [0, 4],
            heightUl;

        //Case when we have more than 5 device links
        if (nbChild > 5){
          $('.language-select .wrapper-sub-menu').height(245);

          //Function to go down in language select
          $('.language-select .more-arrow').once().click(function(){
            if (state === "not") {
              state = "animated";
              $.each(currentDevice, function(id, elt) {
                currentDevice[id] += 1;
              });
              $('.language-select .sub-menu').stop(true, true).animate({
                top : "-=" +heightChild
              }, 200, 'linear', function(){
                if (currentDevice[0] > 0) {
                  $('.language-select .less-arrow').show();
                }
                if (currentDevice[1] === iNbChild){
                  $('.language-select .more-arrow').hide();
                }
                //Set timeout to avoid bind effect
                setTimeout(
                  function() {
                    state = "not";
                  }, 100
                );
              });
            }
            return false;
          });
          //Function to go top in language select
          $('.language-select .less-arrow').once().click(function() {
            if (state === "not") {
              state = "animated";
              $.each(currentDevice, function(id, elt) {
                currentDevice[id] -= 1;
              });
              $('.language-select .sub-menu').stop(true, true).animate({
                top : "+=" +heightChild
              }, 200, 'linear', function() {
                if (currentDevice[0] === 0) {
                  $('.language-select .less-arrow').hide();
                }
                if (currentDevice[1] < iNbChild){
                  $('.language-select .more-arrow').show();
                }
                //Set timeout to avoid bind effect
                setTimeout(
                  function() {
                    state = "not";
                  }, 100
                );
              });
            }
            return false;
          });
        } else {
          //Case when we have less than 5 device link
          heightUl = (nbChild * 47) - 1;
          $('.language-select .wrapper-sub-menu').height(heightUl);
          $('.language-select .more-arrow').hide();
        }

        //Function to display the language select
        $('.trigger-sub-menu').once().click(function() {
          $('.language-select .wrapper-sub-menu').slideToggle('fast');
          heightChild = $('.language-select .sub-menu li').outerHeight(true);
          return false;
        });

        $('.wrapper-sub-menu').mouseleave(function(){
          $('.wrapper-sub-menu').stop(true, true).slideUp('fast');
        });
      }
      if ($('.language-select').length > 0) {
        selectcountry();
      }
    }
  };
  Drupal.behaviors.ipadMessage = {
    attach: function (context, settings) {
      //Function to create a cookie
      function createCookie(name,value,days) {
        var expires;
        if (days) {
          var date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          expires = "; expires="+date.toGMTString();
        }
        else {
          expires = "";
        }
        document.cookie = name+"="+value+expires+"; path=/";
      }
      //Function to read a cookie
      function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      }
      //Function to erase a cookie
      function eraseCookie(name) {
        createCookie(name,"",-1);
      }
      //Function for ipad message
      function ipadMessage() {

        if (jQuery('.ipad-message').length === 0) {
          $('body').prepend('<div class="ipad-message"><p>'+Drupal.t('You should switch to landscape view for better navigation', {}, {context: "HEADER"})+'</p><p class="call-to-action"><a href="#" class="triggerTrue">'+Drupal.t('Close', {}, {context: 'GENERICS'})+'</a></p></div>');
        }

        $('.ipad-message').fadeIn(500);
        $('.triggerTrue').click(function(){
          createCookie("dontDisplay", true, 2);
          $('.ipad-message').fadeOut(500);
          return false;
        });
      }

      //Function for ipad to detect if we are in orientation 0
      // var isiPad = navigator.userAgent.match(/iPad/i) !== null;
      var cookieDontDisplay = readCookie("dontDisplay");
      if (Browser.isTabletUnder1024() && window.orientation === 0 && cookieDontDisplay !== "true") {
        ipadMessage();
      }
      window.onorientationchange = function () {
        if (Browser.isTabletUnder1024() && window.orientation === 0 && cookieDontDisplay !== "true") {
          ipadMessage();
        }
      };
    }
  };

  Drupal.behaviors.productslide = {
    attach: function(context) {
      $('.page-product .fader-prez').prez();

      $('.page-product .see-details').click(function(e) {
        e.preventDefault();
        $.scrollTo($('#details'), 500);
      });
    }
  };
  // Highlights the selected tab and delivery option
  Drupal.behaviors.delivery = {
    attach: function (context, settings) {
      // Tabs
      $('.form-item-default-delivery-pane-shipping-tabs').each(function() {
        if ( $('input', this).is(':checked') ) {
          $(this).addClass('active');
        }
        $('input', this).click(function() {
          $('.form-item-default-delivery-pane-shipping-tabs').removeClass('active');
          $(this).parents('.form-item-default-delivery-pane-shipping-tabs').addClass('active');
        });
      });
      $('.form-item-custom-delivery-pane-shipping-tabs').each(function() {
        if ( $('input', this).is(':checked') ) {
          $(this).addClass('active');
        }
        $('input', this).click(function() {
          $('.form-item-custom-delivery-pane-shipping-tabs').removeClass('active');
          $(this).parents('.form-item-custom-delivery-pane-shipping-tabs').addClass('active');
        });
      });
      // Delivery option
      $('.delivery-item').each(function() {
        if ( $('input', this).is(':checked') ) {
          $(this).addClass('active');
        }
        $('input', this).click(function() {
          $('.delivery-item').removeClass('active');
          $(this).parents('.delivery-item').addClass('active');
        });
      });
    }
  };

  // Darkens all targetted items except the hovered one on listing pages. */
  Drupal.behaviors.hoverListing = {
    attach: function (context) {
      $('.cartierfo-pages-collections-facets .navigation-item-cartier-navigation-product-container').hover(
        function() {
          $('.cartierfo-pages-collections-facets .navigation-item-cartier-navigation-product-container').not($(this)).stop().animate({
            opacity: "0.6"
          }, 200);
          $('.models-count', this).stop().animate({
            opacity: "0.999"
          }, 200);
        },
        function() {
          $('.cartierfo-pages-collections-facets .navigation-item-cartier-navigation-product-container').stop().animate({
            opacity: "0.999"
          }, 600);
          $('.models-count', this).stop().animate({
            opacity: "0"
          }, 200);
        }
        );
    }
  };

  // Shows rollover infos on model listing pages.
  Drupal.behaviors.hoverModel = {
    attach: function (context) {

      // regular browsers
      if (Modernizr.opacity) {
        $('.listing-model').hover(
          function() {
            $(this).children('.hover-info').stop(true, true).fadeIn('normal');
          },
          function() {
            $(this).children('.hover-info').stop(true, true).fadeOut('normal');
          }
        );

      // IE8
      } else {
        $('.listing-model').hover(
          function() {
            $(this).children('.hover-info').show();
          },
          function() {
            $(this).children('.hover-info').hide();
          }
        );
      }
    }
  };

  // Shows rollover infos on push services node.
  Drupal.behaviors.pushHoverServices = {
    attach: function (context, settings) {
      var $this;
      $('.node-service-push').mouseenter(function() {
        $this = $(this);
        $('.field-name-c-content-image-33', $this).stop(true, true).fadeOut('normal');
        $('.field-name-c-content-body', $this).stop(true, true).fadeIn('normal');
      }).mouseleave(function() {
        $this = $(this);
        $('.field-name-c-content-body', $this).stop(true, true).fadeOut('normal');
        $('.field-name-c-content-image-33', $this).stop(true, true).fadeIn('normal');
      });
    }
  };

  // Behavior when you hover a push in video container.
  Drupal.behaviors.pushHover = {
    attach: function (context, settings) {
      var height_node,
          index_push,
          heights = [],
          $children = $('.l-container-pushes .with-hover .l-push-hover');

      // Get the height of push and add in an array.
      $children.each(function(i) {
        height_node = $(this).height();
        heights.push(height_node - 14);
      });
      // Function to display the 'hover' stuff.
      $('.l-container-pushes li').mouseenter(function() {
        index_push = $(this).index();
        $('.l-push-hover', $(this)).stop(true, false).animate({ height: heights[index_push]}, 200);
      }).mouseleave(function(){
        $('.l-push-hover', $(this)).stop(true, false).animate({ height: "45px" }, 200);
      });
      $('.l-container-pushes .with-hover .l-push-hover').height('45');
    }
  };

  // Triger to show messages in popin.
  Drupal.behaviors.fancy_status = {
    attach: function (context) {
      function callPopin(selector) {
        if ($(selector).length === 1) {
          $.fancybox({
            content: $(selector).html(),
            fitToView : false,
            autoSize : true,
            closeClick : false,
            openEffect : 'none',
            closeEffect : 'none',
            padding : 0,
            closeBtn : true
          });
        }
      }
      callPopin('.messages.fancy_status');
    }
  };

  // Script for home page line
  Drupal.behaviors.homepageLine = {
    attach: function(context) {
      $('#cartierfo-pages-line-homepage .line-link-group .title a').click(function(e) {
        e.preventDefault();
        if (!$(this).hasClass('active')) {
          $('#cartierfo-pages-line-homepage .line-link-group .title a').removeClass('active').parent().next('.links').slideUp('normal');
        }
        $(this).toggleClass('active').parent().next('.links').slideToggle('normal');
      });
    }
  };

  /* Slide with question in FAQ page */
  Drupal.behaviors.faq = {
    attach: function(context){
      $('.field-name-c-content-faq-question .field-items').click(function(){
        $(this).parent().next().slideToggle('fast');
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
        } else {
          $(this).addClass('active');
        }
        return false;
      });
    }
  };

  // Behavior for the view more on orders page.
  Drupal.behaviors.viewMoreOrders = {
    attach: function (context, settings) {
      var $row = $('#last-order .l-group-orders'),
          $row_first = $('#last-order .l-group-orders-first'),
          row_count = $row.length,
          row_position = 0;

      if (row_count > 0) {
        $row.hide();
      }

      $('#last-order .l-view-more a').click(function(e) {
        e.preventDefault();
        var wHeight = $(window).height() - 50;
        $row.eq(row_position).slideDown(function() {
          if (row_position === row_count) {
            $('#last-order .l-view-more a').fadeOut(200);
          }
          $.scrollTo($('#last-order .l-view-more'), 500, {offset: -wHeight});
        });
        row_position += 1;
      });
    }
  };

  // Add class to HTML if iPad
  Drupal.behaviors.setiPad = {
    attach: function(context) {

      if (Browser.isiPad) {
        jQuery('html').addClass('ipad');
      }

    }
  };

  // Behavior for back link.
  Drupal.behaviors.CBackLink = {
    attach: function (context, settings) {
      if (document.referrer != '') {
        var parser = document.createElement('a');
        parser.href = document.referrer;
        var host = parser.host.replace('secure.', '').replace(':80', '');
        var currentHost = window.location.host.replace('secure.', '');
        if (host == currentHost) {
          $('.back-link-js', context).removeClass('hidden');
          if (history.length >= 2) {
            $('.back-link-js a', context).click(function() {
              history.back();
              return false;
            });
          }
          else {
            $('.back-link-js a', context).click(function() {
              window.location = document.referrer;
              return false;
            });
          }
        }
      }
    }
  };
   //Fix height errors messages on modal
  Drupal.behaviors.errorPopinMessage = {
    attach: function (context) {
     if ($('.ctools-modal-content .messages.error').height() > 0 ) {
        $('.ctools-modal-content').css('height',$('.ctools-modal-content').height() + $('.messages.error').height() - 50);
        $('.modal-content').css('height',$('.ctools-modal-content').height() + $('.messages.error').height() - 50);
      }
    }
  };
   //Fix bridal popin
  Drupal.behaviors.bridalPopinMessage = {
    attach: function (context) {
     if ($('.bridal .ctools-modal-content').length > 0 ) {
        $('.l-popin').addClass('light bridal');
      }
    }
  };

  Drupal.behaviors.pushGlobalClick = {
    attach: function (context) {

      jQuery('body').delegate('.l-push', 'click', function (evt) {
        if (evt.target.localName !== 'a') {
          Drupal.behaviors.pushGlobalClick.simulateClick(this);
        }
      });

      jQuery('body').delegate('.node-service-push', 'click', function (evt) {
        if (evt.target.localName !== 'a') {
          Drupal.behaviors.pushGlobalClick.simulateClick(this);
        }
      });

      jQuery('body').delegate('#cartierfo-pages-line-homepage .push', 'click', function (evt) {
        if (evt.target.localName !== 'a') {
          Drupal.behaviors.pushGlobalClick.simulateClick(this);
        }
      });

      jQuery('body').delegate('#cartierfo-pages-verticalsubsection .publication', 'click', function (evt) {
        if (evt.target.localName !== 'a') {
          Drupal.behaviors.pushGlobalClick.simulateClick(this);
        }
      });

    },
    /* This method check if the target of the link is _blank and open it on a new window. */
    simulateClick: function(element) {
      if (jQuery(element).find('a').attr('target') == '_blank') {
        window.open(jQuery(element).find('a').attr('href'));
      }
      else {
        window.location.href = jQuery(element).find('a').attr('href');
      }
    }
  };

  // Listing header pushes.
  Drupal.behaviors.CListingHEaderPushes = {
    attach: function (context, settings) {
      $('.listing-header-pushes .push').mouseenter(function() {
        $('.field-name-c-content-link', this).stop(true, true).fadeIn();
      }).mouseleave(function() {
        $('.field-name-c-content-link', this).stop(true, true).fadeOut();
      })
    }
  };

  // polyfill for browsers which don't support placeholder (IE8 and 9)
  Drupal.behaviors.placeholderShim = {
    attach: function (context) {

      // support for placeholder ?
      // we check only on input because browsers which support it
      // on input also do on textareas
      var placeholder = Browser.supportAttrib('input', 'placeholder');

      if (placeholder) {
        return;
      }


      var inputs = jQuery('[placeholder]'),
          curr;

      // filling up field with default value
      for (var i = 0, len = inputs.length; i < len; i++) {

        curr = jQuery(inputs[i]);

        // if value is prefilled, skip to next input
        if (curr.val() !== '' && curr.val() !== curr.attr('placeholder')) {
          continue;
        }

        curr.val(curr.attr('placeholder'));
      }


      // clear or restore default value
      // if field not populated
      inputs.bind('focus blur', function (evt){

        var placeholderVal = jQuery(this).attr('placeholder'),
            currentVal = jQuery(this).val();


        switch(evt.type) {

          case 'focus':

            if (currentVal === placeholderVal) {
              jQuery(this).val('');
            }
            break;

          case 'blur':

            if (currentVal === '') {
              jQuery(this).val(placeholderVal);
            }
            break;
        }


      });


    }
  };


  // handling address form specificity
  Drupal.behaviors.addressForm = {
    attach: function (context) {


      function setRequiredInputs() {

        var currGroup = jQuery('[name=address_type_selector]:checked'),
            form = currGroup.closest('form'),
            inputs = form.find('[data-group='+ currGroup.val() +']');


        for (var i = 0, len = inputs.length; i < len; i++) {

          // if we have span.form-required in label
          // we add class required on input
          if (jQuery(inputs[i]).parent().find('label').find('.form-required').length > 0) {
            jQuery(inputs[i]).addClass('required');
          }

        }

      }

      jQuery('[name=address_type_selector]').click(function() {

        var otherGroup = jQuery('[name=address_type_selector]').not('[value= '+ jQuery(this).val() +']').val(),
            currGroup = jQuery(this).val();

        jQuery('[data-group='+ otherGroup +']') .removeClass('required error')
                                                .next().remove();

        // handling selector display change
        jQuery('.form-address-selector').removeClass('large');
        setRequiredInputs();

      });



      // executing function once
      jQuery(function(){
        setRequiredInputs();
      });




    }
  };

  // Preventing iOS scaling bug on window.orientation
  Drupal.behaviors.scaleFix = {
    attach: function (context) {

      if(!Browser.isiPad) {
        return;
      }

      window.MBP = window.MBP || {};

      // Fix for iPhone viewport scale bug
      // http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/

      MBP.viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');
      MBP.ua = navigator.userAgent;

      MBP.scaleFix = function () {
        if (MBP.viewportmeta && !/Opera Mini/.test(MBP.ua)) {
          MBP.viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0";
          document.addEventListener("gesturestart", MBP.gestureStart, false);
        }
      };
      MBP.gestureStart = function () {
          MBP.viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
      };

      MBP.scaleFix();
    }
  };

  // IE8 - Home page content display
  Drupal.behaviors.homePageContent = {
    attach: function (context) {
      if (jQuery('html').hasClass('lt-ie9')) {
        $('.homepage-content').show();
      }
    }
  };


  // Message card - removing the error message when change option
  Drupal.behaviors.messageCardRemoveErrorMessage = {
    attach: function (context) {
      $('#uniform-edit-c-message-card-content-0-message-form-card-type-blank:parent').click(function() {
        $('.error').hide();
      });
      if ($('.error:hidden')) {
        $('#uniform-edit-c-message-card-content-0-message-form-card-type-compose:parent').click(function() {
          $('.error').show();
        });
      }
    }
  };


  // Shopping bag estimate tax - the commerce price down if the popin of estimate tax is displayed
  Drupal.behaviors.estimateTax = {
    attach: function (context) {
      if ($('#cartierfo_commerce_taxes_estimation_wrapper').hasClass('red')) {
        $('.component-type-commerce-price-formatted-amount td').addClass('if-popin-estimated-tax');
      } else {
        $('.component-type-commerce-price-formatted-amount td').removeClass('if-popin-estimated-tax');
      }
      if ($('#edit-zipcode').hasClass('error')) {
        $('.component-type-commerce-price-formatted-amount td').addClass('if-popin-estimated-tax-error');
      } else {
        $('.component-type-commerce-price-formatted-amount td').removeClass('if-popin-estimated-tax-error');
      }
    }
  };

  Drupal.behaviors.appointmentDateAllowedDays = {
    attach: function (context) {
      var validateDays = function() {
        $('#cartierfo-generic-appointment-form #edit-date-day option', context).removeAttr('disabled');
        var month = $('#cartierfo-generic-appointment-form #edit-date-month', context).val();
        var year = $('#cartierfo-generic-appointment-form #edit-date-year', context).val();
        if (month && year) {
          var today = new Date();
          var requiredDate = new Date(year, (month - 1), 1);
          var minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
          if (requiredDate.getTime() <= minDate.getTime()) {
            if (requiredDate.getMonth() == minDate.getMonth()
                && requiredDate.getYear() == minDate.getYear() ) {
              for (var i = 1; i <= minDate.getDate(); i++ ) {
                $('#cartierfo-generic-appointment-form #edit-date-day option[value=' + i + ']', context).attr('disabled', 'disabled');
              }
            } else {
              $('#cartierfo-generic-appointment-form #edit-date-day option', context).attr('disabled', 'disabled');
            }
          }
        }
      }
      $('#cartierfo-generic-appointment-form #edit-date-month', context).live('change', validateDays);
      $('#cartierfo-generic-appointment-form #edit-date-year', context).live('change', validateDays);
    }
  }

})(jQuery);
;
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.
/**
 * jQuery Mobile Select
 * @Author: Jochen Vandendriessche <jochen@builtbyrobot.com>
 * @Author URI: http://builtbyrobot.com
 *
 * @TODO:
 *			- create a before / after hook so we can fix some things euhm... before and
 *				after I suppose
**/
(function(b){var c={init:function(a){a=b.extend({autoHide:!0,defaultOption:"Go to...",deviceWidth:480,appendTo:"",className:"mobileselect",useWindowWidth:!1},a);if((a.useWindowWidth===!0?b(window).width():screen.width)<a.deviceWidth){var d=b(this),c=a.appendTo.length?b(a.appendTo):d.parent(),e=b('<select class="'+a.className+'" />');e.appendTo(c);b("<option />",{selected:!b(".current",d).length?"selected":!1,value:"",text:a.defaultOption}).appendTo(e);b("a",d).each(function(){var a=b(this),c=a.parent("li").hasClass("current")||a.hasClass("current")?"selected":!1;b("<option />",{selected:c,value:a.attr("href"),text:a.text()}).appendTo(e)});a.autoHide&&b(d).hide();e.change(function(){window.location=b(this).find("option:selected").val()})}}};b.fn.mobileSelect=function(a){if(c[a])return c[a].apply(this,Array.prototype.slice.call(arguments,1));else if(typeof a==="object"||!a)return c.init.apply(this,arguments);else b.error("Method "+a+" does not exist on jQuery.mobileselect")}})(this.jQuery);
;
(function($) {
  Drupal.behaviors.slideshow = {
    attach: function(context) {
      /* Number of visible views */
      var visibles = 4;

      /* Speed of transition between views */
      var transitionView = 1000;

      /* Speed of transition for hover effect on opacity of links */
      var transitionHover = 350;

      /* Speed of transition for toogle arrow */
      var transitionArrow = 150;

      var itemWidth = 0;

      $(".gallery").each(function(){
        if (!$(this).hasClass('plugin-processed')) {
          $(this).addClass('plugin-processed');
          var list = $(this).find("ul");
          var ipad = navigator.userAgent.toLowerCase().match(/ipad/i) !== null;
          var view = $(this).find("li");
          var total = view.length;
          var directions = new Array($(this).find("> a:eq(0)"),$(this).find("> a:last-child")); //The 2 arrows
          $('.slideshow').bind('slideOver', function(e) {
            list.find('.slide-item').removeClass('active').eq(e.newSlide).addClass('active');
          });
          if (total <= visibles){ //If less than 5 views (variable 'visibles') no arrows
            directions[1].remove();
          } else { //More than 4 views (variable 'visibles')
            var state = [0,false];
            // The width of the ul is computed this way because while
            // outerWidth(false) takes the width of the element without margins,
            // outerWidth(true) should take the width of the element + margins,
            // but instead it just takes the computed margins of the element.
            itemWidth = itemWidth === 0 ?
              (view.eq(0).outerWidth(false) + view.eq(0).outerWidth(true)) :
              itemWidth;
            list.css({ width : itemWidth * total });
            // Passage equal -880, because the width of li are 220px, and we
            // have only 4 items visibles.
            var passage = -880;
            var segmentation = Math.ceil(total / 4) - 1;
            var which = -1;
            var segments = [];
            $('#gallery-tab-container').bind('easytabs:before', function () {
              var list = $('#gallery-tab-container').find('ul.view-content'),
                view = $('#gallery-tab-container').find('li.views-row'),
                total = view.length,
                itemWidth = 220;

              list.css({ width : itemWidth * total });
            });
            function fix(a,b){
              if (b === 0) {
                directions[a].fadeOut(transitionArrow, function() {
                  if (a === 1) {
                    suffix();
                  }
                });
              } else {
                directions[a].fadeIn(transitionArrow, function() {
                  if (a === 1) {
                    suffix();
                  }
                });
              }
            }
            function suffix(){
              if ((which === 0 && state[0] > 0) || (which === 1 && state[0] < segmentation)) {
                directions[which].click();
              }
              which = -1;
            }
            segments[0] = { how : 0, toFix : function(){ fix(0,0); fix(1,1); }};
            for (i = 1; i < segmentation; i++) {
              segments[i] = { how : passage * i, toFix : function(){  fix(0,1); fix(1,1); }};
            }
            segments[segmentation] = { how : passage * segmentation, toFix : function(){ fix(0,1); fix(1,0); }};
            var iGroupSlides = 0;
            var aSlides = [0, 1, 2, 3];
            function pass(a){ //To scroll the carousel to left or to right
              if (a === 0) {
                iGroupSlides = 0;
                aSlides = [0, 1, 2, 3];
              } else if (a === 1) {
                iGroupSlides++;
                $.each(aSlides, function(id, elt) {
                  aSlides[id] = aSlides[id] + 4;
                });
              } else if (a === -1) {
                iGroupSlides--;
                $.each(aSlides, function(id, elt) {
                  aSlides[id] = aSlides[id] - 4;
                });
              }
              state[1] = true;
              state[0] += a;
              var transo = segments[state[0]];
              list.animate({ left : transo.how},transitionView,"swing",function(){
                state[1] = false;
                transo.toFix();
              });
            }
            directions[0].click(function(ze) {
              ze.preventDefault();
              if (! state[1]) {
                pass(-1);
              } else {
                which = 0;
              }
            });
            directions[1].click(function(ze) {
              ze.preventDefault();
              if (! state[1]) {
                pass(1);
              } else {
                which = 1;
              }
            });
            $('.slideshow').bind('slideOver', function(e) {
              if (e.newSlide%4 === 0 && e.current < e.newSlide && ($.inArray(e.current, aSlides) !== -1) && state[1] === false) {
                pass(1);
              }
              if ((e.newSlide + 1)%4 === 0 && e.current > e.newSlide && ($.inArray(e.current, aSlides) !== -1) && state[1] === false) {
                pass(-1);
              }
              if (e.newSlide === 0 && state[1] === false) {
                iGroupSlides = 0;
                aSlides = [0, 1, 2, 3];
                state[1] = true;
                state[0] = 0;
                var transo = segments[state[0]];
                list.animate({ left : 0},transitionView,"swing",function(){
                  state[1] = false;
                  transo.toFix();
                });
                $('.sl-next', $(this)).show();
              }
            });
            if (ipad){ //On iPad: scroll by sliping on screen
              var touch = -1;
              list.bind("touchstart",function(ze){ touch = Math.floor(ze.pageX); });
              list.bind("touchmove",function(ze){ if (touch > -1){ var sense = touch < Math.floor(ze.pageX) ? 0 : 1; if (! state[1]){ pass(sense); } else { which = sense; }}});
              $("body").bind("touchend",function(){ touch = -1; });
            }
          }
        }
      });
    }
  };
})(jQuery);
;
/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ( $, window, document, undefined ) {

  // undefined is used here as the undefined global
  // variable in ECMAScript 3 and is mutable (i.e. it can
  // be changed by someone else). undefined isn't really
  // being passed in so we can ensure that its value is
  // truly undefined. In ES5, undefined can no longer be
  // modified.

  // window and document are passed through as local
  // variables rather than as globals, because this (slightly)
  // quickens the resolution process and can be more
  // efficiently minified (especially when both are
  // regularly referenced in your plugin).

  // Create the defaults once
  var pluginName = 'prez',
    defaults = {
      'triggerSelector' : '.bullet-new-item',
      'pannelSelector' : '.image-tab'
    };

  // The actual plugin constructor
  function Plugin( element, options ) {
    this.element = element;

    // jQuery has an extend method that merges the
    // contents of two or more objects, storing the
    // result in the first object. The first object
    // is generally empty because we don't want to alter
    // the default options for future instances of the plugin
    this.options = $.extend( {}, defaults, options) ;

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  Plugin.prototype = {

    init: function() {

      var $this = $(this.element),
          that = this;

      // Initialize variable
      this.pannel = $(this.options.pannelSelector, $this);
      this.trigger = $(this.options.triggerSelector, $this);
      this.count = this.pannel.length;
      this.currentSlide = 0;
      this.arrayOfSlides = [];
      this.animated = false;

      // Put slides in array in order to know which slide have to display.
      this._putSlidesInArray();

      // Hide all pannel unless the first one.
      $(this.pannel, $this).hide();
      $(this.pannel+":first", $this).show();

      // Click event.
      $(this.trigger, $this).click(function(e) {
        var linkTo = $(this).data('prez');

        that.currentSlide = $(this, $(that.element)).index();

        that.slide(linkTo, $(this, $(that.element)));
        e.preventDefault();
      });

      // Swipe left event.
      $(this.element).swipeEvents().bind("swipeLeft", function(event){

        var index = that._countNext(that.arrayOfSlides, that.currentSlide);

        that.swipe(index);
        event.stopImmediatePropagation();
      });

      // Swipe right event.
      $(this.element).bind("swipeRight",  function(event){

        var index = that._countPrevious(that.arrayOfSlides, that.currentSlide);

        that.swipe(index);
        event.stopImmediatePropagation();
      });
    },

    _putSlidesInArray: function () {
      for (var i = 0; i <= (this.count - 1); i++) {
        this.arrayOfSlides.push(i);
      }
    },

    _countNext: function (p, start) {
      return p[($.inArray(start, p) + 1) % p.length];
    },

    _countPrevious: function (p, start) {
      return p[($.inArray(start, p) - 1 + p.length) % p.length];
    },

    // Slide method.
    slide: function(linkTo, context) {
      $(this.trigger, $(this.element)).removeClass("active");
      $(this.pannel, $(this.element)).not('.'+linkTo).hide();
      var index = $('.'+linkTo, $(this.element)).index();

      // regular browsers
      if(Modernizr.opacity) {
        $('.'+linkTo, $(this.element)).fadeIn();
        // IE8
      }
      else {
        $('.'+linkTo, $(this.element)).show();
      }

      // Active bullet which is correspond to the current slide.
      context.addClass('active');

    },

    swipe: function (index) {

      var that = this;

      $(this.trigger, $(this.element)).removeClass("active");
      $(this.pannel, $(this.element)).not(":eq("+ index +")").hide();

      if(Modernizr.opacity) {
        $(this.pannel, $(this.element)).eq(index).fadeIn( function () {
          that.currentSlide = index;
        });
        // IE8
      }
      else {
        $(this.pannel, $(this.element)).eq(index).show( function () {
          that.currentSlide = index;
        });
      }

      $(this.trigger, $(this.element)).eq(index).addClass('active');

    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations and allowing any
  // public function (ie. a function whose name doesn't start
  // with an underscore) to be called via the jQuery plugin,
  // e.g. $(element).defaultPluginName('functionName', arg1, arg2)
  $.fn[pluginName] = function ( options ) {
    var args = arguments;
    if (options === undefined || typeof options === 'object') {
      return this.each(function () {
        if (!$.data(this, 'plugin_' + pluginName)) {
          $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
        }
      });
    }
    else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
      return this.each(function () {
        var instance = $.data(this, 'plugin_' + pluginName);
        if (instance instanceof Plugin && typeof instance[options] === 'function') {
          instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
        }
      });
    }
  }

})( jQuery, window, document );;
/*
 * jQuery Color Animations v@VERSION
 * http://jquery.org/
 *
 * Copyright 2011 John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: @DATE
 */

(function( jQuery, undefined ){
	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color outlineColor".split(" "),

		// plusequals test for += 100 -= 100
		rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
		// a set of RE's that can match strings and generate color tuples.
		stringParsers = [{
				re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						execResult[ 1 ],
						execResult[ 2 ],
						execResult[ 3 ],
						execResult[ 4 ]
					];
				}
			}, {
				re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						2.55 * execResult[1],
						2.55 * execResult[2],
						2.55 * execResult[3],
						execResult[ 4 ]
					];
				}
			}, {
				re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				space: "hsla",
				parse: function( execResult ) {
					return [
						execResult[1],
						execResult[2] / 100,
						execResult[3] / 100,
						execResult[4]
					];
				}
			}],

		// jQuery.Color( )
		color = jQuery.Color = function( color, green, blue, alpha ) {
			return new jQuery.Color.fn.parse( color, green, blue, alpha );
		},
		spaces = {
			rgba: {
				cache: "_rgba",
				props: {
					red: {
						idx: 0,
						type: "byte",
						empty: true
					},
					green: {
						idx: 1,
						type: "byte",
						empty: true
					},
					blue: {
						idx: 2,
						type: "byte",
						empty: true
					},
					alpha: {
						idx: 3,
						type: "percent",
						def: 1
					}
				}
			},
			hsla: {
				cache: "_hsla",
				props: {
					hue: {
						idx: 0,
						type: "degrees",
						empty: true
					},
					saturation: {
						idx: 1,
						type: "percent",
						empty: true
					},
					lightness: {
						idx: 2,
						type: "percent",
						empty: true
					}
				}
			}
		},
		propTypes = {
			"byte": {
				floor: true,
				min: 0,
				max: 255
			},
			"percent": {
				min: 0,
				max: 1
			},
			"degrees": {
				mod: 360,
				floor: true
			}
		},
		rgbaspace = spaces.rgba.props,
		support = color.support = {},

		// colors = jQuery.Color.names
		colors,

		// local aliases of functions called often
		each = jQuery.each;

	spaces.hsla.props.alpha = rgbaspace.alpha;

	function clamp( value, prop, alwaysAllowEmpty ) {
		var type = propTypes[ prop.type ] || {},
			allowEmpty = prop.empty || alwaysAllowEmpty;

		if ( allowEmpty && value == null ) {
			return null;
		}
		if ( prop.def && value == null ) {
			return prop.def;
		}
		if ( type.floor ) {
			value = ~~value;
		} else {
			value = parseFloat( value );
		}
		if ( value == null || isNaN( value ) ) {
			return prop.def;
		}
		if ( type.mod ) {
			value = value % type.mod;
			// -10 -> 350
			return value < 0 ? type.mod + value : value;
		}

		// for now all property types without mod have min and max
		return type.min > value ? type.min : type.max < value ? type.max : value;
	}

	function stringParse( string ) {
		var inst = color(),
			rgba = inst._rgba = [];

		string = string.toLowerCase();

		each( stringParsers, function( i, parser ) {
			var match = parser.re.exec( string ),
				values = match && parser.parse( match ),
				parsed,
				spaceName = parser.space || "rgba",
				cache = spaces[ spaceName ].cache;


			if ( values ) {
				parsed = inst[ spaceName ]( values );

				// if this was an rgba parse the assignment might happen twice
				// oh well....
				inst[ cache ] = parsed[ cache ];
				rgba = inst._rgba = parsed._rgba;

				// exit each( stringParsers ) here because we matched
				return false;
			}
		});

		// Found a stringParser that handled it
		if ( rgba.length !== 0 ) {

			// if this came from a parsed string, force "transparent" when alpha is 0
			// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
			if ( Math.max.apply( Math, rgba ) === 0 ) {
				jQuery.extend( rgba, colors.transparent );
			}
			return inst;
		}

		// named colors / default - filter back through parse function
		if ( string = colors[ string ] ) {
			return string;
		}
	}

	color.fn = color.prototype = {
		constructor: color,
		parse: function( red, green, blue, alpha ) {
			if ( red === undefined ) {
				this._rgba = [ null, null, null, null ];
				return this;
			}
			if ( red instanceof jQuery || red.nodeType ) {
				red = red instanceof jQuery ? red.css( green ) : jQuery( red ).css( green );
				green = undefined;
			}

			var inst = this,
				type = jQuery.type( red ),
				rgba = this._rgba = [],
				source;

			// more than 1 argument specified - assume ( red, green, blue, alpha )
			if ( green !== undefined ) {
				red = [ red, green, blue, alpha ];
				type = "array";
			}

			if ( type === "string" ) {
				return this.parse( stringParse( red ) || colors._default );
			}

			if ( type === "array" ) {
				each( rgbaspace, function( key, prop ) {
					rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
				});
				return this;
			}

			if ( type === "object" ) {
				if ( red instanceof color ) {
					each( spaces, function( spaceName, space ) {
						if ( red[ space.cache ] ) {
							inst[ space.cache ] = red[ space.cache ].slice();
						}
					});
				} else {
					each( spaces, function( spaceName, space ) {
						each( space.props, function( key, prop ) {
							var cache = space.cache;

							// if the cache doesn't exist, and we know how to convert
							if ( !inst[ cache ] && space.to ) {

								// if the value was null, we don't need to copy it
								// if the key was alpha, we don't need to copy it either
								if ( red[ key ] == null || key === "alpha") {
									return;
								}
								inst[ cache ] = space.to( inst._rgba );
							}

							// this is the only case where we allow nulls for ALL properties.
							// call clamp with alwaysAllowEmpty
							inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
						});
					});
				}
				return this;
			}
		},
		is: function( compare ) {
			var is = color( compare ),
				same = true,
				myself = this;

			each( spaces, function( _, space ) {
				var isCache = is[ space.cache ],
					localCache;
				if (isCache) {
					localCache = myself[ space.cache ] || space.to && space.to( myself._rgba ) || [];
					each( space.props, function( _, prop ) {
						if ( isCache[ prop.idx ] != null ) {
							same = ( isCache[ prop.idx ] == localCache[ prop.idx ] );
							return same;
						}
					});
				}
				return same;
			});
			return same;
		},
		_space: function() {
			var used = [],
				inst = this;
			each( spaces, function( spaceName, space ) {
				if ( inst[ space.cache ] ) {
					used.push( spaceName );
				}
			});
			return used.pop();
		},
		transition: function( other, distance ) {
			var end = color( other ),
				spaceName = end._space(),
				space = spaces[ spaceName ],
				start = this[ space.cache ] || space.to( this._rgba ),
				result = start.slice();

			end = end[ space.cache ];
			each( space.props, function( key, prop ) {
				var index = prop.idx,
					startValue = start[ index ],
					endValue = end[ index ],
					type = propTypes[ prop.type ] || {};

				// if null, don't override start value
				if ( endValue === null ) {
					return;
				}
				// if null - use end
				if ( startValue === null ) {
					result[ index ] = endValue;
				} else {
					if ( type.mod ) {
						if ( endValue - startValue > type.mod / 2 ) {
							startValue += type.mod;
						} else if ( startValue - endValue > type.mod / 2 ) {
							startValue -= type.mod;
						}
					}
					result[ prop.idx ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
				}
			});
			return this[ spaceName ]( result );
		},
		blend: function( opaque ) {
			// if we are already opaque - return ourself
			if ( this._rgba[ 3 ] === 1 ) {
				return this;
			}

			var rgb = this._rgba.slice(),
				a = rgb.pop(),
				blend = color( opaque )._rgba;

			return color( jQuery.map( rgb, function( v, i ) {
				return ( 1 - a ) * blend[ i ] + a * v;
			}));
		},
		toRgbaString: function() {
			var prefix = "rgba(",
				rgba = jQuery.map( this._rgba, function( v, i ) {
					return v == null ? ( i > 2 ? 1 : 0 ) : v;
				});

			if ( rgba[ 3 ] === 1 ) {
				rgba.pop();
				prefix = "rgb(";
			}

			return prefix + rgba.join(",") + ")";
		},
		toHslaString: function() {
			var prefix = "hsla(",
				hsla = jQuery.map( this.hsla(), function( v, i ) {
					if ( v == null ) {
						v = i > 2 ? 1 : 0;
					}

					// catch 1 and 2
					if ( i && i < 3 ) {
						v = Math.round( v * 100 ) + "%";
					}
					return v;
				});

			if ( hsla[ 3 ] == 1 ) {
				hsla.pop();
				prefix = "hsl(";
			}
			return prefix + hsla.join(",") + ")";
		},
		toHexString: function( includeAlpha ) {
			var rgba = this._rgba.slice(),
				alpha = rgba.pop();

			if ( includeAlpha ) {
				rgba.push( ~~( alpha * 255 ) );
			}

			return "#" + jQuery.map( rgba, function( v, i ) {

				// default to 0 when nulls exist
				v = ( v || 0 ).toString( 16 );
				return v.length == 1 ? "0" + v : v;
			}).join("");
		},
		toString: function() {
			return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
		}
	};
	color.fn.parse.prototype = color.fn;

	// hsla conversions adapted from:
	// http://www.google.com/codesearch/p#OAMlx_jo-ck/src/third_party/WebKit/Source/WebCore/inspector/front-end/Color.js&d=7&l=193

	function hue2rgb( p, q, h ) {
		h = ( h + 1 ) % 1;
		if ( h * 6 < 1 ) {
			return p + (q - p) * 6 * h;
		}
		if ( h * 2 < 1) {
			return q;
		}
		if ( h * 3 < 2 ) {
			return p + (q - p) * ((2/3) - h) * 6;
		}
		return p;
	}

	spaces.hsla.to = function ( rgba ) {
		if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
			return [ null, null, null, rgba[ 3 ] ];
		}
		var r = rgba[ 0 ] / 255,
			g = rgba[ 1 ] / 255,
			b = rgba[ 2 ] / 255,
			a = rgba[ 3 ],
			max = Math.max( r, g, b ),
			min = Math.min( r, g, b ),
			diff = max - min,
			add = max + min,
			l = add * 0.5,
			h, s;

		if ( min === max ) {
			h = 0;
		} else if ( r === max ) {
			h = ( 60 * ( g - b ) / diff ) + 360;
		} else if ( g === max ) {
			h = ( 60 * ( b - r ) / diff ) + 120;
		} else {
			h = ( 60 * ( r - g ) / diff ) + 240;
		}

		if ( l === 0 || l === 1 ) {
			s = l;
		} else if ( l <= 0.5 ) {
			s = diff / add;
		} else {
			s = diff / ( 2 - add );
		}
		return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
	};

	spaces.hsla.from = function ( hsla ) {
		if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
			return [ null, null, null, hsla[ 3 ] ];
		}
		var h = hsla[ 0 ] / 360,
			s = hsla[ 1 ],
			l = hsla[ 2 ],
			a = hsla[ 3 ],
			q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
			p = 2 * l - q,
			r, g, b;

		return [
			Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
			Math.round( hue2rgb( p, q, h ) * 255 ),
			Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
			a
		];
	};


	each( spaces, function( spaceName, space ) {
		var props = space.props,
			cache = space.cache,
			to = space.to,
			from = space.from;

		// makes rgba() and hsla()
		color.fn[ spaceName ] = function( value ) {

			// generate a cache for this space if it doesn't exist
			if ( to && !this[ cache ] ) {
				this[ cache ] = to( this._rgba );
			}
			if ( value === undefined ) {
				return this[ cache ].slice();
			}

			var type = jQuery.type( value ),
				arr = ( type === "array" || type === "object" ) ? value : arguments,
				local = this[ cache ].slice(),
				ret;

			each( props, function( key, prop ) {
				var val = arr[ type === "object" ? key : prop.idx ];
				if ( val == null ) {
					val = local[ prop.idx ];
				}
				local[ prop.idx ] = clamp( val, prop );
			});

			if ( from ) {
				ret = color( from( local ) );
				ret[ cache ] = local;
				return ret;
			} else {
				return color( local );
			}
		};

		// makes red() green() blue() alpha() hue() saturation() lightness()
		each( props, function( key, prop ) {
			// alpha is included in more than one space
			if ( color.fn[ key ] ) {
				return;
			}
			color.fn[ key ] = function( value ) {
				var vtype = jQuery.type( value ),
					fn = ( key === 'alpha' ? ( this._hsla ? 'hsla' : 'rgba' ) : spaceName ),
					local = this[ fn ](),
					cur = local[ prop.idx ],
					match;

				if ( vtype === "undefined" ) {
					return cur;
				}

				if ( vtype === "function" ) {
					value = value.call( this, cur );
					vtype = jQuery.type( value );
				}
				if ( value == null && prop.empty ) {
					return this;
				}
				if ( vtype === "string" ) {
					match = rplusequals.exec( value );
					if ( match ) {
						value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
					}
				}
				local[ prop.idx ] = value;
				return this[ fn ]( local );
			};
		});
	});

	// add .fx.step functions
	each( stepHooks, function( i, hook ) {
		jQuery.cssHooks[ hook ] = {
			set: function( elem, value ) {
				var parsed;

				if ( jQuery.type( value ) !== 'string' || ( parsed = stringParse( value ) ) )
				{
					value = color( parsed || value );
					if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
						var backgroundColor,
							curElem = hook === "backgroundColor" ? elem.parentNode : elem;
						do {
							backgroundColor = jQuery.curCSS( curElem, "backgroundColor" );
						} while (
							( backgroundColor === "" || backgroundColor === "transparent" ) &&
							( curElem = curElem.parentNode ) &&
							curElem.style
						);

						value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
							backgroundColor :
							"_default" );
					}

					value = value.toRgbaString();
				}
				elem.style[ hook ] = value;
			}
		};
		jQuery.fx.step[ hook ] = function( fx ) {
			if ( !fx.colorInit ) {
				fx.start = color( fx.elem, hook );
				fx.end = color( fx.end );
				fx.colorInit = true;
			}
			jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
		};
	});

	// detect rgba support
	jQuery(function() {
		var div = document.createElement( "div" ),
			div_style = div.style;

		div_style.cssText = "background-color:rgba(1,1,1,.5)";
		support.rgba = div_style.backgroundColor.indexOf( "rgba" ) > -1;
	});

	// Some named colors to work with
	// From Interface by Stefan Petre
	// http://interface.eyecon.ro/
	colors = jQuery.Color.names = {
		aqua: "#00ffff",
		azure: "#f0ffff",
		beige: "#f5f5dc",
		black: "#000000",
		blue: "#0000ff",
		brown: "#a52a2a",
		cyan: "#00ffff",
		darkblue: "#00008b",
		darkcyan: "#008b8b",
		darkgrey: "#a9a9a9",
		darkgreen: "#006400",
		darkkhaki: "#bdb76b",
		darkmagenta: "#8b008b",
		darkolivegreen: "#556b2f",
		darkorange: "#ff8c00",
		darkorchid: "#9932cc",
		darkred: "#8b0000",
		darksalmon: "#e9967a",
		darkviolet: "#9400d3",
		fuchsia: "#ff00ff",
		gold: "#ffd700",
		green: "#008000",
		indigo: "#4b0082",
		khaki: "#f0e68c",
		lightblue: "#add8e6",
		lightcyan: "#e0ffff",
		lightgreen: "#90ee90",
		lightgrey: "#d3d3d3",
		lightpink: "#ffb6c1",
		lightyellow: "#ffffe0",
		lime: "#00ff00",
		magenta: "#ff00ff",
		maroon: "#800000",
		navy: "#000080",
		olive: "#808000",
		orange: "#ffa500",
		pink: "#ffc0cb",
		purple: "#800080",
		violet: "#800080",
		red: "#ff0000",
		silver: "#c0c0c0",
		white: "#ffffff",
		yellow: "#ffff00",
		transparent: [ null, null, null, 0 ],
		_default: "#ffffff"
	};
})( jQuery );
;
(function($){
  Drupal.behaviors.front_video_player = {
    attach: function(context, settings) {
      $("video").each(function(){
        var videoId = $(this).attr("id"),
            sub_path,
            video_source_hd,
            video_source_sd,
            theme_path,
            playerWidth;


        if ($(this).attr("subtitles")) {
          sub_path = $(this).attr("subtitles");
        } else {
          sub_path = '';
        }

        if ($('body').hasClass('bridal')) {
          theme_path = "/" + Drupal.settings.pathToTheme + "/skins/light/light.xml";
        } else {
          theme_path = "/" + Drupal.settings.pathToTheme + "/skins/red/red.xml";
        }

        // Extract the low resolution video path in variables.
        if (Drupal.settings.video_source['low resolution'] !== undefined && Drupal.settings.video_source['low resolution'][videoId] !== undefined) {
          video_source_sd = Drupal.settings.video_source['low resolution'][videoId];
        }
        else {
          video_source_sd = '';
        }
        // Extract the high resolution video path in variables.
        if (Drupal.settings.video_source['high resolution'] !== undefined && Drupal.settings.video_source['high resolution'][videoId] !== undefined) {
          video_source_hd = Drupal.settings.video_source['high resolution'][videoId];
        }
        else {
          video_source_hd = '';
        }

        // If we don't have a small definition path but have a hd video path,
        // let's switch the values.
        if (video_source_sd === '' && video_source_hd !== '') {
          video_source_sd = video_source_hd;
        }

        // If we have a siblings list change the size of the player.
        if ($('.list-siblings').length > 0) {
          playerWidth = 730;
        } else {
          playerWidth = 980;
        }

        // Let's prevent an empty value here with an extra check.
        if (video_source_sd !== '') {
          if (settings.front_video_player && settings.front_video_player.mode === 'auto'
            && typeof(jwplayer) !== 'undefined') {
            $(this).parents("li").data( {'playerId': videoId} );
            jwplayer(videoId).setup({ // Player's configuration, "full_page_video" mode
              modes:[
                {type:"html5"},
                {type:"flash", src:"/" + Drupal.settings.pathToTheme + "/js/player.swf"}
              ],
              controlbar: "none",
              allowscriptaccess: 'always',
              skin: theme_path,
              file: video_source_sd,
              plugins: "captions-2,hd-2",
              "hd.file": video_source_hd
            });
          }
          else if (settings.cartierfo_generic && settings.cartierfo_generic.expand_player_id === videoId
            && typeof(jwplayer) !== 'undefined') {
            jwplayer(settings.cartierfo_generic.expand_player_id).setup({ // Player's configuration, "slideshow" mode
              modes : [
                {type : "html5"},
                {type : "flash", src : "/" + Drupal.settings.pathToTheme + "/js/player.swf"}
              ],
              autostart: false,
              allowscriptaccess: 'always',
              skin: theme_path,
              file: video_source_sd,
              plugins: "captions-2,hd-2",
              "hd.file": video_source_hd,
              "captions.file": sub_path
            });
          }

          else if (settings.front_video_player && settings.front_video_player.mode === 'manual'
            && typeof(jwplayer) !== 'undefined') {
            jwplayer(videoId).setup({ // Player's configuration, "slideshow" mode
              modes:[
                {type:"html5"},
                {type:"flash", src:"/" + Drupal.settings.pathToTheme + "/js/player.swf"}
              ],
              autostart: false,
              allowscriptaccess:'always',
              width: playerWidth,
              height: 550,
              skin: theme_path,
              file: video_source_sd,
              plugins: "captions-2,hd-2",
              "hd.file": video_source_hd,
              "captions.file": sub_path
            });
          }
          else if (typeof(jwplayer) !== 'undefined') {
            $(this).parents("li").data( {'playerId': videoId} );
            jwplayer(videoId).setup({ // Player's configuration, "slideshow" mode
              modes : [
                {type : "html5"},
                {type : "flash", src : "/" + Drupal.settings.pathToTheme + "/js/player.swf"}
              ],
              autostart: false,
              controlbar: "none",
              allowscriptaccess: 'always',
              skin: theme_path,
              file: video_source_sd,
              plugins: "captions-2,hd-2",
              "hd.file": video_source_hd,
              "captions.file": sub_path
            });
          }
        }
      });
    }
  };
})(jQuery);

Drupal.behaviors.get_agent = function(context) {
  if((navigator.userAgent.match(/iPhone/i)) ||
    (navigator.userAgent.match(/iPad/i)) ||
    (navigator.userAgent.match(/iPod/i))) {
    return 'iphone';
  }
  else {
    return 'default';
  }
};
;

// Form validation
// context parameter: parent form node of submit button
var CheckForm = function(context) {

  // general option for form validation
  this.options = {
    email_regexp : /^[\w+-.%]+@(?:[\w-]+\.)+[\w-]+$/,
    password_len: 8,
    error_class: 'error'
  };

  // caching
  that = this;

  // validation status
  // will store input errors if necessary
  // form submit relies on presence of false values in this array
  this.status = [];

  // passing context
  this.form = context;

  // getting mandatory inputs
  this.inputs = this.form.find(':input').filter('.required');

  // errors
  this.errors = {

    // error message html template
    tpl: '<em>{{error}}</em>',

    // error messages
    msgs: window.formErrors,

    // getting error message
    get: function (code) {
      return this.msgs[code];
    },

    // building error message
    // from tpl above and error message retrieved from window.formErrors
    build: function (code) {

      // get error message
      var error = this.get(code),
            msg = this.tpl.replace('{{error}}', error);

      return msg;
    },

    // display error message
    show: function(field, error, context) {

      if (!context) {

        // default behaviour:
        // - insert error message after input
        // - add error class
        // - animate entrance
        jQuery(field).after(error)
                     .addClass(that.options.error_class);

      } else {

        // insert error message within context block
        jQuery(context).append(error)
                       .addClass(that.options.error_class);
      }

      // handling address block
      if (jQuery(field).data('group') !== undefined && jQuery(field).data('group') === jQuery('[name=address_type_selector]:first').val()) {
        jQuery('.form-address-selector').addClass('large');
      }

    },

    // this function is a shortcut for the following actions
    // - set error token
    // - build error message
    // - append error message
    //
    // Using it like this:
    //
    //    this.errors.display(elm, 'REG2', null);
    //
    // is equivalent to writing
    //
    //    this.status.push(false);
    //    error = this.errors.build('REG2');
    //    this.errors.show(elm, error);
    //
    display: function(field, error_code, context) {

      // adding error to global array
      that.status.push(false);

      // generating error message
      var main_error = this.build(error_code);

      // appending error message
      this.show(field, main_error, context);
    },

    // cleaning all errors
    flush: function() {

      // destroy error tokens
      that.status.length = 0;
      jQuery(that.form).find('em').remove().end()
                                  .find('.error').removeClass('error').end()
                                  .find('[data-valid]').removeAttr('data-valid');


      // handling address block
      jQuery('.form-address-selector').removeClass('large');

    }
  },


  // Validating inputs
  this.check = function () {

    // cleaning errors
    this.errors.flush();

    var inp = this.inputs;        // for caching purposes

    //Input with clas "require-toggleable are only required when visible.
    var toggleableInputs = this.form.find(':input')
        .filter('.required-toggleable')
        .filter(':visible');

    if (toggleableInputs.length) {
      jQuery.each(toggleableInputs, function(index, input) {
        inp.push(input);
      });
    }

    // looping through mandatory inputs
    for (var i = 0, len = inp.length; i < len; i++) {

      var elm = inp[i],
          error = '';

      // empty state
      // does not apply to checkboxes or radio buttons (nice!)
      // but we need to keep selects out
      // we sanitize a bit the value before testing, cleaning whitespaces

      if (jQuery.trim(elm.value) === '' && elm.nodeName.toLowerCase() !== 'select') {

        // handling email and password confirmation
        // we prevent error handling if corresponding original email or password input is empty
        if (elm.name === 'emailAddress_confirm' && this.form.find('[data-type=email][data-valid]').length === 0) {
          continue;
        }

        if (jQuery(elm).hasClass('password-confirm') && this.form.find('[type=password][data-valid]').length === 0) {
          continue;
        }

        var code = '';

        // email confirmation field
        if (elm.name === 'emailAddress_confirm') {
          code = 'REG5';

        // password confirmation field
        } else if(jQuery(elm).hasClass('password-confirm')) {
          code = 'REG7';

        // all other fields
        } else {
          code = 'REG2';
        }

        // displaying error message
        this.errors.display(elm, code, null);

        continue;
      }

      // this is for IE to correct a behaviour
      // linked to its lack of support for placeholder
      if (!Browser.supportAttrib('input', 'placeholder')) {
        if (elm.value === elm.getAttribute('placeholder')) {

          // displaying error message
          this.errors.display(elm, 'REG2', null);

          continue;
        }
      }


      // input has a value
      // check its data-type or type and trigger action associated to it
      // data-type attribute is required only for the following input types:
      // - email
      // - number (which requires alse a data-flavor attribute. See case number)
      // default case is for text inputs/textareas (if needed) and selects
      switch (jQuery(elm).data('type') || elm.type) {

        // email inputs
        // we check for:
        // - email format
        // - values match if there are more than one email field
        case 'email':

          var email_fields = jQuery(this.form).find('input[data-type=email]');

          // login exception
          if (this.form.attr('name') === 'login') {
            continue;
          }


          // regular email
          if (elm.name !== 'emailAddress_confirm') {

            // checking email validity
            if (!this.options.email_regexp.test(elm.value)) {
              // displaying error message
              this.errors.display(elm, 'REG4', null);

              continue;
            }

            // if valid, add a valid token
            jQuery(elm).attr('data-valid', 'yes');


          // confirmation email
          } else {

            if (email_fields[0].value !== email_fields[1].value) {

              // displaying error message
              this.errors.display(elm, 'REG5', null);
            }

          }


          break;

        // number inputs
        // we check if value is a number and then choose a message among these four
        // - phone
        // - street-nb
        // - zip
        // - date
        // These "types" must be present in a data-flavor attribute on every input which requires a number value.
        case 'number':

          if (isNaN(elm.value)) {

            var errorCode;

            // choosing right error message
            switch (jQuery(elm).data('flavor')) {

              case 'phone':

                errorCode = 'REG6';
                break;

              case 'street-nb':

                errorCode = 'REG6';
                break;

              case 'zip':

                errorCode = 'REG11';
                break;

              case 'date':

                errorCode = 'REG13';
                break;

            }

            // displaying error message
            this.errors.display(elm, errorCode, null);

          } else {
              switch (jQuery(elm).data('flavor')) {

                case 'zip':
                  // Check if the data-number is set.
                  var attr = jQuery(elm).attr('data-minnumber');
                  if (typeof attr !== 'undefined' && attr !== false) {
                    var minNumber = jQuery(elm).data('minnumber'),
                        valueNumber = jQuery(elm).val().length;

                    if (valueNumber != minNumber){
                      var errorCode;
                      errorCode = 'REG11';
                      // Displaying error message.
                      this.errors.display(elm, errorCode, null);
                    }
                  }
                  break;
              }
          }
          break;


        // password inputs
        // this validation only applies if we have more than one password field in form
        // we check:
        // - if they are long enough (this.options.password_len parameter)
        // - if they are matching with each other
        case 'password':

          var password_fields = jQuery(this.form).find(':password');


          // regular password
          if (!jQuery(elm).hasClass('password-confirm')) {

            if (password_fields.length > 1) {

              // check if password is long enough
              if (elm.value.length < this.options.password_len) {

                // displaying error message
                this.errors.display(elm, 'REG10', null);

                continue;
              }

              // if valid, add a valid token
              jQuery(elm).attr('data-valid', 'yes');

            }


          // confirmation password
          } else {

            // check if passwords are matching
            if (password_fields[0].value !== password_fields[1].value) {

              // displaying error message
              this.errors.display(elm, 'REG7', null);
            }

          }






          // if (password_fields.length > 1) {

          //   // check if password is long enough
          //   if (elm.value.length < this.options.password_len) {

          //     // displaying error message
          //     this.errors.display(elm, 'REG10', null);

          //     continue;

          //   }

          //   // check if passwords are matching
          //   if (password_fields[0].value !== password_fields[1].value) {

          //     // displaying error message
          //     this.errors.display(elm, 'REG7', null);
          //   }
          // }

          break;

        // checkbox inputs
        // we check for:
        // - checked status
        case 'checkbox':

          if (elm.checked !== true) {

            // displaying error message
            this.errors.display(elm, 'REG2', jQuery(elm).closest('.form-type-checkbox'));
          }

          break;


        // radio inputs
        // we check for:
        // - checked status of one of the radio of the same group
        case 'radio':

          // getting radio group
          var group = jQuery('input[name="' + elm.name + '"]'),
                checked = group.filter(':checked');

          // first radio button and no radio is checked
          if (jQuery(elm).index(group) === 0 && checked.length === 0) {

            // displaying error message
            this.errors.display(elm, 'REG2', jQuery(elm).closest('.form-type-radios'));
          }

          break;


        // text, textarea or select
        default:

          // select case
          if (elm.nodeName.toLowerCase() === 'select' && (elm.value === '' || elm.value === -1)) {

            // displaying error message
            this.errors.display(elm, 'REG2', jQuery(elm).closest('.form-type-select'));
          }

          break;
      }
    }

  };
};


function checkForm() {

  jQuery('.js-validate :submit:not(.form-step)').live('click', function (event) {

    var validate = new CheckForm(jQuery(this).closest('form')),
        that = jQuery(this);

    validate.check();

    // fix for checkout forms
    var disabled = that.closest('form').find(':submit[disabled]');

    // errors in form?
    if (validate.status.length) {

      // fix for checkout forms
      disabled.removeAttr('disabled');

      return false;
    } else {

      // fix for checkout forms
      window.setTimeout(function(){
        that.attr('disabled', true);
      }, 10);

    }

  });

}


// dummy formErrors object for testing purposes
window.formErrors = {
  'REG2': Drupal.t('This is a mandatory field', {}, {context: "ERROR MESSAGES"}),
  'REG4': Drupal.t('Please enter a valid email address', {}, {context: "ERROR MESSAGES"}),
  'REG5': Drupal.t('The email address confirmation does not match the email address', {}, {context: "ERROR MESSAGES"}),
  'REG6': Drupal.t('The format of this field is incorrect', {}, {context: "ERROR MESSAGES"}),
  'REG7': Drupal.t('The password does not match the password confirmation', {}, {context: "ERROR MESSAGES"}),
  'REG10': Drupal.t('The password must contain at least 8 characters', {}, {context: "ERROR MESSAGES"}),
  'REG11': Drupal.t('The zipcode is not valid', {}, {context: "ERROR MESSAGES"}),
  'REG13': Drupal.t('Invalid Date', {}, {context: "ERROR MESSAGES"})
};



// binding forms for validation
jQuery(document).ready(function () {

  checkForm();

});
;

(function ($) {
  Drupal.behaviors.cartierfoMediamind = {
    attach: function (context, settings) {
      $.fn.cartierfoMediamindSendTag = function(context, settings, tags) {
        for (var i = 0; i < tags.length; i++) {
          var ebRand = Math.random()+ ' ';
          ebRand = ebRand * 1000000;
          $.get(Drupal.settings.cartier.cartier_mediamind.mediamind_url + tags[i] + "&rnd=" + ebRand);
        }
      };

      // If there are tags associated with full page pushes,
      // trigger a request to mediamind when those are shown.
      if (Drupal.settings.cartier.cartier_mediamind.mediamind_slide_tags) {
        $('.slideshow').bind('slideOver', function(e) {
          var list = $(this).find("li.node-full-page-push");
          var push_id = list[e.newSlide].id.substr(5);
          if (Drupal.settings.cartier.cartier_mediamind.mediamind_slide_tags[push_id]){
            $.fn.cartierfoMediamindSendTag(context, settings, Drupal.settings.cartier.cartier_mediamind.mediamind_slide_tags[push_id]);
          }
        });
      }
    }
  }
})(jQuery);
;
(function($) {
  Drupal.behaviors.megaMenu = {
    attach: function (context, settings) {
      // Function to detect ipad.
      var isiPad = navigator.userAgent.match(/iPad/i) !== null;

      $('#secondary .trigger-link-megamenu').mouseenter(function(){
        $("select").blur(); // To close any opened select that may display over the menu
        var $this = $(this);
        $('.wrapper-megam').delay(100).fadeOut('slow');
        $(this).find('.wrapper-megam').stop(true, true).fadeIn('fast');
        if (isiPad && $this.find('.close-megamenu').length === 0) {
          $('<a href="#" class="close-megamenu" >'+Drupal.t('Close', {}, {context: "GENERICS"})+'</a>').prependTo($(this).find('.megam'));
        }
        $('.close-megamenu').click(function() {
          $this.find('.wrapper-megam').fadeOut('fast');
        });
      });
      $('#secondary .trigger-link-megamenu').mouseleave(function(){
        $(this).find('.wrapper-megam').stop(true, true)
                                      .delay(100)
                                      .fadeOut('fast', function(){
                                        $(this).attr('style', '');
                                      });
      });
    }
  };
})(jQuery);
;

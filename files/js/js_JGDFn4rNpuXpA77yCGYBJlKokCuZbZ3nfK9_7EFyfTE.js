/*
 * cmcustom.js
 * $Id:  $
 * $Revision:  $
 *
 * Version 4.2.0
 *
 * Coremetrics Tag v4.0, 8/7/2006
 * COPYRIGHT 1999-2002 COREMETRICS, INC. 
 * ALL RIGHTS RESERVED. U.S.PATENT PENDING
 *
 * The following functions aid in the creation of Coremetrics data tags.
 *
  Customisations
  ==============
  
 1. JNUSHI - Initial Version including previous customisations: Added age and gender to registration tag (during implementation). 
 	     10017785 - remove # from data collection 2010-07-06
 
 */
 
 
 // Creates a Registration tag and/or a Newsletter tag
 //
 // customerID		: required for Registration. ID of Customer to register.
 // customerEmail	: required for Newsletters. Optional for Registration.
 // customerCity		: optional. City of Customer that placed this order
 // customerState	: optional. State of Customer that placed this order
 // customerZIP		: optional. Zipcode of Customer that placed this order
 // age			: optional. Age of customer. Integer //customisation # 1
 // gender		: optional. Gender of customer. Either M or F //customisation # 1
 function cmCreateRegistrationTag(customerID, customerEmail, customerCity, customerState, customerZIP, age, gender, attributes) {
 	cmMakeTag(["tid","2","cd",customerID,"em",customerEmail,"ct",customerCity,"sa",customerState,"zp",customerZIP,"ag",age,"gd",gender,"cmAttributes",attributes]);
}


// Internal tag function, DO NOT CALL DIRECTLY
function cmMakeTag(__v) {
	var cm = new _cm("vn2", "e4.0");
	var i;
	for (i = 0; i < __v.length; i += 2) {
		var _n = __v[i];
		var _v = __v[i + 1];
		cm[_n] = _v;
	}
	
	// add a random number for cache-busting
	var datestamp = new Date();	
	var stamp = (Math.floor(Math.random() * 11111111)) + datestamp.valueOf();	
	cm.rnd = stamp;
	
	// if this is a TechProps tag, call addTP
	if (cm.tid == "6") {
		cm.addTP();
		//UPDATE: use cmSetCookie function instead
		document.cookie = "cmTPSet=Y; path=/";
	}

	// if this is the first pageview in the session, convert it to a TechProps tag
	if (cm.tid == "1") {
		if (cI("cmTPSet") != 'Y') {
			cm.tid = "6";
			cm.pc = "Y";
			cm.addTP();
			//UPDATE: use cmSetCookie function instead
			document.cookie = "cmTPSet=Y; path=/";
		}
	}

	// for backwards compatibility with clients using cmCustom libraries and the old cm_exAttr variable.
	if (cm.cm_exAttr) {
		cm.cmAttributes = cm.cm_exAttr.join("-_-");
		cm.cm_exAttr = null;
	}

	// process attribute and extrafield strings into correct tag parameters
	var cmAttributesMap = {"1": "pv_a","2":"rg","3":"o_a","4":"s_a","5":"pr_a","6":"pv_a","14":"c_a","15":"e_a"};
	var cmExtraFieldsMap = {"1": "pv","2":"rg","3":"or","4":"sx","5":"pr","6":"pv","7":"ps","14":"cx"};
	if (cm.cmAttributes) {
		var tempArray = cm.cmAttributes.split("-_-");
		var name = cmAttributesMap[cm.tid];
		for (i=0;i<tempArray.length;++i){
			cm[name + (i + 1)] = tempArray[i];
		}
		cm.cmAttributes = null;
	}
	if (cm.cmExtraFields) {
		var tempArray = cm.cmExtraFields.split("-_-");
		var name = cmExtraFieldsMap[cm.tid];
		for (i=0;i<tempArray.length;++i){
			cm[name + (i + 1)] = tempArray[i];
		}
		cm.cmExtraFields = null;
	}

	if (cmAutoCopyAttributesToExtraFields) {
		if ((cm.tid != '2') && (cm.tid != '15')) {
		    for (var i = 1; i <= 15; ++i) {
				if (!(cm[cmExtraFieldsMap[cm.tid] + "" + i])) {
					cm[cmExtraFieldsMap[cm.tid] + "" + i] = cm[cmAttributesMap[cm.tid] + "" + i];
				}
		    }
		}
	}
	
	// make sure we have a pageID value for pageview or tags that count as pageview
	if ((cm.pi == null) && ((cm.pc == "Y") || (cm.tid == "1"))) {
		cm.pi = cmGetDefaultPageID();
	}

	// try to get referrer from parent frameset
	try{
		if (parent.cm_ref != null) {
			cm.rf = parent.cm_ref;
			if (cm.pc == "Y") {
				parent.cm_ref = document.URL;
			}
		}
	
		// if parent had mmc variables and this is the first pageview, add mmc to this url
		if(parent.cm_set_mmc) {
			cm.ul = document.location.href + 
					((document.location.href.indexOf("?") < 0) ? "?" : "&") + 
					parent.cm_mmc_params; 
			if (cm.pc == "Y") {
				parent.cm_ref = cm.ul;
				parent.cm_set_mmc = false;
			}
		}
	}
	catch(err){
		// most likely failed due to browser security restrictions, so do nothing
	}

	// Set the destination and referring URL parameters if not already set
	if (cm.ul == null) {
		cm.ul = cG7.normalizeURL(window.location.href, false);
	}
	if (cm.rf == null) {
		cm.rf = cG7.normalizeURL(document.referrer, false);
	}

	// convert MMC parameters to lowercase
	cm.ul = cm.ul.replace(cmMMCPattern,function(p){return p.toLowerCase();});
	cm.rf = cm.rf.replace(cmMMCPattern,function(p){return p.toLowerCase();});

	//check for manual_cm_mmc parameter and attach to URL if mmc parameter not already in URL
	//10017785 - remove # from data collection
	//if ((this.manual_cm_mmc) && (cm.ul.indexOf("cm_mmc") == -1) && (cm.ul.indexOf("cm_ven") == -1)) {
	if (this.manual_cm_mmc != null) {
		if (cm.ul.indexOf("\/#")>-1) { cm.ul = cm.ul.replace(/\/#/g,''); }
		
		//cm.ul = cm.ul + ((cm.ul.indexOf("&") == -1) ? ((cm.ul.indexOf("?") == -1) ? "?" : "&") : "&") + "cm_mmc=" + this.manual_cm_mmc;
	}

	// check for cm_em or cm_lm parameter and add registration tag to tagset if necessary
	if (cmCheckCMEMFlag){
		cmStartTagSet();
	}
    cm.writeImg();
	if (cmCheckCMEMFlag) {
		cmCheckCMEMFlag = false;	
		cmCheckCMEM();
		cmSendTagSet();		
	}

	// call IO function if IO enabled
	if (typeof cm_ted_io == 'function') {
		if(cm_IOEnabled) {
			cm_ted_io(cm);
		}
	}
};
(function ($) {
  $(document).ready(function() {
    if (typeof cmSetClientID == 'undefined') {
      return;
    }
    // Core metrics base configuration.
    // Set client ID.
    // Local client ID
    var clientId = Drupal.settings.cartierfo_analytics.client_id;
    // Global client ID (only for production)
    var clientIdGlobal = Drupal.settings.cartierfo_analytics.client_id_global;
    var cookieDomain = Drupal.settings.cartierfo_analytics.cookie_domain;
    var mode = Drupal.settings.cartierfo_analytics.cm_mode;
    var a = Drupal.settings.cartierfo_analytics;
    var search_term = not_empty(a.search_term) ? a.search_term : null;
    var search_results = null;
    if (not_empty(a.search_term) && not_empty(a.search_results)) {
      var search_results = a.search_results;
    }
    else if (not_empty(a.search_term)){
      var search_results = 0;
    }
    // a.different_currency is used in order details.
    if (not_empty(a.different_currency)) {
      a.currency = a.different_currency;
    }

    // Core metrics mode, can be only test or production.
    // Should map deployed_environment values
    if (mode == 'prod') {
      // The client ID should be the account ID concatenated with a semicolon and
      // the domain client ID.
      // We don't have it yet so use twice the client ID.
      clientId = clientIdGlobal + ';' + clientId;
      flagMode = true;
      dataDomain = "data.coremetrics.com";
    }
    else {
      flagMode = false;
      dataDomain = "testdata.coremetrics.com";
    }
    cmSetClientID(clientId, flagMode, dataDomain, cookieDomain);

    // Enables formaction "pageid" prefixing.
    cmSetupOther({cm_FormPageID: true, cm_currencyCode: a.currency});

    // Pageview tag.
    if (not_empty(a.different_page_id)) {
      a.page_id = a.different_page_id;
    }
    // We have to check that the user already visited the dispatch page.
    if (not_empty(a.needs_dispatch_check) && getCookie('cartier_dispatch_page_visited') === null) {
      // Prevent Automatic link click tracking because Cartier asked for manual
      // link clicks on this page only.
      cmSetupOther({cm_TrackLink: ''});
      // Change the page id and category id to match those provided by Cartier.
      a.page_id = "Cartier/Dispatch";
      a.category_id = "Cartier";
      // Hide the original content of the homepage and display the dispatch page
      // content. We do this from javascript because of caching.
      $('#page').hide();
      $('.dispatch-page').show();
      $('body').addClass('dispatch-page-show');
      // Set the cookie so that next time the user visits our .com site it will
      // not show up again.
      setCookie('cartier_dispatch_page_visited', 1);
    }
    $().createPageViewTag(a, true);

    // If we have not available products in the shopping bag, we have to launch
    // a pageview for these products.
    if (not_empty(a.not_available_products)) {
      a.page_id = a.page_id + '/out of stock product: ';
      $.each(a.not_available_products, function(index, item){
        if (index == 0) {
          a.page_id = a.page_id + '[' + item.product_id + ' - ' + item.product_name + ']';
        }
        else {
          a.page_id = a.page_id + '-[' + item.product_id + ' - ' + item.product_name + ']';
        }
      });

      $().createPageViewTag(a, true);
    }
    // Add pageview tags for browse and refine tabs on model listing.
    $('a[href="#cartierfo-pages-listing-collections"]').live('mousedown', {an: a}, function(e) {
      $().createPageViewTag(e.data.an, true);
    });
    $('a[href="#cartierfo-pages-models-listing"]').live('mousedown', {an: a}, function(e) {
      e.data.an = e.data.an.replace('/browse', '/refine');
      $().createPageViewTag(e.data.an, true);
    });
    // ProductView tag.
    if (not_empty(a.product_id)) {
      cmCreateProductviewTag(a.product_id, a.product_name, a.category_id, a.sellable +
        '-_-' + a.product_source + '-_-' + a.product_collection + '-_-' + a.product_stock);
    }
    if (not_empty(a.product_view_container)) {
      $('.sl-control').click({an: a}, function(e){
        var analytics = e.data.an;
        // We need this timeout because of the slide effect.
        setTimeout(function(){
          $.each($('.slide-item'), function(i, item) {
            if ($(item).hasClass('active')) {
              // We launch the element tag and the product view only for the
              // current slide.
              trigger_selection_events(i, analytics);
            }
          });
          $.each($('.slideshow-exceptionals-pieces-slideshow .product-slide'), function(i, item) {
            if ($(item).css('visibility') === 'visible') {
              // We launch the element tag and the product view only for the
              // current slide.
              trigger_selection_events(i, analytics);
            }
          });
        }, 2000);
      });
      // Activate the product view and element tag for the first product when
      // all creations button is clicked.
      $('.selection_slideshow .cta a').click({an: a}, function(e) {
        trigger_selection_events(0, e.data.an);
      });
    }

    var trigger_selection_events = function(i, analytics) {
      var prod = analytics.product_view_container[i];
      cmCreateElementTag(analytics.selection_name + ' - ' + prod.product_name, 'Selections');
      cmCreateProductviewTag(prod.product_id, prod.product_name, prod.category_id,
        prod.product_sellable + '-_-' + prod.product_source + '-_-' + prod.product_collection +
          '-_-' + prod.product_stock);
    }
    if (not_empty(a.product_action_type) && (a.product_action_type == 'order_confirmation')) {
      // The following functions must be called in this order because Shop Action 9 and
      // Order tags will be rejected if the same order ID is found in the lifetime data
      // for that Coremetrics Client ID. This is why we must have two loops.

      // Shop action 9 tag.
      var len = a.product_container.length;
      if (len > 0) {
        for (var i=0; i<len; ++i) {
          var e = a.product_container[i];
          var total_price  = 0;
          for (var j=0; j<len; ++j) {
            var el = a.product_container[j];
            // This means that the two products will be aggregated in the same
            // request.
            if (el.product_id == e.product_id) {
              total_price  = total_price + el.product_unit_price * el.product_quantity;
            }
          }
          cmCreateShopAction9Tag(e.product_id, e.product_name,
            e.product_quantity, e.product_unit_price, a.registration_id, a.order_id,
            a.order_subtotal, a.category_id, total_price + '-_-' + a.currency);
        }
        // Must be called after all shop action 9 calls.
        cmDisplayShops();

        // Order tag.
        cmCreateOrderTag(a.order_id, a.order_subtotal, a.order_shipping, a.registration_id);
      }
    }

    // Registration tag.
    if (not_empty(a.registration_id)) {
      cmCreateRegistrationTag(a.registration_id, '', a.registration_city,
        a.registration_country,'', a.registration_age, a.client_gender);
    }

    // ConversionEvent tag.
    if (not_empty(a.events_container)) {
      var len = a.events_container.length;
      for (var i=0; i<len; ++i) {
        var e = a.events_container[i];
        if (not_empty(e.id)) {
          $(e.id).live('mousedown', {el: e},function(event) {
            cmCreateConversionEventTag(event.data.el.event_id, event.data.el.action_type,
              event.data.el.event_category_id, event.data.el.points, event.data.el.event_reason);
          });
        }
        if (not_empty(e.event_type)) {
          cmCreateConversionEventTag(e.event_id, e.action_type, e.event_category_id, e.points, e.event_reason);
        }
      }
    }

    // Elements tag.
    if (not_empty(a.elements_container)) {
      var len = a.elements_container.length;
      for (var i=0; i<len; ++i) {
        var e = a.elements_container[i];
        // e.id stands for identifier and can be any type of js selector.
        if (not_empty(e.id) && $(e.id).length > 1) {
          if (e.id == '.sl-control') {
            // If we have a slideshow it has the same class for all it's elements.
            // In this case we need to check if it has the additional classes ls-next or ls-previous.
            $(e.id + ':not(".sl-next"):not(".sl-previous")').click({el: e}, function(event) {
              cmCreateElementTag('dots', event.data.el.element_category);
            });
            $(e.id + '.sl-next').click({el: e}, function(event) {
              cmCreateElementTag('next', event.data.el.element_category);
            });
            $(e.id + '.sl-previous').click({el: e}, function(event) {
              cmCreateElementTag('previous', event.data.el.element_category);
            });
          }
          else if (e.id == '.pager') {
            // ESFY slideshows.
            $('#esfy-slideshow a.left').click({el: e}, function(e) {
              cmCreateElementTag('previous', e.data.el.element_category);
            });
            $('#esfy-slideshow a.right').click({el: e}, function(e) {
              cmCreateElementTag('next', e.data.el.element_category);
            });
            $('#esfy-slideshow .pager a').click({el: e}, function(e) {
              cmCreateElementTag('dots', e.data.el.element_category);
            });
          }
          else {
            $(e.id).live('mousedown', {el: e}, function(event) {
              cmCreateElementTag(event.data.el.element_id, event.data.el.element_category, '');
            });
          }
        }
        else if (not_empty(e.id)) {
          $(e.id).live('mousedown', {el: e}, function(event) {
            cmCreateElementTag(event.data.el.element_id, event.data.el.element_category, '');
          });
        }
        // If we have e.element_type it means we must trigger the event on
        // page display.
        if (not_empty(e.element_type)) {
          cmCreateElementTag(e.element_id, e.element_category);
        }
      }
    }

    // Does not match the pattern for other elements (needs to be custom).
    // Language selection element in footer.
    $('#footer li.language-select .sub-menu a').live('click', function() {
      cmCreateElementTag($(this).closest('li').attr('class'), 'Footer links');
    });

    // Contact page country select (contact page).
    $('#views-exposed-form-contact-us-page #edit-c-country-iso2').live('change', function() {
      var country = $("#edit-c-country-iso2 option:selected").text();
      cmCreateElementTag(country, 'Contact page country selection');
    });
    // We have to change the element category if we are on the search page.
    var refine = search_term ? 'Search Refine ' : 'Refine ';
    // RIA filters set and remove filters (can be done using the anchor or
    // using the checkbox).
    $('#cartierfo-pages-models-listing a.facetapi-inactive.facetapi-checkbox-processed').live('click', function(e) {
      // Can be either Collections or Categories.
      var category = $(this).closest('.item-list').prev().attr('name');
      var name = $(this).find('span.element-invisible').text();
      // Can be the current category or collection (e.g. Love, Rings).
      var page_type = not_empty(a.listing_element) ? a.listing_element : '';
      var element_id = name.replace('Apply', 'Set ' + category + ' -');
      cmCreateElementTag(element_id, refine + page_type);
    });
    $('#cartierfo-pages-models-listing-ria .facetapi-checkbox').live('click', function(e) {
      // Can be either Collections or Categories.
      var category = $(this).closest('.item-list').prev().attr('name');
      var name = $(this).parent().parent().siblings('a').find('span.element-invisible').text();
      // Can be the current category or collection (e.g. Love, Rings).
      var page_type = not_empty(a.listing_element) ? a.listing_element : '';
      if ($(this).is(':checked')) {
        var element_id = name.replace('Apply', 'Set '+ category + ' -');
      }
      else {
        var element_id = name.replace('Remove', 'Clear '+ category + ' -');
      }
      cmCreateElementTag(element_id, refine + page_type);
    });
    // Slider price filter.
    $('.search-api-ranges-widget').live("slidestop", function(event, ui) {
      var page_type = not_empty(a.listing_element) ? a.listing_element : '';
      var min = $('.yui3-g div.range-box-left input').val();
      var max = $('.yui3-g div.range-box-right input').val();
      cmCreateElementTag('Set Price '+ min + ' - ' + max , refine + page_type);
    });
    // Boutique "View only Cartier Stores" filter.
    $('.store-locator-filters .boutique_is_retailer .facetapi-checkbox').live('change', function() {
      if ($(this).is(':checked')) {
        cmCreateElementTag('View only Cartier boutiques', 'Boutique search refine');
      }
    });
    // Boutique select filters.
    // 1. Select links.
    $('.store-locator-filters .boutique_services_filter a.facetapi-inactive.facetapi-checkbox-processed').live('click', function() {
      name = $(this).children('.element-invisible').first().text();
      element_id = name.replace('Apply', 'Set:')
      cmCreateElementTag(element_id, 'Boutique search refine');
    });
    // 2. Select checkboxes.
    $('.store-locator-filters .boutique_services_filter .checker input.facetapi-checkbox').live('click', function() {
      name = $(this).parent().parent().siblings('a').children('.element-invisible').first().text();
      element_id = ($(this).is(':checked')) ? name.replace('Apply', 'Set:') : name.replace('Remove', 'Clear:');
      cmCreateElementTag(element_id, 'Boutique search refine');
    });

    // Subscription and interests custom "Newsletter" and "Other News" must
    // send the information only when the checkbox is checked.
    if ($('#cartier-user-interests-form').length > 0) {
      $('#edit-newsletter').live('change', function() {
        if ($(this).is(':checked')){
          cmCreateConversionEventTag('Newsletter subscription interests', 2, 'Newsletter subscription', 20);
        }
        else {
          cmCreateConversionEventTag('Newsletter unsubscription interests', 2, 'Newsletter unsubscription', '');
        }
      });
      $('#edit-contactbybrand').live('change', function() {
        if ($(this).is(':checked')){
          cmCreateConversionEventTag('Other news subscription', 2, 'Other news', 15);
        }
        else {
          cmCreateConversionEventTag('Other news unsubscriptions', 2, 'Other news', '');
        }
      });
      $('#edit-submit').live('click', function() {
        cmCreateConversionEventTag('Edit subscriptions and interests', 2, 'Personal information', 5);
      });
    }

    // Regestration form. If the events happen on the checkout login page we have different names.
    if ($('#cartier-user-register-form').length > 0) {
      var is_checkout_page = ($('body').hasClass('page-checkout'));
      $('#edit-firstname1').blur(function() {
        var valueInput = $(this).val();
        // The information must be sent when the user writes his first name.
        if (valueInput != '' &&  Drupal.is_repeat_name != valueInput) {
          if (is_checkout_page) {
            cmCreateConversionEventTag('Register checkout', 1, 'Register', '', '');
          }
          else {
            cmCreateConversionEventTag('Register', 1, 'Register', '', '');
          }
          Drupal.is_repeat_name = valueInput;
        }
      });
      $('#edit-login-email').blur(function() {
        // The information must be sent when the user writes his first name.
        var valueInput = $(this).val();
        if (valueInput != '' && Drupal.is_repeat_email != valueInput) {
          if(is_checkout_page) {
            cmCreateConversionEventTag('Login checkout', 1, 'Connection', '', '');
          }
          else {
            cmCreateConversionEventTag('Login', 1, 'Connection', '', '');
          }
          Drupal.is_repeat_email = valueInput;
        }
      });
      $('#edit-newsletteraccount').live('click', function() {
        // The information must be sent if the user subscribes to the newsletter.
        if ($(this).is(':checked')) {
          if (is_checkout_page) {
            cmCreateConversionEventTag('Newsletter subscription purchase funnel', 2, 'Newsletter subscription', '', '');
          }
          else {
            cmCreateConversionEventTag('Newsletter subscription registration', 2, 'Newsletter subscription', 20, '');
          }
        }
      });
    }

    // Checkout pages.
    if ($('body.page-checkout-shipping').length > 0) {
      // Correspondance array for radios and the delivery option.
      var corespondance_array = {
        1: 'Deliver to my billing address',
        2: 'Deliver to another shipping address',
        3: 'Boutique pickup'
      };
      var checked_radio = $('input:radio[name="custom_delivery_pane[shipping][tabs]"]:checked').val();
      if (not_empty(checked_radio)) {
        cmCreateElementTag(corespondance_array[checked_radio], 'Delivery options');
      }
      $('input:radio[name="custom_delivery_pane[shipping][tabs]"]').live(
      'change',
      {ca: corespondance_array},
      function(e) {
        var checked_radio = $('input:radio[name="custom_delivery_pane[shipping][tabs]"]:checked').val();
        if (not_empty(checked_radio)) {
          cmCreateElementTag(e.data.ca[checked_radio], 'Delivery options');
        }
      });
      // Delivery options shipping (3), edit address element.
      $('#edit-custom-delivery-pane-edit').live('mousedown', function() {
        cmCreateElementTag('Edit address', 'Delivery options');
      });
    }

    // Delete product element tag in cart.
    $('.delete-link').live('mousedown', function(e) {
      cmCreateElementTag('Product removal', 'Shopping bag');
    });

    Drupal.is_repeat_email = $('#edit-login-email').val();
    Drupal.is_repeat_name = $('#edit-firstname1').val();
    //$elements[] = array('id' => '.expand-trigger', 'element_id' => 'Expand ' . $title[0]['value'], 'element_category' => 'Product page');
    $('.expand-trigger').mousedown(function(e) {
      if (not_empty(a.expand_title)) {
        cmCreateElementTag('Expand '+ a.expand_title, 'Product page');
      }
    });

    // Video tagging.
    if (not_empty(Drupal.settings.front_video_player) &&
      typeof(jwplayer) !== 'undefined' && typeof(jwplayer()) !== 'undefined') {
      jwplayer().onReady(function(){
        var site_section = a.site_section;
        var start = '-_--_--_--_--_--_--_--_--_--_--_--_-';
        this.onPlay(function() {
          // Position is > 0 means we are not at the beginning of the video so
          // it's definitely a 'play' action.
          if (this.getPosition() > 0) {
            cmCreateElementTag(this.getVideoName(a), site_section + ' videos',
              start + '2' + '-_-' + this.getJwPosDuration());
          }
          else {
            // Position is 0 means we are at the beginning of the video. If this
            // is a video with autostart we should trigger 'play', else we
            // trigger launch.
            if (typeof this.config.autostart !== 'undefined' && this.config.autostart == false) {
              cmCreateElementTag(this.getVideoName(a), site_section + ' videos',
                start + '0' + '-_-' + this.getJwPosDuration());
            }
            else {
              cmCreateElementTag(this.getVideoName(a), site_section + ' videos',
                start + '2' + '-_-' + this.getJwPosDuration());
            }
          }
        });
        this.onPause(function() {
          cmCreateElementTag(this.getVideoName(a), site_section + ' videos',
            start + '1-_-' + this.getJwPosDuration());
        });
        this.onComplete(function() {
          cmCreateElementTag(this.getVideoName(a), site_section + ' videos',
            start + '3-_-' + this.getJwPosDuration());
        });
        this.onMute(function(state) {
          // Because this event is called 2 times per click of mute button we
          // have to check both this.getMute() and state.mute.
          if (this.getMute() && state.mute == true) {
            cmCreateElementTag('Mute', site_section + ' videos', start + '-_-' + this.getJwPosDuration());
          }
        });

        /**
         * @var boolean state State of the fullscreen.
         */
        this.onFullscreen(function(state) {
          if (state.fullscreen === true) {
            cmCreateElementTag('Fullscreen', site_section + ' videos', start + '-_-' + this.getJwPosDuration());
          }
        });

        /**
         * Returns the position and duration of the movie concatenated with a -_-.
         *
         * @return {String}
         */
        this.getJwPosDuration = function() {
          return this.getPosition() + '-_-' + this.getDuration();
        };

        /**
         * Returns the video name.
         *
         * @param {object} a
         *
         * @returns {string}
         */
        this.getVideoName = function() {
          var video_name = a.category_id + '-' + a.page_title + '-Video';
          if (not_empty(this.config.file)) {
            var pieces = this.config.file.split('/');
            video_name = pieces[pieces.length - 1];
          }

          return video_name;
        };
      });
    }
  });

  /**
  * Checks if the mixed value passed is not empty or undefined.
  *
  * @param e
  * @return {Boolean}
  */
  function not_empty(e) {
    return !((e === "" || e === 0 || e === "0" || e === null || e === false || typeof e === 'undefined'));
  }

  /**
   * Checks if e is empty. Made this because it's confusing to see !not_empty().
   *
   * @param e
   * @returns {boolean}
   */
  function is_empty(e) {
    return !not_empty(e);
  }

  /**
   * Creates an elementTag for coremetrics.
   *
   * @param e_id
   * @param e_cat
   */
  $.fn.elementTag = function(e_id, e_cat) {
    if (typeof cmSetClientID == 'undefined') {
      return;
    }
    cmCreateElementTag(e_id, e_cat);
  }

  /**
   * Creates a manual pageviewTag for coremetrics. Done like this because of
   * asian devices which have too long urls. See #8689.
   *
   * @param a
   */
  $.fn.createPageViewTag = function(a, with_cookie) {
    // Set the right values for search term and search results for some cases.
    if (is_empty(a.search_term)) {
      a.search_term = null;
      a.search_results = null;
    }
    else if (is_empty(a.search_results)) {
      a.search_results = 0;
    }
    // Get the old page id if it's set, as a backup we use the href, doing so
    // it will not surpass the 2000 characters length for IE.
    var parsed_referrer = parseUri(document.referrer);
    var refferer_host = parsed_referrer.host;
    var parsed_host = parseUri(location.hostname).host;
    var prefix = 'http://' + parsed_host + '/';
    if (parsed_host.search('secure') >= 0) {
      prefix = 'https://' + parsed_host + '/';
    }
    if (not_empty(getCookie('cartierfo_analytics_old_pid')) && parsed_host.search(refferer_host) >= 0) {
      var old_pid = getCookie('cartierfo_analytics_old_pid', (!with_cookie));
    }
    else {
      // Take out the query parameter from the RF parameter if we don't have a
      // page id in the cartierfo_analytics_old_pid cookie.
      var old_pid = document.referrer.replace('?' + parsed_referrer.query, '');
    }
    // Call the manual page view.
    cmCreateManualPageviewTag(
      a.page_id, a.category_id, prefix + a.page_id + a.query_string, old_pid,
      '-_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_-' +
        '-_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_-' +
        '-_--_--_--_--_-',
      a.search_term, a.search_results
    );
    // After we set use the old page ID we set the current page ID as the old
    // one in order to be used in the next request.
    if (with_cookie) {
      setCookie('cartierfo_analytics_old_pid', prefix + a.page_id);
    }
  }

  /**
   * Sets a cookie with name and value.
   *
   * @param name
   * @param value
   */
  function setCookie(name, value) {
    if (Drupal.settings.cartierfo_analytics.is_https) {
      document.cookie = name+"="+value+"; path=/;secure";
    }
    else{
      document.cookie = name+"="+value+"; path=/";
    }
  }

  /**
   * Returns the value of the cookie name.
   *
   * @param name
   * @param last
   * @returns {*}
   */
  function getCookie(name, last) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    var last_occurence = null;
    for(var i=0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        if (last) {
          last_occurence = c.substring(nameEQ.length, c.length);
        }
        else {
          return c.substring(nameEQ.length, c.length);
        }
      }
    }

    return last_occurence;
  }

  /**
   * Parses a URI string and returns an object with the URI information (e.g.
   * host, source, authority, query string)
   *
   * @param str
   * @returns {{}}
   */
  function parseUri(str) {
    var o   = parseUri.options,
      m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      uri = {},
      i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
  };

  /**
   * Object used by the URI parser function for the settings used at parsing.
   *
   * @type {{strictMode: boolean, key: Array, q: {name: string, parser: RegExp}, parser: {strict: RegExp, loose: RegExp}}}
   */
  parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
      name:   "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

  /**
   * Called with ajax_command_invoke to replace the current currency code with
   * the one of the selected country.
   *
   * @param currency_code
   */
  $.fn.setCmCurrency = function(currency_code) {
    cmSetupOther({cm_currencyCode: currency_code});
    Drupal.settings.cartierfo_analytics.currency = currency_code;
  }

})(jQuery);
;
/*
 * @file
 * Manage Micro Shopping Bag behaviors.
 */

(function($){

  'use strict';

  Drupal.behaviors.cartierfoCommerceCart = {
    attach: function (context, settings) {
      var vDeployMSB;

      var Browser = {
        isiPad : /iPad/i.test(navigator.userAgent)
      };

      var msb = {
        items: $('#micro-shopping-bag-inner .views-row'),
        $wrapper: $('#micro-shopping-bag-inner .list-wrapper'),
        $content: $('#micro-shopping-bag-inner .view-content'),
        state: 'not',
        step: 0,
        number_of_items_displayed: 2,
        totalHeight: 0,
        previous_height_child: 0,

        init: function () {

          // Prepare height of content.
          msb.totalHeight = msb.items.eq(0).outerHeight(true) + msb.items.eq(1).outerHeight(true);
          $('#micro-shopping-bag-inner').css({'display': 'none', 'visibility': 'visible'});

          // Apply height on wrapper or apply some static css.
          // Apply once() to avoid height 0.
          if (msb.items.length > msb.number_of_items_displayed){
            msb.$wrapper.css('position', 'absolute');
            msb.$content.once().height(msb.totalHeight);
          } else {
            msb.$wrapper.css({
              "height": "auto",
              "position": "static",
              "margin-left": 0,
              "left": 0
            });
          }

          // Display buttons when we have more than 2 products.
          if (msb.items.length > msb.number_of_items_displayed && $('#micro-shopping-bag-inner .more-product').length === 0) {
            $('<a href="#" class="more-product ir" >+</a>').insertBefore('#micro-shopping-bag-inner .view-footer');
          }
          if (msb.items.length > msb.number_of_items_displayed && $('#micro-shopping-bag-inner .less-product').length === 0) {
            $('<a href="#" class="less-product ir" >+</a>').insertBefore('#micro-shopping-bag-inner .view-content').hide();
          }

          // Cache the buttons.
          msb.$less = $('#micro-shopping-bag-inner .less-product');
          msb.$more = $('#micro-shopping-bag-inner .more-product');
          msb.buttons();
        },

        update: function () {
          // Prepare height of content.
          if (msb.items.length > msb.number_of_items_displayed) {
            msb.$content.height(msb.totalHeight);
          }
        },

        buttons: function () {
          // On more product click navigate.
          msb.$more.click(function(e){
            e.preventDefault();
            msb.step++;
            if (msb.step > 0) {
              msb.$less.slideDown(50);
            }
            if (msb.step === (msb.items.length - msb.number_of_items_displayed)){
              msb.$more.slideUp(50);
            }

            msb.navigate('more');
          });
          // On less product click navigate.
          msb.$less.click(function(e){
            e.preventDefault();
            msb.step--;
            if (msb.step < (msb.items.length - msb.number_of_items_displayed)){
              msb.$more.slideDown(50);
            }
            if (msb.step === 0) {
              msb.$less.slideUp(50);
            }

            msb.navigate('less');
          });
        },

        navigate: function (direction) {

          // Determine the direction.
          if (direction === "less") {
            msb.next_height_child = "+="+msb.items.eq(msb.step + 1).outerHeight(true);
          } else {
            msb.next_height_child = "-="+msb.items.eq(msb.step - 1).outerHeight(true);
          }

          // Move the list of products.
          if (msb.state === "not" && msb.$wrapper.is(":not(animated)")) {
            msb.state = "animated";
            msb.$wrapper.dequeue().stop().animate({
              top : msb.next_height_child
            }, 200, 'linear', function(){
              setTimeout(
                function() {
                  msb.state = "not";
                }, 100
              );
            });
          }
        }
      };

      // Enable scroll into MSB.
      msb.init();

      var $msb_container = $('#micro-shopping-bag-inner');
      var deployMSB = function () {
        $msb_container.fadeOut();
      };

      if (!Browser.isiPad) {
        $msb_container.live('mouseleave', function() {
          var $this = $(this);
          vDeployMSB = setTimeout(deployMSB, 2000);
        }).live('mouseover', function() {
          clearTimeout(vDeployMSB);
        });
        $('#micro-shopping-bag a').mouseenter(function(){
          $msb_container.fadeIn(100);
        });
      }

      // The function when you add a product, Don't remove the "setTimeout", because doesn't work without.
      $.fn.cartierfoCommerceCartCollapse = function(data) {
        setTimeout(
          function() {
            msb.update();
            $.scrollTo({left: 0, top: 0}, 500);
            $msb_container.fadeIn('normal');
          }, 0
        );

        vDeployMSB = setTimeout(
          function() {
            $msb_container.fadeOut('slow');
          }, 3000
        );
      };
      // Function called when the cart limit is reached.
      $.fn.cartierfoCommerceCartLimitReached = function(data) {
        $.fancybox({
          content: '<div class="l-popin engraving-error-message"><div class="fancybox-limit-reached">'+data+'</div></div>',
          fitToView : false,
          autoSize : true,
          minHeight : 75,
          closeClick : false,
          openEffect : 'none',
          closeEffect : 'none',
          padding : 0,
          margin : 0,
          closeBtn : true
        });
      };

      // This code will ensure that when changing some quantity to other higher
      // than the allowed within the context of the cart, the selector will
      // recover the original value.
      $.fn.cartierfoCommerceCartReplaceLimit = function(name, data) {
        $("select[name='" + name + "'] option[value=" + parseInt(data) + "]").attr('selected', 'selected');
        $.uniform.update("select[name='" + name + "']");
      };
    }
  };

})(jQuery);
;

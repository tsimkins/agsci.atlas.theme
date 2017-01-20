;if(typeof(jQueryIWD) == "undefined"){if(typeof(jQuery) != "undefined") {jQueryIWD = jQuery;}} $ji = jQueryIWD;
var IWD = IWD || {};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

IWD.QuickView = {
    mode: 'qv_aac',
    config: null,
    button_html: '<span class="iwd-quick-view-button"><span class="text-button">Quick View</span></span>',
    closePopupOnCheckout: false
};

IWD.QuickView.Processor = {
    optionPriceOld: null,
    bundleOld: null,
    opConfigOld: null,
    activePopup: null,

    init: function () {
        this.initShowDialog();
        this.initSubmitModalForm();
        this.initSubmitFormProductPage();
        this.initRemoveItemShoppingCart();
        this.initStockNotification();
    },

    initStockNotification:function(){
        if (typeof(IWD.StockNotification) != 'undefined') {
            $ji(document).on('click', '.iwd-qv-request-notice', function (e) {
                e.preventDefault();
                console.log(IWD.StockNotification);
                IWD.StockNotification.sendRequestNotify($ji(this));
            });

            $ji(document).on('click', '.iwd-qv-btn-notify', function (e) {
                e.preventDefault();
                $ji('.iwd-qv-modal-notify').hide();//hide all
                IWD.StockNotification.currentBlock = $ji(this).data('id');
                $ji('#iwd-qv-modal-notify-' + IWD.StockNotification.currentBlock).fadeIn();
            });

            $ji(document).on('click', 'i.iwd-qv-close-notification', function (e) {
                e.preventDefault();
                $ji(this).closest('.iwd-qv-modal-notify').hide();
            });
        }
    },

    initShowDialog: function () {
        $ji(this).closest('.iwd-qv-modal-notify').hide();
        function makeRequest(link, mode, edit) {
            $ji('body').addClass('modal-open');
            $ji('#iwd-qv-additional-loader').css('display', 'block');
            link += '?no_cache=true';
            IWD.QuickView.Processor.request(link, edit, mode);
        }

        if(IWD.QuickView.mode == 'aac' || IWD.QuickView.mode == 'qv_aac') {
            $ji(document).on('click', '.btn-cart:not(.my-wishlist .btn-cart, #product_addtocart_form .btn-cart, .block-reorder .btn-cart), .iwd-btn-add-to-cart', function (e) {
                e.returnValue = false; // for IE
                e.preventDefault();
                var link = $ji(this).data('link');
                if (link == '' || typeof(link) == 'undefined') {
                    return;
                }
                makeRequest(link, 'aac');
            });

            //check all links where edit product url
            $ji(document).on('click', 'a', function (e) {

                var link = $ji(this).attr('href');
                if (link == '' || typeof(link) == 'undefined') {
                    return;
                }
                if (link.indexOf('http') == -1) {
                    return;
                }


//                if ($ji('#product_addtocart_form').length > 0 && link.indexOf('wishlist') == -1) {
//                    setLocation(link);
//                    return;
//                }

                if (link.indexOf('checkout/cart/configure') != -1) {
                    e.preventDefault();
                    valueNew = link.substr(link.indexOf('://') + 1);
                    makeRequest(valueNew, 'aac', true);
                }
            });

            if (IWD.QuickView.config.aac_selector != '' && IWD.QuickView.config.aac_selector != null ) {
                $ji(document).on('click', IWD.QuickView.config.aac_selector, function (e) {
                    e.preventDefault();
                    var link = $ji(this).attr('href');
                    if (link == '' || typeof(link) == 'undefined') {
                        return;
                    }
                    makeRequest(link, 'aac');
                });
            }

        }

        if(IWD.QuickView.mode == 'qv' || IWD.QuickView.mode == 'qv_aac') {
            $ji(document).on("click touchstart", ".iwd-quick-view-button", function(e){
                e.preventDefault();
                var link = $ji(this).data('link');
                if (link == '' || typeof(link) == 'undefined') {
                    return;
                }
                $ji(this).closest('.iwd-qv-modal-notify').hide();
                makeRequest(link, 'qv');
            });
        }
    },

    clearPrice: function () {
        $ji('.price-box span').each(function(k, v) {
            if($ji(v).attr('id')) {
                $ji(v).attr('iwd-qv-id', $ji(v).attr('id')).removeAttr('id');
            }
        });
    },
    restorePrice: function () {
        $ji('.price-box span').each(function(k, v) {
            if($ji(v).attr('iwd-qv-id')) {
                $ji(v).attr('id', $ji(v).attr('iwd-qv-id')).removeAttr('iwd-qv-id');
            }
        });
    },

    /** request add to cart or view product **/
    request: function (link, edit, mode) {
        if (typeof(edit) == "undefined") {
            edit = false;
        }
        var cart = IWD.QuickView.Processor.isShoppingCart();
        $ji(this).closest('.iwd-qv-modal-notify').hide();
        $ji.get(link, {"iwd_qv": true, "cart": cart, "edit": edit, "iwd_qv_mode": mode}, IWD.QuickView.Processor.parseResponse, 'json');
    },

    /** INIT SUBMIT FORM EVENT (MODAL FORM) **/
    initSubmitModalForm: function () {
        $ji(document).on('submit', '#iwd_qv_product_addtocart_form_modal', function (event) {
            event.preventDefault();
            var modalProductForm = new VarienForm('iwd_qv_product_addtocart_form_modal');
            if (modalProductForm.validator && modalProductForm.validator.validate()) {
            	valueNew = $ji(this).prop('action').substr($ji(this).prop('action').indexOf('://') + 1);
                IWD.QuickView.Processor.sendRequestFormAddToCart(valueNew, $ji('#iwd_qv_product_addtocart_form_modal'));
            }
        });
    },

    /** REWRITE DEFAULT METHOD productAddToCartForm;**/
    initSubmitFormProductPage: function () {
        if (window.hasOwnProperty('productAddToCartForm')) {
            productAddToCartForm = {
                submit: function (button) {
                    var productForm = new VarienForm('product_addtocart_form');
                    if (productForm.validator && productForm.validator.validate()) {
                        if (IWD.QuickView.Processor.isPaypalExpress(button.href)) {
                            productForm.submit();
                            return;
                        }
                        $ji('.iwd-qv-global-backdrop').show();
                        if($ji('#product_addtocart_form [name="iwd_qv_mode"]').length == 0)
                            $ji('#product_addtocart_form').append($ji('<input>').attr('type', 'hidden').attr('name', 'iwd_qv_mode').val('aac'));
                        valueNew = $ji('#product_addtocart_form').prop('action').substr($ji('#product_addtocart_form').prop('action').indexOf('://') + 1);
                        IWD.QuickView.Processor.sendRequestFormAddToCart(valueNew, $ji('#product_addtocart_form'));
                    }
                },

                submitLight: function (button, url) {
                    var productForm = new VarienForm('product_addtocart_form');
                    if (productForm.validator) {
                        var nv = Validation.methods;
                        delete Validation.methods['required-entry'];
                        delete Validation.methods['validate-one-required'];
                        delete Validation.methods['validate-one-required-by-name'];


                        for (var methodName in Validation.methods) {
                            if (methodName.match(/^validate-datetime-.*/i)) {
                                delete Validation.methods[methodName];
                            }
                        }

                        if (productForm.validator.validate()) {
                            if (url) {
                                $ji('#product_addtocart_form').attr('action', url);
                            }
                            productForm.submit();
                        }
                    }
                }
            }
        }
    },

    /** METHOD FOR REMOVE ITEM FROM SHOPPING CART **/
    initRemoveItemShoppingCart: function () {
        $ji(document).on('click', '.cart-table a.btn-remove', function (event) {
            event.preventDefault();
            var url = $ji(this).prop('href');
            var id = IWD.QuickView.Processor.getShoppingItemId(url);
            if (id == false) {
                setLocation(url);
                return;
            }
            $ji('.iwd-qv-global-backdrop').show();
            $ji.post(IWD.QuickView.config.removeShoppingCartUrl, {id: id}, IWD.QuickView.Processor.parseResponse, 'json');
        });
    },

    getShoppingItemId: function (url) {
        var re1 = '.*?', re2 = '(cart)', re3 = '.*?', re4 = '(delete)', re5 = '.*?', re6 = '(id)', re7 = '.*?', re8 = '(\\d+)';
        var p = new RegExp(re1 + re2 + re3 + re4 + re5 + re6 + re7 + re8, ["i"]);
        var m = p.exec(url);
        if (m != null) {
            var int1 = m[4];
            return int1;
        }
        return false;
    },

    /** CHECK IS PAYPAL BUTTON **/
    isPaypalExpress: function (url) {
        var re1 = '((?:[a-z][a-z]+))', re2 = '.*?', re3 = '(express)';
        var p = new RegExp(re1 + re2 + re3, ["i"]);
        var m = p.exec(url);
        if (m != null) {
            return true;
        }
        return false;
    },

    /** check if current page is shopping cart - for ajax reload page after add to cart */
    isShoppingCart: function () {
        var href = parent.location.href;
        if (href.indexOf('checkout/cart') != -1) {
            return true;
        }
        return false;
    },

    /** SEND AJAX REQUEST - SUBMITED FORM **/
    sendRequestFormAddToCart: function (url, $form) {
        $ji('.iwd-qv-ajax-loader').show();
        var formData = $form.serializeArray();
        var cart = IWD.QuickView.Processor.isShoppingCart();

        formData.push({name: "iwd_qv", value: true});
        formData.push({name: "cart", value: cart});
        //var to = url.indexOf('?') === -1 ? url + '?___store=1' : url + '&___store=1';
        $ji.post(url, formData, IWD.QuickView.Processor.parseResponse, 'json');
    },

    /** PARSE AJAX RESPONSE **/
    parseResponse: function (response) {
        $ji('.iwd-qv-global-backdrop').hide();
        $ji('.iwd-qv-ajax-loader').hide();
        if (typeof(response.after) != "undefined" && response.after == 'cart') {
            window.location.href = IWD.QuickView.config.shoppingCartUrl;
            return;
        }

        IWD.QuickView.Processor.parseAAC(response);
        IWD.QuickView.Processor.parseResponseAfterProductAdded(response);
        IWD.QuickView.Processor.parseResponseProductView(response);
        IWD.QuickView.Processor.parseResponseShoppingCart(response);
        IWD.QuickView.Processor.parseResponseHeader(response);
        IWD.QuickView.Processor.parseResponseUpdateTopDropdown(response);
    },

    parseAAC: function(response) {
        if (typeof(response.content) == "undefined") {
            $ji('body').removeClass('modal-open');
            IWD.QuickView.Processor.restorePrice();
            $ji('#iwd-qv-additional-loader').css('display', 'none');
        }
    },

    parseResponseAfterProductAdded: function(response){
        if (typeof(response.after) != "undefined")
        {
            if(response.after == 'message') {
                if(typeof(response.confirmation) != "undefined" && response.confirmation !== false){
//                    $ji('#iwd-qv-wrapper').html(response.confirmation);
                    IWD.QuickView.Decorator.showModal(response.confirmation);
                }
            }
            if (response.after == 'continue') {
                IWD.QuickView.Decorator.hideModal();
            }
        }
    },

    parseResponseProductView: function(response){
        if (typeof(response.content) != "undefined") {
            IWD.QuickView.Processor.clearPrice();
            IWD.QuickView.Decorator.showPopup = true;
            if(window.optionsPrice != undefined) {
                IWD.QuickView.Processor.optionPriceOld = window.optionsPrice;
            }
            if(window.bundle != undefined) {
                IWD.QuickView.Processor.bundleOld = window.bundle;
            }
            if(window.opConfig != undefined) {
                IWD.QuickView.Processor.opConfigOld = window.opConfig;
            }
        $ji('body').removeClass('modal-open');
        $ji('#iwd-qv-additional-loader').css('display', 'none');
        IWD.QuickView.Decorator.showModal(response.content);
        IWD.QuickView.Decorator.SystemColorSwatch();
        }
    },

    parseResponseShoppingCart:function(response){
        if (typeof(response.shopping_cart) != "undefined" && response.shopping_cart !== false) {
//            if (typeof(response.after) != "undefined" && response.confirmation !== false) {
//                IWD.QuickView.Decorator.showModal(response.confirmation);
//            } else {
//                IWD.QuickView.Decorator.hideModal();
//            }

            $ji('.cart').replaceWith(response.shopping_cart).promise().done(function(){
                $j('input[name^="cart"]').focus(function () {
                    $j(this).siblings('button').fadeIn();
                });
            });
            IWD.QuickView.Decorator.updateButton();
            // for PSU amasty+extended validation by IWD
            if (typeof AmastyTickets != 'undefined') {
                AmastyTickets.handleProceedCheckoutListener();
            }
        }
    },

    parseResponseHeader: function(response){
        /** header - full update for correct display shopping cart **/
        if (typeof(response.header) != "undefined") {
            if($ji('header .links').length > 0){
                $ji('header .links').replaceWith(response.header);
            }else if($ji('#header .links').length > 0){
                $ji('#header .links').replaceWith(response.header);
            }else if($ji('.header .links').length > 0){
                $ji('.header .links').replaceWith(response.header);
            }
        }
    },

    parseResponseUpdateTopDropdown: function(response){
        if (typeof(response.dropdown) != "undefined") {
            if (IWD.QuickView.config.useDefaultDropDown == true) {
                $ji('.header-minicart').html(response.dropdown).promise().done(function(){
                	enquire.register('(max-width: 767px)', {
                        match: function () {
                            $q('#header .cart-container').prepend($q('#header-cart'));
                        },
                         unmatch: function () {
                             $q('#header .skip-links > .header-minicart').prepend($q('#header-cart'));
                         }
                    });
                    if(response.show_dropdown == true) {
                        setTimeout(function(){
                            $ji('.skip-link.skip-cart').trigger('click');
                        }, 200);
                    }
                });

                var skipContents = $ji('.skip-content');
                var skipLinks = $ji('.skip-link.skip-cart');

                skipLinks.off('click');
                skipLinks.on('click', function (e) {

                    e.preventDefault();

                    var self = $ji(this);
                    // Use the data-target-element attribute, if it exists. Fall back to href.
                    var target = self.attr('data-target-element') ? self.attr('data-target-element') : self.attr('href');

                    // Get target element
                    var elem = $ji(target);

                    // Check if stub is open
                    var isSkipContentOpen = elem.hasClass('skip-active') ? 1 : 0;

                    // Hide all stubs
                    skipLinks.removeClass('skip-active');
                    skipContents.removeClass('skip-active');

                    // Toggle stubs
                    if (isSkipContentOpen) {
                        self.removeClass('skip-active');
                    } else {
                        self.addClass('skip-active');
                        elem.addClass('skip-active');
                    }
                });

                $ji('#header-cart').on('click', '.skip-link-close', function (e) {
                    var parent = $ji(this).parents('.skip-content');
                    var link = parent.siblings('.skip-link');

                    parent.removeClass('skip-active');
                    link.removeClass('skip-active');

                    e.preventDefault();
                });
            } else {
                $ji('.es-top-cart').remove();
//                $ji(response.dropdown).insertAfter('#ajax-cart-modal');
                IWD.QuickView.Decorator.moveDropdown();
                setTimeout(function () {
                    if (response.show_dropdown == true) {
                        $ji('.wrrapper-ajaxcart-dropdown').addClass('opened');
                    }
                }, 200);
            }
        }
    }
};

IWD.QuickView.Decorator = {
    showPopup: true,
    timer: null,

    init: function () {
        this.updateButton();
        this.initQtyChange();
        this.removeOpen();
        this.initOnModalClose();
        this.initOnCheckoutClick();
        this.productVideoIntegration();
    },

    initOnModalClose: function(){
        $ji('#iwd-qv-modal').on('hidden.bs.modal', function () {
            if(IWD.QuickView.Processor.optionPriceOld != null) {
                window.optionsPrice = IWD.QuickView.Processor.optionPriceOld;
                IWD.QuickView.Processor.optionPriceOld = null;
            }
            if(IWD.QuickView.Processor.bundleOld != null) {
                window.bundle = IWD.QuickView.Processor.bundleOld;
                IWD.QuickView.Processor.bundleOld = null;
            }
            if(IWD.QuickView.Processor.opConfigOld != null) {
                window.opConfig = IWD.QuickView.Processor.opConfigOld;
                IWD.QuickView.Processor.opConfigOld = null;
            }

            // remove position fixed from popup (this is seted for confirmation message popup)
            $ji('#iwd-qv-modal .iwd-qv-modal-dialog').removeClass('iwd-success-cart');
            $ji('#iwd-qv-wrapper').html('');

            IWD.QuickView.Decorator.showPopup = false;
            $ji('body').removeClass('quick-view-modal');
            ProductMediaManagerQV.destroyZoom();
            IWD.QuickView.Processor.restorePrice();
        });
    },

    initOnCheckoutClick: function(){
        jQueryIWD(document).on('click', '.es-btn-checkout', function(e){
            if(IWD.QuickView.closePopupOnCheckout) {
                $ji('#iwd-qv-modal').modaliwd('hide');
            }
        });
    },

    /** remove onclick from all buttons with class "btn-cart" **/
    updateButton: function() {
        // compatibility with infinite scroll - add quick-view button on hover on product
        if(IWD.QuickView.mode != 'aac') {
            //jQueryIWD(document).on('mouseover', IWD.QuickView.config.qv_selector, function(e){
        	jQueryIWD(IWD.QuickView.config.qv_selector).each(function(){
                var _this = jQueryIWD(this);
                if(_this.children('.iwd-quick-view-button').length == 0) {
                    _this.addClass('iwd-quick-view-block');
                    _this.css('position', 'relative');
                    var link, container;
                    if(_this.prop('tagName').toLowerCase() == 'li') {
                        container = _this;
                    } else {
                        container = _this.closest('li');
                    }
                    link = container.find('.product-image').attr('href');
                    valueNew = link.substr(link.indexOf('://') + 1);
                    _this.append(jQueryIWD(IWD.QuickView.button_html).data('link', valueNew));
                }
            });
        }

        $ji('.btn-cart, .iwd-btn-add-to-cart').not('.my-wishlist .btn-cart, #product_addtocart_form .btn-cart').each(function () {
            var value = $ji(this).attr('onclick');
            if (value != undefined) {
                if (value.indexOf('setLocation') != -1) {
                    value = value.replace("setLocation('", "");
                    value = value.replace("')", "");
                    valueNew = value.substr(value.indexOf('://') + 1);
                    $ji(this).removeAttr('onclick').data('link', valueNew);
                }
            }
        });
    },

    /** show dialog **/
    showModal: function (html) {
//        if(IWD.QuickView.Decorator.showPopup == true){
            $ji('#iwd-qv-modal').modaliwd('hide');
            $ji('#iwd-qv-wrapper').html(html).promise().done(function() {// wait if html is too big for it's load
                var options = {"backdrop": "static", "show": true};
                $ji('#iwd-qv-modal').modaliwd(options);
            });
//        }
    },

    /** hide dialog **/
    hideModal: function () {
        IWD.QuickView.Decorator.showPopup = false;
        $ji('#iwd-qv-modal').modaliwd('hide');
        $ji('body').removeClass('quick-view-modal');
        ProductMediaManagerQV.destroyZoom();
        if(typeof IWD.PV != 'undefined')
            IWD.PV.closeAllVideos();
    },

    /** decorate qty box **/
    decorateQty: function () {
        var width = $ji(window).width();
        $ji('.iwd-qv-modal input.qty').each(function () {
            var _this = $ji(this);
            _this.wrap('<div class="qty-block"></div>');

            _this.addClass('ajax-qty-input').addClass('left');

//            if (width > 480) {
//                _this.attr('readonly', 'readonly');
//            }
            $ji('<div class="right qty-slider"><i class="inc fa fa-chevron-up"></i><i class="dec fa fa-chevron-down"></i></div>').insertAfter(this);
        });
    },

    initQtyChange: function () {
        $ji(document).on('click touchstart', '.iwd-qv-modal .inc', function () {
            var parent = $ji(this).closest('.qty-block');
            var input = parent.find('.ajax-qty-input');
            var val = input.val();
            val = parseFloat(val);
            val = val + 1;
            input.val(val);
            if(input.is('[onkeyup]'))
                input.trigger('keyup'); // to force price change
        });

        $ji(document).on('click touchstart', '.iwd-qv-modal .dec', function () {
            var parent = $ji(this).closest('.qty-block');
            var input = parent.find('.ajax-qty-input');
            var val = input.val();
            val = parseFloat(val);
            val = val - 1;
            if (val < 1) {
                return;
            }
            input.val(val);
            if(input.is('[onkeyup]'))
                input.trigger('keyup'); // to force price change
        });
    },

    removeOpen: function () {
        $ji(document).on('mousemove', '.es-top-cart', function () {
            $ji('.wrrapper-ajaxcart-dropdown').removeClass('opened');
        })
    },

    moveDropdown: function () {
        var $html = $ji('#wrrapper-ajaxcart-dropdown').html();
        $ji('#wrrapper-ajaxcart-dropdown').remove();
        var parent = $ji('.top-link-cart').parent();
        parent.addClass('wrrapper-ajaxcart-dropdown')
        $ji($html).insertAfter('.top-link-cart');
    },

    SystemColorSwatch: function () {
        if (typeof(Product.ConfigurableSwatchesQV) != "undefined" && typeof(spConfigQV) != "undefined") {
            var swatchesConfig = new Product.ConfigurableSwatchesQV(spConfigQV);
        }
    },

    productVideoIntegration: function(){
        if(typeof IWD.PV != 'undefined') {
            $ji(document).on('click touchstart', IWD.PV.Frontend.thumbnailsBox + " ." + IWD.PV.Frontend.class_thumb_video, function(e){
                ProductMediaManagerQV.destroyZoom();
            });

            $ji(document).on('click touchstart', IWD.PV.Frontend.thumbnailsBox + " ." + IWD.PV.Frontend.class_thumb_image, function(e){
                ProductMediaManagerQV.initZoom();
            });
            $ji('.iwd-qv-modal').on('hide.bs.modal', function () {
                if(typeof IWD.PV != 'undefined' && IWD.PV.children !== null)
                    IWD.PV.closeAllVideos();
            });
        }
    }
};

$ji(document).ready(function () {
    if (typeof($ji) == "undefined") {
        console.log('IWD jQuery Library undefined');
    } else {
        if(IWD.QuickView.config.enable == true) {
            IWD.QuickView.Decorator.init();
            IWD.QuickView.Processor.init();
        } else {
            console.log("IWD Quick View extension is disabled");
        }

        $ji(document).on('click', '#iwd-qv-wrapper #recurring_start_date_trig', function () {
            $ji('#iwd-qv-wrapper .calendar').remove();
            $ji('.calendar').appendTo($ji('#iwd-qv-wrapper'));
        });
    }
});

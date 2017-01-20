var bp = {
    xsmall: 479,
    small: 599,
    medium: 770,
    large: 979,
    xlarge: 1199
};

// ==============================================
// Pointer abstraction
// ==============================================
var PointerManagerQV = {
    MOUSE_POINTER_TYPE: 'mouse',
    TOUCH_POINTER_TYPE: 'touch',
    POINTER_EVENT_TIMEOUT_MS: 500,
    standardTouch: false,
    touchDetectionEvent: null,
    lastTouchType: null,
    pointerTimeout: null,
    pointerEventLock: false,
    useZoom: true,

    getPointerEventsSupported: function() {
        return this.standardTouch;
    },

    getPointerEventsInputTypes: function() {
        if (window.navigator.pointerEnabled) { //IE 11+
            //return string values from http://msdn.microsoft.com/en-us/library/windows/apps/hh466130.aspx
            return {
                MOUSE: 'mouse',
                TOUCH: 'touch',
                PEN: 'pen'
            };
        } else if (window.navigator.msPointerEnabled) { //IE 10
            //return numeric values from http://msdn.microsoft.com/en-us/library/windows/apps/hh466130.aspx
            return {
                MOUSE:  0x00000004,
                TOUCH:  0x00000002,
                PEN:    0x00000003
            };
        } else { //other browsers don't support pointer events
            return {}; //return empty object
        }
    },

    /**
     * If called before init(), get best guess of input pointer type
     * using Modernizr test.
     * If called after init(), get current pointer in use.
     */
    getPointer: function() {
        // On iOS devices, always default to touch, as this.lastTouchType will intermittently return 'mouse' if
        // multiple touches are triggered in rapid succession in Safari on iOS
        if(Modernizr.ios) {
            return this.TOUCH_POINTER_TYPE;
        }

        if(this.lastTouchType) {
            return this.lastTouchType;
        }

        return Modernizr.touch ? this.TOUCH_POINTER_TYPE : this.MOUSE_POINTER_TYPE;
    },

    setPointerEventLock: function() {
        this.pointerEventLock = true;
    },
    clearPointerEventLock: function() {
        this.pointerEventLock = false;
    },
    setPointerEventLockTimeout: function() {
        var that = this;

        if(this.pointerTimeout) {
            clearTimeout(this.pointerTimeout);
        }

        this.setPointerEventLock();
        this.pointerTimeout = setTimeout(function() { that.clearPointerEventLock(); }, this.POINTER_EVENT_TIMEOUT_MS);
    },

    triggerMouseEvent: function(originalEvent) {
        if(this.lastTouchType == this.MOUSE_POINTER_TYPE) {
            return; //prevent duplicate events
        }

        this.lastTouchType = this.MOUSE_POINTER_TYPE;
        $ji(window).trigger('mouse-detected', originalEvent);
    },
    triggerTouchEvent: function(originalEvent) {
        if(this.lastTouchType == this.TOUCH_POINTER_TYPE) {
            return; //prevent duplicate events
        }

        this.lastTouchType = this.TOUCH_POINTER_TYPE;
        $ji(window).trigger('touch-detected', originalEvent);
    },

    initEnv: function() {
        if (window.navigator.pointerEnabled) {
            this.standardTouch = true;
            this.touchDetectionEvent = 'pointermove';
        } else if (window.navigator.msPointerEnabled) {
            this.standardTouch = true;
            this.touchDetectionEvent = 'MSPointerMove';
        } else {
            this.touchDetectionEvent = 'touchstart';
        }
    },

    wirePointerDetection: function() {
        var that = this;

        if(this.standardTouch) { //standard-based touch events. Wire only one event.
            //detect pointer event
            $ji(window).on(this.touchDetectionEvent, function(e) {
                switch(e.originalEvent.pointerType) {
                    case that.getPointerEventsInputTypes().MOUSE:
                        that.triggerMouseEvent(e);
                        break;
                    case that.getPointerEventsInputTypes().TOUCH:
                    case that.getPointerEventsInputTypes().PEN:
                        // intentionally group pen and touch together
                        that.triggerTouchEvent(e);
                        break;
                }
            });
        } else { //non-standard touch events. Wire touch and mouse competing events.
            //detect first touch
            $ji(window).on(this.touchDetectionEvent, function(e) {
                if(that.pointerEventLock) {
                    return;
                }

                that.setPointerEventLockTimeout();
                that.triggerTouchEvent(e);
            });

            //detect mouse usage
            $ji(document).on('mouseover', function(e) {
                if(that.pointerEventLock) {
                    return;
                }

                that.setPointerEventLockTimeout();
                that.triggerMouseEvent(e);
            });
        }
    },

    init: function() {
        this.initEnv();
        this.wirePointerDetection();
    }
};

var ProductMediaManagerQV = {
    IMAGE_ZOOM_THRESHOLD: 20,
    imageWrapper: null,

    destroyZoom: function() {
        $ji('.zoomContainer').remove();
        $ji('#iwd-qv-modal .product-image-gallery-qv .iwd-qv-gallery-image').removeData('elevateZoom');
    },

    createZoom: function(image) {
        if(!ProductMediaManagerQV.useZoom)
            return;

        // Destroy since zoom shouldn't be enabled under certain conditions
        ProductMediaManagerQV.destroyZoom();

        if(
        // Don't use zoom on devices where touch has been used
            PointerManagerQV.getPointer() == PointerManagerQV.TOUCH_POINTER_TYPE
                // Don't use zoom when screen is small, or else zoom window shows outside body
                || Modernizr.mq("screen and (max-width:" + bp.medium + "px)")
            ) {
            return; // zoom not enabled
        }

        if(image.length <= 0) { //no image found
            return;
        }

        if(image[0].naturalWidth && image[0].naturalHeight) {
            var widthDiff = image[0].naturalWidth - image.width() - ProductMediaManagerQV.IMAGE_ZOOM_THRESHOLD;
            var heightDiff = image[0].naturalHeight - image.height() - ProductMediaManagerQV.IMAGE_ZOOM_THRESHOLD;

            if(widthDiff < 0 && heightDiff < 0) {
                //image not big enough

                image.parents('.product-image').removeClass('zoom-available');

                return;
            } else {
                image.parents('.product-image').addClass('zoom-available');
            }
        }

        image.elevateZoom();
    },

    swapImage: function(targetImage) {
        targetImage = $ji(targetImage);
        targetImage.addClass('iwd-qv-gallery-image');

        ProductMediaManagerQV.destroyZoom();

        var imageGallery = $ji('#iwd-qv-modal .product-image-gallery-qv');

        if(targetImage[0].complete) { //image already loaded -- swap immediately

            imageGallery.find('.iwd-qv-gallery-image').removeClass('visible');

            //move target image to correct place, in case it's necessary
            imageGallery.append(targetImage);

            //reveal new image
            targetImage.addClass('visible');

            //wire zoom on new image
            ProductMediaManagerQV.createZoom(targetImage);

        } else { //need to wait for image to load

            //add spinner
            imageGallery.addClass('loading');

            //move target image to correct place, in case it's necessary
            imageGallery.append(targetImage);

            //wait until image is loaded
            imagesLoaded(targetImage, function() {
                //remove spinner
                imageGallery.removeClass('loading');

                //hide old image
                imageGallery.find('.iwd-qv-gallery-image').removeClass('visible');

                //reveal new image
                targetImage.addClass('visible');

                //wire zoom on new image
                ProductMediaManagerQV.createZoom(targetImage);
            });

        }
    },

    wireThumbnails: function() {
        //trigger image change event on thumbnail click
        $ji('#iwd-qv-modal .product-image-thumbs .thumb-link').click(function(e) {
            e.preventDefault();
            var jlink = $ji(this);
            var target = $ji('.iwd-qv-modal #image-' + jlink.data('image-index'));

            ProductMediaManagerQV.swapImage(target);
        });
    },

    initZoom: function() {
        ProductMediaManagerQV.createZoom($ji("#iwd-qv-modal .iwd-qv-gallery-image.visible")); //set zoom on first image
    },

    init: function() {
        ProductMediaManagerQV.imageWrapper = $ji('#iwd-qv-modal .product-img-box');

        // Re-initialize zoom on viewport size change since resizing causes problems with zoom and since smaller
        // viewport sizes shouldn't have zoom
        $ji(window).on('iwd-qv-delayed-resize', function(e, resizeEvent) {
            ProductMediaManagerQV.initZoom();
        });

        ProductMediaManagerQV.initZoom();

        ProductMediaManagerQV.wireThumbnails();

        $ji(document).trigger('product-media-loaded', ProductMediaManagerQV);
    }
};

$ji(document).ready(function() {
    var resizeTimer;
    $ji(window).resize(function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            $ji(window).trigger('iwd-qv-delayed-resize', e);
        }, 250);
    });

    ProductMediaManagerQV.init();
});

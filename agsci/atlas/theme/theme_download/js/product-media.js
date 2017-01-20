var ConfigurableMediaImagesQV = {
    imageType: null,
    productImages: {},
    imageObjects: {},

    arrayIntersect: function(a, b) {
        var ai=0, bi=0;
        var result = new Array();

        while( ai < a.length && bi < b.length )
        {
            if      (a[ai] < b[bi] ){ ai++; }
            else if (a[ai] > b[bi] ){ bi++; }
            else /* they're equal */
            {
                result.push(a[ai]);
                ai++;
                bi++;
            }
        }

        return result;
    },

    getCompatibleProductImages: function(productFallback, selectedLabels) {
        //find compatible products
        var compatibleProducts = [];
        var compatibleProductSets = [];
        selectedLabels.each(function(selectedLabel) {
            if(!productFallback['option_labels'][selectedLabel]) {
                return;
            }

            var optionProducts = productFallback['option_labels'][selectedLabel]['products'];
            compatibleProductSets.push(optionProducts);

            //optimistically push all products
            optionProducts.each(function(productId) {
                compatibleProducts.push(productId);
            });
        });

        //intersect compatible products
        compatibleProductSets.each(function(productSet) {
            compatibleProducts = ConfigurableMediaImagesQV.arrayIntersect(compatibleProducts, productSet);
        });

        return compatibleProducts;
    },

    isValidImage: function(fallbackImageUrl) {
        if(!fallbackImageUrl) {
            return false;
        }

        return true;
    },

    getSwatchImage: function(productId, optionLabel, selectedLabels) {
        var fallback = ConfigurableMediaImagesQV.productImages[productId];
        if(!fallback) {
            return null;
        }

        //first, try to get label-matching image on config product for this option's label
        var currentLabelImage = fallback['option_labels'][optionLabel];
        if(currentLabelImage && fallback['option_labels'][optionLabel]['configurable_product'][ConfigurableMediaImagesQV.imageType]) {
            //found label image on configurable product
            return fallback['option_labels'][optionLabel]['configurable_product'][ConfigurableMediaImagesQV.imageType];
        }

        var compatibleProducts = ConfigurableMediaImagesQV.getCompatibleProductImages(fallback, selectedLabels);

        if(compatibleProducts.length == 0) { //no compatible products
            return null; //bail
        }

        //second, get any product which is compatible with currently selected option(s)
        $ji.each(fallback['option_labels'], function(key, value) {
            var image = value['configurable_product'][ConfigurableMediaImagesQV.imageType];
            var products = value['products'];

            if(image) { //configurable product has image in the first place
                //if intersection between compatible products and this label's products, we found a match
                var isCompatibleProduct = ConfigurableMediaImagesQV.arrayIntersect(products, compatibleProducts).length > 0;
                if(isCompatibleProduct) {
                    return image;
                }
            }
        });

        //third, get image off of child product which is compatible
        var childSwatchImage = null;
        var childProductImages = fallback[ConfigurableMediaImagesQV.imageType];
        compatibleProducts.each(function(productId) {
            if(childProductImages[productId] && ConfigurableMediaImagesQV.isValidImage(childProductImages[productId])) {
                childSwatchImage = childProductImages[productId];
                return false; //break "loop"
            }
        });
        if (childSwatchImage) {
            return childSwatchImage;
        }

        //fourth, get base image off parent product
        if (childProductImages[productId] && ConfigurableMediaImagesQV.isValidImage(childProductImages[productId])) {
            return childProductImages[productId];
        }

        //no fallback image found
        return null;
    },

    getImageObject: function(productId, imageUrl) {
        var key = productId+'-'+imageUrl;
        if(!ConfigurableMediaImagesQV.imageObjects[key]) {
            var image = $ji('<img />');
            image.attr('src', imageUrl);
            ConfigurableMediaImagesQV.imageObjects[key] = image;
        }
        return ConfigurableMediaImagesQV.imageObjects[key];
    },

    updateImage: function(el) {
        var select = $ji(el);
        var label = select.find('option:selected').attr('data-label');
        var productId = optionsPrice.productId; //get product ID from options price object

        //find all selected labels
        var selectedLabels = new Array();

        $ji('.product-options .super-attribute-select').each(function() {
            var $option = $ji(this);
            if($option.val() != '') {
                selectedLabels.push($option.find('option:selected').attr('data-label'));
            }
        });

        var swatchImageUrl = ConfigurableMediaImagesQV.getSwatchImage(productId, label, selectedLabels);
        if(!ConfigurableMediaImagesQV.isValidImage(swatchImageUrl)) {
            return;
        }

        var swatchImage = ConfigurableMediaImagesQV.getImageObject(productId, swatchImageUrl);

        ProductMediaManagerQV.swapImage(swatchImage);
    },

    wireOptions: function() {
        $ji('.product-options .super-attribute-select').change(function(e) {
            ConfigurableMediaImagesQV.updateImage(this);
        });
    },

    swapListImage: function(productId, imageObject) {
        var originalImage = $ji('#product-collection-image-' + productId);

        if(imageObject[0].complete) { //swap image immediately

            //remove old image
            originalImage.addClass('hidden');
            $ji('.product-collection-image-' + productId).remove();

            //add new image
            imageObject.insertAfter(originalImage);

        } else { //need to load image

            var wrapper = originalImage.parent();

            //add spinner
            wrapper.addClass('loading');

            //wait until image is loaded
            imagesLoaded(imageObject, function() {
                //remove spinner
                wrapper.removeClass('loading');

                //remove old image
                originalImage.addClass('hidden');
                $ji('.product-collection-image-' + productId).remove();

                //add new image
                imageObject.insertAfter(originalImage);
            });

        }
    },

    swapListImageByOption: function(productId, optionLabel) {
        var swatchImageUrl = ConfigurableMediaImagesQV.getSwatchImage(productId, optionLabel, [optionLabel]);
        if(!swatchImageUrl) {
            return;
        }

        var newImage = ConfigurableMediaImagesQV.getImageObject(productId, swatchImageUrl);
        newImage.addClass('product-collection-image-' + productId);

        ConfigurableMediaImagesQV.swapListImage(productId, newImage);
    },

    setImageFallback: function(productId, imageFallback) {
        ConfigurableMediaImagesQV.productImages[productId] = imageFallback;
    },

    init: function(imageType) {
        ConfigurableMediaImagesQV.imageType = imageType;
        ConfigurableMediaImagesQV.wireOptions();
    }
};

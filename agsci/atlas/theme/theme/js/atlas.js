function scaleHomepageImage() {
    var maxHomepageImageWidth = 1140.0;
    
    var hpi = $(".homepageimage");

    if (hpi) {
        var ratio = hpi.width()/maxHomepageImageWidth; // Homepage image ratio
        var _height = hpi.data('height');
        var new_height = ratio*_height;
        hpi.css("height", new_height + 'px');
    }
}

$(document).ready(
    function () {
        
        var hpi = $('.homepageimage');
        
        var image_urls = hpi.attr('data-image-urls').split(';');
        var image_heights = hpi.attr('data-image-heights').split(';');

        var randomnumber = Math.floor(Math.random()*image_urls.length);
        var _height = image_heights[randomnumber];
        var _url = image_urls[randomnumber];
        
        hpi.css('background-image', "url(" + _url + ")");
        hpi.css('height', _height + 'px');
        hpi.data('height', _height);
        
        scaleHomepageImage();
        
    }
);

$(window).resize(
    function () {
        scaleHomepageImage();
    }
);
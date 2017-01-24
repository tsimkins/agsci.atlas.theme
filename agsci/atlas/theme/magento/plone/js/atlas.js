function scaleHomepageImage() {
    var maxHomepageImageWidth = 1151.0;
    
    var hpi = $ji("#homepageimage");

    if (hpi) {
        var ratio = hpi.width()/maxHomepageImageWidth; // Homepage image ratio
        var _height = hpi.data('height');
        var new_height = ratio*_height;
        hpi.css("height", new_height + 'px');
    }
}

$ji(document).ready(
    function () {
        
        var hpi = $ji('#homepageimage');
        
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

$ji(window).resize(
    function () {
        scaleHomepageImage();
    }
);
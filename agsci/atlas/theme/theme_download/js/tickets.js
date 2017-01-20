AmTickets = Class.create({
    initialize: function () {
        this.showDate();
    },
    showDate: function() {
        if ($$('.product-view .short-description')[0] && $$('.product-shop')[0] && $('amtickets_product_date')) {
            $$('.product-shop')[0].insertBefore($('amtickets_product_date'), $$('.product-view .short-description')[0])
        }
    }
});
$j(document).ready(function () {
    $j('.offer-reviews-more').click(function() {
        var productId = $j('#offer-product-id').val();
        var page = $j('#current-page').val();
        $j.get('/review/index/json', {
            'p' : page,
            'product_id' : productId
        }, function(response) {
            var reviews = jQuery.parseJSON(response);
            reviews.items.each(function(review) {
                $j('#resultTmpl').tmpl(review).appendTo('#offer-reviews-list');
            });
        });
    });
});

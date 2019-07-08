$j(document).on('gomage_customdashboard_campaign_list_order', function (event, url) {
    $j(document).trigger("show_sort_campaigns_loading_popup");

    $j.get(url, function (data) {
        $j('#designer_campaigns_list').html(data);
        $j(document).trigger("hide_sort_campaigns_loading_popup");
    });
});

$j(document).on('gomage_customdashboard_campaign_list_pager', function (event, getUrl, additionParams) {

    $j(document).trigger("show_sort_campaigns_loading_popup");

    var objUrlParams = {};

    var parser = document.createElement('a');

    parser.href = getUrl;

    var params = parser.search.substr(1).split('&');

    for (var i = 0; i < params.length; i++) {
        if (params[i] != '') {
            var pairs = params[i].split("=");
            objUrlParams[pairs[0]] = pairs[1];
        }
    }

    if (additionParams) {
        Object.keys(additionParams).forEach(function(key) {
            objUrlParams[key] = additionParams[key];
        });
    }

    $j.post(getUrl,  objUrlParams, function (data) {
        $j('#designer_campaigns_list').html(data);
        $j(document).trigger("hide_sort_campaigns_loading_popup");
    });
});

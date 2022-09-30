define([
    'Loqate_Tag/js/pca-default'
], function(){
    "use strict";

    return function () {
        if (typeof pca !== "undefined") {
            pca.magento.setupCheckout();
        }
    };
});
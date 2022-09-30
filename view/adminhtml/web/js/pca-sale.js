define([
    'jquery',
    'Magento_Sales/order/create/form'
], function(){
    "use strict";

    return function (config) {
        (function (a, c, b, e) {
            a[b] = a[b] || {}; a[b].initial = { accountCode: config.pcaAccCode, host: config.pcaAccCode + ".pcapredict.com" };
            a[b].on = a[b].on || function () { (a[b].onq = a[b].onq || []).push(arguments) }; var d = c.createElement("script");
            d.async = !0; d.src = e; c = c.getElementsByTagName("script")[0]; c.parentNode.insertBefore(d, c)
        })(window, document, "pca", "/" + "/" + config.pcaAccCode + ".pcapredict.com/js/sensor.js");

        pca.magento = pca.magento || {};

        pca.magento.isElementVisible = function( elem ) {
            return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
        };

        var fieldsToPopulate = [];

        pca.on('data', function(source, key, address, variations) {

            // We fire on an element so that the magento endpoint saves the state, then reload the page to display correctly.
            // We store a temp list of ids and values so we can show the user what magento has stored away.
            // The issue is that the validation magento does for each field means that we loose reference to the current set of fields,
            // so when the pca control comes to update it they are no longer there and we have blank fields, but the form submit that
            // magento does contains the data. We could reload the page but that is quite intensive.
            var fieldsToFire = pca.platform.productList[key]["PLATFORM_CAPTUREPLUS"].bindings[0].fields;

            for (var i = 0; i < fieldsToFire.length; i++) {

                var ele = document.getElementById(fieldsToFire[i].element);

                if (ele !== undefined || ele != null) {
                    fieldsToPopulate.push({
                        id : ele.id,
                        value : ele.value
                    });
                }
            }

            var ele = document.getElementById(fieldsToFire[0].element);

            if (ele !== undefined || ele != null) {
                pca.fire(ele, 'change');
            }
        });

        pca.magento.anyBindingsVisible = function(bindingList){

            for (var i = 0; i < bindingList.length; i++) {
                var fieldSet = bindingList[i].fields;

                var res = fieldSet.filter(function (x) { return pca.magento.isElementVisible(document.getElementById(x.element)); });

                if (res.length > 0){
                    return true;
                }
            }

            return false;
        }

        pca.magento.loadPca = function() {

            // Here we are replacing the default magento calls with our own and then calling the default again.
            // Below will allow us to load the pca control when a user toggles the "same as billing address"
            // without needing to reload the page.

            var curr = order.loadArea;
            order.loadArea = function(area, indicator, params) {
                // apply the default function.
                var prom = curr.apply(this, arguments);
                // The function returns a promise so we can use that to wait till it finishes.
                prom.then(function() {
                    // Populate with the values we have let magento store for the session.
                    if (fieldsToPopulate.length > 0){
                        for (var i = 0; i < fieldsToPopulate.length; i++) {
                            document.getElementById(fieldsToPopulate[i].id).value = fieldsToPopulate[i].value;
                        }
                    }
                    // If the shipping address is the same as the billing address then update those fields as well.
                    if (document.getElementById("order-shipping_same_as_billing").checked == true) {
                        for (var i = 0; i < fieldsToPopulate.length; i++) {

                            var ship = fieldsToPopulate[i].id.replace("billing", "shipping");

                            document.getElementById(ship).value = fieldsToPopulate[i].value;
                        }
                    }
                    // Clear the temp list of values and load the pca again so it is in sync with the fields.
                    fieldsToPopulate = [];

                    pca.load();
                })
            }

            pca.load();
        }

        pca.magento.doLoad = function() {
            // check to see if we have the form fields
            if (pca
                && pca.platform
                && typeof pca.platform.elementExists === 'function'
                && pca.platform.getBindingsForService("PLATFORM_CAPTUREPLUS")
                && pca.magento.anyBindingsVisible(pca.platform.getBindingsForService("PLATFORM_CAPTUREPLUS"))){
                //load controls for address forms
                pca.magento.loadPca();
            }
            else
            {
                // re-set the timeout
                window.setTimeout(pca.magento.doLoad, 500);
            }
        }

        //Entry code that runs - wait for the page to be ready
        pca.magento.doLoad();
    };
});
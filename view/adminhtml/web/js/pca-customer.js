define([
    'jquery'
], function($){
    "use strict";

    return function (config) {
        (function (a, c, b, e) {
            a[b] = a[b] || {}; a[b].initial = { accountCode: config.pcaAccCode, host: config.pcaAccCode + ".pcapredict.com" };
            a[b].on = a[b].on || function () { (a[b].onq = a[b].onq || []).push(arguments) }; var d = c.createElement("script");
            d.async = !0; d.src = e; c = c.getElementsByTagName("script")[0]; c.parentNode.insertBefore(d, c)
        })(window, document, "pca", "/" + "/" + config.pcaAccCode + ".pcapredict.com/js/sensor.js");

        pca.magento = pca.magento || {};
        pca.magento.currentUrl = window.location.href;

        pca.magento.isElementVisible = function( elem ) {
            if (elem) {
                return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
            }
        };

        var backup = {};
        var currentIds = [];
        var gotMatch = false;

        pca.on('data', function(source, key, address, variations) {

            var fieldsToFire = pca.platform.productList[key]["PLATFORM_CAPTUREPLUS"].bindings[0].fields;

            var provNameElId = null;

            for(var  j = 0; j < fieldsToFire.length; j++) {

                var ele = pca.getElement(fieldsToFire[j].element);

                if (ele !== undefined && ele != null) {

                    if (fieldsToFire[j].field === "{ProvinceName}") {
                        provNameElId = fieldsToFire[j].element;
                    }

                    pca.fire(ele, 'change');
                }
            }

            if (provNameElId != null) {
                var ele = document.getElementById(provNameElId);
                if (ele) {
                    for (var k = 0; k < ele.options.length; k++) {
                        if (ele.options[k].text === address.ProvinceName) {
                            ele.selectedIndex = k;
                            pca.fire(ele, 'change');
                            break;
                        }
                    }
                }
            }
        });

        pca.on('restrictions', function (service, key, restrictions) {
            // Do it once only.
            if (!gotMatch){
                // Fetch any id on the page that is in the format of magento random id's.
                var randomMagentoIds = [];

                var isDynamicRegExp = new RegExp("^[A-Z0-9]{7}$");
                var col = document.getElementsByTagName("*");

                for (var i = 0; i < col.length; i++) {
                    if (isDynamicRegExp.test(col[i].id)) {
                        randomMagentoIds.push({
                            name : col[i].name,
                            id : col[i].id
                        });
                    }
                }

                // Filter out the keys to just the set that has regex values that match whats on the page.
                var visibleCurrentMappings = [];
                var visibleGroupId = null;

                var fieldsPresent = restrictions.filter(function(d){ return d.Key == "fieldPresent"; });

                for (var i = 0; i < fieldsPresent.length; i++){

                    var fieldReg = new RegExp(fieldsPresent[i].Value);

                    for (var j = 0; j < randomMagentoIds.length; j++) {

                        if (fieldsPresent[i].Value.length >= randomMagentoIds[j].name.length && fieldReg.test(randomMagentoIds[j].name)) {

                            var matchedOn = randomMagentoIds[j].name.match("[a-z_0-9]*")[0];

                            if (pca.magento.isElementVisible(document.getElementById(randomMagentoIds[j].id))
                                || (visibleGroupId != null && visibleGroupId == matchedOn.substring(1, matchedOn.length-1))){

                                if (visibleGroupId == null){
                                    visibleGroupId = matchedOn.substring(1, matchedOn.length-1);
                                }

                                visibleCurrentMappings.push(randomMagentoIds[j]);
                            }
                        }
                    }
                }

                // As long as a visible set is present then we can proceed.
                if (visibleCurrentMappings.length > 0)
                {
                    gotMatch = true;

                    // Backup the original field regex values and store the new random ids found.
                    backup['backUpRegexFields'] = JSON.parse(JSON.stringify(pca.platform.productList[key]["PLATFORM_CAPTUREPLUS"].bindings[0].fields));
                    backup['backUpRegexRestrictions'] = JSON.parse(JSON.stringify(restrictions));
                    backup['key'] = key;

                    var fields = pca.platform.productList[key]["PLATFORM_CAPTUREPLUS"].bindings[0].fields;
                    var ignoreList = [];

                    for (var i = 0; i < fields.length; i++){
                        var toUse = visibleCurrentMappings.filter(function(f) { return new RegExp(fields[i].element).test(f.name); });

                        if (toUse.length > 0) {
                            fields[i].element = toUse[0].id;
                            currentIds.push(toUse[0].id);
                        } else {
                            ignoreList.push(fields[i].element);
                        }
                    }

                    restrictions.length = 0;
                    for (var i = 0; i < fields.length; i++){
                        if (ignoreList.filter(function(y) { return y == fields[i].element; }).length == 0) {
                            restrictions.push({
                                Key : "fieldPresent",
                                Value : fields[i].element
                            });
                        }
                    }
                }
            }
        });

        pca.magento.loadpca = function() {

            if (console && console.log) console.log("Loading PCA");

            if (backup['key']){
                pca.platform.productList[backup['key']]["PLATFORM_CAPTUREPLUS"].bindings[0].fields = backup['backUpRegexFields'];
                pca.platform.productList[backup['key']]["PLATFORM_CAPTUREPLUS"].restrictions = backup['backUpRegexRestrictions'];
                backup = {};
                currentIds = [];
                gotMatch = false;
            }

            pca.load();
            pca.magento.waitControls();

            // add address button
            var buttons = document.getElementsByTagName('button');
            for (var b = 0; b < buttons.length; b++) {
                if (buttons[b].className.indexOf('action-primary action-accept') > -1
                    || (buttons[b].className.indexOf('scalable') > -1 && buttons[b].className.indexOf('add') > -1)
                    || buttons[b].className.indexOf('action-show-popup') > -1) {
                    $(buttons[b]).off('click.pca').on('click.pca', function(){
                        pca.magento.waitAndLoad();
                    });
                }
            }

            // selected one of the addresses to edit.
            var addressListItems = document.getElementsByTagName('li');
            for (var i = 0; i < addressListItems.length; i++) {
                if (addressListItems[i].className.indexOf('address-list-item') > -1) {
                    $(addressListItems[i]).off('click.pca').on('click.pca', function(){
                        pca.magento.waitAndLoad();
                    });
                }
            }
        }

        pca.magento.getVisibleId = function(colection, defaultVal) {
            for ( var i = 0; i < colection.length; i++) {
                if (pca.magento.isElementVisible(colection[i])) {
                    return colection[i].id;
                }
            }

            return defaultVal;
        }

        pca.events = false;

        pca.magento.waitControls = function() {
            var interval,
                fieldsArr = ['street[0]', 'street[1]', 'city', 'region', 'region_id', 'postcode', "country_id"];

            interval = setInterval(function () {
                if (window.capturePlus) {
                    for (var i = 0; i < capturePlus.controls[0].fields.length; i++) {
                        var elems = document.querySelectorAll('[name="' + fieldsArr[i] + '"]');

                        fieldsArr[i] = pca.magento.getVisibleId(elems, fieldsArr[i]);
                        capturePlus.controls[0].fields[i].element = fieldsArr[i];
                    }

                    capturePlus.load();
                    console.log(capturePlus.controls[0].fields);
                    if(!pca.events) {
                        $(document).on('click', '.edit-default-shipping-address-button', function () {
                            pca.magento.waitAndLoad();
                        });

                        $(document).on('click', '.edit-default-billing-address-button', function () {
                            pca.magento.waitAndLoad();
                        });

                        $(document).on('click', '.add-new-address-button', function () {
                            pca.magento.waitAndLoad();
                        });

                        $(document).on('click', '[data-action="item-edit"]', function () {
                            pca.magento.waitAndLoad();
                        });

                        pca.events = true;
                    }
                    clearInterval(interval)
                }
            });
        }

        pca.magento.dynamicMagentoFieldsExist = function() {

            var isDynamicRegExp = new RegExp("^[A-Z0-9]{7}$");
            var col = document.getElementsByTagName("*");

            for (var i = 0; i < currentIds.length; i++){
                if (pca.magento.isElementVisible(pca.getElement(currentIds[i]))) {
                    return false;
                }
            }

            for (var i = 0; i < col.length; i++) {
                if (isDynamicRegExp.test(col[i].id) && pca.magento.isElementVisible(col[i])) {
                    return true;
                }
            }

            return false;
        };

        pca.magento.waitAndLoad = function() {

            var addAddressButton = document.getElementsByClassName('scalable add');

            // check to see if we have the form fields or the add address button
            if (pca
                && pca.platform
                && typeof pca.platform.elementExists === 'function'
                && addAddressButton
                && pca.magento.isElementVisible(addAddressButton[0])
                && pca.magento.dynamicMagentoFieldsExist()){

                //load controls for address forms
                pca.magento.loadpca();
            }
            else
            {
                // re-set the timeout
                window.setTimeout(pca.magento.waitAndLoad, 500);
            }
        }

        //Entry code that runs - wait for the page to be ready
        pca.magento.waitAndLoad();
    };
});
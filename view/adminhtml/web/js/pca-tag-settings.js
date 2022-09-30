define([
    'jquery'
], function($){
    "use strict";

    return function (config) {
        var initCodeFront = null;
        var initCodeBack = null;

        $('#formSettings').on('submit', function(){
            $('#btnSave').addClass('working');
            $.ajax({
                type: 'POST',
                url: config.formSettingsUrl,
                showLoader: true,
                data: {
                "form_key": window.FORM_KEY,
                    "action": 'save',
                    "custom_javascript_front": $('#customjavascript_front').val(),
                    "custom_javascript_back": $('#customjavascript_back').val()
            }
        })
        .done(function(result){
                resetSaveButton();
                $('.loqate-message')
                    .text('Your settings were saved.')
                    .removeClass('loqate-message-error')
                    .addClass('loqate-message-success')
                    .slideDown(500);
            })
                .fail(function(result){
                    $('.loqate-message')
                        .text('Sorry, there was a problem saving the settings.')
                        .removeClass('loqate-message-success')
                        .addClass('loqate-message-error')
                        .slideDown(500);
                })
                .always(function(_){
                    hidePCAMessage(2000, 500);
                    $('#btnSave').removeClass('working');
                });
        });

        $('#formLogIn').on('submit', function(){

            $('#btnLogIn').addClass('working');

            $.ajax({
                showLoader: true,
                type: 'POST',
                url: 'https://app_api.pcapredict.com/api/primaryaccountauthorisation',
                processData: false,
                contentType: 'application/json',
                data: JSON.stringify({
                    "accountcode": $('#accountCode').val(),
                    "password": $('#password').val(),
                    "deviceDescription": 'Magento 2 | ' + window.location.hostname,
                    "deviceType": 1
                })
            })
                .done(function(result){

                    if(console && console.log) console.log(result);

                    if(result.accounts && Object.keys(result.accounts).length > 0) {

                        var token = result.token.token;
                        var accountCode = $('#accountCode').val();
                        var auth = btoa(accountCode + ':' + token);

                        $.ajax({
                            showLoader: true,
                            type: 'POST',
                            url: 'https://app_api.pcapredict.com/api/apps/magento/2/0.0.1/licences',
                            processData: false,
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Basic ' + auth
                            }
                        })
                            .done(function(result2){
                                $.ajax({
                                    type: 'POST',
                                    url: config.formLogInUrl,
                                    showLoader: true,
                                    data: {
                                    "form_key": window.FORM_KEY,
                                        "account_code": accountCode,
                                        "account_token": token,
                                        "module_version": config.moduleVersion
                                }
                            })
                            .done(function(result3){

                                    var classToAdd = 'loqate-message-success';
                                    var classToRemove = 'loqate-message-error';
                                    var msg = 'Logging into the extension...';

                                    if(!result3.success) {
                                        classToAdd = 'loqate-message-error';
                                        classToRemove = 'loqate-message-success';
                                        msg = 'There was an error logging into the extension';
                                    }

                                    $('.loqate-message')
                                        .text(msg)
                                        .removeClass(classToRemove)
                                        .addClass(classToAdd)
                                        .slideDown(500);
                                })
                                    .fail(failMagentoCall);
                            })
                            .fail(function(result2){
                                $('.loqate-message')
                                    .text('Sorry, there was a problem creating your keys. Please email support@pcapredict.com')
                                    .removeClass('loqate-message-success')
                                    .addClass('loqate-message-error')
                                    .slideDown(500);
                            });
                    } else {
                        $('.loqate-message')
                            .text('Sorry, there is an error with the response from authentication. Please email support@pcapredict.com')
                            .removeClass('loqate-message-success')
                            .addClass('loqate-message-error')
                            .slideDown(500);
                    }
                })
                .fail(function(result){
                    $('#btnLogIn').removeClass('working');
                    $('#accountCode').val("");
                    $('#password').val("");
                    $('.loqate-message')
                        .text('Sorry, your account code or password was not recognized. Please try again.')
                        .removeClass('loqate-message-success')
                        .addClass('loqate-message-error')
                        .slideDown(500);
                })
                .always(function(){
                    $('#btnLogIn').removeClass('working');
                    hideMessageAndReload(5000);
                });
        });

        $('#formLogOut').on('submit', function(){
            $('#btnLogOut').addClass('working');

            var accountCode = config.pcaAccCode;
            var token = config.pcaToken;
            var auth = btoa(accountCode + ':' + token);

            $.ajax({
                type: 'POST',
                url: config.formLogOut,
                showLoader: true,
                data: {
                "form_key": window.FORM_KEY
            }
        })
        .done(function(_) { tryLogoutFromServer(auth); })
                .fail(failMagentoCall)
                .always(function(_) { hideMessageAndReload(2000); });
        });

        $('#customjavascript_front').bind('input propertychange', function() {
            if ((initCodeFront == $('#customjavascript_front')[0].value) && (initCodeBack == $('#customjavascript_back')[0].value)){
                resetSaveButton();
            } else {
                $('#btnSave').prop('disabled', false);
                $('#btnSave').removeClass('button-light');
                $('#btnSave').addClass('button-dark');
            }
        });

        $('#customjavascript_back').bind('input propertychange', function() {
            if ((initCodeFront == $('#customjavascript_front')[0].value) && (initCodeBack == $('#customjavascript_back')[0].value)){
                resetSaveButton();
            } else {
                $('#btnSave').prop('disabled', false);
                $('#btnSave').removeClass('button-light');
                $('#btnSave').addClass('button-dark');
            }
        });

        var resetSaveButton = function() {
            $('#btnSave').prop('disabled', true);
            $('#btnSave').addClass('button-light');
            $('#btnSave').removeClass('button-dark');

            if ($('#customjavascript_front')[0] != undefined) {
                initCodeFront = $('#customjavascript_front')[0].value;
            }

            if ($('#customjavascript_back')[0] != undefined) {
                initCodeBack = $('#customjavascript_back')[0].value;
            }
        }

        // hides the message banner after a delay and animates it.
        var hidePCAMessage = function(delayMs, animateTime, funcToRunAfter) {
            delayMs = delayMs || 0;
            animateTime = animateTime || 0;
            setTimeout(function(){
                $('.loqate-message').slideUp(animateTime);
                if (typeof(funcToRunAfter) == "function"){
                    funcToRunAfter();
                }
            }, delayMs);
        }

        // Tries to logout from the server. Not needed to log out of the extension.
        var tryLogoutFromServer = function(auth) {

            $.ajax({
                showLoader: true,
                type: 'DELETE',
                url: 'https://app_api.pcapredict.com/api/authtoken',
                processData: false,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + auth
                }
            })
                .done(function(_) {
                    if(console && console.log) console.log("Logged out successfully");
                })
                .fail(function(_){
                    if(console && console.log) console.log("Error logging out from server");
                })
                .always(function(_) {
                    $('.loqate-message')
                        .text("Logging out of the extension...")
                        .removeClass('loqate-message-error')
                        .addClass('loqate-message-success')
                        .slideDown(500);
                });
        }

        // Default message if the ajax call to a magento resource does not succeed.
        var failMagentoCall = function(_) {

            $('.loqate-message')
                .text("There was a problem while making a call to a magento resource for the extension")
                .removeClass('loqate-message-success')
                .addClass('loqate-message-error')
                .slideDown(500);
        }

        // Reloads the view with message close transition before.
        var hideMessageAndReload = function(messageInViewMs) {
            hidePCAMessage(messageInViewMs, 500, function() {  window.location.reload(true); });
        }

        $("#customCodeBackup").click(function(event){
            var front = $('#customjavascript_front').val();
            var back = $('#customjavascript_back').val();

            $(this).attr('download','custom_javascript_backup.txt')
                .attr('href',"data:application/octet-stream;base64,"+ btoa("Front-end custom JavaScript\n\n" + front + "\n\nBack-end custom JavaScript\n\n" + back));
        });

        resetSaveButton();
    };
});
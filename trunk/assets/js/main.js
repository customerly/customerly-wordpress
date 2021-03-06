jQuery(document).ready(function () {
    var searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('appid') == true) {
        var appid = searchParams.get('appid');
        save_main_options_ajax();
    }
    replaceFooter();


    if (configured === false) {
        console.log("Not configured");
        try {
            setTimeout(function () {
                mixpanel.track("wordpress_configuration_started", {
                    source: "wordpress",
                });
            }, 1000);

        } catch (e) {
            console.log("error", e);
        }

    } else {
        console.log(" configured");
    }

});


function reset() {

    jQuery('#appID').val("");
    jQuery('#sessionToken').val("");
    jQuery('#appkey').val("");
    save_main_options_ajax();
    mixpanel.track("wordpress_configuration_reset", {});
}

function show_login() {
    jQuery('.customerly_login').slideDown();
    jQuery('.customerly_register').slideUp();
    mixpanel.track("wordpress_configuration_login", {});
}

function show_register() {
    jQuery('.customerly_register').slideDown();
    jQuery('.customerly_login').slideUp();
    mixpanel.track("wordpress_configuration_register", {});
}

function login() {

    if (jQuery('#loginpassword').val().length < 6) {
        show_error("login", "Please insert your Password");
        return;
    }

    jQuery('#login-button').hide();
    jQuery('#login-loader').show();


    var data = JSON.stringify({
        email: jQuery('#loginemail').val(),
        password: jQuery('#loginpassword').val(),
    });

    jQuery.post({
        url: 'https://app.customerly.io/backend_api/v1/security/wordpress-login',
        type: 'POST',
        data: data,
        success: function (data) {


            if (data.error != undefined) {
                show_error("login", data.error.message);
                jQuery('#login-button').show();
                jQuery('#login-loader').hide();
                return;
            }


            var token = data.data.token;
            jQuery('#sessionToken').val(token);
            elaborate_available_apps(data.data.apps);

            jQuery('.customerly_app_select').slideDown();
            jQuery('.customerly_login').slideUp();

            mixpanel.track("login", {
                source: "wordpress"
            });


        }
    });

}

function select_app(appid, token) {
    jQuery('#appID').val(appid);
    jQuery('#appkey').val(token);
    save_main_options_ajax();
}

function elaborate_available_apps(apps) {

    //IF the account has just one app, I'll select it automatically
    if (Object.entries(apps).length == 1) {
        var key = Object.keys(apps)[0];
        var app = apps[key];
        select_app(app.app_id, app.access_token);
        return;
    } else {
        for (const [key, value] of Object.entries(apps)) {
            var app = value;
            jQuery('#app_container').append('<div class="app-container" onclick="select_app(\'' + key + '\',\'' + app.access_token + '\');">\n' +
                '<h4 class="app-name">' + app.app_name + ' <span class="app-id">' + app.app_id + '</span></h4>\n' +
                '</div>');
        }
    }

}

function show_error(position, message) {

    if (position == 'login') {
        jQuery('#error_message_login').html(message);
        jQuery('#error_message_login').slideDown();

        setTimeout(function () {
            jQuery('#error_message_login').html("").slideUp();
        }, 10000);
    } else {
        jQuery('#error_message').html(message);
        jQuery('#error_message').slideDown();

        setTimeout(function () {
            jQuery('#error_message').html("").slideUp();
        }, 10000);
    }

    try {
        mixpanel.track("wordpress_error", {
            error: message
        });

    } catch (e) {
        console.log("error", e);
    }


}

function register_account() {


    if (jQuery('#app_name').val().length < 3) {
        show_error("register", "Please add a Project Name");
        return;
    }
    if (jQuery('#password').val().length < 6) {
        show_error("register", "Please add at least 6 char to the Password");
        return;
    }
    var email = jQuery('#email').val();

    jQuery('#register-button').hide();
    jQuery('#register-loader').show();

    var data = JSON.stringify({
        email: email,
        submission: {
            extra: {
                utm_source: 'wordpress',
                utm_campaign: 'plugin',
                ref: 'lucamicheli'
            }
        },
        app: {
            name: jQuery('#app_name').val(),
            installed_domain: jQuery('#domain').val(),
            widget_position: 1,
            extra: {
                utm_source: 'wordpress',
                utm_campaign: 'plugin',
                ref: 'lucamicheli'
            }
        },
        account: {
            name: jQuery('#name').val(),
            password: jQuery('#password').val(),
            marketing: jQuery('#marketing:checkbox:checked').length > 0,
            extra: {
                utm_source: 'wordpress',
                utm_campaign: 'plugin',
                ref: 'lucamicheli'
            }
        }
    });


    jQuery.post({
        url: 'https://app.customerly.io/backend_api/v1/security/wordpress-register',
        type: 'POST',
        data: data,
        success: function (data) {


            try {
                mixpanel.track("sign_up", {
                    source: "wordpress",
                    utm_source: 'wordpress',
                    utm_medium: 'plugin',
                    utm_campaign: 'wp_plugin_in_page_signup',
                    email: email,
                });

                mixpanel.track("complete_registration", {
                    source: "wordpress",
                });
            } catch (e) {
                console.log("error", e);
            }

            if (data.error != undefined) {
                show_error("register", data.error.message);
                jQuery('#register-button').show();
                jQuery('#register-loader').hide();
                return;
            }
            var token = data.data.token;
            jQuery('#sessionToken').val(token);
            elaborate_available_apps(data.data.apps);

            jQuery('.customerly_app_select').slideDown();
            jQuery('.customerly_register').slideUp();


        }
    });

}

function save_main_options_ajax() {
    jQuery('#customerlySettings').submit();
    mixpanel.track("wordpress_configured");
}

function replaceFooter() {
    jQuery('#footer-upgrade').hide();
    jQuery("#footer-left").html('Do you like <strong>Customerly</strong>? Please leave us a <a href="https://go.customerly.io/wpreview" target="_blank">★★★★★ review</a>. We appreciate your support!');
}

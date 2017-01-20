;
if (typeof(jQueryIWD) == "undefined") {
    if (typeof(jQuery) != "undefined") {
        jQueryIWD = jQuery;
    }
}
$ji = jQueryIWD;
window.hasOwnProperty = function (obj) {
    return (this[obj]) ? true : false;
};
if (!window.hasOwnProperty('IWD')) {
    IWD = {};
}
var IWD = IWD || {};

IWD.Signin = {
    config: null,
    showDialog: false,
    googleHandleRequest: null,
    googleData: null,
    yahooDialog: null,
    twitterDialog: null,
    opc: false,

    init: function () {
        if (typeof(SigninConfig) != "undefined") {
            IWD.Signin.config = SigninConfig;
        } else {
            return;
        }
        if (typeof(IWD.Signin.config.isLoggedIn) != "undefined" && IWD.Signin.config.isLoggedIn == 1) {
            return;
        }
        this.initOpenDialog();
        this.initLoginLink();
        this.initLoginForm();
        this.initRegisterLink();
        this.initRegisterForm();
        this.initForgotPassword();
        this.initForgotForm();
        this.initPaypalLogin();
        this.initYahooLogin();
        this.initTwitterLogin();
        this.reloadCaptcha();
    },

    initPaypalLogin: function () {
        $ji(document).on('click', '.btn-paypal-login', function (e) {
            e.preventDefault();
            var paypalUrl = $ji('.btn-paypal-login').attr('href');
            mywindow = window.open(paypalUrl, "_PPIdentityWindow_", "location=1, status=0, scrollbars=0, width=400, height=550");
        });
    },
    initOpenDialog: function () {
        //wishlis link
        $ji('.links a').each(function () {
            var url = $ji(this).attr('href');
            if (typeof(url) != "undefined") {
                var regV = /wishlist/gi;
                var result = url.match(regV);
                if (result) {
                    $ji(this).click(function (event) {
                        event.preventDefault();
                        IWD.Signin.saveLink();
                        IWD.Signin.showModal();
                        IWD.Signin.prepareLoginForm();
                    });
                }
            }
        });
        /** close dialog **/
        $ji('#signin-iwd-modal').on('hide.bs.modal', function () {
            if (IWD.Signin.opc == true) {
                IWD.ES.Decorator.showDialog();
                IWD.ES.Decorator.hideProcess();
                IWD.ES.Decorator.showPayment();
            }
            IWD.Signin.opc = false;
        });
        // link-wishlist
        $ji('a.link-wishlist').attr('onclick', '');
        $ji('a.link-wishlist').click(function (event) {
            event.preventDefault();
            IWD.Signin.saveLink();
            IWD.Signin.showModal();
            IWD.Signin.prepareLoginForm();
        });
        //email to a friend
        $ji('.email-friend a, .emailto-link a').click(function (event) {
            event.preventDefault();
            IWD.Signin.saveLink();
            IWD.Signin.showModal();
            IWD.Signin.prepareLoginForm();
        });
    },
    saveLink: function () {
        var form = {};
        if (IWD.Signin.opc == true) {
            form.url = document.location.href + '?opc=true';
        } else {
            form.url = document.location.href;
        }

        $ji.post(IWD.Signin.config.url + 'signin/json/redirect', form, IWD.Signin.parseLoginResponse, 'json');
    },
    initLoginLink: function () {
        $ji('.signin-modal').click(function (e) {
            if ($ji(this).hasClass('login-trigger')) {
                return;
            }
            e.preventDefault();
            IWD.Signin.showLoginHeader();
            IWD.Signin.saveLink();
            IWD.Signin.showModal();
            IWD.Signin.prepareLoginForm();
        });
    },
    reloadCaptcha: function () {
        $ji(document).on('click touchstart', '#comment-captcha', function () {
            IWD.Signin.loadNewCaptcha();
        });
    },

    loadNewCaptcha: function () {
        $ji('#comment-captcha-load').show();
        jQuery.ajax({
            url: IWD.Signin.urlReloadCaptcha,
            type: "POST",
            dataType: 'json',
            success: function (result) {
                if (result.error == 0) {
                    IWD.Signin.resetCaptcha(result.src);
                } else {
                    console.error(result.error);
                }
            },
            error: function () {
                console.error("Reload captcha error");
            }
        });
    },
    resetCaptcha: function (src) {
        $ji('#comment-captcha').attr('src', src);
        $ji('#comment-captcha-load').hide();
        $ji('input[name="captcha-text"]').val("");
        $ji('input[name="captcha-text"]').focus();
        $ji('#iwd-signin-captcha-error').show();
    },
    initLoginForm: function () {
        $ji(document).on('click', '.signin #signin-login', function (e) {
            $ji('.signin #login-form').submit();
        });

        $ji(document).on('submit', '.signin #login-form', function (event) {
            IWD.Signin.showLoader();
            event.preventDefault();
            var form = $ji('.signin #login-form').serializeArray();
            $ji.post(IWD.Signin.config.url + 'signin/json/login', form, IWD.Signin.parseLoginResponse, 'json');
        });
    },

    prepareLoginForm: function () {

        IWD.Signin.showLoader();
        $ji.post(IWD.Signin.config.url + 'signin/json/load', {"block": "login"}, IWD.Signin.parseResponseLoad, 'json');
    },
    parseResponseLoad: function (response) {
        IWD.Signin.hideLoader();
        if (typeof(response.id != "undefined")) {
            var block = response.id;
            $ji('#signin-iwd-ajax-load').html(response[block]);
            $ji('#signin-iwd-modal').data('bs.modal').handleUpdate();
        }
    },
    initRegisterLink: function () {
        $ji(document).on('click', '#create-account-singup', function (e) {
            e.preventDefault();
            $ji('.login-form').hide();
            IWD.Signin.showRegisterHeader();
            IWD.Signin.insertLoader();
            IWD.Signin.prepareRegisterForm();
        });
        $ji('.signin-modal-register').click(function (e) {
            if ($ji(this).hasClass('login-trigger')) {
                return;
            }
            e.preventDefault();
            $ji('.login-form').hide();
            IWD.Signin.showRegisterHeader();
            IWD.Signin.showModal();
            IWD.Signin.insertLoader();
            IWD.Signin.prepareRegisterForm();
        });

        $ji(document).on('click', '.account-create-signin .back-link, #back-to-login', function (e) {
            e.preventDefault();
            IWD.Signin.showLoginHeader();
            $ji("html, body").animate({scrollTop: 0}, "slow");
            IWD.Signin.insertLoader();
            IWD.Signin.prepareLoginForm();
        });
    },

    showRegisterHeader: function () {
        $ji('#login-header').hide();
        $ji('#forgot-header').hide();
        $ji('#register-header').show();
    },
    showLoginHeader: function () {
        $ji('#login-header').show();
        $ji('#forgot-header').hide();
        $ji('#register-header').hide();
    },
    showForgotPassHeader: function () {
        $ji('#login-header').hide();
        $ji('#forgot-header').show();
        $ji('#register-header').hide();
    },

    initRegisterForm: function () {
        //$ji(document).on('click', '#submit-register-form', function (event) {
        //    event.preventDefault();
        //    $ji('#form-validate').submit();
        //});
        $ji(document).on('submit', '.account-create-signin #form-validate', function(event){
            IWD.Signin.showLoader();
            event.preventDefault();
            var form = $ji('.account-create-signin #form-validate').serializeArray();
            $ji.post(IWD.Signin.config.url + 'signin/json/register', form, IWD.Signin.parseRegisterResponse, 'json');
        });
    },

    prepareRegisterForm: function () {
        $ji.post(IWD.Signin.config.url + 'signin/json/load', {"block": "register"}, IWD.Signin.parseResponseLoad, 'json');
    },

    initForgotPassword: function () {
        $ji(document).on('click', '#forgot-password', function (e) {
            e.preventDefault();
            IWD.Signin.showForgotPassHeader();
            IWD.Signin.insertLoader();
            $ji.post(IWD.Signin.config.url + 'signin/json/load', {"block": "forgotpassword"}, IWD.Signin.parseResponseLoad, 'json');
        });
    },

    initForgotForm: function () {
        //$ji(document).on('click', '#submit-forgot-form', function(event){
        //    event.preventDefault();
        //    $ji('#form-validate').submit();
        //});
        $ji(document).on('submit', '.account-forgotpassword #form-validate', function (event) {
            IWD.Signin.showLoader();
            event.preventDefault();
            var form = $ji('.account-forgotpassword #form-validate').serializeArray();
            $ji.post(IWD.Signin.config.url + 'signin/json/forgotpassword', form, IWD.Signin.parseForgotPasswordResponse, 'json');
        });

    },

    insertLoader: function () {
        $ji('#signin-iwd-ajax-load').empty();
        IWD.Signin.showLoader();
    },

    showLoader: function () {
        $ji('.ajax-loader').show();
    },

    hideLoader: function () {
        $ji('.ajax-loader').hide();
    },

    parseLoginResponse: function (response) {
        if (response == null) {
            return;
        }

        if (typeof(response.error) != "undefined" && response.error == 1) {
            IWD.Signin.showMessage();
            // show message
            $ji('#signin-error').show();
            //if error show error message*/
            $ji('#signin-error').remove();
            //$ji('#iwd-signin-captcha-error').removeClass('hide').addClass('signin-error').insertAfter('.signin #login-form');
            $ji('<div />').attr('id', 'signin-error').addClass('signin-error').html(response.message).insertAfter('.signin #login-form');


            // standard
            if (!IWD.Signin.reCaptcha) {
                IWD.Signin.resetCaptcha(response.src);
            }
            IWD.Signin.showMessage(response.message);
        }

        if (typeof(response.linkAfterLogin) != "undefined") {

            if (IWD.Signin.opc == true) {
                IWD.Signin.hideModal();
                IWD.ES.Decorator.showDialog();
                IWD.ES.Decorator.showLoader();
                IWD.Signin.opc = false;
                IWD.ES.config.isLoggedIn = 1;
                IWD.ES.Loader.reloadMainBlock();
                IWD.ES.Decorator.hideProcess();
                IWD.ES.Decorator.showPayment();
                return;
            }

            if (typeof(response.message) != "undefined") {
                //show message and redirect to url after 2.5s;
                setTimeout(function () {
                    setLocation(response.linkAfterLogin);
                }, 2500);
            } else {
                //just redirect to url
                setTimeout(function () {
                    setLocation(response.linkAfterLogin);
                }, 500);
            }
        }
    },

    showMessage: function (message, block) {
        block = block | '#login-form';
        IWD.Signin.hideLoader();
        $ji('#signin-error').show();
        $ji('<div />').attr('id', 'signin-error').addClass('signin-error').html(message).insertAfter(block);
        $ji('#signin-iwd-modal').data('bs.modal').handleUpdate();
        //$ji('#iwd-signin-captcha-error').addClass('signin-error').insertAfter('.signin #login-form');
        //$ji('#signin-error').remove();
        //$ji('<div />').attr('id', 'signin-error').addClass('signin-error').html(response.message).insertAfter('.signin #login-form');
    },

    redirect: function (url) {
        setLocation(url);
    },

    parseRegisterResponse: function (response) {
        IWD.Signin.hideLoader();
        //$ji('#iwd-signin-captcha-error').show();
        $ji('#signin-error').remove();

        if (typeof(response.error) != "undefined" && response.error == 1) {
            //if error show error message
            //$ji('#iwd-signin-captcha-error').removeClass('hide').addClass('signin-error').insertAfter('.account-create-signin #form-validate');
            $ji('<div />').attr('id', 'signin-error').addClass('signin-error').html(response.message).insertAfter('.account-create-signin #form-validate');
            //$ji('#iwd-signin-captcha-error').show();

            if (!IWD.Signin.reCaptcha) {
                IWD.Signin.resetCaptcha(response.src);
            }
            IWD.Signin.showMessage(response.message);
        }
        if (typeof(response.linkAfterLogin) != "undefined") {
            $ji('#iwd-signin-captcha-error').addClass('hide')
            $ji('.account-create-signin #form-validate').empty();
            if (typeof(response.message) != "undefined" || response.error != 1) {
                //show message and redirect to url after 2.5s;
                $ji('#iwd-signin-captcha-error').addClass('hide')
                $ji('<div />').attr('id', 'signin-error').addClass('signin-success').html(response.message).appendTo('.account-create-signin #form-validate');

                setTimeout(function () {
                    setLocation(response.linkAfterLogin);
                }, 2500);
            } else {
                //just redirect to url
                setTimeout(function () {
                    setLocation(response.linkAfterLogin);
                }, 500);
            }
        }

        if (typeof(response.emailConfirmation) != "undefined") {
            if (typeof(response.message) != "undefined") {
                //just redirect to url
                $ji('<div />').attr('id', 'signin-error').addClass('signin-success').html(response.message).appendTo('.account-create-signin #form-validate');
            }
        }

    },

    parseForgotPasswordResponse: function (response) {
        IWD.Signin.hideLoader();

        if (typeof(response.error) != "undefined" && response.error == 1) {
            $ji('#iwd-signin-captcha-error').removeClass('hide').addClass('signin-error').insertAfter('.account-forgotpassword #form-validate');
            //$ji('<div />').attr('id', 'signin-error').addClass('signin-error').html(response.message).appendTo('.account-forgotpassword #form-validate');
            //$ji('#iwd-signin-captcha-error').show();
        } else {
            IWD.Signin.insertLoader();
            IWD.Signin.prepareLoginForm();
        }
        if (!IWD.Signin.reCaptcha) {
            IWD.Signin.resetCaptcha(response.src);
        }
        IWD.Signin.showMessage(response.message);
    },

    //facebook login or register
    loginWithFacebook: function () {
        if (IWD.Signin.config.isLoggedIn != 1) {
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    console.log('1');
                    FB.api('/me', {fields: 'email, first_name, last_name'}, IWD.Signin.pushFacebookData);
                } else {
                    console.log('2');
                    FB.login(function (response) {
                        if (response.authResponse) {
                            FB.api('/me', {fields: 'email, first_name, last_name'}, IWD.Signin.pushFacebookData);
                        } else {
                        }

                    }, {scope: 'public_profile, email', return_scopes: true});
                }
            });

        }
    },

    pushFacebookData: function (response) {
        var form = {};
        form.firstname = response.first_name;
        form.lastname = response.last_name;
        form.id = response.id;
        form.email = response.email;
        $ji.post(IWD.Signin.config.url + 'signin/json/facebook', form, IWD.Signin.parseLoginResponse, 'json');
    },


    /** YAHOO  **/
    initYahooLogin: function () {
        $ji(document).on('click', '.btn-yahoo-login', function (e) {
            e.preventDefault();

            var leftvar = (screen.width - 600) / 2;
            var topvar = (screen.height - 435) / 2;

            IWD.Signin.yahooDialog = window.open(IWD.Signin.config.url + 'signin/yahoo/prepare', "Yahoo", "width=600,height=435,resizable=false,scrollbars=false,status=false,toolbar=false,left=" + leftvar + ",top=" + topvar + ",status=no,toolbar=no,menubar=no")
            IWD.Signin.yahooDialog.focus();
        });
    },


    /** TWITTER **/
    initTwitterLogin: function () {
        $ji(document).on('click', '.btn-twitter-login', function (e) {
            e.preventDefault();

            var leftvar = (screen.width - 600) / 2;
            var topvar = (screen.height - 435) / 2;
            IWD.Signin.twitterDialog = window.open(IWD.Signin.config.url + 'signin/twitter/prepare/', "Twitter", "width=600,height=435,resizable=false,scrollbars=false,status=false,toolbar=false,left=" + leftvar + ",top=" + topvar + ",status=no,toolbar=no,menubar=no")
            IWD.Signin.twitterDialog.focus();
        });
    },

    showModal: function () {
        var options = {"backdrop": "static", "show": true}
        $ji('#signin-iwd-modal').modaliwd(options);
    },

    hideModal: function () {
        $ji('#signin-iwd-modal').modaliwd('hide');
    }
};
$ji(document).ready(function () {
    IWD.Signin.init();
});
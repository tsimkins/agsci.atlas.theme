;if(typeof(jQueryIWD) == "undefined"){if(typeof(jQuery) != "undefined") {jQueryIWD = jQuery;}} $ji = jQueryIWD;
var ExtendedValidation = {
    init: function() {

    },
    checkDoRunExtendedValidation: function(form) {
        var doRun = true;
        if (typeof window._iwdIsFromForm == 'undefined')
            doRun = false;
        // if this is update item form
        var action = form.attr('action');
        if (action != undefined && action.indexOf('checkout/cart/updateItemOptions') !== -1) {
            doRun = true;
        }
        if ( !doRun)
            return false;

        var inputs = form.find('.product-custom-option.am-registration-field'), _input = null;
        for (var i=0;i<inputs.length; i++) {
            _input = inputs.eq(i);
            if (_input.attr('type') == 'checkbox') {
                if (_input.prop('checked'))
                    return true;
            } else if (_input.val().length > 0)
                return true;
        }
        return false;
    },
    getForm: function(input) {
        var _input = jQueryIWD(input);
        if (_input.parents('.iwd-local-form').length > 0)
            return _input.closest('.iwd-local-form');
        return _input.closest('form');
    },
    validateFirstLastNames: function(val, input) {
        var _localForm = ExtendedValidation.getForm(input);
        if (!ExtendedValidation.checkDoRunExtendedValidation(_localForm))
            return true;
        return val.length > 0;
    },
    validatePhoneOrEmail: function(val, input) {
        var _localForm = ExtendedValidation.getForm(input);
        if (!ExtendedValidation.checkDoRunExtendedValidation(_localForm))
            return true;

        if (!_localForm.find('.iwd-type-primary_phone').val() && !_localForm.find('.iwd-type-email').val()) {
            return false;
        }
        return true;
    },
    validatePhoneType: function(val, input) {
        var _localForm = ExtendedValidation.getForm(input);
        if ( !ExtendedValidation.checkDoRunExtendedValidation(_localForm))
            return true;
        var phoneInput = _localForm.find('.iwd-type-primary_phone');
        if (phoneInput.val().length > 0 && val.length == 0)
            return false;
        return true;
    },
    validateRegistrationRequired: function(val, input) {
        var _localForm = ExtendedValidation.getForm(input);
        if ( !ExtendedValidation.checkDoRunExtendedValidation(_localForm))
            return true;
        return Validation.get('required-entry').test(val);
    },
    validateRegistrationRequiredByName: function(v, elm) {
        var _localForm = ExtendedValidation.getForm(elm);
        if ( !ExtendedValidation.checkDoRunExtendedValidation(_localForm))
            return true;
        var inputs = $$('input[name="' + elm.name.replace(/([\\"])/g, '\\$1') + '"]');

            var error = 1;
            for(var i=0;i<inputs.length;i++) {
                if((inputs[i].type == 'checkbox' || inputs[i].type == 'radio') && inputs[i].checked == true) {
                    error = 0;
                }

                if(Validation.isOnChange && (inputs[i].type == 'checkbox' || inputs[i].type == 'radio')) {
                    Validation.reset(inputs[i]);
                }
            }

            if( error == 0 ) {
                return true;
            } else {
                return false;
            }
            
        //return Validation.get('am-validate-one-required-by-name').test(val, elm); doesn't work
    },
};
ExtendedValidation.init();
Validation.add('iwd-type-firstname', 'This field is required', ExtendedValidation.validateFirstLastNames);
Validation.add('iwd-type-lastname', 'This field is required', ExtendedValidation.validateFirstLastNames);
Validation.add('iwd-type-primary_phone', 'Email or phone are required', ExtendedValidation.validatePhoneOrEmail);
Validation.add('iwd-type-email', 'Email or phone are required', ExtendedValidation.validatePhoneOrEmail);
Validation.add('iwd-type-primary_phone_type', 'Phone type is required', ExtendedValidation.validatePhoneType);
Validation.add('am-required-entry', 'This field is required', ExtendedValidation.validateRegistrationRequired);
Validation.add('am-validate-one-required-by-name', 'Please select one of the options.', ExtendedValidation.validateRegistrationRequiredByName);
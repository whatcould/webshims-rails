if(!Modernizr.formvalidation || webshims.bugs.bustedValidity){
webshims.register('form-shim-extend', function($, webshims, window, document, undefined, options){
"use strict";
webshims.inputTypes = webshims.inputTypes || {};
//some helper-functions
var cfg = webshims.cfg.forms;
var bugs = webshims.bugs;
var isSubmit;

var isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	typeModels = webshims.inputTypes,
	checkTypes = {
		radio: 1,
		checkbox: 1
	},
	getType = function(elem){
		return (elem.getAttribute('type') || elem.type || '').toLowerCase();
	}
;

(function(){
	if('querySelector' in document){
		try {
			bugs.findRequired = !($('<form action="#" style="width: 1px; height: 1px; overflow: hidden;"><select name="b" required="" /></form>')[0].querySelector('select:required'));
		} catch(er){
			bugs.findRequired = false;
		}
		
		if (bugs.bustedValidity || bugs.findRequired) {
			(function(){
				var find = $.find;
				var matchesSelector = $.find.matchesSelector;
				
				var regExp = /(\:valid|\:invalid|\:optional|\:required|\:in-range|\:out-of-range)(?=[\s\[\~\.\+\>\:\#*]|$)/ig;
				var regFn = function(sel){
					return sel + '-element';
				};
				
				$.find = (function(){
					var slice = Array.prototype.slice;
					var fn = function(sel){
						var ar = arguments;
						ar = slice.call(ar, 1, ar.length);
						ar.unshift(sel.replace(regExp, regFn));
						return find.apply(this, ar);
					};
					for (var i in find) {
						if(find.hasOwnProperty(i)){
							fn[i] = find[i];
						}
					}
					return fn;
				})();
				if(!Modernizr.prefixed || Modernizr.prefixed("matchesSelector", document.documentElement)){
					$.find.matchesSelector = function(node, expr){
						expr = expr.replace(regExp, regFn);
						return matchesSelector.call(this, node, expr);
					};
				}
				
			})();
		}
	}
})();

//API to add new input types
webshims.addInputType = function(type, obj){
	typeModels[type] = obj;
};

//contsrain-validation-api
var validityPrototype = {
	customError: false,

	typeMismatch: false,
	badInput: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	stepMismatch: false,
	tooLong: false,
	patternMismatch: false,
	valueMissing: false,
	
	valid: true
};

var isPlaceholderOptionSelected = function(select){
	if(select.type == 'select-one' && select.size < 2){
		var option = $('> option:first-child', select);
		return !!option.prop('selected');
	} 
	return false;
};
var modules = webshims.modules;
var emptyJ = $([]);
var getGroupElements = function(elem){
	elem = $(elem);
	var name;
	var form;
	var ret = emptyJ;
	if(elem[0].type == 'radio'){
		form = elem.prop('form');
		name = elem[0].name;
		if(!name){
			ret = elem;
		} else if(form){
			ret = $(form[name]);
		} else {
			ret = $(document.getElementsByName(name)).filter(function(){
				return !$.prop(this, 'form');
			});
		}
		ret = ret.filter('[type="radio"]');
	}
	return ret;
};
var validityRules = {
		valueMissing: function(input, val, cache){
			if(!input.prop('required')){return false;}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			if(cache.nodeName == 'select'){
				ret = (!val && (input[0].selectedIndex < 0 || isPlaceholderOptionSelected(input[0]) ));
			} else if(checkTypes[cache.type]){
				ret = (cache.type == 'checkbox') ? !input.is(':checked') : !getGroupElements(input).filter(':checked')[0];
			} else {
				ret = !(val);
			}
			return ret;
		},
		tooLong: function(){
			return false;
		},
		patternMismatch: function(input, val, cache) {
			if(val === '' || cache.nodeName == 'select'){return false;}
			var pattern = input.attr('pattern');
			if(!pattern){return false;}
			try {
				pattern = new RegExp('^(?:' + pattern + ')$');
			} catch(er){
				webshims.error('invalid pattern value: "'+ pattern +'" | '+ er);
				pattern = false;
			}
			if(!pattern){return false;}
			return !(pattern.test(val));
		}
	}
;

$.each({typeMismatch: 'mismatch', badInput: 'bad'}, function(name, fn){
	validityRules[name] = function (input, val, cache){
		if(val === '' || cache.nodeName == 'select'){return false;}
		var ret = false;
		if(!('type' in cache)){
			cache.type = getType(input[0]);
		}
		
		if(typeModels[cache.type] && typeModels[cache.type][fn]){
			ret = typeModels[cache.type][fn](val, input);
		} else if('validity' in input[0] && ('name' in input[0].validity)){
			ret = input[0].validity[name] || false;
		}
		return ret;
	};
});

webshims.addValidityRule = function(type, fn){
	validityRules[type] = fn;
};

$.event.special.invalid = {
	add: function(){
		$.event.special.invalid.setup.call(this.form || this);
	},
	setup: function(){
		var form = this.form || this;
		if( $.data(form, 'invalidEventShim') ){
			form = null;
			return;
		}
		$(form)
			.data('invalidEventShim', true)
			.on('submit', $.event.special.invalid.handler)
		;
		webshims.moveToFirstEvent(form, 'submit');
		if(webshims.bugs.bustedValidity && $.nodeName(form, 'form')){
			(function(){
				var noValidate = form.getAttribute('novalidate');
				form.setAttribute('novalidate', 'novalidate');
				webshims.data(form, 'bustedNoValidate', (noValidate == null) ? null : noValidate);
			})();
		}
		form = null;
	},
	teardown: $.noop,
	handler: function(e, d){
		
		if( e.type != 'submit' || e.testedValidity || !e.originalEvent || !$.nodeName(e.target, 'form') || $.prop(e.target, 'noValidate') ){return;}
		
		isSubmit = true;
		e.testedValidity = true;
		var notValid = !($(e.target).checkValidity());
		if(notValid){
			e.stopImmediatePropagation();
			isSubmit = false;
			return false;
		}
		isSubmit = false;
	}
};

var supportSubmitBubbles = !('submitBubbles' in $.support) || $.support.submitBubbles;
var addSubmitBubbles = function(form){
	if (!supportSubmitBubbles && form && typeof form == 'object' && !form._submit_attached ) {
				
		$.event.add( form, 'submit._submit', function( event ) {
			event._submit_bubble = true;
		});
		
		form._submit_attached = true;
	}
};
if(!supportSubmitBubbles && $.event.special.submit){
	$.event.special.submit.setup = function() {
		// Only need this for delegated form submit events
		if ( $.nodeName( this, "form" ) ) {
			return false;
		}

		// Lazy-add a submit handler when a descendant form may potentially be submitted
		$.event.add( this, "click._submit keypress._submit", function( e ) {
			// Node name check avoids a VML-related crash in IE (#9807)
			var elem = e.target,
				form = $.nodeName( elem, 'input' ) || $.nodeName( elem, 'button' ) ? $.prop(elem, 'form') : undefined;
			addSubmitBubbles(form);
			
		});
		// return undefined since we don't need an event listener
	};
}

$.event.special.submit = $.event.special.submit || {setup: function(){return false;}};
var submitSetup = $.event.special.submit.setup;
$.extend($.event.special.submit, {
	setup: function(){
		if($.nodeName(this, 'form')){
			$(this).on('invalid', $.noop);
		} else {
			$('form', this).on('invalid', $.noop);
		}
		return submitSetup.apply(this, arguments);
	}
});

$(window).on('invalid', $.noop);


webshims.addInputType('email', {
	mismatch: (function(){
		//taken from http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
		var test = cfg.emailReg || /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		return function(val){
			// optional punycode support: https://github.com/bestiejs/punycode.js
			if(window.punycode && punycode.toASCII){
				try {
					if( test.test(punycode.toASCII(val)) ){
						return false;
					}
				} catch(er){}
			}
			return !test.test(val);
		};
	})()
});

webshims.addInputType('url', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = cfg.urlReg || /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

webshims.defineNodeNameProperty('input', 'type', {
	prop: {
		get: function(){
			var elem = this;
			var type = (elem.getAttribute('type') || '').toLowerCase();
			return (webshims.inputTypes[type]) ? type : elem.type;
		}
	}
});

// IDLs for constrain validation API
//ToDo: add object to this list
webshims.defineNodeNamesProperties(['button', 'fieldset', 'output'], {
	checkValidity: {
		value: function(){return true;}
	},
	willValidate: {
		value: false
	},
	setCustomValidity: {
		value: $.noop
	},
	validity: {
		writeable: false,
		get: function(){
			return $.extend({}, validityPrototype);
		}
	}
}, 'prop');

var baseCheckValidity = function(elem){
	var e,
		v = $.prop(elem, 'validity')
	;
	if(v){
		$.data(elem, 'cachedValidity', v);
	} else {
		return true;
	}
	if( !v.valid ){
		e = $.Event('invalid');
		var jElm = $(elem).trigger(e);
		if(isSubmit && !baseCheckValidity.unhandledInvalids && !e.isDefaultPrevented()){
			webshims.validityAlert.showFor(jElm);
			baseCheckValidity.unhandledInvalids = true;
		}
	}
	$.removeData(elem, 'cachedValidity');
	return v.valid;
};
var rsubmittable = /^(?:select|textarea|input)/i;
webshims.defineNodeNameProperty('form', 'checkValidity', {
	prop: {
		value: function(){
			
			var ret = true,
				elems = $($.prop(this, 'elements')).filter(function(){
					if(!rsubmittable.test(this.nodeName)){return false;}
					var shadowData = webshims.data(this, 'shadowData');
					return !shadowData || !shadowData.nativeElement || shadowData.nativeElement === this;
				})
			;
			
			baseCheckValidity.unhandledInvalids = false;
			for(var i = 0, len = elems.length; i < len; i++){
				if( !baseCheckValidity(elems[i]) ){
					ret = false;
				}
			}
			return ret;
		}
	}
});

webshims.defineNodeNamesProperties(['input', 'textarea', 'select'], {
	checkValidity: {
		value: function(){
			baseCheckValidity.unhandledInvalids = false;
			return baseCheckValidity($(this).getNativeElement()[0]);
		}
	},
	setCustomValidity: {
		value: function(error){
			$.removeData(this, 'cachedValidity');
			webshims.data(this, 'customvalidationMessage', ''+error);
		}
	},
	willValidate: {
		writeable: false,
		get: (function(){
			var types = {
					button: 1,
					reset: 1,
					hidden: 1,
					image: 1
				}
			;
			return function(){
				var elem = $(this).getNativeElement()[0];
				//elem.name && <- we don't use to make it easier for developers
				return !!(!elem.disabled && !elem.readOnly && !types[elem.type] );
			};
		})()
	},
	validity: {
		writeable: false,
		get: function(){
			var jElm = $(this).getNativeElement();
			var elem = jElm[0];
			var validityState = $.data(elem, 'cachedValidity');
			if(validityState){
				return validityState;
			}
			validityState 	= $.extend({}, validityPrototype);
			
			if( !$.prop(elem, 'willValidate') || elem.type == 'submit' ){
				return validityState;
			}
			var val 	= jElm.val(),
				cache 	= {nodeName: elem.nodeName.toLowerCase()}
			;
			
			validityState.customError = !!(webshims.data(elem, 'customvalidationMessage'));
			if( validityState.customError ){
				validityState.valid = false;
			}
							
			$.each(validityRules, function(rule, fn){
				if (fn(jElm, val, cache)) {
					validityState[rule] = true;
					validityState.valid = false;
				}
			});
			$(this).getShadowFocusElement().attr('aria-invalid',  validityState.valid ? 'false' : 'true');
			jElm = null;
			elem = null;
			return validityState;
		}
	}
}, 'prop');

webshims.defineNodeNamesBooleanProperty(['input', 'textarea', 'select'], 'required', {
	set: function(value){
		$(this).getShadowFocusElement().attr('aria-required', !!(value)+'');
	},
	initAttr: Modernizr.localstorage //only if we have aria-support
});

webshims.reflectProperties(['input'], ['pattern']);


if( !('maxLength' in document.createElement('textarea')) ){
	var constrainMaxLength = (function(){
		var timer;
		var curLength = 0;
		var lastElement = $([]);
		var max = 1e9;
		var constrainLength = function(){
			var nowValue = lastElement.prop('value');
			var nowLen = nowValue.length;
			if(nowLen > curLength && nowLen > max){
				nowLen = Math.max(curLength, max);
				lastElement.prop('value', nowValue.substr(0, nowLen ));
			}
			curLength = nowLen;
		};
		var remove = function(){
			clearTimeout(timer);
			lastElement.unbind('.maxlengthconstraint');
		};
		return function(element, maxLength){
			remove();
			if(maxLength > -1){
				max = maxLength;
				curLength = $.prop(element, 'value').length;
				lastElement = $(element);
				lastElement.on({
					'keydown.maxlengthconstraint keypress.maxlengthconstraint paste.maxlengthconstraint cut.maxlengthconstraint': function(e){
						setTimeout(constrainLength, 0);
					},
					'keyup.maxlengthconstraint': constrainLength,
					'blur.maxlengthconstraint': remove
				});
				timer = setInterval(constrainLength, 200);
			}
		};
	})();
	
	constrainMaxLength.update = function(element, maxLength){
		if($(element).is(':focus')){
			if(!maxLength){
				maxLength = $.prop(element, 'maxlength');
			}
			constrainMaxLength(element, maxLength);
		}
	};
	
	$(document).on('focusin', function(e){
		var maxLength;
		if(e.target.nodeName == "TEXTAREA" && (maxLength = $.prop(e.target, 'maxlength')) > -1){
			constrainMaxLength(e.target, maxLength);
		}
	});
	
	webshims.defineNodeNameProperty('textarea', 'maxlength', {
		attr: {
			set: function(val){
				this.setAttribute('maxlength', ''+val);
				constrainMaxLength.update(this);
			},
			get: function(){
				var ret = this.getAttribute('maxlength');
				return ret == null ? undefined : ret;
			}
		},
		prop: {
			set: function(val){
				if(isNumber(val)){
					if(val < 0){
						throw('INDEX_SIZE_ERR');
					}
					val = parseInt(val, 10);
					this.setAttribute('maxlength', val);
					constrainMaxLength.update(this, val);
					return;
				}
				this.setAttribute('maxlength', '0');
				constrainMaxLength.update(this, 0);
			},
			get: function(){
				var val = this.getAttribute('maxlength');
				return (isNumber(val) && val >= 0) ? parseInt(val, 10) : -1; 
				
			}
		}
	});
	webshims.defineNodeNameProperty('textarea', 'maxLength', {
		prop: {
			set: function(val){
				$.prop(this, 'maxlength', val);
			},
			get: function(){
				return $.prop(this, 'maxlength');
			}
		}
	});
} 



var submitterTypes = {submit: 1, button: 1, image: 1};
var formSubmitterDescriptors = {};
[
	{
		name: "enctype",
		limitedTo: {
			"application/x-www-form-urlencoded": 1,
			"multipart/form-data": 1,
			"text/plain": 1
		},
		defaultProp: "application/x-www-form-urlencoded",
		proptype: "enum"
	},
	{
		name: "method",
		limitedTo: {
			"get": 1,
			"post": 1
		},
		defaultProp: "get",
		proptype: "enum"
	},
	{
		name: "action",
		proptype: "url"
	},
	{
		name: "target"
	},
	{
		name: "novalidate",
		propName: "noValidate",
		proptype: "boolean"
	}
].forEach(function(desc){
	var propName = 'form'+ (desc.propName || desc.name).replace(/^[a-z]/, function(f){
		return f.toUpperCase();
	});
	var attrName = 'form'+ desc.name;
	var formName = desc.name;
	var eventName = 'click.webshimssubmittermutate'+formName;
	
	var changeSubmitter = function(){
		var elem = this;
		if( !('form' in elem) || !submitterTypes[elem.type] ){return;}
		var form = $.prop(elem, 'form');
		if(!form){return;}
		var attr = $.attr(elem, attrName);
		if(attr != null && ( !desc.limitedTo || attr.toLowerCase() === $.prop(elem, propName))){
			
			var oldAttr = $.attr(form, formName);
			
			$.attr(form, formName, attr);
			setTimeout(function(){
				if(oldAttr != null){
					$.attr(form, formName, oldAttr);
				} else {
					try {
						$(form).removeAttr(formName);
					} catch(er){
						form.removeAttribute(formName);
					}
				}
			}, 9);
		}
	};
	
	

switch(desc.proptype) {
		case "url":
			var urlForm = document.createElement('form');
			formSubmitterDescriptors[propName] = {
				prop: {
					set: function(value){
						$.attr(this, attrName, value);
					},
					get: function(){
						var value = $.attr(this, attrName);
						if(value == null){return '';}
						urlForm.setAttribute('action', value);
						return urlForm.action;
					}
				}
			};
			break;
		case "boolean":
			formSubmitterDescriptors[propName] = {
				prop: {
					set: function(val){
						val = !!val;
						if(val){
							$.attr(this, 'formnovalidate', 'formnovalidate');
						} else {
							$(this).removeAttr('formnovalidate');
						}
					},
					get: function(){
						return $.attr(this, 'formnovalidate') != null;
					}
				}
			};
			break;
		case "enum":
			formSubmitterDescriptors[propName] = {
				prop: {
					set: function(value){
						$.attr(this, attrName, value);
					},
					get: function(){
						var value = $.attr(this, attrName);
						return (!value || ( (value = value.toLowerCase()) && !desc.limitedTo[value] )) ? desc.defaultProp : value;
					}
				}
		};
		break;
		default:
			formSubmitterDescriptors[propName] = {
				prop: {
					set: function(value){
						$.attr(this, attrName, value);
					},
					get: function(){
						var value = $.attr(this, attrName);
						return (value != null) ? value : "";
					}
				}
			};
	}


	if(!formSubmitterDescriptors[attrName]){
		formSubmitterDescriptors[attrName] = {};
	}
	formSubmitterDescriptors[attrName].attr = {
		set: function(value){
			formSubmitterDescriptors[attrName].attr._supset.call(this, value);
			$(this).unbind(eventName).on(eventName, changeSubmitter);
		},
		get: function(){
			return formSubmitterDescriptors[attrName].attr._supget.call(this);
		}
	};
	formSubmitterDescriptors[attrName].initAttr = true;
	formSubmitterDescriptors[attrName].removeAttr = {
		value: function(){
			$(this).unbind(eventName);
			formSubmitterDescriptors[attrName].removeAttr._supvalue.call(this);
		}
	};
});

webshims.defineNodeNamesProperties(['input', 'button'], formSubmitterDescriptors);


if(!$.support.getSetAttribute && $('<form novalidate></form>').attr('novalidate') == null){
	webshims.defineNodeNameProperty('form', 'novalidate', {
		attr: {
			set: function(val){
				this.setAttribute('novalidate', ''+val);
			},
			get: function(){
				var ret = this.getAttribute('novalidate');
				return ret == null ? undefined : ret;
			}
		}
	});
} else if(webshims.bugs.bustedValidity){
	
	webshims.defineNodeNameProperty('form', 'novalidate', {
		attr: {
			set: function(val){
				webshims.data(this, 'bustedNoValidate', ''+val);
			},
			get: function(){
				var ret = webshims.data(this, 'bustedNoValidate');
				return ret == null ? undefined : ret;
			}
		},
		removeAttr: {
			value: function(){
				webshims.data(this, 'bustedNoValidate', null);
			}
		}
	});
	
	$.each(['rangeUnderflow', 'rangeOverflow', 'stepMismatch'], function(i, name){
		validityRules[name] = function(elem){
			return (elem[0].validity || {})[name] || false;
		};
	});
	
}

webshims.defineNodeNameProperty('form', 'noValidate', {
	prop: {
		set: function(val){
			val = !!val;
			if(val){
				$.attr(this, 'novalidate', 'novalidate');
			} else {
				$(this).removeAttr('novalidate');
			}
		},
		get: function(){
			return $.attr(this, 'novalidate') != null;
		}
	}
});

if(Modernizr.inputtypes.date && /webkit/i.test(navigator.userAgent)){
	(function(){
		
		var noInputTriggerEvts = {updateInput: 1, input: 1},
			fixInputTypes = {
				date: 1,
				time: 1,
				month: 1,
				week: 1,
				"datetime-local": 1
			},
			noFocusEvents = {
				focusout: 1,
				blur: 1
			},
			changeEvts = {
				updateInput: 1,
				change: 1
			},
			observe = function(input){
				var timer,
					focusedin = true,
					lastInputVal = input.prop('value'),
					lastChangeVal = lastInputVal,
					trigger = function(e){
						//input === null
						if(!input){return;}
						var newVal = input.prop('value');
						
						if(newVal !== lastInputVal){
							lastInputVal = newVal;
							if(!e || !noInputTriggerEvts[e.type]){
								input.trigger('input');
							}
						}
						if(e && changeEvts[e.type]){
							lastChangeVal = newVal;
						}
						if(!focusedin && newVal !== lastChangeVal){
							input.trigger('change');
						}
					},
					extraTimer,
					extraTest = function(){
						clearTimeout(extraTimer);
						extraTimer = setTimeout(trigger, 9);
					},
					unbind = function(e){
						clearInterval(timer);
						setTimeout(function(){
							if(e && noFocusEvents[e.type]){
								focusedin = false;
							}
							if(input){
								input.unbind('focusout blur', unbind).unbind('input change updateInput', trigger);
								trigger();
							}
							input = null;
						}, 1);
						
					}
				;
				
				clearInterval(timer);
				timer = setInterval(trigger, 160);
				extraTest();
				input
					.off({
						'focusout blur': unbind,
						'input change updateInput': trigger
					})
					.on({
						'focusout blur': unbind,
						'input updateInput change': trigger
					})
				;
			}
		;
		
		
		$(document)
			.on('focusin', function(e){
				if( e.target && fixInputTypes[e.target.type] && !e.target.readOnly && !e.target.disabled ){
					observe($(e.target));
				}
			})
		;
		
		
	})();
}

webshims.addReady(function(context, contextElem){
	//start constrain-validation
	var focusElem;
	$('form', context)
		.add(contextElem.filter('form'))
		.bind('invalid', $.noop)
	;
	
	try {
		if(context == document && !('form' in (document.activeElement || {}))) {
			focusElem = $('input[autofocus], select[autofocus], textarea[autofocus]', context).eq(0).getShadowFocusElement()[0];
			if (focusElem && focusElem.offsetHeight && focusElem.offsetWidth) {
				focusElem.focus();
			}
		}
	} 
	catch (er) {}
	
});

if(!Modernizr.input.list){
	webshims.defineNodeNameProperty('datalist', 'options', {
		prop: {
			writeable: false,
			get: function(){
				var elem = this;
				var select = $('select', elem);
				var options;
				if(select[0]){
					options = select[0].options;
				} else {
					options = $('option', elem).get();
					if(options.length){
						webshims.warn('you should wrap your option-elements for a datalist in a select element to support IE and other old browsers.');
					}
				}
				return options;
			}
		}
	});
	
	webshims.ready('form-datalist', function(){
		webshims.defineNodeNameProperties('input', {
			list: {
				attr: {
					get: function(){
						var val = webshims.contentAttr(this, 'list');
						return (val == null) ? undefined : val;
					},
					set: function(value){
						var elem = this;
						webshims.contentAttr(elem, 'list', value);
						webshims.objectCreate(options.shadowListProto, undefined, {input: elem, id: value, datalist: $.prop(elem, 'list')});
						$(elem).triggerHandler('listdatalistchange');
					}
				},
				initAttr: true,
				reflect: true,
				propType: 'element',
				propNodeName: 'datalist'
			}
		});
	});
	
}

if(!Modernizr.formattribute || !Modernizr.fieldsetdisabled){
	(function(){
		(function(prop, undefined){
			$.prop = function(elem, name, value){
				var ret;
				if(elem && elem.nodeType == 1 && value === undefined && $.nodeName(elem, 'form') && elem.id){
					ret = document.getElementsByName(name);
					if(!ret || !ret.length){
						ret = document.getElementById(name);
					}
					if(ret){
						ret = $(ret).filter(function(){
							return $.prop(this, 'form') == elem;
						}).get();
						if(ret.length){
							return ret.length == 1 ? ret[0] : ret;
						}
					}
				}
				return prop.apply(this, arguments);
			};
		})($.prop, undefined);
		var removeAddedElements = function(form){
			var elements = $.data(form, 'webshimsAddedElements');
			if(elements){
				elements.remove();
				$.removeData(form, 'webshimsAddedElements');
			}
		};
		
		
		if(!Modernizr.formattribute){
			webshims.defineNodeNamesProperty(['input', 'textarea', 'select', 'button', 'fieldset'], 'form', {
				prop: {
					get: function(){
						var form = webshims.contentAttr(this, 'form');
						if(form){
							form = document.getElementById(form);
							if(form && !$.nodeName(form, 'form')){
								form = null;
							}
						} 
						return form || this.form;
					},
					writeable: false
				}
			});
			
			
			webshims.defineNodeNamesProperty(['form'], 'elements', {
				prop: {
					get: function(){
						var id = this.id;
						var elements = $.makeArray(this.elements);
						if(id){
							elements = $(elements).add('input[form="'+ id +'"], select[form="'+ id +'"], textarea[form="'+ id +'"], button[form="'+ id +'"], fieldset[form="'+ id +'"]').not('.webshims-visual-hide > *').get();
						}
						return elements;
					},
					writeable: false
				}
			});
			
			
			
			$(function(){
				var stopPropagation = function(e){
					e.stopPropagation();
				};
				$(document).on('submit', function(e){
					
					if(!e.isDefaultPrevented()){
						var form = e.target;
						var id = form.id;
						var elements;
						
						
						if(id){
							removeAddedElements(form);
							
							elements = $('input[form="'+ id +'"], select[form="'+ id +'"], textarea[form="'+ id +'"]')
								.filter(function(){
									return !this.disabled && this.name && this.form != form;
								})
								.clone()
							;
							if(elements.length){
								$.data(form, 'webshimsAddedElements', $('<div class="webshims-visual-hide" />').append(elements).appendTo(form));
								setTimeout(function(){
									removeAddedElements(form);
								}, 9);
							}
							elements = null;
						}
					}
				});
				
				$(document).on('click', function(e){
					if(!e.isDefaultPrevented() && $(e.target).is('input[type="submit"][form], button[form], input[type="button"][form], input[type="image"][form], input[type="reset"][form]')){
						var trueForm = $.prop(e.target, 'form');
						var formIn = e.target.form;
						var clone;
						if(trueForm && trueForm != formIn){
							clone = $(e.target)
								.clone()
								.removeAttr('form')
								.addClass('webshims-visual-hide')
								.on('click', stopPropagation)
								.appendTo(trueForm)
							;
							if(formIn){
								e.preventDefault();
							}
							addSubmitBubbles(trueForm);
							clone.trigger('click');
							setTimeout(function(){
								clone.remove();
								clone = null;
							}, 9);
						}
					}
				});
			});
		}
		
		if(!Modernizr.fieldsetdisabled){
			webshims.defineNodeNamesProperty(['fieldset'], 'elements', {
				prop: {
					get: function(){
						//add listed elements without keygen, object, output
						return $('input, select, textarea, button, fieldset', this).get() || [];
					},
					writeable: false
				}
			});
		}
		
		if(!$.fn.finish && parseFloat($.fn.jquery, 10) < 1.9){
			var rCRLF = /\r?\n/g,
				rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
				rselectTextarea = /^(?:select|textarea)/i;
			$.fn.serializeArray = function() {
					return this.map(function(){
						var elements = $.prop(this, 'elements');
						return elements ? $.makeArray( elements ) : this;
					})
					.filter(function(){
						return this.name && !this.disabled &&
							( this.checked || rselectTextarea.test( this.nodeName ) ||
								rinput.test( this.type ) );
					})
					.map(function( i, elem ){
						var val = $( this ).val();
			
						return val == null ?
							null :
							$.isArray( val ) ?
								$.map( val, function( val, i ){
									return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
								}) :
								{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}).get();
				};
		}
		
	})();
}

	if($('<input />').prop('labels') == null){
		webshims.defineNodeNamesProperty('button, input, keygen, meter, output, progress, select, textarea', 'labels', {
			prop: {
				get: function(){
					if(this.type == 'hidden'){return null;}
					var id = this.id;
					var labels = $(this)
						.closest('label')
						.filter(function(){
							var hFor = (this.attributes['for'] || {});
							return (!hFor.specified || hFor.value == id);
						})
					;
					
					if(id) {
						labels = labels.add('label[for="'+ id +'"]');
					}
					return labels.get();
				},
				writeable: false
			}
		});
	}
	
	if(!('value' in document.createElement('progress'))){
		(function(){
			
			var nan = parseInt('NaN', 10);
			
			var updateProgress = function(progress){
				var position;
				
				
				position = $.prop(progress, 'position');
				
				$.attr(progress, 'data-position', position);
				$('> span', progress).css({width: (position < 0 ?  100 : position * 100) +'%'});
			};
			var desc = {
				position: {
					prop: {
						get: function(){
							var max;
							//jQuery 1.8.x try's to normalize "0" to 0
							var val = this.getAttribute('value');
							var ret = -1;
							
							val = val ? (val * 1) : nan; 
							if(!isNaN(val)){
								max = $.prop(this, 'max');
								ret = Math.max(Math.min(val / max, 1), 0);
								if(updateProgress.isInChange){
									$.attr(this, 'aria-valuenow', ret * 100);
									if(updateProgress.isInChange == 'max'){
										$.attr(this, 'aria-valuemax', max);
									}
								}
							} else if(updateProgress.isInChange) {
								$(this).removeAttr('aria-valuenow');
							}
							return ret;
						},
						writeable: false
					}
				}
			};
			
			$.each({value: 0, max: 1}, function(name, defValue){
				var removeProp = (name == 'value' && !$.fn.finish);
				desc[name] = {
					attr: {
						set: function(value){
							var ret = desc[name].attr._supset.call(this, value);
							updateProgress.isInChange = name;
							updateProgress(this);
							updateProgress.isInChange = false;
							return ret;
						}
					},
					removeAttr: {
						value: function(){
							this.removeAttribute(name);
							if(removeProp){
								try {
									delete this.value;
								} catch(er){}
							}
							updateProgress.isInChange = name;
							updateProgress(this);
							updateProgress.isInChange = false;
						}
					},
					prop: {
						get: function(){
							var max;
							var ret = (desc[name].attr.get.call(this) * 1);
							if(ret < 0 || isNaN(ret)){
								ret = defValue;
							} else if(name == 'value'){
								ret = Math.min(ret, $.prop(this, 'max'));
							} else if(ret === 0){
								ret = defValue;
							}
							return ret;
						},
						set: function(value){
							value = value * 1;
							if(isNaN(value)){
								webshims.error('Floating-point value is not finite.');
							}
							return desc[name].attr.set.call(this, value);
						}
					}
				};
			});
			
			webshims.createElement(
				'progress', 
				function(){
					var labels = $(this)
						.attr({role: 'progressbar', 'aria-valuemin': '0'})
						.html('<span class="progress-value" />')
						.jProp('labels')
						.map(function(){
							return webshims.getID(this);
						})
						.get()
					;
					if(labels.length){
						$.attr(this, 'aria-labelledby', labels.join(' '));
					} else {
						webshims.info("you should use label elements for your prgogress elements");
					}
					
					updateProgress.isInChange = 'max';
					updateProgress(this);
					updateProgress.isInChange = false;
				}, 
				desc
			);
				
		})();
	}

try {
	document.querySelector(':checked');
} catch(er){
	(function(){
		$('html').addClass('no-csschecked');
		var checkInputs = {
			radio: 1,
			checkbox: 1
		};
		var selectChange = function(){
			var options = this.options || [];
			var i, len, option;
			for(i = 0, len = options.length; i < len; i++){
				option = $(options[i]);
				option[$.prop(options[i], 'selected') ? 'addClass' : 'removeClass']('prop-checked');
			}
		};
		var checkChange = function(){
			var fn = $.prop(this, 'checked')  ? 'addClass' : 'removeClass';
			var className = this.className || '';
			var parent;
			
			//IE8- has problems to update styles, we help
			if( (className.indexOf('prop-checked') == -1) == (fn == 'addClass')){ 
				$(this)[fn]('prop-checked');
				if((parent = this.parentNode)){
					parent.className = parent.className;
				}
			}
		};
		
		
		webshims.onNodeNamesPropertyModify('select', 'value', selectChange);
		webshims.onNodeNamesPropertyModify('select', 'selectedIndex', selectChange);
		webshims.onNodeNamesPropertyModify('option', 'selected', function(){
			$(this).closest('select').each(selectChange);
		});
		webshims.onNodeNamesPropertyModify('input', 'checked', function(value, boolVal){
			var type = this.type;
			if(type == 'radio' && boolVal){
				getGroupElements(this).each(checkChange);
			} else if(checkInputs[type]) {
				$(this).each(checkChange);
			}
		});
		
		$(document).on('change', function(e){
			
			if(checkInputs[e.target.type]){
				if(e.target.type == 'radio'){
					getGroupElements(e.target).each(checkChange);
				} else {
					$(e.target)[$.prop(e.target, 'checked') ? 'addClass' : 'removeClass']('prop-checked');
				}
			} else if(e.target.nodeName.toLowerCase() == 'select'){
				$(e.target).each(selectChange);
			}
		});
		
		webshims.addReady(function(context, contextElem){
			$('option, input', context)
				.add(contextElem.filter('option, input'))
				.each(function(){
					var prop;
					if(checkInputs[this.type]){
						prop = 'checked';
					} else if(this.nodeName.toLowerCase() == 'option'){
						prop = 'selected';
					}
					if(prop){
						$(this)[$.prop(this, prop) ? 'addClass' : 'removeClass']('prop-checked');
					}
					
				})
			;
		});
	})();
}

(function(){
	var bustedPlaceholder;
	Modernizr.textareaPlaceholder = !!('placeholder' in $('<textarea />')[0]);
	if(Modernizr.input.placeholder && options.overridePlaceholder){
		bustedPlaceholder = true;
	}
	if(Modernizr.input.placeholder && Modernizr.textareaPlaceholder && !bustedPlaceholder){
		(function(){
			var ua = navigator.userAgent;
			
			if(ua.indexOf('Mobile') != -1 && ua.indexOf('Safari') != -1){
				$(window).on('orientationchange', (function(){
					var timer;
					var retVal = function(i, value){
						return value;
					};
					
					var set = function(){
						$('input[placeholder], textarea[placeholder]').attr('placeholder', retVal);
					};
					return function(e){
						clearTimeout(timer);
						timer = setTimeout(set, 9);
					};
				})());
			}
		})();
		
		//abort
		return;
	}
	
	var isOver = (webshims.cfg.forms.placeholderType == 'over');
	var isResponsive = (webshims.cfg.forms.responsivePlaceholder);
	var polyfillElements = ['textarea'];
	var debug = webshims.debug !== false;
	if(!Modernizr.input.placeholder || bustedPlaceholder){
		polyfillElements.push('input');
	}
	
	var setSelection = function(elem){
		try {
			if(elem.setSelectionRange){
				elem.setSelectionRange(0, 0);
				return true;
			} else if(elem.createTextRange){
				var range = elem.createTextRange();
				range.collapse(true);
				range.moveEnd('character', 0);
				range.moveStart('character', 0);
				range.select();
				return true;
			}
		} catch(er){}
	};
	
	var hidePlaceholder = function(elem, data, value, _onFocus){
			if(value === false){
				value = $.prop(elem, 'value');
			}
			
			if(!isOver && elem.type != 'password'){
				if(!value && _onFocus && setSelection(elem)){
					var selectTimer  = setTimeout(function(){
						setSelection(elem);
					}, 9);
					$(elem)
						.off('.placeholderremove')
						.on({
							'keydown.placeholderremove keypress.placeholderremove paste.placeholderremove input.placeholderremove': function(e){
								if(e && (e.keyCode == 17 || e.keyCode == 16)){return;}
								elem.value = $.prop(elem, 'value');
								data.box.removeClass('placeholder-visible');
								clearTimeout(selectTimer);
								$(elem).unbind('.placeholderremove');
							},
							'mousedown.placeholderremove drag.placeholderremove select.placeholderremove': function(e){
								setSelection(elem);
								clearTimeout(selectTimer);
								selectTimer = setTimeout(function(){
									setSelection(elem);
								}, 9);
							},
							'blur.placeholderremove': function(){
								clearTimeout(selectTimer);
								$(elem).unbind('.placeholderremove');
							}
						})
					;
					return;
				} else if(!_onFocus && !value && elem.value){ //especially on submit
					elem.value = value;
				}
			} else if(!value && _onFocus){
				$(elem)
					.off('.placeholderremove')
					.on({
						'keydown.placeholderremove keypress.placeholderremove paste.placeholderremove input.placeholderremove': function(e){
							if(e && (e.keyCode == 17 || e.keyCode == 16)){return;}
							data.box.removeClass('placeholder-visible');
							$(elem).unbind('.placeholderremove');
						},
						'blur.placeholderremove': function(){
							$(elem).unbind('.placeholderremove');
						}
					})
				;
				return;
			}
			data.box.removeClass('placeholder-visible');
		},
		showPlaceholder = function(elem, data, placeholderTxt){
			if(placeholderTxt === false){
				placeholderTxt = $.prop(elem, 'placeholder');
			}
			
			if(!isOver && elem.type != 'password'){
				elem.value = placeholderTxt;
			}
			data.box.addClass('placeholder-visible');
		},
		changePlaceholderVisibility = function(elem, value, placeholderTxt, data, type){
			if(!data){
				data = $.data(elem, 'placeHolder');
				if(!data){return;}
			}
			var isVisible = $(elem).hasClass('placeholder-visible');
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder') || '';
			}
			
			$(elem).unbind('.placeholderremove');
			
			if(value === false){
				value = $.prop(elem, 'value');
			}
			
			if(!value && (type == 'focus' || (!type && $(elem).is(':focus')))){
				if(elem.type == 'password' || isOver || isVisible){
					hidePlaceholder(elem, data, '', true);
				}
				return;
			}
			
			if(value){
				hidePlaceholder(elem, data, value);
				return;
			}
			
			if(placeholderTxt && !value){
				showPlaceholder(elem, data, placeholderTxt);
			} else {
				hidePlaceholder(elem, data, value);
			}
		},
		hasLabel = function(elem){
			elem = $(elem);
			return !!(elem.prop('title') || elem.attr('aria-labelledby') || elem.attr('aria-label') || elem.jProp('labels').length);
		},
		createPlaceholder = function(elem){
			elem = $(elem);
			return $( hasLabel(elem) ? '<span class="placeholder-text"></span>' : '<label for="'+ elem.prop('id') +'" class="placeholder-text"></label>');
		},
		pHolder = (function(){
			var delReg 	= /\n|\r|\f|\t/g,
				allowedPlaceholder = {
					text: 1,
					search: 1,
					url: 1,
					email: 1,
					password: 1,
					tel: 1,
					number: 1
				}
			;
			
			if(modules["form-number-date-ui"].loaded){
				delete allowedPlaceholder.number;
			}
			
			return {
				create: function(elem){
					var data = $.data(elem, 'placeHolder');
					var form;
					var responsiveElem;
					if(data){return data;}
					data = $.data(elem, 'placeHolder', {});
					
					$(elem).on('focus.placeholder blur.placeholder', function(e){
						changePlaceholderVisibility(this, false, false, data, e.type );
						data.box[e.type == 'focus' ? 'addClass' : 'removeClass']('placeholder-focused');
					});
					
					if((form = $.prop(elem, 'form'))){
						$(elem).onWSOff('reset.placeholder', function(e){
							setTimeout(function(){
								changePlaceholderVisibility(elem, false, false, data, e.type );
							}, 0);
						}, false, form);
					}
					
					if(elem.type == 'password' || isOver){
						data.text = createPlaceholder(elem);
						if(isResponsive || $(elem).is('.responsive-width') || (elem.currentStyle || {width: ''}).width.indexOf('%') != -1){
							responsiveElem = true;
							data.box = data.text;
						} else {
							data.box = $(elem)
								.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +' placeholder-box-'+$.css(elem, 'float')+'" />')
								.parent()
							;
						}
						data.text
							.insertAfter(elem)
							.on('mousedown.placeholder', function(){
								changePlaceholderVisibility(this, false, false, data, 'focus');
								try {
									setTimeout(function(){
										elem.focus();
									}, 0);
								} catch(e){}
								return false;
							})
						;
						
						
						$.each(['lineHeight', 'fontSize', 'fontFamily', 'fontWeight'], function(i, style){
							var prop = $.css(elem, style);
							if(data.text.css(style) != prop){
								data.text.css(style, prop);
							}
						});
						$.each(['Left', 'Top'], function(i, side){
							var size = (parseInt($.css(elem, 'padding'+ side), 10) || 0) + Math.max((parseInt($.css(elem, 'margin'+ side), 10) || 0), 0) + (parseInt($.css(elem, 'border'+ side +'Width'), 10) || 0);
							data.text.css('padding'+ side, size);
						});
						
						$(elem)
							.onWSOff('updateshadowdom', function(){
								var height, width; 
								if((width = elem.offsetWidth) || (height = elem.offsetHeight)){
									data.text
										.css({
											width: width,
											height: height
										})
										.css($(elem).position())
									;
								}
							}, true)
						;
						
					} else {
						var reset = function(e){
							if($(elem).hasClass('placeholder-visible')){
								hidePlaceholder(elem, data, '');
								
								setTimeout(function(){
									if(!e || e.type != 'submit' || e.isDefaultPrevented()){
										changePlaceholderVisibility(elem, false, false, data );
									}
								}, 9);
							}
						};
						
						$(elem).onWSOff('beforeunload', reset, false, window);
						data.box = $(elem);
						if(form){
							$(elem).onWSOff('submit', reset, false, form);
						}
					}
					
					return data;
				},
				update: function(elem, val){
					var type = ($.attr(elem, 'type') || $.prop(elem, 'type') || '').toLowerCase();
					if(!allowedPlaceholder[type] && !$.nodeName(elem, 'textarea')){
						webshims.warn('placeholder not allowed on input[type="'+type+'"], but it is a good fallback :-)');
						return;
					}
					
					
					var data = pHolder.create(elem);
					if(data.text){
						data.text.text(val);
					}
					
					changePlaceholderVisibility(elem, false, val, data);
				}
			};
		})()
	;
	
	$.webshims.publicMethods = {
		pHolder: pHolder
	};
	polyfillElements.forEach(function(nodeName){
		var desc = webshims.defineNodeNameProperty(nodeName, 'placeholder', {
			attr: {
				set: function(val){
					var elem = this;
					if(bustedPlaceholder){
						webshims.data(elem, 'bustedPlaceholder', val);
						elem.placeholder = '';
					} else {
						webshims.contentAttr(elem, 'placeholder', val);
					}
					pHolder.update(elem, val);
				},
				get: function(){
					var placeholder;
					if(bustedPlaceholder){
						placeholder = webshims.data(this, 'bustedPlaceholder');
					}
					return  placeholder || webshims.contentAttr(this, 'placeholder');
				}
			},
			reflect: true,
			initAttr: true
		});
	});
	
	
	polyfillElements.forEach(function(name){
		var placeholderValueDesc =  {};
		var desc;
		['attr', 'prop'].forEach(function(propType){
			placeholderValueDesc[propType] = {
				set: function(val){
					var elem = this;
					var placeholder;
					if(bustedPlaceholder){
						placeholder = webshims.data(elem, 'bustedPlaceholder');
					}
					if(!placeholder){
						placeholder = webshims.contentAttr(elem, 'placeholder');
					}
					$.removeData(elem, 'cachedValidity');
					var ret = desc[propType]._supset.call(elem, val);
					if(placeholder && 'value' in elem){
						changePlaceholderVisibility(elem, val, placeholder);
					}
					return ret;
				},
				get: function(){
					var elem = this;
					return $(elem).hasClass('placeholder-visible') ? '' : desc[propType]._supget.call(elem);
				}
			};
		});
		desc = webshims.defineNodeNameProperty(name, 'value', placeholderValueDesc);
	});
	
})();

	(function(){
		var doc = document;	
		if( 'value' in document.createElement('output') ){return;}
		
		webshims.defineNodeNameProperty('output', 'value', {
			prop: {
				set: function(value){
					var setVal = $.data(this, 'outputShim');
					if(!setVal){
						setVal = outputCreate(this);
					}
					setVal(value);
				},
				get: function(){
					return webshims.contentAttr(this, 'value') || $(this).text() || '';
				}
			}
		});
		
		
		webshims.onNodeNamesPropertyModify('input', 'value', function(value, boolVal, type){
			if(type == 'removeAttr'){return;}
			var setVal = $.data(this, 'outputShim');
			if(setVal){
				setVal(value);
			}
		});
		
		var outputCreate = function(elem){
			if(elem.getAttribute('aria-live')){return;}
			elem = $(elem);
			var value = (elem.text() || '').trim();
			var	id 	= elem.prop('id');
			var	htmlFor = elem.attr('for');
			var shim = $('<input class="output-shim" type="text" disabled name="'+ (elem.attr('name') || '')+'" value="'+value+'" style="display: none !important;" />').insertAfter(elem);
			var form = shim[0].form || doc;
			var setValue = function(val){
				shim[0].value = val;
				val = shim[0].value;
				elem.text(val);
				webshims.contentAttr(elem[0], 'value', val);
			};
			
			elem[0].defaultValue = value;
			webshims.contentAttr(elem[0], 'value', value);
			
			elem.attr({'aria-live': 'polite'});
			if(id){
				shim.attr('id', id);
				elem.attr('aria-labelledby', elem.jProp('labels').map(function(){
					return webshims.getID(this);
				}).get().join(' '));
			}
			if(htmlFor){
				id = webshims.getID(elem);
				htmlFor.split(' ').forEach(function(control){
					control = document.getElementById(control);
					if(control){
						control.setAttribute('aria-controls', id);
					}
				});
			}
			elem.data('outputShim', setValue );
			shim.data('outputShim', setValue );
			return setValue;
		};
						
		webshims.addReady(function(context, contextElem){
			$('output', context).add(contextElem.filter('output')).each(function(){
				outputCreate(this);
			});
		});
		
		/*
		 * Implements input event in all browsers
		 */
		(function(){
			var noInputTriggerEvts = {updateInput: 1, input: 1},
				noInputTypes = {
					radio: 1,
					checkbox: 1,
					submit: 1,
					button: 1,
					image: 1,
					reset: 1,
					file: 1
					
					//pro forma
					,color: 1
					//,range: 1
				},
				observe = function(input){
					var timer,
						lastVal = input.prop('value'),
						trigger = function(e){
							//input === null
							if(!input){return;}
							var newVal = input.prop('value');
							if(newVal !== lastVal){
								lastVal = newVal;
								if(!e || !noInputTriggerEvts[e.type]){
									webshims.triggerInlineForm && webshims.triggerInlineForm(input[0], 'input');
								}
							}
						},
						extraTimer,
						extraTest = function(){
							clearTimeout(extraTimer);
							extraTimer = setTimeout(trigger, 9);
						},
						unbind = function(){
							input.unbind('focusout', unbind).unbind('keyup keypress keydown paste cut', extraTest).unbind('input change updateInput', trigger);
							clearInterval(timer);
							setTimeout(function(){
								trigger();
								input = null;
							}, 1);
							
						}
					;
					
					clearInterval(timer);
					timer = setInterval(trigger, 200);
					extraTest();
					input.on({
						'keyup keypress keydown paste cut': extraTest,
						focusout: unbind,
						'input updateInput change': trigger
					});
				}
			;
						
			$(doc)
				.on('focusin', function(e){
					if( e.target && !e.target.readOnly && !e.target.disabled && (e.target.nodeName || '').toLowerCase() == 'input' && !noInputTypes[e.target.type] && !(webshims.data(e.target, 'implemented') || {}).inputwidgets){
						observe($(e.target));
					}
				})
			;
		})();
	})();

}); //webshims.ready end
}//end formvalidation

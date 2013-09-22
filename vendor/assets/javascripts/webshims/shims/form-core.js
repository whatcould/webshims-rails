webshims.register('form-core', function($, webshims, window, document, undefined, options){
	"use strict";

	webshims.capturingEventPrevented = function(e){
		if(!e._isPolyfilled){
			var isDefaultPrevented = e.isDefaultPrevented;
			var preventDefault = e.preventDefault;
			e.preventDefault = function(){
				clearTimeout($.data(e.target, e.type + 'DefaultPrevented'));
				$.data(e.target, e.type + 'DefaultPrevented', setTimeout(function(){
					$.removeData(e.target, e.type + 'DefaultPrevented');
				}, 30));
				return preventDefault.apply(this, arguments);
			};
			e.isDefaultPrevented = function(){
				return !!(isDefaultPrevented.apply(this, arguments) || $.data(e.target, e.type + 'DefaultPrevented') || false);
			};
			e._isPolyfilled = true;
		}
	};
	
	if(Modernizr.formvalidation && !webshims.bugs.bustedValidity){
		//create delegatable events
		webshims.capturingEvents(['invalid'], true);
	}

	var isValid = function(elem){
		return ($.prop(elem, 'validity') || {valid: 1}).valid;
	};
	var lazyLoad = function(){
		var toLoad = ['form-validation'];
		if(options.lazyCustomMessages){
			options.customMessages = true;
			toLoad.push('form-message');
		}
		if(options.customDatalist){
			options.fD = true;
			toLoad.push('form-datalist');
		}
		if(options.addValidators){
			toLoad.push('form-validators');
		}
		webshims.reTest(toLoad);
		$(document).off('.lazyloadvalidation');
	};
	/*
	 * Selectors for all browsers
	 */
	var hasInvalid = function(elem){
		var ret = false;
		$(elem).jProp('elements').each(function(){
			ret = $(this).is(':invalid');
			if(ret){
				return false;
			}
		});
		return ret;
	};
	var rElementsGroup = /^(?:form)$/i;///^(?:form|fieldset)$/i
	$.extend($.expr[":"], {
		"valid-element": function(elem){
			return rElementsGroup.test(elem.nodeName || '') ? !hasInvalid(elem) :!!($.prop(elem, 'willValidate') && isValid(elem));
		},
		"invalid-element": function(elem){
			return rElementsGroup.test(elem.nodeName || '') ? hasInvalid(elem) : !!($.prop(elem, 'willValidate') && !isValid(elem));
		},
		"required-element": function(elem){
			return !!($.prop(elem, 'willValidate') && $.prop(elem, 'required'));
		},
		"user-error": function(elem){
			return ($.prop(elem, 'willValidate') && $(elem).hasClass('user-error'));
		},
		"optional-element": function(elem){
			return !!($.prop(elem, 'willValidate') && $.prop(elem, 'required') === false);
		}
	});
	
	['valid', 'invalid', 'required', 'optional'].forEach(function(name){
		$.expr[":"][name] = $.expr.filters[name+"-element"];
	});
	
	//bug was partially fixed in 1.10.0 for IE9, but not IE8 (move to es5 as soon as 1.10.2 is used) 
	var pseudoFocus = $.expr[":"].focus;
	$.expr[":"].focus = function(){
		try {
			return pseudoFocus.apply(this, arguments);
		} catch(e){
			webshims.error(e);
		}
		return false;
	};
	
	webshims.triggerInlineForm = function(elem, event){
		$(elem).trigger(event);
	};
	
	var lazyLoadProxy = function(obj, fn, args){
		lazyLoad();
		webshims.ready('form-validation', function(){
			obj[fn].apply(obj, args);
		});
	};
	
	var transClass = ('transitionDelay' in document.documentElement.style) ?  '' : ' no-transition';
	var poCFG = webshims.cfg.wspopover;
	if(!poCFG.position && poCFG.position !== false){
		poCFG.position = {
			at: 'left bottom',
			my: 'left top',
			collision: 'fit flip'
		};
	}
	webshims.wsPopover = {
		id: 0,
		_create: function(){
			this.options = $.extend(true, {}, poCFG, this.options);
			this.id = webshims.wsPopover.id++;
			this.eventns = '.wsoverlay' + this.id;
			this.timers = {};
			this.element = $('<div class="ws-popover'+transClass+'" tabindex="-1"><div class="ws-po-outerbox"><div class="ws-po-arrow"><div class="ws-po-arrowbox" /></div><div class="ws-po-box" /></div></div>');
			this.contentElement = $('.ws-po-box', this.element);
			this.lastElement = $([]);
			this.bindElement();
			
			this.element.data('wspopover', this);
			
		},
		options: {},
		content: function(html){
			this.contentElement.html(html);
		},
		bindElement: function(){
			var that = this;
			var stopBlur = function(){
				that.stopBlur = false;
			};
			this.preventBlur = function(e){
				that.stopBlur = true;
				clearTimeout(that.timers.stopBlur);
				that.timers.stopBlur = setTimeout(stopBlur, 9);
			};
			this.element.on({
				'mousedown': this.preventBlur
			});
		},
		show: function(){
			lazyLoadProxy(this, 'show', arguments);
		}
	};
	
	/* some extra validation UI */
	webshims.validityAlert = {
		showFor: function(){
			lazyLoadProxy(this, 'showFor', arguments);
		}
	};
	
	
	webshims.getContentValidationMessage = function(elem, validity, key){
		var message = $(elem).data('errormessage') || elem.getAttribute('x-moz-errormessage') || '';
		if(key && message[key]){
			message = message[key];
		} else if(message) {
			validity = validity || $.prop(elem, 'validity') || {valid: 1};
			if(validity.valid){
				message = '';
			}
		}
		if(typeof message == 'object'){
			validity = validity || $.prop(elem, 'validity') || {valid: 1};
			if(!validity.valid){
				$.each(validity, function(name, prop){
					if(prop && name != 'valid' && message[name]){
						message = message[name];
						return false;
					}
				});
				if(typeof message == 'object'){
					if(validity.typeMismatch && message.badInput){
						message = message.badInput;
					}
					if(validity.badInput && message.typeMismatch){
						message = message.typeMismatch;
					}
				}
			}
		}
		
		if(typeof message == 'object'){
			message = message.defaultMessage;
		}
		return message || '';
	};
	
	$.fn.getErrorMessage = function(key){
		var message = '';
		var elem = this[0];
		if(elem){
			message = webshims.getContentValidationMessage(elem, false, key) || $.prop(elem, 'customValidationMessage') || $.prop(elem, 'validationMessage');
		}
		return message;
	};
	
	
	$(document).on('focusin.lazyloadvalidation', function(e){
		if('form' in e.target && (e.target.list || $(e.target).is(':invalid'))){
			lazyLoad();
		}
	});
	webshims.ready('WINDOWLOAD', lazyLoad);
	
});

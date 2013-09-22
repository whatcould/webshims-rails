webshims.register('form-validation', function($, webshims, window, document, undefined, options){
	var isWebkit = 'webkitURL' in window;
	var chromeBugs = isWebkit && Modernizr.formvalidation && !webshims.bugs.bustedValidity;
	var webkitVersion = chromeBugs && parseFloat((navigator.userAgent.match(/Safari\/([\d\.]+)/) || ['', '999999'])[1], 10);
	var invalidClass = options.iVal.errorClass || 'user-error';
	var validClass = options.iVal.successClass || 'user-success';
	
	var invalidWrapperClass = options.iVal.errorWrapperClass || 'ws-invalid';
	var successWrapperClass = options.iVal.successWrapperClass || 'ws-success';
	var errorBoxClass = options.iVal.errorBoxClass || 'ws-errorbox';
	var checkTypes = {checkbox: 1, radio: 1};
	
	var emptyJ = $([]);
	var isValid = function(elem){
		return ($.prop(elem, 'validity') || {valid: 1}).valid;
	};
	
	var nonFormFilter = function(){
		return !$.prop(this, 'form');
	};
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
				ret = $(form).jProp(name);
			} else {
				ret = $(document.getElementsByName(name)).filter(nonFormFilter);
			}
			ret = ret.filter('[type="radio"]');
		}
		return ret;
	};
	
	
	var returnValidityCause = function(validity, elem){
		var ret;
		$.each(validity, function(name, value){
			if(value){
				ret = name + $.prop(elem, 'validationMessage');
				return false;
			}
		});
		return ret;
	};
	
	var isInGroup = function(name){
		var ret;
		try {
			ret = document.activeElement.name === name;
		} catch(e){}
		return ret;
	};
	//actually we could always use the change event, but chrome messed it up and does not respect the commit action definition of the html spec
	//see: http://code.google.com/p/chromium/issues/detail?id=155747
	var changeTypes = {
		radio: 1,
		checkbox: 1,
		'select-one': 1,
		'select-multiple': 1,
		file: 1,
		date: 1,
		month: 1,
		week: 1,
		text: 1
	};
	//see: http://code.google.com/p/chromium/issues/detail?id=179708 and bug above
	var noFocusWidgets = {
		time: 1,
		date: 1,
		month: 1,
		datetime: 1,
		week: 1,
		'datetime-local': 1
	};
	var switchValidityClass = function(e){
		if(!options.iVal.sel){return;}
		var elem, timer, shadowElem, shadowType;
		if(!e.target){return;}
		elem = $(e.target).getNativeElement()[0];
		shadowElem = $(elem).getShadowElement();
		if(elem.type == 'submit' || !$.prop(elem, 'willValidate') || (e.type == 'change' && (shadowType = shadowElem.prop('type')) && !changeTypes[shadowType])){return;}
		timer = $.data(elem, 'webshimsswitchvalidityclass');
		var switchClass = function(){
			if(!shadowType){
				shadowType = shadowElem.prop('type');
			}
			if(
				(chromeBugs && (e.type == 'change' || webkitVersion < 537.36) && noFocusWidgets[shadowType] && $(e.target).is(':focus')) ||
				(e.type == 'focusout' && elem.type == 'radio' && isInGroup(elem.name))
				){
					return;
			}
			if(webshims.refreshCustomValidityRules){
				if(webshims.refreshCustomValidityRules(elem) == 'async'){
					$(elem).one('refreshvalidityui', switchValidityClass);
					return;
				}
			}
			
			var validity = $.prop(elem, 'validity');
			
			var addClass, removeClass, trigger, generaltrigger, validityCause;
			
			
			
			if(validity.valid){
				if(!shadowElem.hasClass(validClass)){
					addClass = validClass;
					removeClass = invalidClass;
					generaltrigger = 'changedvaliditystate';
					trigger = 'changedvalid';
					if(checkTypes[elem.type] && elem.checked){
						getGroupElements(elem).not(elem).removeClass(removeClass).addClass(addClass).removeAttr('aria-invalid');
					}
					shadowElem.removeAttr('aria-invalid');
					$.removeData(elem, 'webshimsinvalidcause');
				}
			} else {
				validityCause = returnValidityCause(validity, elem);
				if($.data(elem, 'webshimsinvalidcause') != validityCause){
					$.data(elem, 'webshimsinvalidcause', validityCause);
					generaltrigger = 'changedvaliditystate';
				}
				if(!shadowElem.hasClass(invalidClass)){
					addClass = invalidClass;
					removeClass = validClass;
					if (checkTypes[elem.type] && !elem.checked) {
						getGroupElements(elem).not(elem).removeClass(removeClass).addClass(addClass).attr('aria-invalid', 'true');
					}
					shadowElem.attr('aria-invalid', 'true');
					trigger = 'changedinvalid';
				}
			}
			
			if(addClass){
				shadowElem.addClass(addClass).removeClass(removeClass);
				//jQuery 1.6.1 IE9 bug (doubble trigger bug)
				setTimeout(function(){
					$(elem).trigger(trigger);
				}, 0);
			}
			if(generaltrigger){
				setTimeout(function(){
					$(elem).trigger(generaltrigger);
				}, 0);
			}
			
			$.removeData(elem, 'webshimsswitchvalidityclass');
		};
		
		if(timer){
			clearTimeout(timer);
		}
		if(e.type == 'refreshvalidityui'){
			switchClass();
		} else {
			$.data(elem, 'webshimsswitchvalidityclass', setTimeout(switchClass, 9));
		}
	};
	
	$(document.body || 'html')
		.on(options.validityUIEvents || 'focusout change refreshvalidityui invalid', switchValidityClass)
		.on('reset resetvalui', function(e){
			var elems = $(e.target);
			if(e.type == 'reset'){
				elems = elems.filter('form').jProp('elements');
			}
			elems
				.filter('.user-error, .user-success')
				.removeAttr('aria-invalid')
				.removeClass('user-error')
				.removeClass('user-success')
				.getNativeElement()
				.each(function(){
					$.removeData(this, 'webshimsinvalidcause');
				})
				.trigger('resetvalidityui')
			;
		})
	;
	
	var setRoot = function(){
		webshims.scrollRoot = (isWebkit || document.compatMode == 'BackCompat') ?
			$(document.body) : 
			$(document.documentElement)
		;
	};
	var minWidth = (Modernizr.boxSizing || Modernizr['display-table'] || $.support.getSetAttribute || $.support.boxSizing) ?
		'minWidth' :
		'width'
	;
	var hasTransition = ('transitionDelay' in document.documentElement.style);
	var resetPos = {display: 'inline-block', left: 0, top: 0, marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0};
	
	setRoot();
	webshims.ready('DOM', setRoot);
	
	
	webshims.getRelOffset = function(posElem, relElem, opts){
		var offset, bodyOffset, dirs;
		posElem = $(posElem);
		$.swap($(posElem)[0], resetPos, function(){
			if($.position && opts && $.position.getScrollInfo){
				if(!opts.of){
					opts.of = relElem;
				}
				
				opts.using = function(calced, data){
					posElem.attr({'data-horizontal': data.horizontal, 'data-vertical': data.vertical});
					offset = calced;
				};
				posElem.attr({
					'data-horizontal': '', 
					'data-vertical': '',
					'data-my': opts.my || 'center',
					'data-at': opts.at || 'center'
				});
				posElem.position(opts);
				
			} else {
				offset = $(relElem).offset();
				bodyOffset = posElem.offset();
				offset.top -= bodyOffset.top;
				offset.left -= bodyOffset.left;
				
				offset.top += relElem.outerHeight();
			}
			
		});
		
		return offset;
	};
	
	$.extend(webshims.wsPopover, {
		
		
		isInElement: function(container, contained){
			return container == contained || $.contains(container, contained);
		},
		show: function(element){
			if(this.isVisible){return;}
			var e = $.Event('wspopoverbeforeshow');
			this.element.trigger(e);
			if(e.isDefaultPrevented()){return;}
			this.isVisible = true;
			element = $(element || this.options.prepareFor).getNativeElement() ;
			
			var that = this;
			var visual = $(element).getShadowElement();
			var delayedRepos = function(e){
				clearTimeout(that.timers.repos);
				that.timers.repos = setTimeout(function(){
					that.position(visual);
				}, e && e.type == 'pospopover' ? 4 : 200);
			};

			this.clear();
			this.element.removeClass('ws-po-visible').css('display', 'none');
			
			this.prepareFor(element, visual);
			
			this.position(visual);
			that.timers.show = setTimeout(function(){
				that.element.css('display', '');
				that.timers.show = setTimeout(function(){
					that.element.addClass('ws-po-visible').trigger('wspopovershow');
				}, 9);
			}, 9);
			
			$(document).on('focusin'+this.eventns+' mousedown'+this.eventns, function(e){
				if(that.options.hideOnBlur && !that.stopBlur && !that.isInElement(that.lastElement[0] || document.body, e.target) && !that.isInElement(element[0] || document.body, e.target) && !that.isInElement(that.element[0], e.target)){
					that.hide();
				}
			});
			
			this.element.off('pospopover').on('pospopover', delayedRepos);
			$(window).on('resize'+this.eventns + ' pospopover'+this.eventns, delayedRepos);
		},
		prepareFor: function(element, visual){
			var onBlur;
			var that = this;
			var css = {};
			var opts = $.extend(true, {}, this.options, $(element.prop('form') || []).data('wspopover') || {}, element.data('wspopover'));
			this.lastOpts = opts;
			this.lastElement = $(element).getShadowFocusElement();
			if(!this.prepared || !this.options.prepareFor){
				if(opts.appendTo == 'element'){
					this.element.insertAfter(element);
				} else {
					this.element.appendTo(opts.appendTo);
				}
			}
			
			this.element.attr({
				'data-class': element.prop('className'),
				'data-id': element.prop('id')
			});
			
			css[minWidth] = opts.constrainWidth ? visual.outerWidth() : '';
			
			this.element.css(css);
			
			if(opts.hideOnBlur){
				onBlur = function(e){
					if(that.stopBlur){
						e.stopImmediatePropagation();
					} else {
						that.hide();
					}
				};
				
				that.timers.bindBlur = setTimeout(function(){
					that.lastElement.off(that.eventns).on('focusout'+that.eventns + ' blur'+that.eventns, onBlur);
					that.lastElement.getNativeElement().off(that.eventns);
				}, 10);
				
				
			}
			
			if(!this.prepared && $.fn.bgIframe){
				this.element.bgIframe();
			}
			this.prepared = true;
		},
		clear: function(){
			$(window).off(this.eventns);
			$(document).off(this.eventns);
			this.element.off('transitionend'+this.eventns);
			this.stopBlur = false;
			this.lastOpts = false;
			$.each(this.timers, function(timerName, val){
				clearTimeout(val);
			});
		},
		hide: function(){
			var e = $.Event('wspopoverbeforehide');
			this.element.trigger(e);
			if(e.isDefaultPrevented() || !this.isVisible){return;}
			this.isVisible = false;
			var that = this;
			var forceHide = function(e){
				if(!(e && e.type == 'transitionend' && (e = e.originalEvent) && e.target == that.element[0] && that.element.css('visibility') == 'hidden')){
					that.element.off('transitionend'+that.eventns).css('display', 'none').attr({'data-id': '', 'data-class': '', 'hidden': 'hidden'});
					clearTimeout(that.timers.forcehide);
					$(window).off('resize'+that.eventns);
				}
			};
			this.clear();
			this.element.removeClass('ws-po-visible').trigger('wspopoverhide');
			$(window).on('resize'+this.eventns, forceHide);
			if(hasTransition){
				this.element.off('transitionend'+this.eventns).on('transitionend'+this.eventns, forceHide);
			}
			
			that.timers.forcehide = setTimeout(forceHide, hasTransition ? 600 : 40);
		},
		position: function(element){
			var offset = webshims.getRelOffset(this.element.removeAttr('hidden'), element, (this.lastOpts || this.options).position);
			
			this.element.css(offset);
		}
	});
	
	
	
	/* some extra validation UI */
	webshims.validityAlert = (function(){
		
		options.messagePopover.position = $.extend({}, {
			at: 'left bottom',
			my: 'left top',
			collision: 'none'
		}, options.messagePopover.position || {});
			
		var focusTimer = false;
		
		var api = webshims.objectCreate(webshims.wsPopover, {}, options.messagePopover);
		var boundHide = api.hide.bind(api);
		
		api.element.addClass('validity-alert').attr({role: 'alert'});
		$.extend(api, {
			hideDelay: 5000,
			showFor: function(elem, message, noFocusElem, noBubble){
				
				elem = $(elem).getNativeElement();
				this.clear();
				this.hide();
				if(!noBubble){
					this.getMessage(elem, message);
					
					this.show(elem);
					if(this.hideDelay){
						this.timers.delayedHide = setTimeout(boundHide, this.hideDelay);
					}
					
				}
				
				if(!noFocusElem){
					this.setFocus(elem);
				}
			},
			setFocus: function(element){
				var focusElem = $(element).getShadowFocusElement();
				var scrollTop = webshims.scrollRoot.scrollTop();
				var elemTop = focusElem.offset().top - 30;
				var focus = function(){
					try {
						focusElem[0].focus();
					} catch(e){}
					$(window).triggerHandler('pospopover'+this.eventns);
				};
				
				if(scrollTop > elemTop){
					webshims.scrollRoot.animate(
						{scrollTop: elemTop - 5}, 
						{
							queue: false, 
							duration: Math.max( Math.min( 600, (scrollTop - elemTop) * 1.5 ), 80 ),
							complete: focus
						}
					);
					
				} else {
					focus();
				}
				
			},
			getMessage: function(elem, message){
				if (!message) {
					message = elem.getErrorMessage();
				}
				if (message) {
					api.contentElement.text(message);
				} else {
					this.hide();
				}
			}
		});
		
		
		return api;
	})();
	
	var fx = {
		slide: {
			show: 'slideDown',
			hide: 'slideUp'
		},
		fade: {
			show: 'fadeIn',
			hide: 'fadeOut'
		}
	};
	if(!fx[options.iVal.fx]){
		options.iVal.fx = 'slide';
	}
	webshims.errorbox = {
		create: function(elem, fieldWrapper){
			if(!fieldWrapper){
				fieldWrapper = this.getFieldWrapper(elem);
			}
			var errorBox = $('div.'+errorBoxClass, fieldWrapper);
			
			if(!errorBox.length){
				errorBox = $('<div class="'+ errorBoxClass +'" hidden="hidden">');
				fieldWrapper.append(errorBox);
			}
			
			fieldWrapper.data('errorbox', errorBox);
			return errorBox;
		},
		getFieldWrapper: function(elem){
			var fieldWrapper;
			if(options.iVal.fieldWrapper){
				fieldWrapper = (typeof options.iVal.fieldWrapper == "function") ? options.iVal.fieldWrapper.apply(this, arguments) : $(elem).parent().closest(options.iVal.fieldWrapper);
				if(!fieldWrapper.length){
					fieldWrapper = false;
					webshims.error("could not find fieldwrapper: "+ options.iVal.fieldWrapper);
				}
			}
			if(!fieldWrapper){
				fieldWrapper = $(elem).parent().closest(':not(span, label, em, strong, b, i, mark, p)');
			}
			return fieldWrapper;
		},
		_createContentMessage: (function(){
			var fields = {};
			var getErrorName = function(elem){
				var ret = $(elem).data('errortype');
				if(!ret){
					$.each(fields, function(errorName, cNames){
						if($(elem).is(cNames)){
							ret = errorName;
							return false;
						}
					});
				}
				return ret || 'defaultMessage';
			};
			$(function(){
				$.each($('<input />').prop('validity'), function(name){
					if(name != 'valid'){
						var cName = name.replace(/[A-Z]/, function(c){
							return '-'+(c).toLowerCase();
						});
						fields[name] = '.'+cName+', .'+name+', .'+(name).toLowerCase()+', [data-errortype="'+ name +'"]';
					}
				});
			});
			return function(elem, errorBox){
				var extended = false;
				var errorMessages = $(elem).data('errormessage') || {};
				if(typeof errorMessages == 'string'){
					errorMessages = {defaultMessage: errorMessages};
				}
				$('> *', errorBox).each(function(){
					var name = getErrorName(this);
					if(!errorMessages[name]){
						extended = true;
						errorMessages[name] = $(this).html();
					}
				});
				if(extended){
					$(elem).data('errormessage', errorMessages);
				}
			};
		})(),
		get: function(elem, fieldWrapper){
			if(!fieldWrapper){
				fieldWrapper = this.getFieldWrapper(elem);
			}
			var errorBox = fieldWrapper.data('errorbox');
			if(!errorBox){
				errorBox = this.create(elem, fieldWrapper);
				this._createContentMessage(elem, errorBox);
			} else if(typeof errorBox == 'string'){
				errorBox = $('#'+errorBox);
				fieldWrapper.data('errorbox', errorBox);
				this._createContentMessage(elem, errorBox);
			}
			return errorBox;
		},
		addSuccess: function(elem, fieldWrapper){
			var type = $.prop(elem, 'type');
			var check = function(){
				var hasVal = checkTypes[type] ? $.prop(elem, 'checked') : $(elem).val();
				fieldWrapper[hasVal ? 'addClass' : 'removeClass'](successWrapperClass);
			};
			var evt = changeTypes[type] ? 'change' : 'blur';
			
			$(elem).off('.recheckvalid').on(evt+'.recheckinvalid', check);
			check();
		},
		hideError: function(elem, reset){
			var fieldWrapper = this.getFieldWrapper(elem);
			var errorBox = fieldWrapper.hasClass(invalidWrapperClass) ? this.get(elem, fieldWrapper) : fieldWrapper.data('errorbox');
			
			if(errorBox && errorBox.jquery){
				fieldWrapper.removeClass(invalidWrapperClass);
				errorBox.message = '';
				$(elem).filter('input').off('.recheckinvalid');
				errorBox[fx[options.iVal.fx].hide](function(){
					$(this).attr({hidden: 'hidden'});
				});
			}
			if(!reset){
				this.addSuccess(elem, fieldWrapper);
			}
			return fieldWrapper;
		},
		recheckInvalidInput: function(input){
			if(options.iVal.recheckDelay && options.iVal.recheckDelay > 90){
				var timer;
				var throttle = function(){
					switchValidityClass({type: 'input', target: input});
				};
				$(input)
					.filter('input:not([type="checkbox"], [type="radio"])')
					.off('.recheckinvalid')
					.on('input.recheckinvalid', function(){
						clearTimeout(timer);
						timer = setTimeout(throttle, options.iVal.recheckDelay); 
					})
					.on('focusout.recheckinvalid', function(){
						clearTimeout(timer);
					})
				;
			}
		},
		showError: function(elem){
			var fieldWrapper = this.getFieldWrapper(elem);
			var box = this.get(elem, fieldWrapper);
			var message = $(elem).getErrorMessage();
			if(box.message != message){
				box.stop(true, true).html('<p>'+ message +'</p>');
				box.message = message;
				fieldWrapper.addClass(invalidWrapperClass).removeClass(successWrapperClass);
				if(box.is('[hidden]') || box.css('display') == 'none'){
					this.recheckInvalidInput(elem);
					box
						.css({display: 'none'})
						.removeAttr('hidden')
						[fx[options.iVal.fx].show]()
					;
				}
			}
			fieldWrapper.removeClass(successWrapperClass);
			$(elem).off('.recheckvalid');
			
			return fieldWrapper;
		},
		reset: function(elem){
			this.hideError(elem, true).removeClass(successWrapperClass);
		},
		toggle: function(elem){
			if($(elem).is(':invalid')){
				this.showError(elem);
			} else {
				this.hideError(elem);
			}
		}
	};
	
	$(document.body)
		.on({
			'changedvaliditystate': function(e){
				if(options.iVal.sel){
					var form = $(e.target).jProp('form');
					if(form.is(options.iVal.sel)){
						webshims.errorbox.toggle(e.target);
					}
				}
			},
			resetvalidityui: function(e){
				if (options.iVal.sel) {
					var form = $(e.target).jProp('form');
					if (form.is(options.iVal.sel)) {
						webshims.errorbox.reset(e.target);
					}
				}
			},
			firstinvalid: function(e){
				if(options.iVal.sel && options.iVal.handleBubble){
				var form = $(e.target).jProp('form');
					if(form.is(options.iVal.sel)){
						e.preventDefault();
						if(options.iVal.handleBubble != 'none'){
							webshims.validityAlert.showFor( e.target, false, false, options.iVal.handleBubble == 'hide' ); 
						}
					}
				}
			},
			submit: function(e){
				if(options.iVal.sel && !options.iVal.noSubmitCheck &&$(e.target).is(options.iVal.sel) && $.prop(e.target, 'noValidate') && !$(e.target).checkValidity()){
					e.stopImmediatePropagation();
					return false;
				}
			}
		})
	;
	
	webshims.modules["form-core"].getGroupElements = getGroupElements;
	
	
	if(options.replaceValidationUI){
		webshims.ready('DOM forms', function(){
			$(document).on('firstinvalid', function(e){
				if(!e.isInvalidUIPrevented()){
					e.preventDefault();
					webshims.validityAlert.showFor( e.target ); 
				}
			});
		});
	}
	
	/* extension, but also used to fix native implementation workaround/bugfixes */
	(function(){
		var firstEvent,
			invalids = [],
			stopSubmitTimer,
			form
		;
		
		$(document).on('invalid', function(e){
			if(e.wrongWebkitInvalid){return;}
			var jElm = $(e.target);
			
			
			if(!firstEvent){
				//trigger firstinvalid
				firstEvent = $.Event('firstinvalid');
				firstEvent.isInvalidUIPrevented = e.isDefaultPrevented;
				var firstSystemInvalid = $.Event('firstinvalidsystem');
				$(document).triggerHandler(firstSystemInvalid, {element: e.target, form: e.target.form, isInvalidUIPrevented: e.isDefaultPrevented});
				jElm.trigger(firstEvent);
			}

			//if firstinvalid was prevented all invalids will be also prevented
			if( firstEvent && firstEvent.isDefaultPrevented() ){
				e.preventDefault();
			}
			invalids.push(e.target);
			e.extraData = 'fix'; 
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
				//reset firstinvalid
				firstEvent = false;
				invalids = [];
				$(e.target).trigger(lastEvent, [lastEvent]);
			}, 9);
			jElm = null;
		});
	})();
	
	//see: https://bugs.webkit.org/show_bug.cgi?id=113377
	if (chromeBugs && webkitVersion < 540) {
		(function(){
			var elems = /^(?:textarea|input)$/i;
			var form = false;
			
			document.addEventListener('contextmenu', function(e){
				if (elems.test(e.target.nodeName || '') && (form = e.target.form)) {
					setTimeout(function(){
						form = false;
					}, 1);
				}
			}, false);
			
			$(window).on('invalid', function(e){
				if (e.originalEvent && form && form == e.target.form) {
					e.wrongWebkitInvalid = true;
					e.stopImmediatePropagation();
				}
			});
			
		})();
	}
});

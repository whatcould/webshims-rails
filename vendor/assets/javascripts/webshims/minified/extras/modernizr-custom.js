window.Modernizr=function(s,e,C){function z(a,b){for(var c in a){var g=a[c];if(!~(""+g).indexOf("-")&&J[g]!==C)return"pfx"==b?g:!0}return!1}function v(a,b,c){var g=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+w.join(g+" ")+g).split(" ");if("string"===typeof b||"undefined"===typeof b)return z(e,b);e=(a+" "+t.join(g+" ")+g).split(" ");a:{var a=e,f;for(f in a)if(g=b[a[f]],g!==C){if(!1===c){b=a[f];break a}b="function"===typeof g?g.bind(c||b):g;break a}b=!1}return b}function D(){f.input=function(a){for(var b=
0,c=a.length;b<c;b++)u[a[b]]=!!(a[b]in j);if(u.list)u.list=!(!e.createElement("datalist")||!s.HTMLDataListElement);return u}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" "));f.inputtypes=function(a){for(var b=0,c,g,f=a.length;b<f;b++){j.setAttribute("type",g=a[b]);if(c="text"!==j.type)j.value=q,j.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(g)&&j.style.WebkitAppearance!==C?(m.appendChild(j),c=e.defaultView,c=c.getComputedStyle&&"textfield"!==
c.getComputedStyle(j,null).WebkitAppearance&&0!==j.offsetHeight,m.removeChild(j)):/^(search|tel)$/.test(g)||(c=/^(url|email)$/.test(g)?j.checkValidity&&!1===j.checkValidity():j.value!=q);E[a[b]]=!!c}return E}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var f={},m=e.documentElement,k=e.createElement("modernizr"),J=k.style,j=e.createElement("input"),q=":)",w="Webkit Moz O ms".split(" "),t="webkit moz o ms".split(" "),k={},E={},u={},x=[],F=x.slice,
A,G={}.hasOwnProperty,H;H="undefined"!==typeof G&&"undefined"!==typeof G.call?function(a,b){return G.call(a,b)}:function(a,b){return b in a&&"undefined"===typeof a.constructor.prototype[b]};if(!Function.prototype.bind)Function.prototype.bind=function(a){var b=this;if("function"!=typeof b)throw new TypeError;var c=F.call(arguments,1),g=function(){if(this instanceof g){var e=function(){};e.prototype=b.prototype;var e=new e,f=b.apply(e,c.concat(F.call(arguments)));return Object(f)===f?f:e}return b.apply(a,
c.concat(F.call(arguments)))};return g};k.canvas=function(){var a=e.createElement("canvas");return!(!a.getContext||!a.getContext("2d"))};k.geolocation=function(){return"geolocation"in navigator};k.video=function(){var a=e.createElement("video"),b=!1;try{if(b=!!a.canPlayType)b=new Boolean(b),b.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),b.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),b.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,
"")}catch(c){}return b};k.audio=function(){var a=e.createElement("audio"),b=!1;try{if(b=!!a.canPlayType)b=new Boolean(b),b.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),b.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),b.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),b.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(c){}return b};k.localstorage=function(){try{return localStorage.setItem("modernizr","modernizr"),localStorage.removeItem("modernizr"),
!0}catch(a){return!1}};k.sessionstorage=function(){try{return sessionStorage.setItem("modernizr","modernizr"),sessionStorage.removeItem("modernizr"),!0}catch(a){return!1}};for(var I in k)H(k,I)&&(A=I.toLowerCase(),f[A]=k[I](),x.push((f[A]?"":"no-")+A));f.input||D();f.addTest=function(a,b){if("object"==typeof a)for(var c in a)H(a,c)&&f.addTest(c,a[c]);else{a=a.toLowerCase();if(f[a]!==C)return f;b="function"==typeof b?b():b;m.className+=" "+(b?"":"no-")+a;f[a]=b}return f};J.cssText="";k=j=null;(function(a,
b){function c(){var b=y.elements;return"string"==typeof b?b.split(" "):b}function e(b){var a=o[b[n]];a||(a={},h++,b[n]=h,o[h]=a);return a}function f(a,i,d){i||(i=b);if(l)return i.createElement(a);d||(d=e(i));i=d.cache[a]?d.cache[a].cloneNode():K.test(a)?(d.cache[a]=d.createElem(a)).cloneNode():d.createElem(a);return i.canHaveChildren&&!N.test(a)?d.frag.appendChild(i):i}function j(a,b){if(!b.cache)b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag();a.createElement=
function(d){return!y.shivMethods?b.createElem(d):f(d,a,b)};a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+c().join().replace(/\w+/g,function(a){b.createElem(a);b.frag.createElement(a);return'c("'+a+'")'})+");return n}")(y,b.frag)}function i(a){a||(a=b);var i=e(a);if(y.shivCSS&&!r&&!i.hasCSS){var d,c=a;d=c.createElement("p");c=c.getElementsByTagName("head")[0]||c.documentElement;d.innerHTML="x<style>article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}</style>";
d=c.insertBefore(d.lastChild,c.firstChild);i.hasCSS=!!d}l||j(a,i);return a}var B=a.html5||{},N=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,K=/^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i,r,n="_html5shiv",h=0,o={},l;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>";r="hidden"in a;var i;if(!(i=1==a.childNodes.length)){b.createElement("a");
var d=b.createDocumentFragment();i="undefined"==typeof d.cloneNode||"undefined"==typeof d.createDocumentFragment||"undefined"==typeof d.createElement}l=i}catch(c){l=r=!0}})();var y={elements:B.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:!1!==B.shivCSS,supportsUnknownElements:l,shivMethods:!1!==B.shivMethods,type:"default",shivDocument:i,createElement:f,createDocumentFragment:function(a,
i){a||(a=b);if(l)return a.createDocumentFragment();for(var i=i||e(a),d=i.frag.cloneNode(),B=0,f=c(),o=f.length;B<o;B++)d.createElement(f[B]);return d}};a.html5=y;i(b)})(this,e);f._version="2.6.1";f._domPrefixes=t;f._cssomPrefixes=w;f.testProp=function(a){return z([a])};f.testAllProps=v;f.prefixed=function(a,b,c){return b?v(a,b,c):v(a,"pfx")};m.className=m.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(" js "+x.join(" "));return f}(this,this.document);
(function(s,e,C){function z(a){return"[object Function]"==E.call(a)}function v(a){return"string"==typeof a}function D(){}function f(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function m(){var a=u.shift();x=1;a?a.t?w(function(){("c"==a.t?p.injectCss:p.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),m()):x=0}function k(a,b,g,j,r,n,h){function o(d){if(!y&&f(l.readyState)&&(M.r=y=1,!x&&m(),l.onload=l.onreadystatechange=null,d)){"img"!=a&&w(function(){G.removeChild(l)},50);for(var e in c[b])c[b].hasOwnProperty(e)&&
c[b][e].onload()}}var h=h||p.errorTimeout,l=e.createElement(a),y=0,k=0,M={t:g,s:b,e:r,a:n,x:h};1===c[b]&&(k=1,c[b]=[]);"object"==a?l.data=b:(l.src=b,l.type=a);l.width=l.height="0";l.onerror=l.onload=l.onreadystatechange=function(){o.call(this,k)};u.splice(j,0,M);"img"!=a&&(k||2===c[b]?(G.insertBefore(l,A?null:t),w(o,h)):c[b].push(l))}function J(a,b,c,e,f){return x=0,b=b||"j",v(a)?k("c"==b?I:H,a,b,this.i++,c,e,f):(u.splice(this.i++,0,a),1==u.length&&m()),this}function j(){var a=p;return a.loader={load:J,
i:0},a}var q=e.documentElement,w=s.setTimeout,t=e.getElementsByTagName("script")[0],E={}.toString,u=[],x=0,F="MozAppearance"in q.style,A=F&&!!e.createRange().compareNode,G=A?q:t.parentNode,q=s.opera&&"[object Opera]"==E.call(s.opera),q=!!e.attachEvent&&!q,H=F?"object":q?"script":"img",I=q?"script":H,a=Array.isArray||function(a){return"[object Array]"==E.call(a)},b=[],c={},g={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},L,p;p=function(e){function f(a){var a=a.split("!"),e=b.length,c=
a.pop(),i=a.length,c={url:c,origUrl:c,prefixes:a},h,d,k;for(d=0;d<i;d++)k=a[d].split("="),(h=g[k.shift()])&&(c=h(c,k));for(d=0;d<e;d++)c=b[d](c);return c}function k(a,b,e,i,h){var d=f(a),g=d.autoCallback;d.url.split(".").pop().split("?").shift();d.bypass||(b&&(b=z(b)?b:b[a]||b[i]||b[a.split("/").pop().split("?")[0]]),d.instead?d.instead(a,b,e,i,h):(c[d.url]?d.noexec=!0:c[d.url]=1,e.load(d.url,d.forceCSS||!d.forceJS&&"css"==d.url.split(".").pop().split("?").shift()?"c":C,d.noexec,d.attrs,d.timeout),
(z(b)||z(g))&&e.load(function(){j();b&&b(d.origUrl,h,i);g&&g(d.origUrl,h,i);c[d.url]=2})))}function K(a,b){function c(a,f){if(a)if(v(a))f||(d=function(){var a=[].slice.call(arguments);i.apply(this,a);h()}),k(a,d,b,0,e);else{if(Object(a)===a)for(j in g=function(){var b=0,d;for(d in a)a.hasOwnProperty(d)&&b++;return b}(),a)a.hasOwnProperty(j)&&(!f&&!--g&&(z(d)?d=function(){var a=[].slice.call(arguments);i.apply(this,a);h()}:d[j]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,
b);h()}}(i[j])),k(a[j],d,b,j,e))}else!f&&h()}var e=!!a.test,f=a.load||a.both,d=a.callback||D,i=d,h=a.complete||D,g,j;c(e?a.yep:a.nope,!!f);f&&c(f)}var r,n,h=this.yepnope.loader;if(v(e))k(e,0,h,0);else if(a(e))for(r=0;r<e.length;r++)n=e[r],v(n)?k(n,0,h,0):a(n)?p(n):Object(n)===n&&K(n,h);else Object(e)===e&&K(e,h)};p.addPrefix=function(a,b){g[a]=b};p.addFilter=function(a){b.push(a)};p.errorTimeout=1E4;null==e.readyState&&e.addEventListener&&(e.readyState="loading",e.addEventListener("DOMContentLoaded",
L=function(){e.removeEventListener("DOMContentLoaded",L,0);e.readyState="complete"},0));s.yepnope=j();s.yepnope.executeStack=m;s.yepnope.injectJs=function(a,b,c,g,j,k){var h=e.createElement("script"),o,l,g=g||p.errorTimeout;h.src=a;for(l in c)h.setAttribute(l,c[l]);b=k?m:b||D;h.onreadystatechange=h.onload=function(){!o&&f(h.readyState)&&(o=1,b(),h.onload=h.onreadystatechange=null)};w(function(){o||(o=1,b(1))},g);j?h.onload():t.parentNode.insertBefore(h,t)};s.yepnope.injectCss=function(a,b,c,f,g,j){var f=
e.createElement("link"),h,b=j?m:b||D;f.href=a;f.rel="stylesheet";f.type="text/css";for(h in c)f.setAttribute(h,c[h]);g||(t.parentNode.insertBefore(f,t),w(b,0))}})(this,document);Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};

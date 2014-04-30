//Project start: Sex 06 Abr 2012 00:22:51 BRT 
/*	Animelt, The JavaScript Framework for complex animations
	Beta version, by Gabriel Rubens
	github.com/grsabreu
	gabrielrubensjs.wordpress.com
	gabrielrubensjs.blogspot.com
	Copyright (C) 2012  Gabriel Rubens

 	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
   
	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/  
(function(window,undefined){

var ge = function( sel,ctx ){
	return new ge.fn.meet( sel,ctx );
};

//Regexps
var unit = /[a-z%]+$/i,
	digits = /[0-9.]+/g,
	simpleVal = /([0-9.]+)([a-z%]+)/gi,
	words = /[a-z]+/gi,
	specials = {},
	complex = /[(),\s]+/g;

ge.fn = ge.prototype = {
	
	constructor: ge,

	version: "beta",

	bag: [],

	length: function(){
		return this.bag.length;
	},

	meet: function( sel,ctx ){
		if( !sel ) return this;
		if( sel.nodeName && sel.nodeType ){ 
			this.bag = [ sel ];
			return this;
		};
		
		//Get a Array of elements
		if( typeof sel == "array" ){
			this.bag = sel;
			return this;
		}

		//Get a jQuery NodeList
		if( sel.jquery ){
			this.bag = ge.makeArray( sel );
			return this;
		};
		if( typeof sel == "object" ){
			var $this = this;
			ge.each(sel,function(i, key, val){
				$this[ key ] = val;
			});
			return this;
		}
		this.selector = sel;
		var ctx = ctx || document; this.ctx = ctx;
		
		if( document.querySelectorAll ){
			this.bag = ge.makeArray( ctx.querySelectorAll(sel) );

			return this;
		};
		//Use jQuery, if it exists
		if( window.jQuery ){
			this.bag = ge.makeArray( window.jQuery(sel) );
			return this;
		};
		//A simple CSSSelectorEngine
		var selectors = (sel + ",").split(",");
		
		for( var i = 0,count=selectors.length;i<count;i++ ){
			//For #id
			if( 
				( /^#/g ).test( selectors[i] ) 
			){
				this.bag.push( ctx.getElementById( selector[i] ) );
			}
			//For .class
			else if(
				( /^\./g ).test( selectors[i] )
			){
				//FuckIE < IE 9.0
				this.bag.concat( ge.makeArray( ctx.getElementsByTagName(selectors[i]) ) );
			}
			//Then the selector is a tag name
			else{
				this.bag.concat( ge.makeArray( ctx.getElementsByTag(selectors[i]) ) );
			};
		};
		return this;
	},
	
	each: function( fn ){
		ge.each( this.bag,fn );
	},
	
	css: function( props ){
		if( arguments.length == 2 ){
			var val = arguments[ 1 ];
			this.each(function(){
				ge.css( props,val, this );
			});
			return this;
		};
		if( typeof props == "string" ){
			return ge.css( props, this.bag[0] );
		};
		ge.each(this.bag,function(){
			ge.css( props,this );
		});
		return this;
	},
	
	animelt: function( props,opts,time,fn,easing ){
		if( !props ) return this;
		opts = ge.parserOpts( opts,time,fn,easing );

		opts.duration = opts.duration * 1000;

		var start, now,
			per,
			easing = opts.easing ? ge.easings[ opts.easing ] : function( p ){ return p; },
			interval = opts.fps ? Math.round( 1000/opts.fps ) : 20;
			
		var els = this.bag,
			quickGe = ge(),
			$this = this;
		//@nodecss keeps the props of els
		var nodecss = [];

		this.each(function( el ){
			var node = this,
				//@prop keeps the old and new value of prop
				prop = { };
			ge.each(props,function( i,key,val ){
				//Makes the cross-browser
				if( key in specials )
					key = specials[key];
				//Store the origin value
				var oldvalue = "";
				//Tries find the @oldValue in @el.style propertie
				if ( node.style[key] )
					oldvalue = node.style[key];
				//If not tries find the @oldValue in computedStyle of el
				else if ( digits.test( ge(node).css(key) ) )
					oldvalue = ge(node).css( key );
				//If it does not find in either the @oldValue takes value 0
				else oldvalue = "0";
				prop[ key ] = [ oldvalue,val ];
			});
			nodecss[ el ] = prop;
		});
		
		//We're go!
			start = ge.now();
		var id = window.setTimeout(function run(){
		
			now = ge.now();
			per = ( now - start ) / opts.duration;
			
			if ( per > 1 ) per = 1;
			per = easing( per );

			$this.each(function( i,el ){
				//@props gets the props of respective el
				quickGe.bag[0] = el;
			 	var props = nodecss[ i ];
			 	//Makes the 'magic' animation
			 	//Hey man, look at me rockin' now! (I'm on the net!)
				ge.each(props,function( j,prop,val ){
					var ind = 0,
						//@old store the olds values in an array
						old = val[0].match( digits );
					//Uses the Animelt CSS method as Wrapper Pattern
					quickGe.css( 
						prop, 
						val[1].replace(simpleVal,function(exp,num,unit){
							old[ind] = old[ind] || "0";
							Number(num) == Number(old[ind]) ?
								old[ind] = 0 : void 0;							
							var finalvalue = Number(old[ind]) + ( Number(num) - Number(old[ind]) ) * per;						
							ind++;
							return finalvalue + unit;
						}) 
					);
				});
			});		
			
			//Finish
			if( per === 1 ){
				window.clearTimeout( id );
				if(fn) fn.call( $this );
			}else window.setTimeout( run,interval );
		},interval);

		return this;
	},
	
	push: function( els ){
		if( els.nodeName )
			this.bag.push( els );
		else if( els.constructor == Array )
			this.bag = this.bag.concat( els );
		else if( els.constructor == ge )
			this.bag = this.bag.concat( els.bag );
		return this;
	},

	slice: function( from,to ){
		this.bag = this.bag.slice( from,to );
		return this;
	},

	nth: function( i ){
		var lng = this.length;
		return i === -1 ? this.slice( lng-1,lng ) : this.slice( i-1,i ); 
	},

	last: function(){
		return this.nth( -1 );
	},

	first: function(){
		return this.nth( 1 );
	}
};

ge.makeArray = function( obj ){
	var lng = obj.length,
		arr = [],
		i = 0;
	ge.each( obj,function(i){
		if( obj[ i ] !== undefined )
			arr[ i ] = obj[ i ];
	});
	return arr;
};

ge.now = function(){
	return ( new Date() ).getTime();
};

ge.css = function( props,els ){
	if( ge.isStr(els) ){
		arguments[2].style[ props ] = els; 
	}
	if(els.nodeName && els.nodeType){
		if( typeof props == "string" ){
			if( window.getComputedStyle )
				return window.getComputedStyle( els )[ ge.decamel(props) ]
						|| els.style[ ge.camel( props ) ];
			else if( document.currentStyle )
				return els.currentStyle[ ge.decamel(props) ];
		}
		ge.each(props,function(i,prop,val){			
			if( typeof val == "number" && prop !== "opacity" )
				els.style[ prop ] = val + "px";
			else
				els.style[ prop ] = val;
		});
	};
};

ge.each = function( arr,fn ){
	var i = 0;
	if( arr.constructor == Object )
		for( var key in arr)
			fn.call( arr[key],i++,key,arr[key] );
	else
		for( var count=arr.length;i<count;i++ )
			fn.call( arr[ i ],i,arr[ i ] );
};

ge.each({

	isNumber: function( number ){
		return number.constructor == Number;
	},

	isStr: function( str ){
		return str.constructor == String;
	},

	isArr: function( arr ){
		return arr.constructor == Array;
	},

	isObj: function( obj ){
		return obj.constructor == Object;
	},

	isFn: function( fn ){
		return fn.constructor == Function
	}

}, function( i,name,val ){
	ge[ name ] = val;	
});

ge.merge = function( to ){
	ge.each( arguments,function( i,idx,obj ){
		if( i !== 0 ){
			ge.each( obj,function( u,key,val ){
				to[ key ] = val;
			} );
		};
	} );
	return to;
};

ge.parserOpts = function( options ){
	var opts = {
		duration: 0.6,
		finish: function(){ },
		easing: void 0
	};
	if( options == undefined )
		return opts;

	if( ge.isObj( options ) ){
		return ge.merge( opts,options );
	};

	ge.each(arguments, function( i,key,val ){
		if( val !== undefined )
			if ( ge.isNumber( val ) )
				opts.duration = val;
			else if( ge.isStr( val ) )
				opts.easing = val;
			else if( ge.isFn( val ) )
				opts.finish = val;
	});
	return opts;
};
//Strings manipulation

ge.cssMath = function( str1,str2,op ){
var n1 = parseFloat( str1,10 ),
	n2 = parseFloat( str2,10 ),
	leUnit = unit.test( str1 ) ? str1.match( unit )[0] : "";
	
	return eval( n1 + op + n2 ) + leUnit;
};

ge.decamel = function( str ){
	return str.replace(/([A-Z])/g,function(exp,letter){
			return "-" + letter.toLowerCase();
	});
};

ge.camel = function( str ){
	return str.replace(/^-/,"").replace(/-([a-z])/g,function(exp,letter){
			return letter.toUpperCase();
	});
};

ge.trim = function( str ){
	return str.replace( /^\s+|\s+$/,"" );
};

ge.easings = {
};
ge.queue = [];

//----Extend functions----

//Category: Events

ge.bind = function( el,evnts,fn ){
	var evnt = evnts.split(" ");
	
	if ( el.addEventListener )
		ge.each( evnt,function( i ){
			el.addEventListener( evnt[ i ],fn,false );
		} );
	else if ( el.attachEvent )
		ge.each( evnt,function( i ){
			el.attachEvent( "on" + evnt[ i ],fn );
		} );	
};

ge.fn.bind = function( evnts,fn ){
	this.each( function(){
		ge.bind( this,evnts,fn );
	} );
	return this;
};

ge.fn.click = function( fn ){
	this.each(function(){
		ge.bind( this,"click",fn );
	});
	return this;
}

ge.fn.move = function( fn ){
	this.each(function(){
		ge.bind( this,"mousemove",fn );
	});
	return this;
};

ge.fn.mousedown = function( fn,fn2 ){
	this.each(function(){
		ge.bind( this,"mousedown",fn );
	});
	if( fn2 )
	this.each(function(){
		ge.bind( this,"mouseup",fn2 )
	});
	return this;
};

ge.fn.mouseup = function( fn,fn2 ){
	this.each(function(){
		ge.bind( this,"mouseup",fn );
	});	
	if( fn2 )
		this.each(function(){
			ge.bind( this,"mousedown",fn2 )
		});
	return this;
};

ge.fn.hover = function( fn,fn2 ){
	this.each(function(){
		ge.bind( this,"mouseover",fn );
	});	
	if( fn2 )
		this.each(function(){
			ge.bind( this,"mouseout",fn2 )
		});
	return this;
};

//Category: DOM manipulate
ge.fn.attr = function( attrs,val ){
	if( typeof attrs == "string" && !val)
		return this.bag[0].getAttribute( attrs );
	if( typeof attrs == "string" )
		this.each(function(){
			this.setAttribute( attrs,val );
		});
	else 
		this.each(function(i,el){
			ge.each( attr,function(i,attr,val){
				el.setAttribute( attr,val );
			} );
		})
	return this;
};

ge.fn.addClass = function( classes ){
	this.each(function(){
		var oldClasses = this.getAttribute( "class" ) || "";
			oldClasses = ge.trim(oldClasses);
		this.setAttribute( "class",oldClasses + " " + classes )
	});
	return this;
};

ge.fn.removeClass = function( classes ){
	var klass = classes.split(" ");
	this.each(function(){
		var oldClasses = this.getAttribute( "class" ) || "";
		ge.each( klass,function( i ){
			oldClasses = oldClasses.replace( klass[i],"" );
		} );
		oldClasses = ge.trim( oldClasses )
		this.setAttribute( "class",oldClasses );
	});
	return this;
};

//Make global
ge.fn.meet.prototype = ge.fn;
window.$ = window._ = window.ge = ge;
})(window);

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
	digits = /\d+/g,
	simpleVal = /(\d+)([a-z%]+)/gi,
	words = /[a-z]+/gi,
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
			var _t = this;
			ge.each(sel,function(i, key, val){
				_t[ key ] = val;
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
				this.style[ props ] = val;
			});
			return this;
		};
		if( typeof props == "string" ){
			if( window.getComputedStyle )
				return window.getComputedStyle( this.bag[0] )[ ge.decamel(props) ]
						|| this.bag[0].style[ ge.camel(props) ];
			else if( document.currentStyle )
				return this.bag[0].currentStyle[ ge.decamel(props) ];
		}
		ge.each(this.bag,function(){
			for(var key in props){
				if( typeof props[ key ] == "number" && key !== "opacity" )
					this.style[ key ] = props[ key ] + "px";
				else{
					if( props[key].charAt(0) == "+" || props[key].charAt(0) == "-" )
						this.style[ key ] = 
							ge.cssMath( ge.css( ge.decamel(key) ,this ), to , props[key].charAt(0) ) ;
					else
						this.style[ key ] = props[ key ];
				}
			}
		});
		return this;
	},
	
	attr: function( props ){
		if( typeof props == "string" ){
			return this.bag[0].getAttribute( props );
		}
		ge.each( this.bag,function(){
			for( var key in props ){
				this.setAttribute( key,props[key] );
			};
		});
		return this;
	},
	
	animelt: function(){
		var props, 
			opts = {}, 
			fn, lenArg = arguments.length;
		props = arguments[ 0 ];

		arguments = [].slice.call( arguments,1,lenArg-1 );
		
		ge.each( arguments,function(){
			switch( typeof this ){
				case "number": opts.duration = this; break;
				case "string": opts.easing = this; break;
				case "function": fn = this; break;
			}
		} );

		//If no opts.duration he assumes, the defualt value, 600ms.
		if( !opts ) opts = { duration:0.6 };
		
		if( !opts.duration ) opts.duration = 0.6;
		
		opts.duration = opts.duration * 1000;

		var start, now,
			diff = [], from = [], leUnit = [],
			diffComplex = [], fromComplex = [], //A local reserved for complex values
			per,
			easing = opts.easing ? ge.easings[ opts.easing ] : function( p ){ return p; },
			interval = opts.fps ? Math.round( 1000/opts.fps ) : 20;
			
		var els = this.bag,
			lethis = this;
		//'Precreate' a local for store the props values from,diff,unit
		ge.each( els,function( elIndex ){			
			from[elIndex] = [];
			diff[elIndex] = [];
			leUnit[elIndex] = [];
			fromComplex[elIndex] = [];
			diffComplex[elIndex] = [];				
		} );		
		
		ge.each( props,function( i,prop,val ){
			for(var elIndex=0,elCounter=els.length;elIndex < elCounter;elIndex++){
				var theVal = ge.css( prop,els[elIndex] );
				
				fromComplex[elIndex][i] = els[elIndex].style[ ge.camel(prop) ].match(digits) || (theVal.match(digits) || [0]);
				diffComplex[elIndex][i] = [];
				
				for( var cnt = 0,matches=val.match(digits),lngt=matches.length;cnt<lngt;cnt++ ){
					fromComplex[elIndex][i][cnt] *= 1;
					diffComplex[elIndex][i][cnt] = matches[cnt] - (fromComplex[elIndex][i][cnt] || 0);
				};
			};

		} );
		
		//We're go!
			start = ge.now();
		var id = window.setTimeout(function run(){
		
			now = ge.now();
			per = ( now - start ) / opts.duration;
			
			if ( per > 1 ) per = 1;
			per = easing( per );
			
			ge.each(props,function( i,prop,val ){
				var elIndex = 0;
				ge.each( els,function( ){
						//The magic, but this incremental feature have a less performance
						// :(
						var x = 0;
						this.style[ prop ] = val.replace(simpleVal,function(exp,num,unt){
							return fromComplex[elIndex][i][x] + diffComplex[elIndex][i][x] * per + unt;
							x++;
						});	
					elIndex++;
				});
			});
			
			//Finish
			if( per === 1 ){
				window.clearTimeout( id );
				if(fn) fn.call( lethis );
			}else window.setTimeout( run,interval );
		},interval);

		return this;
	},
	
	push: function( els ){
		if( els.nodeName )
			this.bag.push( els );
		if( els.constructor == Array )
			this.bag = this.bag.concat( els );
		if( els.constructor == ge )
			this.bag = this.bag.concat( els.bag );
		return this;
	},

	last: function(){
		return ge( this.bag[ this.length-1 ] );
	},

	first: function(){
		return ge( this.bag[0] );
	}
};

ge.makeArray = function( obj ){
	var lng = obj.length;
	return [].slice.call( obj,0,lng );
};

ge.now = function(){
	return ( new Date() ).getTime();
};

ge.css = function( props,els ){
	if(els.nodeName && els.nodeType){
		if( typeof props == "string" ){
			if( window.getComputedStyle )
				return window.getComputedStyle( els )[ props ];
			else if( document.currentStyle)
				return els.currentStyle[ props ];
		}
		ge.each(props,function(i,val){			
			els.style[val] = this;
		});
	};
};

ge.each = function( arr,fn ){
	var i = 0;
	if( arr.constructor == Object ){
		for( var val in arr)
			fn.call( arr[val],i++,val,arr[val] );
	}
	else if( arr.constructor == Array ){
		for( var count=arr.length;i<count;i++ ){
			fn.call( arr[ i ],i,arr[ i ] );
		};
	};
};

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

ge.bind = function( el,evnts,fn ){
	var evnt = evnts.split(" ");
	
	if ( el.addEventListener )
		ge.each( evnt,function( i ){
			el.addEventListener( evnt[ i ],fn );
		} );
	else if ( el.attachEvent )
		ge.each( evnt,function( i ){
			el.attachEvent( "on" + evnt[ i ],fn );
		} );	
};

ge.easings = {
};
ge.queue = [];

//Extend functions
ge.fn.bind = function( evnts,fn ){
	this.each( function(){
		ge.bind( this,evnts,fn );
	} );
};

ge.fn.move = function( fn ){
	this.each(function(){
		ge.bind( this,"mousemove",fn );
	});
};

ge.fn.mousedown = function( fn,fn2 ){
	this.each(function(){
		ge.bind( this,"mousedown",fn );
	});
	if( fn2 )
	this.each(function(){
		ge.bind( this,"mouseup",fn2 )
	});
};

ge.fn.mouseup = function( fn ){
	this.each(function(){
		ge.bind( this,"mouseup",fn );
	});	
	if( fn2 )
	this.each(function(){
		ge.bind( this,"mousedown",fn2 )
	});
};

ge.fn.on = function( evnts ){
	var on = false;
	this.bind( evnts,function(){
		on ? true : false;
	} );
	return on;
}
ge.fn.dragOn = function(){
	
};

function dragTo( e ){
	e = e || window.event;
	var x = e.clientX ? e.clientX : e.screenX,
		y = e.clientY ? e.clientY : e.screenY;
	x = x - e.target.offsetLeft;
	y = y - e.target.offsetTop;
	return {
		x: x,
		y: y
	};
};
//Make global
ge.fn.meet.prototype = ge.fn;
window.$ = window._ = window.ge = ge;
})(window);

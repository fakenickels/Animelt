//Project start: Sex 06 Abr 2012 00:22:51 BRT 
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

		//E.g, get a jQuery NodeList
		if( typeof sel == "object" ){
			this.bag = ge.makeArray( sel );
			return this;
		};
		
		this.selector = sel;
		var ctx = ctx || document; this.context = ctx;
		
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
		if( typeof props == "string" ){
			if( window.getComputedStyle )
				return window.getComputedStyle( this.bag[0] )[ ge.decamel(props) ];
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
	
	animelt: function( props,opts,fn ){
		
		if( typeof opts == "number" ){
			var wait = opts,
				opts = { duration:wait };
		};
		
		if( typeof opts == "function" && !fn ){
			var fn = opts,
				opts = { duration:600 };
		};
		
		//If no opts.duration he assumes, the defualt value, 600ms.
		if( !opts ) var opts = { duration:600 };
		
		if( !opts.duration ) opts.duration = 600;
		
		var start, now,
			diff = [], from = [], leUnit = [],
			per,
			easing = opts.easing ? ge.easings[ opts.easings ] : function( p ){ return p; },
			interval = opts.fps ? Math.round( 1000/opts.fps ) : 25;
			
		var els = this.bag,
			 lethis = this;
			 
		//'Precreate' a local for store the props values from,diff,unit
		ge.each( els,function( elIndex ){			
			from[elIndex] = [];
			diff[elIndex] = [];
			leUnit[elIndex] = [];				
		} );		
		
		ge.each( props,function( i,prop,val ){
			for(var elIndex=0,elCounter=els.length;elIndex < elCounter;elIndex++){
				var theVal = ge.css( prop,els[elIndex] ),
				
					//Verify for complex values, e.g. "rotate(90deg)";
					isComplex = complex.test( val );
				if( !theVal ) continue;
				if(!isComplex){
					from[elIndex][i] = parseFloat( theVal,10 ) || 0;
					
					if( from[elIndex][i] ==  parseFloat( val,10 ) )
						from[elIndex][i] = 0;
						
					diff[elIndex][i] = parseFloat( val,10 ) - from[elIndex][i];
					
					//Get the unit used
					if( unit.test( val ) ){
					//If this is in @val, get the unit from @val
						leUnit[elIndex][i] = val.match( unit )[0];
					}else{
					//Find the unit in origin value - @theVal
						if( prop !== "opacity" )
							leUnit[elIndex][i] = unit.test(theVal) ? theVal.match(unit)[0] : "";
						else
							leUnit[elIndex][i] = ""; 
					};
				};
			};

		} );
		
		//We're go!
			start = ge.now();
		var id = window.setInterval(function(){
		
			now = ge.now();
			per = ( now - start ) / opts.duration;
			
			if ( per > 1 ) per = 1;
			per = easing( per );
			
			ge.each(props,function( i,prop,val ){
				ge.each( els,function( elIndex ){
					var isComplex = complex.test(val),
						finalValue;
					if( opts.step ) { var _t = this; opts.step.call( _t,per ) };
					
					if( !isComplex ){
						finalValue = from[elIndex][i] + diff[elIndex][i]*per + leUnit[elIndex][i];	
					}else{
						//The magic, but this incremental feature have a less performance
						// :(
							finalValue = val.replace(simpleVal,function(exp,num,unt){
								return Number( num ) * per  + unt;
							});
					};
					this.style[ prop ] = finalValue;
				});
			});
			
			//Finish
			if( per === 1 ){
				window.clearInterval( id );
				if(fn) fn.call( lethis );
			};
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
	}
};

ge.makeArray = function( obj ){
	var lng = obj.length;
	return Array.prototype.slice.call( obj,0,lng );

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
		for( var val in arr){
			fn.call( arr[val],i,val,arr[val] );
			i++;
		};
	}
	if( arr.constructor == Array ){
		for( var count=arr.length;i<count;i++ )
			fn.call( arr[i],i,arr[i] );
	}
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
ge.queue = [];

//Make global
ge.fn.meet.prototype = ge.fn;
window.$ = window._ = window.ge = ge;
})(window);

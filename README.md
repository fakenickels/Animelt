Animelt
============

# Contributors 

- [Judson Barroso](https://github.com/judsonbsilva) (helped me to enhance A LOT the regex engine]

# Demonstration of use

You can call Animelt Lib on this way: ge( selector ), $( selector ) and _( selector )

### "Animeltizing"

```javascript
//Syntax sample
$( sel ).animelt( props,duration,finish,easing );
```
e.g.
```javascript
$("div").animelt({
	width: "40px",
	border: "2px solid #000"
}, 1, function(){
	console.log("It's finished!");
});

$("div").animelt({
	"-webkit-transform": "rotateX(30deg) rotateY(120deg)",
	boxShadow: "0px 0px 20px #000"
}, 0.6);
```

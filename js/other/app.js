window.onload = function() {
	dom = app.dom;
	colors = app.storage.colors;
	fonts = app.storage.fonts;
	sizes = app.storage.sizes;
	body = document.getElementsByTagName('body')[0];
	body.style.background = colors.gray8;
	var winWidth = window.innerWidth;
	var winHeight = window.innerHeight;
	app.init(winWidth,winHeight);
}
var dom;
var body;
var colors;
var fonts;
var sizes;
var app = {
	setVariables: function(winWidth,winHeight) {
		var $ = this;
		$.partsHeight = 400;
		$.partTops = (winHeight-$.partsHeight)/2+20;
		$.middleSpacing = 20;
		$.planeWidth = 800;
		$.sideBarWidth = 340;
		$.sampleRate = 44100;
		$.nyquist = $.sampleRate/2;
		$.numOctaves = Math.log($.nyquist/10)/Math.LN2;
		$.initialTabName = 'wave';
	},
	filterValueToReal: function(property,value) {
		var $ = this, realValue;
		if(property==='frequency') {
			realValue = $.nyquist*Math.pow(2,$.numOctaves*(value-1));
		} else if(property==='Q-factor') {
			realValue = 1000*Math.pow(2,20*(value-1)); // fudged, idk what i'm doing but it works
		} else {
			realValue = value;
		}
		return realValue;
	},
	init: function(winWidth,winHeight) {
		var $ = this;
		$.storage.init();
		$.dom.init();
		$.setVariables(winWidth,winHeight);
		$.player.init();
		$.plane.init(winWidth,winHeight);
		$.sideBar.init(winWidth,winHeight);
		$.tabs.init(winWidth,winHeight);
		$.help.init(winWidth,winHeight);
	}
}
// extras
	function preservePointer() {
		body.style.cursor = 'pointer';
	}
	function defaultCursor() {
		body.style.cursor = 'default';
	}
	function nsResizeCursor() {
		body.style.cursor = 'ns-resize';
	}
	function ewResizeCursor() {
		body.style.cursor = 'ew-resize';
	}
	window.oncontextmenu = function(e) {
		e.preventDefault();
	}
	function preventDefaults() {
		window.addEventListener('mousedown',function(e) {
			e.preventDefault();
		});
		window.addEventListener('mousemove',function(e) {
			e.preventDefault();
		});
	}
	preventDefaults();
	// exiting
		exiting = undefined;
		window.addEventListener('mousedown',function() {
			if(exiting) {
				exiting();
				exiting = undefined;
			}
		});
	function randomColor() {
		var colors = ['blue','green','red','yellow','orange','purple'];
		return colors[Math.floor(Math.random()*colors.length)];
	}
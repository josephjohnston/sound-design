app.plane.wave = {
	setVariables: function() {
		var $ = this, plane = app.plane;
		$.width = plane.width;
		$.height = plane.height;
		$.points = []; // drawn points
		for(var i=0, half=$.height/2; i<$.width; i++) {
			$.points.push(half);
		}
		$.dragging = false;
		$.lastX;
		$.wave = undefined; // calculated points
		$.coefs = {
			real: undefined,
			imag: undefined
		}
		$.totalCoefs = undefined;
		$.lastDrawnPoints = $.points.slice(0);
	},
	toggleMode: function() {
		var $ = this;
		$.redraw();
	},
	sendCoefs: function() {
		var $ = this;
		return $.coefs;
	},
	sendStatic: function() {
		var $ = this,
			staticWave = $.points.slice(0);
		 $.convertAmp(staticWave);
		return staticWave;
	},
	showOriginal: function() {
		var $ = this;
		$.newWave($.lastDrawnPoints);
	},
	newWave: function(wave) {
		var $ = this;
		//$.points = Array.prototype.slice.call(wave);
		$.points = wave.slice(0);
		$.redraw();
	},
	drawDefault: function(type) {
		var $ = this,
			wave = [];
		if(type==='sine') {
			for(var i=0; i<$.width; i++) {
				wave[i] = Math.sin((i*2*Math.PI)/$.width);
			}
		} else if(type==='square') {
			for(var i=0; i<$.width; i++) {
				if(i===0) {
					wave[i] = 0;
				} else if(i===$.width-1) {
					wave[i] = 0;
				} else if(i<$.width/2) {
					wave[i] = 0.995;
				} else {
					wave[i] = -0.995;
				}
			}
		} else if(type==='sawtooth') {
			var increment = 2/$.width;
			for(var i=0; i<$.width; i++) {
				if(i<$.width/2) {
					wave[i] = i*increment;
				} else {
					wave[i] = i*increment-2;
				}
			}
		} else if(type==='triangle') {
			var increment = 2/($.width/2);
			for(var i=0; i<$.width; i++) {
				if(i<$.width/4) {
					wave[i] = i*increment;
				} else if(i<$.width*3/4) {
					wave[i] = -(i*increment)+2;
				} else {
					wave[i] = i*increment-4;
				}
			}
		}
		$.reverseAmp(wave);
		$.lastDrawnPoints = wave.slice(0);
		$.newWave(wave);
	},
	mousedown: function(mouse) {
		var $ = this, x = mouse.x;
		if(app.sideBar.wave.waveType!=='custom') return;
		$.showingWave = false;
		$.dragging = true;
		$.lastX = x;
		$.points[x] = mouse.y;
		$.redraw();
	},
	mouseup: function(mouse) {
		var $ = this;
		if($.dragging) $.lastDrawnPoints = $.points.slice(0);
		$.dragging = false;
		$.lastX = undefined;
	},
	mousemove: function(mouse) {
		var $ = this;
		if(!$.dragging) return;
		var points = $.points,
			x = Math.floor(mouse.x), y = Math.floor(mouse.y),
			lastX = $.lastX;
		if(lastX+1<x) {
			var diffX = x-lastX,
				diffY = points[lastX]-y;
			for(var i=0; i<diffX+1; i++) {
				var percDiff = i/diffX,
					aproxY = Math.round(points[lastX]-percDiff*diffY);
				$.points[lastX+i] = aproxY;
			}
		} else if(x<lastX-1) {
			var diffX = lastX-x,
				diffY = points[lastX]-y;
			for(var i=diffX; i>-1; i--) {
				var percDiff = i/diffX,
					aproxY = Math.round(points[lastX]-percDiff*diffY);
				$.points[lastX-i] = aproxY;
			}
		} else $.points[x] = y;
		$.lastX = x;
		$.redraw();
	},
	redraw: function() {
		var $ = this, ctx = app.plane.canvas.context;
		ctx.clearRect(0,0,$.width,$.height);
		ctx.beginPath();
		ctx.moveTo(0,$.points[0]);
		// var pointsToSkip = Math.round($.width/$.points.length);
		for(var i=0; i<$.width; i++) {
			ctx.lineTo(i,$.points[Math.round((i/$.width)*$.points.length)]);
		}
		// var grad = ctx.createLinearGradient(0,0,0,$.height);
		// for(var i=0; i<360; i++) {
		// 	grad.addColorStop(i/360,'hsl('+(i-40)+',100%,50%)');
		// }
		// ctx.strokeStyle = grad;
		ctx.strokeStyle = colors.wave;
		ctx.lineWidth = 2;
		ctx.stroke();
	},
	crunch: function(totalCoefs) {
		var $ = this,
			totalCoefs = totalCoefs,
			realCoefs = [],
			imagCoefs = [];
		// var pointsString = '';
		// for(var i=0; i<$.points.length; ++i) {
		// 	pointsString += $.points[i]+',';
		// }
		// console.log(pointsString);
		$.wave = $.lastDrawnPoints.slice(0);
		$.convertAmp($.wave);
		for(var i=0; i<totalCoefs; ++i) {
			// real coef
				var cosSubWave = $.calcCosSub(i),
					cosSubInt = $.calcIntegral(cosSubWave),
					cosCoef = $.calcCoef(cosSubInt);
				if(i%totalCoefs===0) cosCoef /= 2;
				realCoefs.push(cosCoef);
			// imag coef
				if(i===0) var sinCoef = 0;
				else {
					var sinSubWave = $.calcSinSub(i),
						sinSubInt = $.calcIntegral(sinSubWave);
						sinCoef = $.calcCoef(sinSubInt);
				}
				imagCoefs.push(sinCoef);
		}
		$.coefs.real = new Float32Array(realCoefs);
		$.coefs.imag = new Float32Array(imagCoefs);
		$.reverse(totalCoefs);
	},
	calcCosSub: function(subNum) {
		var $ = this, cosSubWave = [];
		function basis(t) {
			return Math.cos((2*Math.PI)*(subNum*t));
		}
		for(var i=0; i<$.wave.length; i++) {
			cosSubWave.push($.wave[i]*basis(i/$.wave.length));
		}
		return cosSubWave;
	},
	calcSinSub: function(subNum) {
		var $ = this, sinSubWave = [];
		function basis(t) {
			return Math.sin((2*Math.PI)*(subNum*t));
		}
		for(var i=0; i<$.wave.length; i++) {
			sinSubWave.push($.wave[i]*basis(i/$.wave.length));
		}
		return sinSubWave;
	},
	calcIntegral: function(wave) {
		var $ = this,
			rectNum = wave.length,
			rectWidth = 1/rectNum,
			area = 0;
		for(var i=0; i<wave.length; i++) {
			area += wave[i]*rectWidth;
		}
		return area;
	},
	calcCoef: function(integral) {
		var $ = this;
		return 2*integral;
	},
	reverse: function(totalCoefs) {
		var $ = this, compositeWave = [];
		// make empty
			for(var i=0; i<$.wave.length; ++i) compositeWave.push(0);
		// generate and sum waves
			for(var i=0; i<totalCoefs; ++i) {
				var cosSubWave = $.reverseCosSub($.coefs.real[i],i),
					sinSubWave = $.reverseSinSub($.coefs.imag[i],i);
				for(var j=0; j<compositeWave.length; j++) {
					compositeWave[j] += cosSubWave[j]+sinSubWave[j];
				}
			}
		// reverse back to canvas form
			$.reverseAmp(compositeWave);
		// send to editor
			$.newWave(compositeWave);
	},
	reverseCosSub: function(coef,subNum) {
		var $ = this,
			cosWave = [];
		for(var i=0; i<$.wave.length; ++i) {
			var periodDec = i/$.wave.length,
				point = coef*Math.cos((2*Math.PI)*(subNum*periodDec));
			cosWave.push(point);
		}
		return cosWave;
	},
	reverseSinSub: function(coef,subNum) {
		var $ = this,
			sinWave = [];
		for(var i=0; i<$.wave.length; ++i) {
			var periodDec = i/$.wave.length,
				point = coef*Math.sin((2*Math.PI)*(subNum*periodDec));
			sinWave.push(point);
		}
		return sinWave;
	},
	reverseAmp: function(wave) {
		var $ = this,
			height = $.height,
			inTo = height/2,
			offset = height/2;
		for(var i=0; i<wave.length; ++i) {
			var point = wave[i];
			// multiply percent
				point = point*inTo;
			// zero from middle to bottom
				point = point+offset;
			// zero from bottom to top
				point = height-point;
			wave[i] = point;
		}
	},
	convertAmp: function(wave) {
		var $ = this,
			height = $.height,
			offset = height/2,
			outOf = height/2;
		for(var i=0; i<wave.length; ++i) {
			var point = wave[i];
			// zero from top to bottom
				point = height-point;
			// zero from bottom to middle
				point = point-offset;
			// take percent
				point = point/outOf;
			wave[i] = point;
		}
	},
	setState: function() {
		var $ = this;
		// $.points = [200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,127,127,127,127,127,128,128,128,128,129,130,131,131,132,133,134,135,136,137,137,138,139,140,141,142,143,144,146,147,148,149,150,151,152,153,154,156,157,158,159,160,161,162,163,164,165,167,168,169,170,171,172,173,175,176,177,178,180,181,182,183,185,186,187,188,190,191,192,193,194,196,197,198,199,201,202,203,204,206,207,208,209,210,211,212,213,214,216,217,218,219,220,221,222,223,224,225,226,227,228,229,231,232,233,234,235,236,237,238,239,240,241,242,242,243,244,245,246,247,248,249,250,251,251,252,253,254,255,256,257,258,259,259,260,261,262,263,264,265,266,267,268,268,269,270,271,272,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,345,345,345,344,344,343,341,340,338,336,335,333,331,329,328,326,324,322,320,319,317,315,313,311,310,308,306,304,303,301,300,298,297,295,293,292,290,289,287,285,284,282,281,279,278,276,274,273,271,270,268,267,265,264,263,261,260,259,257,256,255,253,252,251,249,248,247,245,244,242,241,240,238,237,236,234,233,232,230,229,228,226,225,224,223,222,220,219,218,217,216,215,214,213,211,210,209,208,207,206,205,204,202,201,200,199,198,197,196,195,193,192,191,190,189,188,187,186,184,183,182,181,180,179,178,177,176,175,174,173,172,171,170,169,168,167,166,165,164,163,162,161,160,159,158,157,156,155,154,153,152,151,150,149,148,147,146,145,144,143,142,141,139,138,137,136,135,134,133,132,131,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200];
		$.points = [200,200,200,200,200,200,200,227,224,220,217,214,211,207,204,201,199,196,193,190,188,185,182,179,177,174,171,168,166,163,160,157,155,152,149,146,144,141,138,135,133,130,127,124,122,119,118,118,117,116,118,119,299,298,297,295,294,293,292,291,289,288,287,286,284,283,281,280,279,278,277,276,275,274,273,272,271,270,269,268,267,266,265,264,263,262,261,260,259,258,257,256,255,254,253,252,251,250,249,248,246,245,244,243,241,240,239,238,237,235,234,233,232,230,229,228,227,226,224,223,222,221,220,218,217,216,216,216,276,274,273,273,272,270,268,266,264,263,261,259,257,254,252,249,247,244,241,237,234,231,228,226,223,220,217,214,211,207,204,201,200,198,197,196,194,193,193,192,192,192,192,192,192,192,193,193,194,195,197,199,202,204,208,211,214,217,220,223,226,231,236,241,244,248,251,254,257,261,264,266,268,270,272,275,277,279,281,283,285,287,288,290,292,294,295,297,299,300,301,302,303,304,305,306,307,308,308,308,309,309,309,309,309,309,310,310,310,310,310,310,310,310,310,309,309,309,309,308,308,308,308,308,308,307,305,304,303,302,301,300,299,298,297,296,295,294,292,291,290,288,287,286,285,283,282,281,280,278,277,276,275,273,272,271,270,268,267,266,265,264,263,262,260,259,258,257,256,255,254,253,252,250,249,248,247,246,245,244,243,241,240,239,238,237,236,235,235,234,233,232,232,231,230,229,229,228,227,226,226,225,224,223,223,222,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,224,227,265,264,263,261,259,257,254,252,250,248,246,244,243,241,239,237,234,231,229,226,223,220,218,215,212,209,206,203,200,196,193,190,187,182,178,173,169,164,161,157,154,150,147,144,141,139,136,133,129,125,124,123,122,121,122,122,123,123,124,124,125,125,126,127,128,129,129,130,131,132,133,134,136,137,138,139,141,142,143,145,146,148,149,151,152,154,156,157,159,160,162,163,165,166,168,170,172,174,176,178,180,181,183,185,187,189,191,193,196,199,202,205,208,211,214,217,220,223,226,229,236,244,251,268,267,266,264,263,262,260,259,257,256,254,253,251,250,249,247,246,245,243,242,240,239,238,236,235,234,232,231,229,228,226,225,223,222,220,219,217,216,214,213,211,210,208,207,205,204,202,201,199,198,196,195,194,192,191,190,189,187,186,185,183,182,181,179,178,177,175,174,173,172,170,169,168,166,165,164,163,162,161,213,212,211,210,209,208,207,206,205,205,205,205,265,265,265,264,264,264,264,264,263,263,263,262,262,262,262,261,261,261,260,260,260,259,259,259,259,258,258,258,258,257,257,257,257,256,256,256,255,255,255,255,254,254,254,253,253,253,253,252,252,252,251,251,251,251,250,250,250,250,250,250,250,249,249,249,249,249,249,248,247,247,254,253,252,250,249,248,247,246,245,244,243,242,242,241,240,239,238,237,236,235,235,234,233,232,232,231,230,230,229,228,227,227,226,225,225,224,223,223,222,221,220,220,219,219,219,219,219,219,218,218,218,218,218,218,218,218,218,220,222,229,288,287,287,286,285,284,283,282,282,281,280,280,279,279,278,277,277,276,275,274,274,273,272,271,270,269,269,268,267,266,265,265,264,263,262,262,261,260,259,259,258,257,256,256,255,254,253,253,252,251,250,250,249,248,247,247,246,245,244,244,243,242,241,240,239,238,238,237,236,235,234,233,232,231,231,230,229,228,228,227,226,225,225,224,223,222,222,221,220,219,218,217,216,215,214,213,212,210,209,208,208.5,200,200,200,200];
		$.lastDrawnPoints = $.points.slice(0);
	},
	init: function() {
		var $ = this;
		$.setVariables();
		$.setState();
	}
}
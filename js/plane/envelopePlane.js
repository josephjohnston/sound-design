app.plane.envelope = {
	setVariables: function() {
		var $ = this;
		$.canvas = app.plane.canvas;
		$.width = app.plane.width;
		$.height = app.plane.height;
		$.propertyNames = app.player.envelopeProperties;
		$.properties = {};
	},
	toggleMode: function() {
		var $ = this;
		$.draw();
	},
	convertVert: function(value) {
		var $ = this;
		return value*$.height/2;
	},
	convertHoriz: function(value) {
		var $ = this;
		return value/4*$.width;
	},
	changeProperty: function(property,type,value) {
		var $ = this, object = $.properties[property];
		if(property==='sustain') object.value = $.convertVert(value);
		else object.value = $.convertHoriz(value);
		if(property!=='sustain') object.type = type;
		$.draw();
	},
	calculateExponential: function(x0,y0,x1,y1) {
		var $ = this,
			values = [];
		for(var x=x0; x<=x1; x++) {
			values.push(y0*Math.pow((y1/y0),(x-x0)/(x1-x0)));
		}
		return values;
	},
	draw: function() {
		var $ = this,
			ctx = $.canvas.context;
		ctx.clearRect(0,0,$.canvas.width,$.canvas.height);
		// var grad = ctx.createLinearGradient(0,0,$.width,0);
		// for(var i=0; i<360; i++) {
		// 	grad.addColorStop(i/360,'hsl('+(i-40)+',100%,50%)');
		// }
		// ctx.strokeStyle = grad;
		// ctx.lineWidth = 4;
		ctx.fillStyle = colors.envelope;
		var attack = $.properties.attack,
			decay = $.properties.decay,
			sustain = $.properties.sustain,
			release = $.properties.release;
		ctx.beginPath();
		ctx.moveTo(release.value,$.height/2);
		// top
			// release
				if(release.type==='linear') {
					ctx.lineTo(decay.value,200-sustain.value);
				} else {
					var startX = decay.value,
						exp = $.calculateExponential(startX,sustain.value,release.value+1,0.0001);
					for(var e=exp.length-1; e>-1; e--) {
						ctx.lineTo(startX+e,-exp[e]+200);
					}
				}
			// decay
				if(decay.type==='linear') ctx.lineTo(attack.value,0);
				else {
					var startX = attack.value,
						exp = $.calculateExponential(startX,200,decay.value,sustain.value);
					for(var e=exp.length-1; e>-1; e--) {
						ctx.lineTo(startX+e,-exp[e]+200);
					}
				}
			// attack
				if(attack.type==='linear') ctx.lineTo(0,$.height/2);
				else {
					var exp = $.calculateExponential(0,0.0001,attack.value,200);
					for(var e=exp.length-1; e>-1; e--) {
						ctx.lineTo(e,-exp[e]+200);
					}
				}
			ctx.closePath();
			// ctx.stroke();
			ctx.fill();
		// bottom
			// release
				if(release.type==='linear') {
					ctx.lineTo(decay.value,$.height-(200-sustain.value));
				} else {
					var startX = decay.value,
						exp = $.calculateExponential(startX,sustain.value,release.value+1,0.0001);
					for(var e=exp.length-1; e>-1; e--) {
						ctx.lineTo(startX+e,exp[e]+200);
					}
				}
			// decay
				if(decay.type==='linear') ctx.lineTo(attack.value,$.height);
				else {
					var startX = attack.value,
						exp = $.calculateExponential(startX,200,decay.value,sustain.value);
					for(var e=exp.length-1; e>-1; e--) {
						ctx.lineTo(startX+e,exp[e]+200);
					}
				}
			// attack
				if(attack.type==='linear') ctx.lineTo(0,$.height/2);
				else {
					var exp = $.calculateExponential(0,0.0001,attack.value,200);
					for(var e=exp.length-1; e>-1; e--) {
						ctx.lineTo(e,exp[e]+200);
					}
				}
			ctx.closePath();
			// ctx.stroke();
			ctx.fill();
	},
	mousedown: function(mouse) {
	},
	mousemove: function(mouse) {
	},
	mouseup: function(mouse) {
	},
	setState: function() {
		var $ = this,
			envelopeValues = app.player.envelopeValues;
		for(var i=0; i<$.propertyNames.length; i++) {
			var property = $.propertyNames[i];
			$.properties[property] = {};
			var object = $.properties[property];
			object.type = 'linear';
			var value = envelopeValues[property];
			if(property==='sustain') object.value = $.convertVert(value);
			else object.value = $.convertHoriz(value);
		}
	},
	init: function() {
		var $ = this;
		$.setVariables();
		$.setState();
	}
}
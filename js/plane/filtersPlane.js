app.plane.filters = {
	setVariables: function() {
		var $ = this, plane = app.plane;
		$.canvas = plane.canvas;
		$.width = plane.width;
		$.height = plane.height;
		$.drawing = undefined;
		// $.on = undefined;
		$.nyquist = app.nyquist;
		$.dbScale = 60;
		$.binResolution = app.player.binResolution;
		$.numOctaves = app.numOctaves;
		$.pixelsPerDb = ($.height/2)/$.dbScale;
		$.animFrame = undefined;
	},
	dbToY: function(db) {
		var $ = this;
		return ($.height/2)-$.pixelsPerDb*db;
	},
	toggleMode: function() {
		var $ = this;
		$.toggleDrawing();
	},
	toggleDrawing: function() {
		var $ = this;
		if(!$.drawing) {
			$.animFrame = window.requestAnimationFrame(draw);
			$.drawing = true;
		} else {
			window.cancelAnimationFrame($.animFrame);
			$.drawing = false;
		}
		function draw() {
			$.draw();
			$.animFrame = window.requestAnimationFrame(draw);
		}
	},
	draw: function() {
		var $ = this,
			ctx = $.canvas.context,
			player = app.player,
			responses = player.sendFilterResponses(),
			frequencies = player.sendFrequencies();
		ctx.clearRect(0,0,$.canvas.width,$.canvas.height);
		// ctx.fillStyle = 'black';
		// ctx.fillStyle = colors.filters;
		// ctx.lineWidth = 1;
		// $.drawAxes();
		$.drawFilters(responses);
		$.drawComposite(responses);
		$.drawFrequencies(frequencies);
	},
	drawFilters: function(responses) {
		var $ = this, canvas = $.canvas, ctx = canvas.context,
			width = canvas.width,
			length = responses.length;
		for(var i=0; i<length; i++) {
			var response = responses[i],
				data = response.data,
				hue = response.hue;
			ctx.beginPath();
			ctx.moveTo(-10,-10);
			for(var r=0, y; r<data.length; r++) {
				y = $.dbToY(data[r]);
				ctx.lineTo(r,y);
			}
			ctx.lineTo(width+10,y);
			ctx.lineTo(width+10,-10);
			ctx.closePath();
			// if(response.active) ctx.strokeStyle = 'hsl('+hue+',100%,50%)';
			// else ctx.strokeStyle = 'hsl('+hue+',100%,80%)';
			// ctx.stroke();
			if(response.active) ctx.fillStyle = 'hsla('+hue+',100%,78%,0.7)';
			else ctx.fillStyle = 'hsla('+hue+',100%,86%,0.2)';
			ctx.fill();
		}
	},
	drawComposite: function(responses) {
		var $ = this, canvas = $.canvas, ctx = canvas.context,
			width = canvas.width;
		if(responses.length>0) var length = responses[0].data.length;
		ctx.beginPath();
		// ctx.moveTo(-10,-10);
		for(var i=0, y; i<length; i++) {
			y = 0;
			for(var r=0; r<responses.length; r++) {
				y += responses[r].data[i];
			}
			ctx.lineTo(i,$.dbToY(y));
		}
		// ctx.lineTo(width+10,y);
		// ctx.lineTo(width+10,-10);
		// ctx.closePath();
		ctx.lineWidth = 4;
		ctx.strokeStyle = colors.gray6;
		ctx.stroke();
		// ctx.fillStyle = 'hsla(0,0%,0%,0.2)';
		// ctx.fill();
	},
	drawAxes: function() {
		var $ = this, ctx = $.canvas.context;
		// frequency scale
			// $.numOctaves = ;
			var freqMarkSpace = $.width/$.numOctaves;
			for(var i=0; i<=$.numOctaves; i++) {
				var x = i*freqMarkSpace;
				ctx.beginPath();
				ctx.moveTo(x,0);
				ctx.lineTo(x,$.height);
				ctx.stroke();
				var num = $.nyquist*Math.pow(2,i-$.numOctaves),
					unit = ' Hz';
				// console.log(num);
				if(num>=1000) {
					num = num/1000;
					unit = ' kHz';
				}
				ctx.strokeText(num.toFixed(2)+unit,x+5,20);
			}
		// db scale
			for(var i=-$.dbScale; i<$.dbScale; i+=10) {
				var y = $.dbToY(i);
				ctx.beginPath();
				ctx.moveTo(0,y);
				ctx.lineTo($.width,y);
				ctx.stroke();
				ctx.strokeText(i+' db',$.width-40,y-5);
			}
	},
	drawFrequencies: function(frequencies) {
		var $ = this, length = frequencies.length,
			ctx = $.canvas.context;
		ctx.fillStyle = colors.gray6;
		// ctx.beginPath();
		for(var i=0, lastBinNum; i<length; i++) {
			var dec = i/length,
				frequency = $.nyquist*Math.pow(2,$.numOctaves*(dec-1)),
				binNum = Math.floor(frequency/$.binResolution);
			// if(binNum===lastBinNum) continue;
			var value = frequencies[binNum],
				percent = value/256,
				height = $.height*percent,
				offset = $.height-height,
				barWidth = $.width/length;
			// if(i===0) ctx.moveTo(i*barWidth,offset);
			// else ctx.lineTo(i*barWidth,offset);
			ctx.fillRect(i*barWidth,offset,barWidth,height);
			lastBinNum = binNum;
		}
		// for(var i=0; i<length; i++) {
		// 	var value = frequencies[i],
		// 		percent = value/256,
		// 		height = $.height*percent,
		// 		offset = $.height-height,
		// 		barWidth = $.width/length;
		// 	ctx.fillRect(i*barWidth,offset,barWidth,height);
		// }
		// ctx.stroke();
	},
	mousedown: function(mouse) {
		var $ = this;
	},
	mousemove: function(mouse) {
		var $ = this;
	},
	mouseup: function(mouse) {
		var $ = this;
	},
	setState: function() {
		var $ = this;
		$.drawing = false;
		// $.on = false;
	},
	init: function() {
		var $ = this;
		$.setVariables();
		// $.setState();
	}
}
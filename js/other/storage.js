app.storage = {
	// style
		setStyleAliasas: function() {
			var c = this.colors, f = fonts;
			// sidebar
				c.divActive = c.gray2;
				c.textActive = c.gray4;
				c.divInactive = c.gray5;
				c.textInactive = c.gray5;
			// slider
				c.railActive = c.gray3;
				c.blockActive = c.gray2;
				c.railInactive = c.gray5;
				c.blockInactive = c.gray5;
			// button
				c.buttonRegular = c.gray3point5;
				c.buttonHover = c.gray3;
				c.buttonActive = c.gray2;
			// fonts
				f.sideBar = f.text+'-UltraLight';
				f.button = f.text+'-UltraLight';
			// selector
				c.itemRegular = c.gray3point5;
				c.itemHover = c.gray3;
				c.itemActive = c.gray2;
		},
		colors: {
			// general colors
				black: 'hsl(0,0%,0%)',
				gray0: 'hsl(0,0%,12%)',
				gray1: 'hsl(0,0%,18%)',
				gray2: 'hsl(0,0%,24%)',
				gray3: 'hsl(0,0%,36%)',
				gray3point5: 'hsl(0,0%,42%)',
				gray4: 'hsl(0,0%,48%)',
				gray5: 'hsl(0,0%,60%)',
				gray6: 'hsl(0,0%,72%)',
				gray7: 'hsl(0,0%,84%)',
				gray8: 'hsl(0,0%,96%)',
				white: 'hsl(0,0%,100%)',
			// pages
				wave: 'hsl(123,50%,60%)',//'#60D166',// 123° 55% 60%
				filters: 'hsl(8,50%,60%)',//'#BE5D4E',// 8° 46% 53%
				envelope: 'hsl(282,50%,60%)'//'#9949BA'// 282° 45% 51%
		},
		fonts: {
			text: 'HelveticaNeue'
		},
		sizes: {
			sliderHeight: 10,
			sliderIconWidth: 3
		},
	instrumentTabs: {
		wave: function(ctx,side,state) {
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			var a = side*1/4, b = side*3/4, c = (a+b)/2, d = (b-a)/2;
			ctx.moveTo(a,b+d/8);
			ctx.quadraticCurveTo(c,0-d/4,b,c);
			ctx.arc(b-d/8,c+d/2,d/2,3/2*Math.PI,1/2*Math.PI,true);
			ctx.closePath();
			var colors = app.storage.colors;
			// if(state==='active') ctx.fillStyle = colors.gray1;
			ctx.fillStyle = colors.gray2;
			ctx.fill();
			// ctx.stroke();
		},
		filters: function(ctx,side,state) {
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			var a = side*1/4, b = side*3/4, c = (a+b)/2, d = (b-a)/2;
			ctx.moveTo(a,a);
			ctx.lineTo(c-d/4,c);
			ctx.lineTo(c-d/4,c+d/1.5);
			ctx.lineTo(c+d/4,b+d/4);
			ctx.lineTo(c+d/4,c);
			ctx.lineTo(b,a);
			ctx.closePath();
			var colors = app.storage.colors;
			// if(state==='active') ctx.fillStyle = colors.gray1;
			ctx.fillStyle = colors.gray2;
			ctx.fill();
		},
		envelope: function(ctx,side,state) {
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			var a = side*1/4, b = side*3/4, c = (a+b)/2, d = (b-a)/2, i = d/4,
				colors = app.storage.colors;
			// if(state=='active') ctx.strokeStyle = colors.black;
			ctx.strokeStyle = colors.black;
			// if(state==='active') ctx.fillStyle = colors.gray2;
			ctx.fillStyle = colors.gray3;
			ctx.lineCap = 'round';
			ctx.lineWidth = d/8;
			// outline
				ctx.moveTo(a-i,a+i);
				ctx.lineTo(b+i,a+i);
				ctx.lineTo(b+i,b-i);
				ctx.lineTo(a-i,b-i);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			// bottom
				ctx.beginPath();
				ctx.moveTo(a-i,b-i);
				ctx.lineTo(c,a+i);
				ctx.lineTo(b+i,b-i);
				ctx.fill();
				ctx.stroke();
			// top
				ctx.beginPath();
				ctx.moveTo(a-i,a+i);
				ctx.lineTo(c,c+d/4);
				ctx.lineTo(b+i,a+i);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
		}
	},
	waveIcons: [
		{
			name: 'sine',
			icon: {
				draw: function(ctx,side) {
					var a = side/4,
						b = side-a;
					ctx.lineWidth = sizes.sliderIconWidth;
					ctx.strokeStyle = colors.wave;
					ctx.clearRect(0,0,side,side);
					ctx.beginPath();
					ctx.moveTo(a,b);
					ctx.quadraticCurveTo((a+b)/2,-a,b,b);
					ctx.stroke();
				}
			}
		},{
			name: 'square',
			icon: {
				draw: function(ctx,side) {
					var a = side/4,
						b = side-a;
					ctx.lineWidth = sizes.sliderIconWidth;
					ctx.strokeStyle = colors.wave;
					ctx.clearRect(0,0,side,side);
					ctx.beginPath();
					ctx.moveTo(a,b);
					ctx.lineTo(a,a);
					ctx.lineTo(b,a);
					ctx.lineTo(b,b);
					ctx.stroke();
				}
			}
		},{
			name: 'sawtooth',
			icon: {
				draw: function(ctx,side) {
					var a = side/4,
						b = side-a;
					ctx.lineWidth = sizes.sliderIconWidth;
					ctx.strokeStyle = colors.wave;
					ctx.clearRect(0,0,side,side);
					ctx.beginPath();
					ctx.moveTo(a,b);
					ctx.lineTo(b,a);
					ctx.lineTo(b,b);
					ctx.stroke();
				}
			}
		},{
			name: 'triangle',
			icon: {
				draw: function(ctx,side) {
					var a = side/4,
						b = side-a;
					ctx.lineWidth = sizes.sliderIconWidth;
					ctx.strokeStyle = colors.wave;
					ctx.clearRect(0,0,side,side);
					ctx.beginPath();
					ctx.moveTo(a,b);
					ctx.lineTo((a+b)/2,a);
					ctx.lineTo(b,b);
					ctx.stroke();
				}
			}
		},{
			name: 'custom',
			icon: {
				draw: function(ctx,side) {
					var a = side*1/4, b = side*3/4, c = (a+b)/2, d = (b-a)/2;
					ctx.lineWidth = sizes.sliderIconWidth;
					ctx.strokeStyle = colors.wave;
					ctx.clearRect(0,0,side,side);
					ctx.beginPath();
					ctx.moveTo(a,c+d/8);
					ctx.quadraticCurveTo(a+d/4,a,a+d/2,c);
					ctx.quadraticCurveTo(c-d/4,b+d,c,c);
					ctx.quadraticCurveTo(c+d/4,a-d,c+d/2,c);
					ctx.quadraticCurveTo(b-d/3,b-d/8,b-d/6,c);
					ctx.quadraticCurveTo(b-d/8,c-d/2,b,c+d/4);
					// ctx.quadraticCurveTo(c+d/4,a-d/4,b-d/4,c+d/4);
					// ctx.quadraticCurveTo(b-d/8,c+d/4,)
					ctx.stroke();
				}
			}
		}
	],
	envelopeTypes: [
		{
			name: 'linear',
			icon: {
				draw: function(ctx,side) {
					var a = side/4,
						b = side-a;
					ctx.lineWidth = sizes.sliderIconWidth;
					ctx.strokeStyle = colors.envelope;
					ctx.clearRect(0,0,side,side);
					ctx.beginPath();
					ctx.moveTo(a,b);
					ctx.lineTo(b,a);
					ctx.stroke();
				}
			}
		},{
			name: 'exponential',
			icon: {
				draw: function(ctx,side) {
					var a = side/4,
						b = side-a;
					ctx.lineWidth = sizes.sliderIconWidth;
					ctx.strokeStyle = colors.envelope;
					ctx.clearRect(0,0,side,side);
					ctx.beginPath();
					ctx.moveTo(a,b);
					ctx.quadraticCurveTo(b,b,b,a);
					ctx.stroke();
				}
			}
		}
	],
	filterIcons: {
		highpass: function(ctx,side) {
			var a = side/4,
				b = side-a;
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			ctx.moveTo(a,b);
			ctx.quadraticCurveTo(a,a,b,a);
			ctx.stroke();
		},
		lowshelf: function(ctx,side) {
			var a = side/4,
				b = side-a,
				c = a+(b-a)/2;
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			ctx.moveTo(b,b);
			ctx.quadraticCurveTo(c,b,c,c);
			ctx.quadraticCurveTo(c,a,a,a);
			ctx.stroke();
		},
		bandpass: function(ctx,side) {
			var a = side/4,
				b = side-a,
				c = a+(b-a)/2;
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			ctx.moveTo(a,b);
			ctx.quadraticCurveTo(c,b,c,a);
			ctx.quadraticCurveTo(c,b,b,b);
			ctx.stroke();
		},
		peaking: function(ctx,side) {
			var a = side/4,
				b = side-a,
				c = a+(b-a)/2;
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			ctx.moveTo(a,b);
			ctx.quadraticCurveTo(c,-a,b,b);
			ctx.stroke();
		},
		notch: function(ctx,side) {
			var a = side/4,
				b = side-a,
				c = a+(b-a)/2;
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			ctx.moveTo(a,a);
			ctx.quadraticCurveTo(c,a,c,b);
			ctx.quadraticCurveTo(c,a,b,a);
			ctx.stroke();
		},
		highshelf: function(ctx,side) {
    		var a = side/4,
				b = side-a,
				c = a+(b-a)/2;
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			ctx.moveTo(a,b);
			ctx.quadraticCurveTo(c,b,c,c);
			ctx.quadraticCurveTo(c,a,b,a);
			ctx.stroke();
		},
		lowpass: function(ctx,side) {
			var a = side/4,
				b = side-a;
			ctx.clearRect(0,0,side,side);
			ctx.beginPath();
			ctx.moveTo(b,b);
			ctx.quadraticCurveTo(b,a,a,a);
			ctx.stroke();
		}
	},
	init: function() {
		this.setStyleAliasas();
	}
}
app.sideBar.wave = {
	setVariables: function() {
		var $ = this;
		$.width = app.sideBar.width;
		$.height = app.sideBar.height;
		$.container = dom.create('div',app.sideBar.container);
		$.container.set()
			.position('absolute')
			.width($.width)
			.height($.height)
			.display('none');
		$.waveType = undefined;
	},
	toggleMode: function() {
		var $ = this;
	},
	switchWave: function(waveType) {
		var $ = this;
		$.waveTitle.p.set().innerHTML(waveType+' wave');
		if(waveType!=='custom') {
			$.makeCurveInactive();
			app.plane.wave.drawDefault(waveType);
			app.player.changeWave('default',waveType);
		} else {
			$.makeCurveActive();
		}
		$.waveType = waveType;
	},
	changeCurve: function(value) {
		var $ = this, value = Math.round(value);
		$.curveTitle.p.set().innerHTML('curvature '+value+'%');
	},
	makeCurveInactive: function() {
		var $ = this;
		$.curveTitle.set().background(colors.divInactive);
		$.curveTitle.p.set().color(colors.textInactive).innerHTML('curvature 0%');
		$.slider.makeInactive();
		$.button.set().display('none');
	},
	makeCurveActive: function() {
		var $ = this, value = Math.round($.slider.getValue());
		$.curveTitle.set().background(colors.divActive);
		$.curveTitle.p.set().color(colors.textActive).innerHTML('curvature '+value+'%');
		$.slider.makeActive();
		$.slider.setValue(value);
		$.button.set().display('table');
	},
	createWave: function() {
		var $ = this,
			value = Math.round($.slider.getValue()),
			curvature = 52-Math.round(value/2), // to invert it
			wavePlane = app.plane.wave,
			player = app.player;
		if(curvature===52) {
			wavePlane.showOriginal();
			player.changeWave('static',wavePlane.sendStatic());
		} else {
			wavePlane.crunch(curvature);
			player.changeWave('curved',wavePlane.sendCoefs());
		}
	},
	makeWaveTitle: function() {
		var $ = this;
		$.waveTitle = dom.create('div',$.container);
		$.waveTitle.set()
			.position('absolute')
			.top(20)
			.width($.width)
			.height(40)
			.display('table')
			.background(colors.divActive);
		$.waveTitle.p = dom.create('p',$.waveTitle);
		$.waveTitle.p.set()
			.color(colors.textActive)
			.textAlign('center')
			.display('table-cell')
			.verticalAlign('middle')
			.font(fonts.sideBar)
			.size(32);
	},
	makeSelector: function() {
		var $ = this,
			waves = app.storage.waveIcons,
			configSide = 60,
			buttonValues = { width: configSide, height: configSide, borderRadius: 4, background: colors.itemRegular },
			popItemValues = { width: configSide, height: configSide },
			left = ($.width-configSide)/2,
			top = 80,
			callback = function(item) {
				$.switchWave(item.name);
			};
		$.waveSelector = dom.makeSelector($.container,left,top,waves,buttonValues,waves,popItemValues,callback,true);
	},
	makeCurveTitle: function() {
		var $ = this;
		$.curveTitle = dom.create('div',$.container);
		$.curveTitle.set()
			.position('absolute')
			.top(180)
			.width($.width)
			.height(40)
			.display('table')
			// .background('orange');
		$.curveTitle.p = dom.create('p',$.curveTitle);
		$.curveTitle.p.set()
			// .color('red')
			.textAlign('center')
			.display('table-cell')
			.verticalAlign('middle')
			.font(fonts.sideBar)
			.size(32)
			.innerHTML('curvature 0%');
	},
	makeSlider: function() {
		var $ = this,
			values = { width: $.width-100, height: sizes.sliderHeight },
			range = [0,100,34],
			onchange = function(value) {
				$.changeCurve(value);
			}
		$.slider = dom.makeSlider($.container,values,range,onchange);
		$.slider.set()
			.position('absolute')
			.left(50)
			.top(250);
	},
	makeButton: function() {
		var $ = this,
			buttonValues = { width: 120, height: 50, font: fonts.button, size: 24, background: colors.buttonRegular, hover: colors.buttonHover, active: colors.buttonActive, borderRadius: 4 },
			callback = function() {
				$.createWave();
			}
		$.button = dom.makeButton($.container,'Round It!',buttonValues,callback);
		$.button.set()
			.position('absolute')
			.top(310)
			.left(($.width-buttonValues.width)/2);
	},
	setState: function() {
		var $ = this,
			initialWaveName = 'custom',
			initialWave;
		$.currentWave = initialWaveName;
		// title
			$.waveTitle.p.set().innerHTML(initialWaveName);
		// selector
			var waves = app.storage.waveIcons,
				button = $.waveSelector.button,
				ctx = button.canvas.context,
				side = button.points.side;
			for(var i=0; i<waves.length; i++) {
				if(waves[i].name===initialWaveName) {
					initialWave = waves[i];
				}
			}
			initialWave.icon.draw(ctx,side);
			button.currentItem = initialWave;
		$.curvature = 34;
		$.switchWave(initialWaveName);
		$.changeCurve(34);
		$.createWave();
	},
	init: function() {
		var $ = this;
		$.setVariables();
		$.makeWaveTitle();
		$.makeSelector();
		$.makeCurveTitle();
		$.makeSlider();
		$.makeButton();
		$.setState();
	}
}
app.sideBar.envelope = {
	setVariables: function() {
		var $ = this,
			sideBar = app.sideBar;
		$.width = sideBar.width;
		$.height = sideBar.height;
		$.container = dom.create('div',sideBar.container);
		$.container.set()
			.position('absolute')
			.width($.width)
			.height($.height)
			.display('none');
		$.rangerProperties = app.player.envelopeProperties;
		$.rangerValues = app.player.envelopeValues;
		$.rangers = {};
	},
	changePropertyValue: function(ranger,value) {
		var $ = this, property = ranger.property;
		if(property==='attack') {
			if(!(value<$.rangerValues.decay)) value = $.rangerValues.decay-0.001;
		} else if(property==='decay') {
			if(!(value>$.rangerValues.attack)) value = $.rangerValues.attack+0.001;
			else if(!(value<$.rangerValues.release)) value = $.rangerValues.release-0.001;
		} else if(property==='sustain') {
			//console.log(value);
			//if(value===0) value += 0.0001;
		} else if(property==='release') {
			if(!(value>$.rangerValues.decay)) value = $.rangerValues.decay+0.001;
		}
		$.rangerValues[property] = value; // Math.round(value*1000)/1000; // round to thousandth
		$.sendChanges(ranger);
	},
	changePropertyType: function(ranger,type) {
		var $ = this;
		ranger.type = type;
		$.renderRangerTitle(ranger);
		$.sendChanges(ranger);
	},
	sendChanges: function(ranger) {
		var $ = this,
			property = ranger.property,
			type = ranger.type ? ranger.type : undefined,
			value = $.rangerValues[property];
		app.plane.envelope.changeProperty(property,type,value);
		app.player.changeEnvelope(property,type,value);
		$.renderRangerTitle(ranger);
	},
	renderRangerTitle: function(ranger) {
		var $ = this, type = ranger.type ? ranger.type : '',
			property = ranger.property,
			value = $.rangerValues[property];
		ranger.title.p.set().innerHTML(type+' '+property+' '+value.toFixed(1));
	},
	makeRangers: function() {
		var $ = this,
			sliderValues = { width: 200, height: sizes.sliderHeight },
			selectorSide = 40,
			player = app.player,
			envelopeValues = player.envelopeValues;
		for(var i=0; i<$.rangerProperties.length; i++) {
			var property = $.rangerProperties[i], ranger = {}, top = 5+i*100,
				titleHeight = 40;
			ranger.property = property;
			ranger.value = envelopeValues[property];
			ranger.range = (property==='sustain') ? [0,1,ranger.value] : [0,player.envelopeDuration,ranger.value];
			// title
				ranger.title = dom.create('div',$.container);
				ranger.title.set()
					.position('absolute')
					.top(top)
					.width($.width)
					.height(titleHeight)
					.display('table')
					.background(colors.divActive);
				ranger.title.p = dom.create('p',ranger.title);
				ranger.title.p.set()
					.color(colors.textActive)
					//.innerHTML(ranger.property+' '+ranger.range[2].toFixed(1))
					.textAlign('center')
					.display('table-cell')
					.verticalAlign('middle')
					.font(fonts.sideBar)
					.size(24);
				var usedSpace = sliderValues.width+selectorSide,
					extraSpace = $.width-usedSpace,
					spacing = extraSpace/3,
					topSpace = 10,
					sliderLeft = (property!=='sustain') ? spacing : spacing; //($.width-sliderValues.width)/2;
			// slider
				(function(ranger) {
					ranger.onchange = function(value) {
						$.changePropertyValue(ranger,value);
					}
				})(ranger);
				ranger.slider = dom.makeSlider($.container,sliderValues,ranger.range,ranger.onchange);
				ranger.slider.set()
					.position('absolute')
					.left(Math.round(sliderLeft))
					.top(top+titleHeight+topSpace/2+selectorSide/2);
			// wave type selector
				var buttonValues = { width: selectorSide, height: selectorSide, borderRadius: 4, background: colors.itemRegular };
				if(property!=='sustain') {
					ranger.type = 'linear';
					var selectorItems = app.storage.envelopeTypes,
						popItemValues = { width: selectorSide, height: selectorSide },
						callback;
					(function(ranger) {
						callback = function(item) {
							$.changePropertyType(ranger,item.name);
						}
					})(ranger);
					ranger.selector = dom.makeSelector(
						$.container,
						$.width-spacing-selectorSide,
						top+titleHeight+topSpace,
						selectorItems,
						buttonValues,
						selectorItems,
						popItemValues,
						callback,
						true
						);
					var button = ranger.selector.button,
						ctx = button.canvas.context,
						side = selectorSide;
					if(player.envelopeTypes[property]==='linear') {
						button.currentItem = selectorItems[0];
					} else {
						button.currentItem = selectorItems[1];
						$.changePropertyType(ranger,'exponential');
					}
					button.currentItem.icon.draw(ctx,side);
				} else {
					var div = dom.create('div',$.container);
					div.set()
						.width(buttonValues.width)
						.height(buttonValues.height)
						.background(buttonValues.background)
						.position('absolute')
						.top(top+titleHeight+topSpace)
						.left($.width-spacing-selectorSide)
						.borderRadius(buttonValues.borderRadius);
				}
			$.renderRangerTitle(ranger);
			$.rangers[i] = ranger;
			ranger = undefined;
		}
	},
	toggleMode: function() {
		var $ = this;
	},
	init: function() {
		var $ = this;
		$.setVariables();
		$.makeRangers();
	}
}
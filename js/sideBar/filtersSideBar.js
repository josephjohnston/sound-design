app.sideBar.filters = {
	setVariables: function() {
		var $ = this,
			sideBar = app.sideBar,
			player = app.player,
			tabs = app.tabs;
		$.width = sideBar.width;
		$.height = sideBar.height;
		$.container = dom.create('div',sideBar.container);
		$.container.set()
			.position('absolute')
			.width($.width)
			.height($.height)
			.display('none');
		$.blockWidth = 40;
		$.blockNames = player.filterNames;
		$.filterProperties = player.filterProperties;
		$.filterRanges = player.filterRanges;
		$.nyquist = app.nyquist;
		$.numOctaves = app.numOctaves;
		$.blocks = {};
		$.currentBlock = undefined;
		$.rangers = [];
	},
	toggleMode: function() {
		var $ = this;
	},
	changePropertyValue: function(ranger,value) {
		var $ = this, property = ranger.property,
			realValue = app.filterValueToReal(property,value);
		$.currentBlock.properties[property] = value;
		ranger.title.p.set().innerHTML(property+' '+realValue.toFixed(2));
		app.player.changeFilterValue($.currentBlock.id,property,realValue);
	},
	switchBlock: function(block) {
		var $ = this, button = $.button;
		$.currentBlock.draw('inactive');
		$.currentBlock = block;
		block.draw('active');
		if(block.active) {
			$.showRangers();
			if(!button.on) $.toggleButton();
		} else {
			$.hideRangers();
			if(button.on) $.toggleButton();
		}
	},
	hideRangers: function() {
		var $ = this;
		for(var i=0; i<$.rangers.length; i++) {
			$.rangers[i].makeInactive();
		}
	},
	showRangers: function() {
		var $ = this, block = $.currentBlock;
		for(var i=0; i<$.rangers.length; i++) {
			var ranger = $.rangers[i],
				property = ranger.property,
				include = (block.properties[property]!==undefined);
			if(include) {
				ranger.makeActive();
				ranger.setValue(block.properties[property]);
			} else {
				ranger.makeInactive();
			}
		}
	},
	toggleBlock: function() {
		var $ = this, block = $.currentBlock;
		if(block.active) {
			block.active = false;
			block.draw('active');
			$.hideRangers();
			$.toggleButton();
		} else {
			block.active = true;
			block.draw('active');
			$.showRangers();
			$.toggleButton();
		}
		app.player.toggleFilterMode(block.id);
	},
	toggleButton: function() {
		var $ = this, button = $.button;
		if(button.on) {
			button.text().innerHTML('on');
			button.on = false;
		} else {
			button.text().innerHTML('off');
			button.on = true;
		}
	},
	makeBlocks: function() {
		var $ = this,
			blockNum = $.blockNames.length,
			blockWidth = $.blockWidth,
			extraSpace = $.width-blockNum*blockWidth,
			blockSpacing = extraSpace/(blockNum+1);
		for(var i=0; i<$.blockNames.length; i++) {
			var blockName = $.blockNames[i],
				id = i,
				icon = app.storage.filterIcons[blockName],
				left = blockSpacing+i*(blockWidth+blockSpacing),
				properties = $.filterProperties[blockName],
				mode = app.player.filterModes[i],
				block = new $.Block(blockName,id,icon,left,properties,mode);
			$.blocks[id+''] = block;
		}
	},
	Block: function(blockName,id,icon,left,properties,mode) {
		var $ = this, filters = app.sideBar.filters,
			filterRanges = filters.filterRanges;
		$.name = blockName;
		$.id = id;
		$.active = mode;
		var names = filters.blockNames;
		$.hue = (id/names.length)*360;
		$.properties = {};
		for(var i=0; i<properties.length; ++i) {
			var property = properties[i];
			for(var r=0; r<filterRanges.length; ++r) {
				var filterRange = filterRanges[r];
				if(filterRange.property===property) {
					$.properties[property] = 0;
				}
			}
		}
		$.icon = icon;
		$.canvas = dom.create('canvas',filters.container);
		$.canvas.set()
			.position('absolute')
			.canWidth(filters.blockWidth)
			.canHeight(filters.blockWidth)
			.left(left)
			.top(10)
			.background(colors.gray3)
			.borderRadius(4);
		$.canvas.onmousedown = function() {
			$.canvas.set().background(colors.itemActive);
			if($!==filters.currentBlock) filters.switchBlock($);
		}
		$.canvas.onmouseup = function() {
			$.canvas.set().background(colors.itemHover);
		}
		$.canvas.onmouseenter = function() {
			$.canvas.set().background(colors.gray2);
			// if($!==filters.currentBlock) $.draw('hover');
			preservePointer();
		}
		$.canvas.onmouseleave = function() {
			$.canvas.set().background(colors.gray3);
			// if($!==filters.currentBlock) $.draw('inactive');
			defaultCursor();
		}
	},
	setBlockPrototype: function() {
		var filters = this;
		filters.Block.prototype = {
			draw: function(state) {
				var $ = this, ctx = $.canvas.context;
				ctx.lineWidth = 2;
				if($.active) {
					if(state==='active') ctx.strokeStyle = 'hsl('+$.hue+',100%,50%)';
					// else if(state==='hover') ctx.strokeStyle = 'hsl('+$.hue+',75%,50%)';
					else ctx.strokeStyle = 'hsl('+$.hue+',40%,50%)';
				} else {
					if(state==='active') ctx.strokeStyle = colors.gray6;
					else ctx.strokeStyle = colors.gray4;
				}
				// console.log(typeof $.icon)
				$.icon(ctx,$.canvas.width);
			}
		}
	},
	makeButton: function() {
		var $ = this,
			buttonValues = { font: fonts.button, size: 18, width: 60, height: 30, borderRadius: 4, background: colors.buttonRegular, hover: colors.buttonHover, active: colors.buttonActive };
		$.button = dom.makeButton($.container,'',buttonValues,function() { $.toggleBlock(); });
		$.button.set()
			.position('absolute')
			.left(($.width-buttonValues.width)/2)
			.top(75);
		$.button.on = undefined;
	},
	makeRangers: function() {
		var $ = this,
			sliderValues = { width: 200, height: sizes.sliderHeight, railColor: 'red', blockColor: 'blue' };
		for(var i=0; i<$.filterRanges.length; i++) {
			var filterRange = $.filterRanges[i], ranger = {}, top = 130+i*90,
				titleHeight = 40;
			ranger.active = false;
			ranger.property = filterRange.property;
			ranger.range = filterRange.range;
			// title
				ranger.title = dom.create('div',$.container);
				ranger.title.set()
					.position('absolute')
					.top(top)
					.width($.width)
					.height(titleHeight)
					.display('table');
					// .background('purple');
				ranger.title.p = dom.create('p',ranger.title);
				ranger.title.p.set()
					// .color('red')
					.textAlign('center')
					.display('table-cell')
					.verticalAlign('middle')
					.font(fonts.sideBar)
					.size(24);
			// slider
				(function(ranger) {
					ranger.onchange = function(value) {
						$.changePropertyValue(ranger,value);
					}
				})(ranger);
				ranger.slider = dom.makeSlider($.container,sliderValues,ranger.range,ranger.onchange);
				ranger.slider.set()
					.position('absolute')
					.left(($.width-sliderValues.width)/2)
					.top(top+titleHeight+20);
			// set value
				(function(ranger) {
					ranger.setValue = function(value) {
						ranger.slider.setValue(value);
					}
				})(ranger);
			// mode
				(function(ranger) {
					ranger.makeInactive = function() {
						ranger.slider.makeInactive();
						ranger.title.set().background(colors.divInactive);
						// ranger.title.p.set().innerHTML(ranger.property+' '+ranger.range[2]);
						ranger.title.p.set().color(colors.textInactive);
					}
				})(ranger);
				(function(ranger) {
					ranger.makeActive = function() {
						ranger.slider.makeActive();
						ranger.title.set().background(colors.divActive);
						ranger.title.p.set().color(colors.textActive);
					}
				})(ranger);
			$.rangers[i] = ranger;
			ranger = undefined;
		}
	},
	setState: function() {
		var $ = this,
			initialFilterValues = app.player.initialFilterValues,
			initialBlockName = app.player.filterNames[3];
		$.button.on = true;
		$.button.text().innerHTML('off');
		for(var i=0; i<$.blockNames.length; ++i) {
			var name = $.blockNames[i],
				block = $.blocks[i+''],
				properties = $.filterProperties[name];
			var customInitialValues = initialFilterValues['_'+i];
			if(customInitialValues) {
				block.active = true;
				app.player.filters[i].mode = true;
			}
			block.draw('inactive');
			for(var j=0; j<properties.length; ++j) {
				var property = properties[j];
				for(var r=0; r<$.filterRanges.length; ++r) {
					var filterRange = $.filterRanges[r];
					if(filterRange.property===property) {
						if(customInitialValues!==undefined) {
							var specialValue = customInitialValues[r],
								realValue = app.filterValueToReal(property,specialValue);
							block.properties[property] = specialValue;
							app.player.changeFilterValue(i,property,realValue);
							app.player.filters[i].mode = true;
						} else {
							var defaultValue = initialFilterValues['_default'][r],
								realValue = app.filterValueToReal(property,defaultValue);
							block.properties[property] = defaultValue;
							app.player.changeFilterValue(i,property,realValue);
						}
					}
				}
			}
			if(initialBlockName===block.name) {
				$.currentBlock = block;
				$.switchBlock($.currentBlock);
			}
		}
		app.player.assembleFilters();
	},
	init: function() {
		var $ = this;
		$.setVariables();
		$.setBlockPrototype();
		$.makeBlocks();
		$.makeRangers();
		$.makeButton();
		$.setState();
	}
}
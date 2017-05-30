app.dom = {
	HtmlObject: function(type) {
		this.element = document.createElement(type);
	},
	create: function(type,parent) {
		var htmlObject = new this.HtmlObject(type);
		if(parent) parent.appendChild(htmlObject.element);
		if(type==='canvas') htmlObject.element.context = htmlObject.element.getContext('2d');
		htmlObject.element.set = function() {
			return htmlObject;
		}
		return htmlObject.element;
	},
	destroy: function(element) {
		var parent = element.parentNode;
		parent.removeChild(element);
	},
	makeCanvasButton: function(parent,values,pics,onclick) { // pics: hover, active, regular
		var $ = this,
			canvas = $.create('canvas',parent),
			ctx = canvas.getContext('2d');
		canvas.set()
			.canWidth(values.width)
			.canHeight(values.height)
			.background(values.background)
			.borderRadius(values.borderRadius);
		pics.regular(ctx,values.width,values.height);
		function erase() {
			ctx.clearRect(0,0,values.width,values.height);
		}
		canvas.onmouseenter = function() {
			erase();
			preservePointer();
			pics.hover(ctx,values.width,values.height);
		}
		canvas.onmouseleave = function() {
			erase();
			defaultCursor();
			pics.regular(ctx,values.width,values.height);
		}
		canvas.onmousedown = function() {
			erase();
			pics.active(ctx,values.width,values.height);
		}
		canvas.onmouseup = function() {
			erase();
			pics.hover(ctx,values.width,values.height);
		}
		canvas.onclick = function() {
			preservePointer();
			onclick();
		}
		return canvas;
	},
	makeButton: function(parent,text,values,callback,extras) { // values: font,size,width,height,background,hover,active,borderRadius
		var $ = this,
			div = $.create('div',parent),
			background = values.background,
			hover = values.hover,
			active = values.active;
		div.set()
			.width(values.width)
			.height(values.height)
			.background(background)
			.borderRadius(values.borderRadius)
			.display('table')
		div.p = $.create('p',div);
		div.p.set()
			.innerHTML(text)
			.color(values.color || 'white')
			.textAlign('center')
			.display('table-cell')
			.verticalAlign('middle')
			.font(values.font)
			.size(values.size)
			.paddingBottom(1);
		div.resetBackground = function(newBackground) {
			background = newBackground;
			this.style.background = background;
		}
		div.text = function() {
			return div.p.set();
		}
		div.onmouseenter = function() {
			if(extras && extras.mouseenter) extras.mouseenter();
			preservePointer();
			div.style.background = hover;
		}
		div.onmouseleave = function() {
			if(extras && extras.mouseleave) extras.mouseleave();
			defaultCursor();
			div.style.background = background;
		}
		div.onmousedown = function() {
			if(extras && extras.mousedown) extras.mousedown();
			div.style.background = active;
		}
		div.onmouseup = function() {
			if(extras && extras.mouseup) extras.mouseup();
			div.style.background = hover;
		}
		div.onclick = function() {
			preservePointer();
			callback();
		}
		return div;
	},
	makeButtonLink: function(parent,text,values,url,callback) {
		var $ = this,
			div = $.create('div',parent);
		div.set()
			.width(values.width)
			.height(values.height)
			.background(values.background)
			.borderRadius(values.borderRadius)
		var link = $.create('a',div);
		link.set()
			.paragraph(text,values)
			.display('block')
			.width(values.width)
			.height(values.height)
		link.href = url;
		link.style.textDecoration = 'none';
		div.onmouseenter = function() {
			this.style.background = values.hover;
		}
		div.onmouseleave = function() {
			this.style.background = values.background;
		}
		if(callback) {
			div.onclick = function(e) {
				e.preventDefault();
				preservePointer();
				callback();
			}
		}
		return div;
	},
	makeTextLink: function(text,parent,hoverColor,values,url) {
		var $ = this,
			link = $.create('a',parent),
			textNode = document.createTextNode(text);
		link.appendChild(textNode);
		link.style.color = values.color;
		link.href = url;
		link.style.textDecoration = 'none';
		link.onmouseenter = function() {
			link.style.textDecoration = 'underline';
		}
		link.onmouseleave = function() {
			link.style.textDecoration = 'none';
		}
		return link;
	},
	makeSlider: function(parent,values,range,onchange) { // values: width,height,railColor,blockColor  range: [min,max,defaul]
		var $ = this,
			rail = $.create('div',parent),
			block = $.create('div',rail),
			blockWidth = 10,
			start = range[0],
			stop = range[1],
			lastValue = range[2],
			increment = values.width/Math.abs(stop-start),
			originalPos = (increment*(lastValue-range[0])-blockWidth/2),
			dragging = false,
			inactive = false;
		rail.set()
			.width(values.width)
			.height(values.height)
			// .background(values.railColor)
			.background(colors.railActive)
			.borderRadius(values.height/2);
		block.set()
			.position('absolute')
			.width(blockWidth)
			.height(values.height*2)
			.top(-values.height/2)
			.left(originalPos)
			// .background(values.blockColor);
			.background(colors.blockActive);
		rail.makeInactive = function() {
			inactive = true;
			block.set().left(originalPos);
			rail.set().background(colors.railInactive);
			block.set().background(colors.blockInactive);
		}
		rail.makeActive = function() {
			inactive = false;
			rail.set().background(colors.railActive);
			block.set().background(colors.blockActive);
		}
		rail.hide = function() {
			rail.set().display('none');
			block.set().display('none');
		}
		rail.show = function() {
			rail.set().display('block');
			block.set().display('block');
		}
		rail.setValue = function(value) {
			var distance = Math.abs(value-start),
				center = distance*increment;
			block.set().left(center-blockWidth/2);
			onchange(value);
		}
		function getMouseX(e) {
			var rect = rail.getBoundingClientRect();
			return e.clientX-rect.left;
		}
		rail.onmouseenter = function() {
			if(!inactive) preservePointer();
		}
		rail.onmouseleave = function() {
			if(!inactive) defaultCursor();
		}
		rail.onmousedown = function(e) {
			if(inactive) return;
			var x = getMouseX(e), center = x;
			if(x<=0 || values.width<=x) return;
			block.set().left(center-blockWidth/2);
			returnValue(center);
			dragging = true;
		}
		block.onmousedown = function(e) {
			if(inactive) return;
			var x = getMouseX(e);
			dragging = true;
		}
		window.addEventListener('mouseup',function() {
			dragging = false;
			defaultCursor();
		});
		window.addEventListener('mousemove',function(e) {
			if(!dragging) return;
			e.preventDefault();
			var x = getMouseX(e), center = x,
				value;
			preservePointer();
			if(!(0<=center)) value = -blockWidth/2;
			else if(!(center<=values.width)) value = values.width-blockWidth/2;
			else value = center-blockWidth/2;
			block.set().left(value);
			if(0<=center && center<=values.width)
				returnValue(center);
		});
		function returnValue(center) {
			var value = start+center/increment;
			if(lastValue===value) return;
			lastValue = value;
			onchange(lastValue);
		}
		rail.getValue = function() {
			return lastValue;
		}
		return rail;
	},
	setPrototype: function(HtmlObject) {
		var $ = this;
		this.HtmlObject.prototype = {
			// regular css
				width: function(width) {
					this.element.style.width = width+'px';
					return this;
				},
				height: function(height) {
					this.element.style.height = height+'px';
					return this;
				},
				background: function(background) {
					this.element.style.background = background;
					return this;
				},
				position: function(position) {
					this.element.style.position = position;
					return this;
				},
				left: function(left) {
					this.element.style.left = left+'px';
					return this;
				},
				top: function(top) {
					this.element.style.top = top+'px';
					return this;
				},
				borderRadius: function(borderRadius,corners) {
					// [ 'Top' ]
					var htmlObject = this;
					if(corners) {
						corners.forEach(function(corner) {
							htmlObject.element.style['border'+corner+'Radius'] = borderRadius+'px';
						});
					} else this.element.style.borderRadius = borderRadius+'px';
					return this;
				},
				backgroundImage: function(backgroundImage) {
					this.element.style.backgroundImage = backgroundImage;
					return this;
				},
				overflow: function(overflow) {
					this.element.style.overflow = overflow;
					return this;
				},
				border: function(width,color,sides) {
					var htmlObject = this;
					if(sides) {
						sides.forEach(function(side) {
							htmlObject.element.style['border'+side] = width+'px solid '+color;
						});
					} else this.element.style.border = width+'px solid '+color;
					return this;
				},
				borderTop: function(border,color) {
					var htmlObject = this;
					this.element.style.borderTop = border+'px solid '+color;
					return this;
				},
				borderBottom: function(border,color) {
					var htmlObject = this;
					this.element.style.borderBottom = border+'px solid '+color;
					return this;
				},
				borderLeft: function(border,color) {
					var htmlObject = this;
					this.element.style.borderLeft = border+'px solid '+color;
					return this;
				},
				borderRight: function(border,color) {
					var htmlObject = this;
					this.element.style.borderRight = border+'px solid '+color;
					return this;
				},
				margin: function(margin,sides) {
					var htmlObject = this;
					if(sides) {
						sides.forEach(function(side) {
							htmlObject.element.style['margin'+side] = margin+'px';
						});
					} else this.element.style.margin = margin+'px';
					return this;
				},
				zIndex: function(zIndex) {
					this.element.style.zIndex = zIndex;
					return this;
				},
				display: function(display) {
					this.element.style.display = display;
					return this;
				},
				transition: function(transition) {
					this.element.style.WebkitTransition = transition;
					return this;
				},
				transform: function(transform) {
					this.element.style.WebkitTransform = transform;
					return this;
				},
				// text
					font: function(font) {
						this.element.style.fontFamily = font;
						return this;
					},
					size: function(size) {
						this.element.style.fontSize = size+'px';
						return this;
					},
					color: function(color) {
						this.element.style.color = color;
						return this;
					},
					text: function(text) {
						var parent = this.element;
						parent.appendChild(document.createTextNode(text));
						return this;
					},
					textAlign: function(textAlign) {
						this.element.style.textAlign = textAlign;
						return this;
					},
					verticalAlign: function(verticalAlign) {
						this.element.style.verticalAlign = verticalAlign;
						return this;
					},
					innerHTML: function(innerHTML) {
						this.element.innerHTML = innerHTML;
						return this;
					},
					paddingBottom: function(paddingBottom) {
						this.element.style.paddingBottom = paddingBottom+'px';
						return this;
					},
					boxShadow: function(horizPos,vertPos,blur,spread,color) {
						this.element.style.boxShadow = horizPos+'px '+vertPos+'px '+blur+'px '+spread+'px '+color;
						return this;
					},
					padding: function(padding,sides) {
						var htmlObject = this;
						if(sides) {
						sides.forEach(function(side) {
								htmlObject.element.style['padding'+side] = padding+'px';
							});
						} else this.element.style.padding = padding+'px';
						return this;
					},
			// my css
				paragraph: function(text,values) { // color, font, size
					var p = $.create('p',this.element),
						textNode = document.createTextNode(text);
						p.appendChild(textNode);
					if(values) {
						p.style.display = 'table-cell';
						p.style.verticalAlign = 'middle';
						p.style.textAlign = 'center';
						p.style.color = values.color;
						p.style.fontFamily = values.font;
						p.style.fontSize = values.size+'px';
						p.style.paddingBottom = '1px';
					}
					return this;
				},
				mousePointer: function(effects) {
					// [ [ 'background', 'newColor', 'regularColor' ] ]
					var $ = this;
					this.element.onmouseenter = function() {
						if(effects) {
							effects.forEach(function(effect) {
								console.log()
								$.element.set()[effect[0]](effect[1]);
							});
						}
						preservePointer();
					}
					this.element.onmouseleave = function() {
						if(effects) {
							effects.forEach(function(effect) {
								$.element.set()[effect[0]](effect[2]);
							});
						}
						defaultCursor();
					}
					return this;
				},
			// canvas methods
				canWidth: function(width) {
					this.element.width = width;
					return this;
				},
				canHeight: function(height) {
					this.element.height = height;
					return this;
				},
			// form methods
				att: function(attribute,value) {
					this.element.setAttribute(attribute,value);
					return this;
				},
				outline: function(outline) {
					this.element.style.outline = outline;
					return this;
				}
		}
	},
	makeSelector: function(parent,left,top,buttonItems,buttonValues,popItems,popItemValues,callback,canvas) {
		var $ = {};
		$.onItem = false;
		// button
			$.button = { items: buttonItems, points: {} }
			$.button.changeItem = function(itemIndex) {
				var item = this.items[itemIndex];
				if(canvas) {
					this.currentItem = item;
					var ctx = $.button.canvas.context,
						side = $.button.points.side;
					this.currentItem.icon.draw(ctx,side);
				} else {
					$.button.div.text().innerHTML(item.name);
				}
			}
			// points
				$.button.points.side = buttonValues.width;
				$.button.points.top = top;
				$.button.points.left = left;
			// canvas
				if(canvas) {
					$.button.currentItem = undefined;
					$.button.canvas = dom.create('canvas',parent);
					$.button.canvas.set()
						.canWidth($.button.points.side)
						.canHeight($.button.points.side)
						.background(buttonValues.background)
						.borderRadius(buttonValues.borderRadius)
						.position('absolute')
						.left($.button.points.left)
						.top($.button.points.top);
					var ctx = $.button.canvas.context,
						side = $.button.points.side;
					$.button.canvas.onmouseenter = function() {
						preservePointer();
						// $.button.currentItem.icon.draw(ctx,side);
					}
					$.button.canvas.onmouseleave = function() {
						defaultCursor();
						// $.button.currentItem.icon.draw(ctx,side);
					}
					$.button.canvas.onmousedown = function() {
						// $.button.currentItem.icon.active(ctx,side);
					}
					$.button.canvas.onmouseup = function() {
						// $.button.currentItem.icon.draw(ctx,side);
					}
					$.button.canvas.onclick = function() {
						preservePointer();
						$.pop.div.show();
						exiting = function() {
							if(!$.onItem) $.pop.div.hide();
						}
					}
				}
			// div
				else {
					$.button.div = dom.makeButton(parent,'',buttonValues,function() {
						$.pop.div.show();
						exiting = function() {
							if(!$.onItem) $.pop.div.hide();
						}
					});
					$.button.div.set().position('absolute')
						.left($.button.points.left)
						.top($.button.points.top);
				}
		// popup
			// variables
				$.pop = { items: [], points: {} };
				for(var i=0; i<popItems.length; i++) {
					$.pop.items.push({ data: popItems[i] });
				}
				// points
					$.pop.points.side = popItemValues.width;
					$.pop.points.padding = 8;
					$.pop.points.top = $.button.points.top-$.pop.points.padding;
					$.pop.points.left = left;
					$.pop.points.height = $.pop.items.length*$.pop.points.side+$.pop.points.padding*2;
			// div
				$.pop.div = dom.create('div',parent);
				$.pop.div.set()
					.width($.pop.points.side)
					.height($.pop.points.height)
					.background(colors.gray3)
					.position('absolute')
					.left($.pop.points.left)
					.top($.pop.points.top)
					.borderRadius($.pop.points.padding)
					.display('none');
				$.pop.div.hide = function() {
					$.pop.div.style.display = 'none';
					$.pop.div.style.zIndex = '0';
				}
				$.pop.div.show = function() {
					$.pop.div.style.zIndex = '1';
					$.pop.div.style.display = 'block';
				}
			// scrolling
				$.pop.points.pos = $.pop.points.top;
				$.pop.div.onmousewheel = function(e) {
					e.preventDefault();
					var mouseY = e.clientY-parent.getBoundingClientRect().top,
						toBeTop = $.pop.points.pos+e.wheelDelta/3;
					if(mouseY<=toBeTop+$.pop.points.padding) toBeTop = mouseY-$.pop.points.padding;
					else if(toBeTop+$.pop.points.height-$.pop.points.padding<=mouseY) toBeTop = mouseY-$.pop.points.height+$.pop.points.padding;
					if($.button.points.top<toBeTop+$.pop.points.padding) toBeTop = $.button.points.top-$.pop.points.padding;
					else if(toBeTop+$.pop.points.height-$.pop.points.padding<=$.button.points.top+$.button.points.side) toBeTop = $.button.points.top+$.button.points.side-$.pop.points.height+$.pop.points.padding;
					$.pop.points.pos = toBeTop;
					$.pop.div.style.top = $.pop.points.pos+'px';
				}
			// items
				function setItems() {
					for(var i=0; i<$.pop.items.length; i++) {
						(function(item) {
							var side = $.pop.points.side;
							// canvas item
								if(canvas) {
									item.canvas = dom.create('canvas',$.pop.div);
									item.canvas.set()
										.position('absolute')
										.canWidth(side)
										.canHeight(side)
										.background(colors.itemRegular)
										.top(side*i+$.pop.points.padding);
									var ctx = item.canvas.context,
										icon = item.data.icon;
									icon.draw(ctx,side);
									item.canvas.onmousedown = function() {
										// icon.active(ctx,side);
										item.canvas.set().background(colors.itemActive);
										$.onItem = true;
									}
									item.canvas.onmouseup = function() {
										$.onItem = false;
									}
									item.canvas.onmouseenter = function() {
										// icon.hover(ctx,side);
										item.canvas.set().background(colors.itemHover);
										preservePointer();
									}
									item.canvas.onmouseleave = function() {
										// icon.regular(ctx,side);
										item.canvas.set().background(colors.itemRegular);
										defaultCursor();
									}
									item.canvas.onclick = function() {
										callback(item.data);
										$.pop.div.hide();
										$.button.changeItem($.pop.items.indexOf(item));
									}
								}
							// div item
								else {
									var extras = {
										mousedown: function() {
											$.onItem = true;
										},
										mouseup: function() {
											$.onItem = false;
										}
									}
									item.div = dom.makeButton($.pop.div,item.data.name,popItemValues,function() {
										callback(item.data);
										$.pop.div.hide();
										$.button.changeItem($.pop.items.indexOf(item));
									},extras);
									item.div.set()
										.position('absolute')
										.top($.pop.points.side*i+$.pop.points.padding);
								}
						})($.pop.items[i]);
					}
				}
				setItems();
				$.changeItems = function(newButtonItems,newPopItems) {
					$.button.items = newButtonItems;
					$.pop.items = [];
					for(var i=0; i<newPopItems.length; i++) {
						$.pop.items.push({ data: newPopItems[i] });
					}
					$.pop.div.innerHTML = '';
					$.pop.points.height = $.pop.items.length*$.pop.points.side+$.pop.points.padding*2;
					$.pop.div.set().height($.pop.points.height).top($.pop.points.top);
					$.pop.points.pos = $.pop.points.top;
					setItems();
				}
		return $;
	},
	// selector
		Selector: function(parent,left,top,display,displayHeight,width,popupPadding,popupBorderRadius,itemHeight) {
			var $ = this;
			// helpers
				$.showingPopup = false;
				$.popupPadding = popupPadding;
				$.popupTop = -$.popupPadding;
				$.itemHeight = itemHeight;
				$.popupHeight = undefined;
				$.top = top;
				$.left = left;
			// display
				$.display = display;
				$.displayHeight = displayHeight;
			// popup
				$.popup = dom.create('div',parent);
				$.popup.set()
					.width(width)
					.borderRadius(popupBorderRadius)
					.background('blue')
					.display('none')
					.position('absolute')
					.top($.top+$.popupTop)
					.left($.left);
			// listeners
				$.display.onclick = function() {
					preservePointer();
					$.showingPopup = true;
					$.showPopup();
				}
				$.popup.onmousedown = function(e) {
					e.cancelBubble = true;
				}
				$.popup.onclick = function(e) {
					e.cancelBubble = true;
					$.showingPopup = false;
					$.hidePopup();
				}
				$.popup.onmousewheel = function(e) {
					e.preventDefault();
					var mY = e.clientY-display.getBoundingClientRect().top;
					$.scroll($.popupTop-e.deltaY,mY);
				}
				window.addEventListener('mousedown',function(e) {
					if($.showingPopup) {
						$.showingPopup = false;
						$.hidePopup();
					}
				});
				$.popup.onmouseenter = function() {
					preservePointer();
				}
				$.popup.onmouseleave = function() {
					defaultCursor();
				}
		},
		setSelectorPrototype: function() {
			this.Selector.prototype = {
				scroll: function(toBeTop,mY) {
					var $ = this;
					if(0-$.popupPadding<toBeTop) toBeTop = -$.popupPadding;
					if(mY-$.popupPadding<toBeTop) toBeTop = mY-$.popupPadding;
					if(toBeTop+($.popupHeight-$.popupPadding)<$.displayHeight-1) toBeTop = $.displayHeight-($.popupHeight-$.popupPadding)+1;
					if(toBeTop+($.popupHeight-$.popupPadding)<mY-1) toBeTop = mY-($.popupHeight-$.popupPadding)+1;
					$.popup.set().top($.top+toBeTop);
					$.popupTop = toBeTop;
				},
				showPopup: function() {
					this.popup.set()
						.zIndex(1)
						.display('block');
				},
				hidePopup: function() {
					this.popup.set()
						.zIndex('auto')
						.display('none');
				},
				loadItems: function(items) {
					var $ = this;
					$.popupHeight = $.popupPadding*2+$.itemHeight*items.length;
					$.popup.set().height($.popupHeight);
					for(i=0; i<items.length; i++) {
						var item = items[i];
						$.popup.appendChild(item);
						item.set()
							.position('absolute')
							.left(0)
							.top($.popupPadding+i*$.itemHeight);
					}
				}
			}
		},
	// scroller
		Scroller: function(parent,width,height,rowNum,colNum,tilePadding,sidebarWidth,tileConstructor) {
			var $ = this;
			$.width = width;
			$.height = height;
			// tiles
				$.tileConstructor = tileConstructor;
				$.rowNum = rowNum;
				$.totalRowNum = $.rowNum+1;
				$.colNum = colNum;
				$.sidebarWidth = sidebarWidth;
				$.tilePadding = tilePadding;
				$.halfPadding = $.tilePadding/2;
				$.colWidth = $.width/$.colNum;
				$.rowHeight = $.height/$.rowNum;
				$.tileWidth = $.colWidth-$.tilePadding;
				$.tileHeight = $.rowHeight-$.tilePadding;
				$.containerHeight = undefined;
				$.rows = [];
				for(var i=0; i<$.totalRowNum; i++) $.rows.push([]);
				$.stream = [];
				$.topRows = 0;
				$.top = 0;
				$.clickedY = undefined;
			// containers
				$.holder = dom.create('div',parent);
				$.holder.set()
					.width($.width+$.sidebarWidth+$.halfPadding)
					.height($.height)
					.overflow('hidden');
				$.container = dom.create('div',$.holder);
				$.container.set()
					.left($.halfPadding+$.sidebarWidth)
					.width($.width)
					.position('absolute');
			// sidebar
				$.sidebar = dom.create('div',$.holder);
				$.sidebar.set()
					.width($.sidebarWidth)
					.background('black')
					.borderRadius($.sidebarWidth)
					.position('absolute')
					.left($.halfPadding);
			// listeners
				$.container.onmousewheel = function(e) {
					e.preventDefault();
					$.moveContainer($.top-e.deltaY);
					$.moveSidebar();
					$.moveRows();
				},
				$.holder.onmousedown = function(e) {
					e.preventDefault();
					var rect = this.getBoundingClientRect(),
						mX  = e.clientX-rect.left
						mY = e.clientY-rect.top;
					if($.tilePadding+$.sidebarWidth<mX) return;
					if($.insideSidebar(mY)) {
						var sidebarTop = Math.abs($.top)/$.containerHeight*$.height;
						$.clickedY = mY-sidebarTop;
					} else {
						var point = mY/$.height*$.containerHeight-$.height/2;
						$.jumpToPoint(-point);
						$.clickedY = $.height/$.containerHeight*$.height/2;
					}
				}
				window.addEventListener('mousemove',function(e) {
					if($.clickedY!==undefined) {
						var mY = e.clientY-$.holder.getBoundingClientRect().top,
							point = (mY-$.clickedY)/$.height*$.containerHeight;
						$.jumpToPoint(-point);
					}
				});
				window.addEventListener('mouseup',function(e) {
					if($.clickedY!==undefined) $.clickedY = undefined;
				});
			$.makeTiles();
		},
		setScrollerPrototype: function() {
			this.Scroller.prototype = {
				// scroll
					moveContainer: function(toBeTop) {
						var $ = this;
						if(0<toBeTop) toBeTop = 0;
						else if(toBeTop+$.containerHeight<$.height)
							toBeTop = $.height-$.containerHeight;
						$.top = toBeTop;
						$.container.set().top($.top);
					},
					moveRows: function() {
						var $ = this,
							topRows = Math.floor(Math.abs($.top+1)/$.rowHeight);
						if($.topRows===topRows) return;
						var rowsToChange = $.topRows-topRows;
						if(rowsToChange<0) {
							for(var i=0; i<Math.abs(rowsToChange); i++) {
								var row = $.rows.splice(0,1)[0];
								$.rows.push(row);
								$.topRows++;
								var top = $.halfPadding+$.topRows*$.rowHeight+$.rowNum*$.rowHeight,
									 startIndex = $.topRows*$.colNum+$.rowNum*$.colNum;
								$.moveRow($.rows.length-1,top);
								$.loadRow($.rows.length-1,startIndex);
							}
						} else {
							for(var i=0; i<rowsToChange; i++) {
								var row = $.rows.splice($.rows.length-1,1)[0];
								$.rows.unshift(row);
								$.topRows--;
								var top = $.halfPadding+$.topRows*$.rowHeight,
									startIndex = $.topRows*$.colNum;
								$.moveRow(0,top);
								$.loadRow(0,startIndex);
							}
						}
					},
					jumpToPoint: function(top) {
						var $ = this;
						$.moveContainer(top);
						$.moveSidebar();
						$.moveRows();
					},
				// elements
					insideSidebar: function(mY) {
						var $ = this,
							top = Math.abs($.top)/$.containerHeight*$.height,
							bottom = top+$.height/$.containerHeight*$.height;
						if(top<mY && mY<=bottom) return true;
						else return false;
					},
					moveSidebar: function() {
						var $ = this;
						$.sidebar.set().top(Math.abs($.top)/$.containerHeight*$.height);
					},
					changeHeight: function() {
						var $ = this;
						$.containerHeight = Math.ceil($.stream.length/$.colNum)*$.rowHeight;
						$.container.set().height($.containerHeight);
						$.sidebar.set().height($.height/$.containerHeight*$.height);
					},
				// rows
					moveRow: function(r,t) {
						for(var i=0; i<this.rows[r].length; i++)
							this.rows[r][i].container.set().top(t);
					},
					loadRow: function(r,s) {
						for(var i=0; i<this.rows[r].length; i++)
							this.rows[r][i].load(this.stream[s+i]);
					},
				// streams
					partialLoad: function(rowNum,colNum,index) {
						var $ = this;
						$.changeHeight();
						$.drawSidebar();
						for(var i=0; i<$.totalRowNum; i++)
							if(rowNum<=$.topRows+i)
								$.loadRow(i,$.topRows*$.colNum+i*$.colNum);
					},
					loadStream: function(stream) {
						var $ = this;
						if(stream) $.stream = stream;
						$.changeHeight();
						$.moveSidebar();
						for(var i=0; i<$.totalRowNum; i++)
							$.loadRow(i,$.topRows*$.colNum+i*$.colNum);
					},
				// tiles
					makeTiles: function() {
						var $ = this;
						for(var r=0; r<$.totalRowNum; r++) {
							for(var c=0; c<$.colNum; c++) {
								var tile = new $.tileConstructor($,$.tileWidth,$.tileHeight);
								$.moveToColumn(tile,c);
								$.moveToRow(tile,r);
								$.rows[r].push(tile);
							}
						}
					},
					removeTile: function(tile,index,rowNum,colNum) {
						var $ = this,
							replTile = new $.tileConstructor($,$.tileWidth,$.tileHeight),
							row;
						if((rowNum && colNum)===undefined) {
							rowNum = Math.floor(index/$.colNum);
							colNum = index%$.colNum;
						} else if(index===undefined) index = $.topRows*$.colNum+rowNum*$.colNum+colNum;
						row = $.rows[rowNum];
						$.moveToColumn(replTile,colNum);
						$.moveToRow(replTile,rowNum);
						row.splice(colNum,1,replTile);
						$.stream.splice(index,1);
						$.partialLoad(rowNum,colNum,index);
					},
					insertTile: function(tile) {
						var $ = this,
							index = $.topRows*$.colNum; // or custom sorting
						$.stream.splice(index,0,tile.content);
						$.partialLoad(Math.floor(index/$.colNum),index%$.colNum,index);
					},
					moveToColumn: function(tile,colNum) {
						tile.container.set()
							.left(
								Math.round(this.halfPadding+colNum*this.colWidth)
							)
					},
					moveToRow: function(tile,rowNum) {
						tile.container.set()
							.top(this.halfPadding+this.topRows*this.rowHeight+rowNum*this.rowHeight);
					}
			}
		},
	init: function() {
		var $ = this;
		$.setPrototype();
		$.setSelectorPrototype();
		$.setScrollerPrototype();
	}
}
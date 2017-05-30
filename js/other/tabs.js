app.tabs = {
	setVariables: function(winWidth,winHeight) {
		var $ = this;
		$.width = winWidth/6;
		$.tabHeight = 50;
		$.top = (winHeight-app.partsHeight)/2-$.tabHeight;
		$.tabNames = ['wave','filters','envelope'];
		$.tabs = {};
		$.container = dom.create('div',body);
		$.container.set()
			.position('absolute')
			.left((winWidth-$.width)/2)
			.top($.top);
		$.currentTab = undefined;
	},
	switchTab: function(tab) {
		var $ = this;
		$.currentTab.draw('inactive');
		$.currentTab = tab;
		tab.draw('active');
		app.plane.switchTab(tab.name);
		app.sideBar.switchTab(tab.name);
	},
	makeTabs: function() {
		var $ = this,
			tabNum = $.tabNames.length,
			tabSpacing = $.width/(tabNum+1);
		for(var i=0; i<$.tabNames.length; i++) {
			var tabName = $.tabNames[i],
				icon = app.storage.instrumentTabs[tabName],
				middle = tabSpacing*(i+1);
			$.tabs[tabName] = new $.Tab(tabName,icon,middle);
		}
	},
	Tab: function(tabName,icon,middle) {
		var $ = this, tabs = app.tabs,
			side = tabs.tabHeight;
		$.name = tabName;
		$.canvas = dom.create('canvas',tabs.container);
		$.canvas.set()
			.position('absolute')
			.canWidth(side)
			.canHeight(side)
			.left(middle-side/2)
			.borderRadius(4);
		$.canvas.onclick = function() {
			if($!==tabs.currentTab) {
				tabs.switchTab($);
			}
		}
		$.canvas.onmouseenter = function() {
			if($!==tabs.currentTab) $.draw('hover');
			$.popup.set().display('table');
			preservePointer();
		}
		$.canvas.onmouseleave = function() {
			if($!==tabs.currentTab) $.draw('inactive');
			$.popup.set().display('none');
			defaultCursor();
		}
		$.icon = icon;
		var textValues = { color: colors.gray8, font: fonts.text+'-UltraLight', size: 16 }
		$.popup = dom.create('div',tabs.container);
		$.popup.set()
			.position('absolute')
			.top(62)
			.padding(10,['Left','Right'])
			.height(30)
			.background(colors.gray3)
			.borderRadius(6)
			.display('table')
			.paragraph($.name,textValues);
		var rect = $.popup.getBoundingClientRect(),
			rectMiddle  = rect.width/2;
		$.popup.set().left(middle-rectMiddle).display('none');
		$.popup.cusp = dom.create('div',$.popup);
		var cuspSide = 8;
		$.popup.cusp.set()
			.position('absolute')
			.left(rectMiddle-cuspSide)
			.top(-cuspSide)
			.border(cuspSide,'transparent',['Left','Right'])
			.borderBottom(cuspSide,colors.gray3);
		return $;
	},
	setTabPrototype: function() {
		var tabs = this;
		this.Tab.prototype = {
			draw: function(state) {
				var $ = this, ctx = $.canvas.context,
					colors = app.storage.colors;
				if(state==='hover') $.canvas.set().background(colors.gray6);
				else if(state==='active') $.canvas.set().background(colors[this.name]);
				else $.canvas.set().background(colors.gray7);
				$.icon(ctx,$.canvas.width,state);
			}
		}
	},
	setState: function() {
		var $ = this,
			initialTabName = app.initialTabName;
		for(var i=0; i<$.tabNames.length; i++) {
			var name = $.tabNames[i],
				tab = $.tabs[name];
			if(initialTabName===tab.name) {
				$.currentTab = tab;
				$.switchTab(tab);
			} else {
				tab.draw('inactive');
			}
		}
	},
	init: function(winWidth,winHeight) {
		var $ = this;
		$.setVariables(winWidth,winHeight);
		$.setTabPrototype();
		$.makeTabs();
		$.setState();
	}
}
app.sideBar = {
	setVariables: function(winWidth,winHeight) {
		var $ = this;
		$.width = app.sideBarWidth;
		$.height = app.partsHeight;
		$.left = winWidth-(winWidth-app.planeWidth-app.middleSpacing-$.width)/2-$.width;
		$.container = dom.create('div',body);
		$.container.set()
			.position('absolute')
			.width($.width)
			.height($.height)
			.left($.left)
			.top(app.partTops)
			.boxShadow(0,0,8,0,colors.gray7)
			// .overflow('hidden')
			.borderRadius(3);
		$.currentTab = undefined;
	},	
	switchTab: function(tabName) {
		var $ = this;
		if($.currentTab) {
			$.currentTab.container.set().display('none');
			$.currentTab.toggleMode();
		}
		$.container.set().background(colors[tabName]);
		$.currentTab = $[tabName];
		$.currentTab.container.set().display('block');
		$.currentTab.toggleMode();
	},
	init: function(winWidth,winHeight) {
		var $ = this;
		$.setVariables(winWidth,winHeight);
		$.wave.init();
		$.filters.init();
		$.envelope.init();
	}
}
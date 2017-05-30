app.plane = {
	setVariables: function(winWidth,winHeight) {
		var $ = this;
		$.width = app.planeWidth;
		$.height = app.partsHeight;
		$.left = (winWidth-$.width-app.middleSpacing-app.sideBarWidth)/2;
		$.canvas = dom.create('canvas',body);
		$.canvas.set()
			.position('absolute')
			.canWidth($.width)
			.canHeight($.height)
			.left($.left)
			.borderRadius(4)
			.top(app.partTops)
			.boxShadow(0,0,8,0,colors.gray7)
			.background('white');
		$.currentTab = undefined;
	},
	switchTab: function(tabName) {
		var $ = this,
			canvas = $.canvas;
		canvas.context.clearRect(0,0,canvas.width,canvas.height);
		if($.currentTab) $.currentTab.toggleMode();
		$.currentTab = $[tabName];
		$.currentTab.toggleMode();
	},
	mousedown: function() {
		var $ = this;
		$.canvas.onmousedown = function(e) {
			var mouse = $.getMouse(e);
			$.currentTab.mousedown(mouse);
		}
	},
	mousemove: function() {
		var $ = this;
		$.canvas.onmousemove = function(e) {
			var mouse = $.getMouse(e);
			$.currentTab.mousemove(mouse);		
		}
	},
	mouseup: function() {
		var $ = this;
		window.addEventListener('mouseup',function(e) {
			var mouse = $.getMouse(e);
			$.currentTab.mouseup(mouse);
		});
	},
	getMouse: function(e) {
		var $ = this,
			rect = $.canvas.getBoundingClientRect();
		return {
			x: e.clientX-rect.left,
			y: e.clientY-rect.top
		}
	},
	init: function(winWidth,winHeight) {
		var $ = this;
		$.setVariables(winWidth,winHeight);
		$.mousedown();
		$.mousemove();
		$.mouseup();
		$.wave.init();
		$.filters.init();
		$.envelope.init();
	}
}
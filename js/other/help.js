app.help = {
	setVariables: function(winWidth,winHeight) {
		var $ = this;
		// popup
			$.showingPopup = false;
			$.popupWidth = winWidth*1/2;
			$.popupHeight = winHeight*1/2;
			$.popupTop =(winHeight-$.popupHeight)/2;
			$.popupLeft = (winWidth-$.popupWidth)/2;
		// icon
		$.iconHeight= 36;
		$.iconTop = 12;
		$.iconLeft = 12;//(winWidth-app.planeWidth-app.middleSpacing-app.sideBarWidth)/2;
		var values = { font: fonts.text+'-Light', size: 18, color: colors.gray5, width: $.iconHeight, height: $.iconHeight, background: colors.gray1, hover: colors.gray2, borderRadius: $.iconHeight/2 },
			callback = function() {
				$.togglePopup();
			}
		$.icon = dom.makeButton(body,'?',values,callback);
		$.icon.set()
			.position('absolute')
			.left($.iconLeft)
			.top($.iconTop);
	},
	makePopup: function() {
		var $ = this;
		$.popup = dom.create('div',body);
		$.popup.set()
			.transition('0.4s')
			.width($.popupWidth)
			.height($.popupHeight)
			.position('absolute')
			.left($.popupLeft)
			.top($.popupTop)
			.boxShadow(0,0,6,0,colors.gray4)
			.borderRadius(4)
			.display('none')
			.background(colors.gray7);
		var text = dom.create('p',$.popup),
			// contactStyling = '<span style="font-family: '+fonts.text+'-Medium">',
			message = 
			'<b>1.</b> In the wave tab, choose a wave type to act as your sound wave. If you choose custom type (the bottom one) draw your pattern on the display to the left. Click \'Round It!\' to initiate your drawing.'
				+'<br><b>2.</b> Use the filters tab to impose different filter types on your sound wave. The gray line shows a sum of all the filters that are active.'
				+'<br><b>3.</b> Customize the envelope of your sound in the envelope tab.'
				+'<br><b>4.</b> Finally, play the keys on your computer keyboard to hear the sound in action!'
				+'<br><br><b>Contact: josephljohnston@mac.com</b>';
		text.set()
			.width($.popupWidth*(2/3))
			.height($.popupHeight*(2/3))
			// .background('purple')
			.font(fonts.text)
			.size(16)
			.color(colors.gray1)
			.overflow('auto')
			.innerHTML(message)
			.position('absolute')
			.left($.popupWidth*(1/6))
			.top($.popupHeight*(1/6));
		text.style.lineHeight = '140%';
		text.style['word-wrap'] = 'break-word';
	},
	togglePopup: function() {
		var $ = this;
		if($.showingPopup) {
			$.popup.set().display('none');
			$.showingPopup = false;
		} else {
			$.popup.set().display('block');
			$.showingPopup = true;
		}
	},
	init: function(winWidth,winHeight) {
		var $ = this;
		$.setVariables(winWidth,winHeight);
		$.makePopup();
	}
}
 var compressor = require('node-minify');
// find files
	var base = 'js/';
	var partNames = ['other','plane','sideBar'];
	var parts = {};
	parts[partNames[0]] = ['app','storage','dom','player','tabs','help'];
	parts[partNames[1]] = ['plane','envelopePlane','filtersPlane','wavePlane'];
	parts[partNames[2]] = ['sideBar','envelopeSideBar','filtersSideBar','waveSideBar'];
	var files = [];
	for(var i=0; i<partNames.length; ++i) {
		var part = parts[partNames[i]];
		for(j=0; j<part.length; ++j) {
			files.push(base+partNames[i]+'/'+part[j]+'.js');
		}
	}
// minify
	new compressor.minify({
		type: 'yui-js',
		fileIn: files,
		fileOut: 'public/min.js',
		callback: function(err,min){
			if(err) console.log(err);
		}
	});
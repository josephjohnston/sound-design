app.player = {
	setVariables: function() {
		var $ = this;
		// current setting
			$.initialFilterValues = {
				_1: [0.4,0,26],
				_3: [0.6,0.5,20],
				_6: [0.8,0,0],
				_default: [0.5,0.5,20]
			}
		$.context = new webkitAudioContext();
		var ctx = $.context;
		$.assetType = 'osc';
		$.coefs = undefined;
		$.buffer = undefined;
		// filters
			$.nyquist = app.nyquist;
			$.filterNames = ['highpass','lowshelf','bandpass','peaking','notch','highshelf','lowpass'];
			$.filterProperties = {
				highpass: ['frequency','Q-factor'],
				lowshelf: ['frequency','gain'],
				bandpass: ['frequency','Q-factor'],
				peaking: ['frequency','Q-factor','gain'],
				notch: ['frequency','Q-factor'],
				highshelf: ['frequency','gain'],
				lowpass: ['frequency','Q-factor']
			}
			$.filterRanges = [
				{ property: 'frequency', range: [0,1] },
				{ property: 'Q-factor', range: [0,1] },
				{ property: 'gain', range: [-40,40] }
			]
			$.filterModes = [false,false,false,false,false,false,false];
			$.filters = {};
			for(var i=0; i<$.filterNames.length; i++) {
				var name = $.filterNames[i],
					engine = ctx.createBiquadFilter();
				engine.type = name;
				engine.frequency.value = getDefault('frequency');
				var properties = $.filterProperties[name];
				for(var p=0; p<properties.length; p++) {
					var property = properties[p];
					if(property==='Q-factor') engine.Q.value = getDefault(property);
					else if(property==='gain') engine.gain.value = getDefault(property);
				}
				$.filters[i+''] = {
					engine: engine,
					mode: $.filterModes[i]
				}
			}
			function getDefault(property) {
				for(var i=0; i<$.filterRanges.length; i++) {
					var filterRange = $.filterRanges[i];
					if(filterRange.property===property) {
						var value = filterRange.range[2],
							realValue = app.filterValueToReal(property,value);
						return realValue;
					}
				}
			}
		// wave
			$.periodicWave = undefined;
		// analyser
			$.analyser = ctx.createAnalyser();
			$.fftSize = 2048;
			$.binCount = $.fftSize/2; // 1024
			$.sampleRate = app.sampleRate;
			$.binResolution = $.sampleRate/$.fftSize; // 21.53
			$.totalFrequencies = $.binCount*$.binResolution; // 22046.72
		// envelope
			$.envelopeDuration = 4;
			$.envelopeProperties = ['attack','decay','sustain','release'];
			$.envelopeValues = {
				attack: $.envelopeDuration/8,
				decay: $.envelopeDuration/4,
				sustain: 1/2,
				release: $.envelopeDuration/2,
			}
			$.envelopeTypes = {
				attack: 'linear',
				decay: 'exponential',
				release: 'exponential',
			}
		// $.input = ctx.createGainNode();
		$.input = ctx.createGain();
		$.compressor = ctx.createDynamicsCompressor();
		$.waveShaper = ctx.createWaveShaper();
		$.waveShaper.curve = new Float32Array(0.9,0.1,0.1);
		$.compressor.connect($.waveShaper);
		$.waveShaper.connect($.analyser);
		$.analyser.connect(ctx.destination);
		// keys
			$.keyMap = {
				'65': 0,
				'87': 1,
				'83': 2,
				'69': 3,
				'68': 4,
				'70': 5,
				'84': 6,
				'71': 7,
				'89': 8,
				'72': 9,
				'85': 10,
				'74': 11,
				'75': 12,
				'79': 13,
				'76': 14,
				'80': 15,
				'186': 16,
				'222': 17,
				'221': 18,
				'13': 19
			}
	},
	sendFilterResponses: function() {
		var $ = this, totalResponse = [],
			filters = app.plane.filters,
			blocks = app.sideBar.filters.blocks,
			currentBlock = app.sideBar.filters.currentBlock,
			ctx = $.context,
			names = $.filterNames,
			length = filters.width,
			numOctaves = filters.numOctaves;
		for(var i=0; i<names.length; i++) {
			var name = names[i],
				filter = $.filters[i+''];
			if(!filter.mode) continue;
			var frequencyHz = new Float32Array(length),
				magResponse = new Float32Array(length),
				phaseResponse = new Float32Array(length),
				filterResponse = [];
			for(var f=0; f<length; f++) {
				var dec = f/length;
				frequencyHz[f] = $.nyquist*Math.pow(2,numOctaves*(dec-1));
			}
			filter.engine.getFrequencyResponse(frequencyHz,magResponse,phaseResponse);
			for(var m=0; m<length; m++) {
				var dbResponse = 20*Math.log(magResponse[m])/Math.LN10;
				dbResponse *= 2;
				filterResponse.push(dbResponse);
			}
			var block = blocks[i+''];
			totalResponse.push({ hue: block.hue, active: (block===currentBlock), data: filterResponse });
		}
		return totalResponse;
	},
	sendFrequencies: function() {
		var $ = this,
			freqDomain = new Uint8Array($.binCount);
		$.analyser.getByteFrequencyData(freqDomain);
		return freqDomain;
	},
	handleKeys: function() {
		var $ = this,
			k = Math.pow(2,1/12),
			mC = 440/Math.pow(k,9),
			notes = {},
			keysDown = [];
		function makeNote(semitones) {
			if(!($.waveType || $.coefs || $.buffer)) return;
			var frequency = mC*Math.pow(k,semitones),
				note = new $.Note(frequency);
			note.on();
			notes[semitones+''] = note;
		}
		function cancelNote(semitones) {
			if(!($.waveType || $.coefs || $.buffer)) return;
			var note = notes[semitones+''];
			note.off();
			note = undefined;
		}
		document.onkeydown = function(e) {
			var key = e.keyCode, semitones = $.keyMap[e.keyCode];
			if(semitones===undefined || keysDown.indexOf(key)>-1) return;
			keysDown.push(key);
			makeNote(semitones);
		}
		document.onkeyup = function(e) {
			var key = e.keyCode, semitones = $.keyMap[key];
			if(semitones===undefined || keysDown.indexOf(key)===-1) return;
			keysDown.splice(keysDown.indexOf(key),1);
			cancelNote(semitones);
		}
	},
	translateProperty: function(property) {
		switch(property) {
			case 'frequency': case 'gain':
				return property;
				break;
			case 'Q-factor':
				return 'Q';
				break;
		}
	},
	changeEnvelope: function(property,type,value) {
		var $ = this, ctx = $.context;
		$.envelopeValues[property] = value;
		if(property!=='sustain') $.envelopeTypes[property] = type;
	},
	changeWave: function(type,data) {
		var $ = this;
		if(type==='curved') {
			$.assetType = 'osc';
			$.waveType = 'custom';
			var coefs = data;
			$.periodicWave = $.context.createPeriodicWave(coefs.real,coefs.imag);
		} else if(type==='static') {
			$.assetType = 'buffer';
			$.buffer = data;
		} else { // type = default
			$.assetType = 'osc';
			$.waveType = data;
		}
	},
	toggleFilterMode: function(filterId) {
		var $ = this,
			filter = $.filters[filterId];
		if(!filter.mode) filter.mode = true;
		else filter.mode = false;
		$.assembleFilters();
	},
	assembleFilters: function() {
		var $ = this;
		$.input.disconnect(0);
		for(var i=0, activeFilters=[]; i<$.filterNames.length; i++) {
			var filter = $.filters[i+''];
			filter.engine.disconnect(0);
			if(filter.mode!==false) activeFilters.push(filter);
		}
		for(var i=0, previous; i<activeFilters.length; i++) {
			var filter = activeFilters[i];
			if(i===0) {
				// console.log('osc -> ',filter.engine.type);
				$.input.connect(filter.engine);
			} else {
				// console.log(previous.engine.type,' -> ',filter.engine.type);
				previous.engine.connect(filter.engine);
			}
			if(i===activeFilters.length-1) {
				// console.log(filter.engine.type,' -> analyser');
				filter.engine.connect($.compressor);
			}
			previous = filter;
		}
		if(activeFilters.length===0) {
			// console.log('osc -> analyser')
			$.input.connect($.compressor);
		}
	},
	changeFilterValue: function(filterId,property,value) {
		var $ = this,
			filter = $.filters[filterId+''],
			transProperty = $.translateProperty(property);
		filter.engine[transProperty].value = value;
	},
	Note: function(frequency) {
		var $ = this;
		$.assignAsset(frequency);
		$.startTime = undefined;
	},
	setNotePrototype: function() {
		var player = this,
			ctx = player.context;
		player.Note.prototype = {
			assignAsset: function(frequency) {
				var $ = this;
				$.asset = undefined;
				if(player.assetType==='osc') {
					$.asset = ctx.createOscillator();
					$.asset.frequency.value = frequency;
					if(player.waveType==='custom') {
						$.asset.setPeriodicWave(player.periodicWave);
					} else {
						$.asset.type = player.waveType;
					}
				} else {
					var buffer = ctx.createBuffer(1,player.buffer.length,ctx.sampleRate),
						data = buffer.getChannelData(0);
					for(var i=0; i<player.buffer.length; i++) {
						data[i] = player.buffer[i];
					}
					$.asset = ctx.createBufferSource();
					$.asset.buffer = buffer;
					$.asset.loop = true;
					var currentFrequency = ctx.sampleRate/frequency,
						inversePlaybackRate = currentFrequency/player.buffer.length;
					$.asset.playbackRate.value = 1/inversePlaybackRate;
				}
			},
			on: function() {
				var $ = this;
				$.envelope = ctx.createGain(),
					gain = $.envelope.gain,
					values = player.envelopeValues,
					types = player.envelopeTypes,
					attack = values['attack'],
					decay = values['decay'],
					sustain = values['sustain'],
					now = ctx.currentTime;
				gain.setValueAtTime(0.0001,now);
				// attack
					if(types.attack==='linear') {
						gain.linearRampToValueAtTime(1,now+attack);
					} else {
						gain.exponentialRampToValueAtTime(1,now+attack);
					}
				// decay
					if(types.decay==='linear') {
						gain.linearRampToValueAtTime(sustain,now+decay);
					} else {
						gain.exponentialRampToValueAtTime(sustain+0.0001,now+decay);
					}
				$.asset.connect($.envelope);
				$.envelope.connect(player.input);
				$.asset.start(now);
			},
			off: function() {
				var $ = this, values = player.envelopeValues,
					types = player.envelopeTypes,
					gain = $.envelope.gain,
					current = gain.value,
					attack = values['attack'],
					decay = values['decay'],
					sustain = values['sustain'],
					release = values['release'],
					now = ctx.currentTime,
					duration;
				gain.cancelScheduledValues(now);
				gain.linearRampToValueAtTime(current,now);
				if(0<sustain) duration = release-decay;
				else duration = decay-attack;
				var end = now+duration;
				if(types.release==='linear') {
					gain.linearRampToValueAtTime(0,end);
				} else {
					gain.exponentialRampToValueAtTime(0.0001,end);
				}
				$.asset.stop(end+0.2); // analyser to perceive zero freq
			}
		}
	},
	init: function() {
		var $ = this;
		$.setVariables();
		$.setNotePrototype();
		$.handleKeys();
		// $.assembleFilters(); // now done in filtersSideBar setState()
	}
}

	( function () {
	
		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-recorder';

		proto.createdCallback = function () {
			
			var url_prefix = this.dataset["url_prefix"];
			
			this.audio_api_wrap = new V.AudioApiWrap( Recorder, AudioContext, url_prefix + "/js/lib/recorderWorker.js", navigator, FileReader );
			this.audio_recorder = new V.AudioRecorder( this.audio_api_wrap );

		};

		document.registerElement( prefix, { prototype: proto } );

	} () );
	
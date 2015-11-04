
	( function () {
	
		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-recorder';

		proto.attachedCallback = function () {
			
			var worker_url = this.dataset["worker_url"];
			
			this.audio_api_wrap = new VAudioApiWrap( Recorder, AudioContext, worker_url, navigator, FileReader );
			this.audio_recorder = new VAudioRecorder( this.audio_api_wrap );

		};

		document.registerElement( prefix, { prototype: proto } );

	} () );
	
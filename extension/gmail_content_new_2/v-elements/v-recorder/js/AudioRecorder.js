
	V.AudioRecorder = function ( audio_api_wrap ) {

		var private = {
			
			recorder: false,
			stream: false
			
		};

		var public =  {

			start: function () {
				return new Promise ( function ( resolve, reject ) {
					if ( private.recorder || private.stream ) {
						reject( new Error("recorder or stream is truthy") );
					} else {
						audio_api_wrap.get_stream()
						.then( function ( stream ) {
							
							if ( stream === false ) {
								resolve( false );
							} else {
								private.recorder = audio_api_wrap.stream_to_recorder( stream );
								private.stream = stream;
								private.recorder.record();
								resolve( true );
							}
							
						});
					};
				});
			},

			pause: function () {
				if ( private.recorder ) {
					private.recorder.stop();
				} else {
					throw new Error( "recorder is falsy" )
				}				
			},

			cancel: function () {
				
				if ( private.recorder && private.stream ) {

					private.recorder.stop();
					private.recorder.clear();

					private.recorder.context.close();
					private.stream.getAudioTracks()[0].stop();

					private.recorder = false;
					private.stream = false;

				} else {
					throw new Error("recorder or stream is falsy");
				}
			
			},

			get_blob: function () {
				return new Promise( function ( resolve, reject ) {
					if ( private.recorder ) {
						private.recorder.stop();
						private.recorder.exportWAV( function ( blob ) {
							resolve( blob );
						});
					} else {
						reject( new Error("recorder is falsy") );
					};

				});
			},

			get_buffer: function () {
				return new Promise( function ( resolve, reject ) {
					if ( private.recorder ) {
						private.recorder.stop();
						private.recorder.exportWAV( function ( blob ) {
							audio_api_wrap.blob_to_buffer( blob )
							.then( function ( buffer ) {
								resolve( buffer );
							});
						});
					} else {
						reject( new Error("recorder is falsy") );
					};

				});
			},

			get_data_url: function () {
				return new Promise( function ( resolve, reject ) {
					if ( private.recorder ) {
						private.recorder.stop();
						private.recorder.exportWAV( function ( blob ) {
							audio_api_wrap.blob_to_data_url( blob )
							.then( function ( buffer ) {
								resolve( buffer );
							});
						});
					} else {
						reject( new Error("recorder is falsy") );
					};

				});
			}

		};
		
		return public;

	};

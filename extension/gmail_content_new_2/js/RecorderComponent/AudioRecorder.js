
	V.AudioRecorder = function ( audio_api_wrap ) {

		var private = {
			
			recorder: false,
			stream: false,
			
			cancel: function () {
				
				if ( recorder && stream ) {

					private.recorder.stop();
					private.recorder.clear();

					private.recorder.context.close();
					private.stream.getAudioTracks()[0].stop();

					private.recorder = false;
					private.stream = false;

				} else {
					throw new Error("recorder or stream is falsy");
				}
			
			}
			
		};

		var public =  {

			start: function () {
				return new Promise ( function ( resolve ) {
					audio_api_wrap.get_stream()
					.then( function ( stream ) {
						
						if ( stream === false ) {
							resolve( false );
						} else {
							private.recorder = audio_api_wrap.stream_to_recorder( stream );
							private.stream = stream;
							resolve( true );
						}
						
					});
				});
			},

			pause: function () {
				
				private.recorder.stop();
				
			},

			cancel: function () {
				
				private.cancel();
				
			},

			finish: function () {
				
				return new Promise( function ( resolve ) {
					
					if ( private.recorder ) {
						private.recorder.stop();
						private.recorder.exportWAV( function ( blob ) {
							audio_api_wrap.blob_to_buffer( blob ).then( function ( buffer ) {
								private.cancel();
								resolve( buffer );
							});;
						});
					} else {
						throw new Error("recorder is falsy");
					};

				});
				
			}

		};
		
		return public;

	};


	( function () {
		
		// SHIMS
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
		window.URL = window.URL || window.webkitURL;
		
		// VARS
		var			
			v = {
				recorder: null,
				stream: null
			};
		
		// FUNCTIONS
		function create_recorder ( callback ) {
			navigator.getUserMedia(
				{
					audio: true
				},
				function ( stream ) {
					callback (
						new Recorder(
							( new AudioContext() ).createMediaStreamSource( stream ),
							{
								workerPath: WORKER_PATH
							}
						),
						stream
					);
				},
				function () {
					callback( false );
				}
			);
		};
		
		function delete_recorder ( recorder, stream ) {
			recorder.stop();
			recorder.clear();
			stream.getAudioTracks()[0].stop();
		};

		function get_audio_data ( recorder, stream, callback ) {
			recorder.stop();
			recorder.exportWAV( function ( blob ) {
				reader = new FileReader();
				reader.readAsDataURL( blob );
				reader.onloadend = function () {
					callback( reader.result.replace( 'data:audio/wav;base64,', '' ) );
					delete_recorder( recorder, stream );
				}
			});
		}
		
		// PROGRAM
		V.addObservers({
			
			'start_recording_request': function ( data, callback ) {
				create_recorder( function ( recorder, stream ) {
					v.recorder = recorder;
					v.stream = stream;
					recorder.record();
					callback()
				});
			},
			
			'cancel_recording_request': function () {
				delete_recorder( v.recorder, v.stream );
			},
			
			'finish_recording_request': function ( data, callback ) {
				get_audio_data( v.recorder, v.stream, callback );
			}
			
		});

	} () )

	
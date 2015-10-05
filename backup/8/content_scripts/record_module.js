
	( function () {
		
		var recorder = {
			
			recorder: null,
			
			stream: null,
			
			create_recorder_from_stream: function ( stream ) {
				recorder.recorder = new Recorder(
					( new AudioContext() ).createMediaStreamSource( stream ),
					{
						workerPath: WORKER_PATH
					}
				),
				recorder.stream = stream;
			},
			
			create_recorder: function ( callback ) {
				if ( recorder.recorder === null && recorder.stream === null ) {
					navigator.getUserMedia(
						{
							audio: true
						},
						function ( stream ) {
							recorder.create_recorder_from_stream( stream );
							if ( recorder.recorder ) recorder.recorder.record();
							callback( true );
						},
						function () {
							callback( false );
						}
					);
				} else {
					callback( true );
				}
			},
			
			delete_recorder: function () {
				if ( recorder.recorder !== null && recorder.stream !== null ) {
					
					recorder.recorder.stop();
					recorder.recorder.clear();
					
					recorder.recorder.context.close();
					
					recorder.stream.getAudioTracks()[0].stop();
					
					recorder.recorder = null;
					recorder.stream = null;
					
				}
			},
			
			get_base64_from_blob: function ( blob, callback ) {
				reader = new FileReader();
				reader.readAsDataURL( blob );
				reader.onloadend = function () {
					callback( reader.result.replace( 'data:audio/wav;base64,', '' ) );
				};
			},
			
			get_audio_data: function ( callback ) {
				if ( recorder.recorder ) {
					recorder.recorder.stop();
					recorder.recorder.exportWAV( function ( blob ) {
						recorder.get_base64_from_blob( blob, callback );
					});
				} else {
					callback( false );
				}
			}
			
		};
		
		v.add({
			
			'start_recording_request': function ( data ) {
				recorder.create_recorder( data.callback );
			},
			
			'pause_recording_request': function ( data ) {
				recorder.recorder.stop();
			},
			
			'cancel_recording_request': function () {
				recorder.delete_recorder();
			},
			
			'finish_recording_request': function ( data ) {
				recorder.get_audio_data( data.callback );
				recorder.delete_recorder( recorder.recorder, recorder.stream );
			}
			
		});
	
	} () );

	V.AudioRecorder = function ( Recorder, AudioContext, workerPath, navigator, FileReader ) {

		var recorder = null;
		var stream = null;

		create_recorder_from_stream = function ( stream_arg ) {
			recorder = new Recorder(
					( new AudioContext() ).createMediaStreamSource( stream_arg ),
					{
						workerPath: workerPath,
						numChannels: 1

					}
				),
			stream = stream_arg;
		};

		create_recorder = function ( callback ) {
			if ( recorder === null && stream === null ) {
				navigator.getUserMedia(
					{
						audio: true
					},
					function ( stream ) {
						create_recorder_from_stream( stream );
						if ( recorder ) recorder.record();
						if ( callback ) callback( true );
					},
					function () {
						if ( callback ) callback( false );
					}
				);
			} else {
				if ( callback ) callback( true );
			}
		};

		delete_recorder = function () {
			if ( recorder !== null && stream !== null ) {

				recorder.stop();
				recorder.clear();

				recorder.context.close();
				stream.getAudioTracks()[0].stop();

				recorder = null;
				stream = null;

			}
		};

		get_buffer_from_blob = function ( blob, callback ) {
			reader = new FileReader();
			reader.readAsArrayBuffer( blob );
			reader.onloadend = function () {
				callback( reader.result );
			};
		};

		get_audio_data = function ( callback ) {
			if ( recorder ) {
			recorder.stop();
			recorder.exportWAV( function ( blob ) {
				get_buffer_from_blob( blob, callback );
				});
			} else {
				callback( false );
			}
		};

		return {

			start: function ( callback ) {
				create_recorder( callback );
			},

			pause: function () {
				recorder.stop();
			},

			cancel: function () {
				delete_recorder();
			},

			finish: function ( callback ) {
				get_audio_data( function ( audio_data ) {
					delete_recorder();
					callback( audio_data );
				});
			}

		};

	};

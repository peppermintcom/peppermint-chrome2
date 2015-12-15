
	function BackgroundRecorder ( runtime, web_audio_recorder_wrap ) {

		var private = {

			start: function ( callback ) {

				web_audio_recorder_wrap.start()
				.then( function () {
					callback({
						started: true
					});
				})
				.catch( function ( error ) {
					callback({
						started: false,
						error: error
					});
				});

			},

			cancel: function () {
				web_audio_recorder_wrap.cancel();
			},

			finish: function ( callback ) {

				web_audio_recorder_wrap.finish()
				.then( function ( blob ) {

					public.last_recording_blob = blob;
					callback( true );

				});

			}

		};

		var public = {

			last_recording_blob: null

		};

		( function constructor () {

			runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.class_name === 'BackgroundRecorder' ) {

					private[ message.method_name ]( callback );
					return true;

				}

			});

		} () )

		return public;

	}


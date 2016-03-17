
	function BackgroundRecorder ( runtime, web_audio_recorder_wrap, transcription_manager ) {

		var private = {

			start: function ( callback ) {
				web_audio_recorder_wrap.start()
				.then( function () {
					callback({
						started: true
					});
					transcription_manager.start();
				})
				.catch( function ( error ) {
                    Raven.captureException(error);
					callback({
						started: false,
						error: {
							name: error.name
						}
					});
				});

			},

			blob_to_data_url: function ( blob ) {
				return new Promise ( function ( resolve ) {

					var reader = new FileReader();
					reader.onloadend = function () {
						resolve( reader.result );
					};
					reader.readAsDataURL( blob );
					
				});
			},

			cancel: function () {
				web_audio_recorder_wrap.cancel();
				transcription_manager.cancel();
			},

			finish: function ( callback ) {

				web_audio_recorder_wrap.finish()
				.then( private.blob_to_data_url )
				.then( function ( data_url ) {

					transcription_manager.finish()
					.then( function ( transcription_data ) {

						callback({ data_url, transcription_data });

					})

				});

			}

		};

		( function constructor () {

			runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.class_name === 'BackgroundRecorder' ) {

					private[ message.method_name ]( callback );					

				}

			});

		} () )

	}



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
			},

			finish: function ( callback ) {

				web_audio_recorder_wrap.finish()
				.then( private.blob_to_data_url )
				.then( callback );

			}

		};

		( function constructor () {

			runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.class_name === 'BackgroundRecorder' ) {

					private[ message.method_name ]( callback );
					return true;

				}

			});

		} () )

	}


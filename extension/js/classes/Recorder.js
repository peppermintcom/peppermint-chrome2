
	function Recorder ( chrome, $, hub, web_audio_recorder_wrap, transcription_manager ) {
		
		var private = {

			blob_to_data_url: function ( blob ) {

				return new Promise ( function ( resolve ) {

					var reader = new FileReader();
					reader.onloadend = function () {
						resolve( reader.result );
					};
					reader.readAsDataURL( blob );
					
				});

			}
		};

		var public = {

			start: function ( callback ) {

				return new Promise ( function ( resolve ) {

					web_audio_recorder_wrap.start()
					.then( function () {
						resolve({
							started: true
						});
						transcription_manager.start();
					})
					.catch( function ( error ) {
						Raven.captureException(error);
						resolve({
							started: false,
							error: {
								name: error.name
							}
						});
					});

				});

			},

			cancel: function () {

				web_audio_recorder_wrap.cancel();
				transcription_manager.cancel();

			},

			finish: function () {

				return new Promise ( function ( resolve ) {

					web_audio_recorder_wrap.finish()
					.then( private.blob_to_data_url )
					.then( function ( data_url ) {

						transcription_manager.finish()
						.then( function ( transcription_data ) {

							resolve({ data_url, transcription_data });

						});

					});

				});

			},

			get_frequency_data: web_audio_recorder_wrap.get_frequency_data,

			get_time: web_audio_recorder_wrap.get_time

		};

		return public;

	}

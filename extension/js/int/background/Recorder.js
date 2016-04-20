
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

			},

			data_url_to_object_url: function ( data_url ) {

				return new Promise( function ( resolve ) {

					var xhr = new XMLHttpRequest();
					xhr.open( "GET", data_url, true );
					xhr.responseType = "blob";

					xhr.onload = function () {

						resolve( URL.createObjectURL( xhr.response ) );

					}

					xhr.send();

				})

			},

			blob_to_object_url: function ( blob ) {

				return URL.createObjectURL( blob );

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
						
						Raven.log( 'recorder', 'start', '', error );
						
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

					var object_url;

					web_audio_recorder_wrap.finish()
					.then( function ( blob ) {

						return private.blob_to_data_url( blob );

					})
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

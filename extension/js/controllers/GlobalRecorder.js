
	function Recorder ( chrome, $, hub, web_audio_recorder_wrap, transcription_manager ) {
		
		var state = {

			MAX_RECORDING_TIME: 2 * 1000 

		};

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

					});

				});

			}

		};

		var public = {

		};

		chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

			if ( message.receiver === "GlobalRecorder" ) {

				if ( message.name === "start" ) {

					private.start( callback );

				} else if ( message.name === "cancel" ) {

					private.cancel();
					callback();

				} else if ( message.name === "finish" ) {

					private.finish( function ( recording_data ) {

						$.extend( recording_data, message.recording_data );

						hub.fire( "background_message", { receiver: "GlobalUploader", name: "upload_recording_data", recording_data } );

						hub.fire( "background_message", { receiver: "GlobalStorage", name: "update_recording_data", recording_data });

						try { callback( recording_data ); } catch ( e ) {};

					});

				} else if ( message.name === "get_frequency_data" ) {

					callback( web_audio_recorder_wrap.get_frequency_data() );					

				} else if ( message.name === "get_time" ) {

					callback( web_audio_recorder_wrap.get_time() );

				} else if ( message.name === "get_timeout" ) {

					callback( web_audio_recorder_wrap.get_timeout() );

				}

				return true;

			}

		});

		return public;

	}

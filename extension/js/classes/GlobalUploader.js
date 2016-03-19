	
	function GlobalUploader ( chrome, $, hub, upload_queue ) {
		
		var state = {

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

					})

				});

			}

		};

		var public = {

		};

		hub.add({

			"global_recorder_event": function ( message ) {

				if ( message.receiver === "GlobalUploader" ) {

					if ( message.name === "upload_recording_data" ) {

						upload_queue.push( message.recording_data );
						upload_queue.kickstart();

					}

				}

			}

		});

		chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

			if ( message.receiver === "GlobalUploader" ) {

				if ( message.name === "get_urls" ) {

					upload_queue.get_urls_promise()
					.then( callback );

				}

				return true;

			}

		});

		return public;

	}

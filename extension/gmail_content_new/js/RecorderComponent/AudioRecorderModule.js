
	V.AudioRecorderModule = function ( data_manager, audio_recorder ) {

		var public = {

			start: function () {
				return new Promise( function ( resolve ) {
					audio_recorder.start()
					.then( function ( started ) {
						data_manager.apply_data( 'audio_data', { started: started } );
						resolve();
					});
				});
			},

			pause: function () {
				audio_recorder.pause();
			},

			cancel: function () {
				audio_recorder.cancel();
			},

			finish: function () {
				return new Promise( function ( resolve ) {
					audio_recorder.finish()
					.then( function ( buffer ) {
						data_manager.apply_data( 'audio_data', { buffer: buffer } );
						resolve();
					});
				});
			}

		};
		
		return public;

	};

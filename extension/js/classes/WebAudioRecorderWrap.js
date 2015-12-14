
	function WebAudioRecorderWrap ( navigator, WebAudioRecorder, AudioContext ) {

		var private = {
			
			recorder: null,
			stream: null,

			get_stream: function () {
				return new Promise( function ( resolve, reject ) {
					navigator.getUserMedia(
						{
							audio: true
						},
						function ( stream ) {
							resolve( stream );
						},
						function ( error ) {
							reject( error );
						}
					);
				});
			}

		};

		var public = {

			start: function () {

				return new Promise( function ( resolve, reject ) {

					private.get_stream()
					.then( function ( stream ) {

						private.stream = stream;
						private.context = new AudioContext();

						private.recorder = new WebAudioRecorder(
							private.context.createMediaStreamSource( stream ),
							{
								workerDir: "lib/",
								numChannels: 2,
								encoding: 'mp3',
								options: {
									timeLimit: 60 * 60 * 24,
									encodeAfterRecord: true,
									mp3: {
										bitRate: 32
									}
								}
							}
						);

						private.recorder.startRecording();

						resolve();

					})
					.catch( function ( error ) {
						console.log( error );
						reject( error );
					});

				});

			},

			cancel: function () {
			
				private.context.close();
				private.recorder.cancelRecording();
				private.stream.getAudioTracks()[0].stop();

			},

			finish: function () {
				return new Promise( function ( resolve ) {

					private.recorder.onComplete = function ( recorder, blob ) {
						resolve( blob );
					};

					private.recorder.finishRecording();
					public.cancel();

				});
			}

		};

		return public;

	};

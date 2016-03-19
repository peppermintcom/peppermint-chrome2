
	function WebAudioRecorderWrap ( chrome, event_hub, navigator, WebAudioRecorder, AudioContext, worker_dir ) {

		var private = {
			
			recorder: null,
			stream: null,
			media_source: null,
			analyser: null,

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

					if ( ! private.recorder ) {

						private.get_stream()
						.then( function ( stream ) {

							private.stream = stream;
							private.context = new AudioContext();
							private.media_source = private.context.createMediaStreamSource( stream );
							private.analyser = private.context.createAnalyser();

							private.media_source.connect( private.analyser );
							// private.media_source.connect( private.context.destination );

							private.recorder = new WebAudioRecorder(
								private.media_source,
								{
									workerDir: worker_dir,
									numChannels: 2,
									encoding: 'mp3',
									options: {
										timeLimit: 10 * 60,
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
	                        Raven.captureException(error);
							console.log( error );
							reject( error );
						});

					} else {

						reject({ name: "already_recording" });

					}

				});

			},

			cancel: function () {
			
				private.context.close();
				private.recorder.cancelRecording();
				private.stream.getAudioTracks()[0].stop();

				private.recorder = null;
				private.stream = null;

			},

			finish: function () {
				return new Promise( function ( resolve ) {

					private.recorder.onComplete = function ( recorder, blob ) {
						console.log( blob );
						resolve( blob );
					};

					private.recorder.finishRecording();
					public.cancel();

				});
			},

			blob_to_buffer: function ( blob ) {
				return new Promise( function ( resolve ) {

					var reader = new FileReader();
					reader.readAsArrayBuffer( blob );
					reader.onloadend = function () {
						resolve( reader.result );
					};

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

			get_frequency_data: function () {

				if ( private.analyser ) {

					var frequency_data = new Uint8Array( 200 );
					private.analyser.getByteFrequencyData( frequency_data );
					return frequency_data;

				} else {

					return false;
				
				}

			},

			get_time: function () {

				if ( private.recorder ) {

					return private.recorder.recordingTime();
					
				} else {

					return false;
					
				}

			}

		};

		( function () {

            event_hub.fire( 'class_load', { name: 'WebAudioRecorderWrap' } );

		} () )

		return public;

	};

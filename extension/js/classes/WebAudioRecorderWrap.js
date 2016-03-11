
	function WebAudioRecorderWrap ( chrome, navigator, WebAudioRecorder, AudioContext, worker_dir, utilities ) {

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
			},

            add_metric: function ( metric, log_result ){
                
                if(!utilities)
                    utilities = new Utilities( chrome, $, 'WebAudioRecorderWrap' );
                    
                utilities.add_metric( metric, function ( result ) {
                    if(log_result)
                        console.log({ metric, result });
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
									timeLimit: 60 * 10,
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

			}

		};

		( function () {

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.name === "WebAudioRecorderWrap.get_frequency_data" ) {

					var frequency_data = public.get_frequency_data();
					
					callback( frequency_data );

				}

			});
            
            private.add_metric({ name: 'class-load', val: { class: 'WebAudioRecorderWrap' } });

		} () )

		return public;

	};


	( function () {

		var RecorderWrap = function () {

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
				},

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

		var recorder_wrap = new RecorderWrap();

		window.onmessage = function ( event ) {

			var options = {

				'start': function () {
					recorder_wrap.start()
					.then( function () {
						console.log("started");
						window.top.postMessage({
							name: 'started',
						},"*");
					})
					.catch( function ( error ) {
						window.top.postMessage({
							name: 'not_started',
							error: { name: error.name }
						},"*");
					});
				},

				'cancel': function () {
					recorder_wrap.cancel();
				},

				'finish': function () {
					recorder_wrap.finish()
					.then( function ( blob ) {
						console.log( blob );
						console.log("finished");
						window.top.postMessage({
							name: 'finished',
							blob: blob
						},"*");
					});
				}

			};

			if ( typeof options[ event.data.name ] === 'function' ) {
				options[ event.data.name ]();
			}

		};

	} () );
	
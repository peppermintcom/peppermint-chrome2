
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
							function () {
								reject();
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
									numChannels: 1,
									encoding: 'ogg',
									options: {
										timeLimit: 60 * 60 * 24,
										encodeAfterRecord: true,
										ogg: {
											quality: -0.1
										}
									}
								}
							);

							private.recorder.startRecording();

							resolve();

						})
						.catch( reject );

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
						window.top.postMessage({
							name: 'started',
						},"*");
					})
					.catch( function () {
						window.top.postMessage({
							name: 'not_started',
						},"*");
					})
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
	
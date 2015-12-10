
	( function () {

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
	

	function log ( message ) {
		dom_log.innerHTML += "\n" + message;
	}
	
	V.notifyObservers( 'start_recording_request', null, function () {
		setTimeout( function () {
			V.notifyObservers(
				'finish_recording_request',
				null,
				function( response ) {
					// window.open( 'data:audio/wav;base64,' + response );
					V.notifyObservers( 'send_data_request', response );
				}
			);
		}, 1000 )	
	});
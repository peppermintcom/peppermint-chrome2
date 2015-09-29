
	V = {};
	
	V.state = {};

	V.events = {};
	
	V.addObserver = function (  event, callback ) {
	
		if ( typeof V.events[ event ] == 'undefined' ) {
		
			V.events[ event ] = [];

		}
		
		V.events[ event ].push( callback );
	
	};
	
	V.addObservers = function ( observers ) {
	
		Object.keys( observers ).forEach( function ( event_name ) {

			V.addObserver( event_name, observers[ event_name ] );

		} );
	
	};
	
	V.notifyObservers = function ( event, data, response_callback ) {
		
		console.log( event );
		
		if ( typeof V.events[ event ] !== 'undefined' ) {
		
			for ( var i = V.events[ event ].length; i-- ; ) {
			
				V.events[ event ][ i ]( data, response_callback );
			
			}
		
		}

	};
	
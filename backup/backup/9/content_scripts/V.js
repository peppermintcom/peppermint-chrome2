	
	var V = {};

	V.EventHub = function () {
		
		var events = {};
	
		function add_one ( name, observer ) {
		
			if ( typeof events[ name ] === 'undefined' ) {
			
				events[ name ] = [];

			}
			
			events[ name ].push( observer );
		
		};
	
		return {
			
			add: function ( observers ) {
		
				Object.keys( observers ).forEach( function ( name ) {

					add_one( name, observers[ name ] );

				});
			
			},
			
			remove: function ( name ) {
				events[ name ] = undefined;
			},
			
			fire: function ( data ) {
				
				console.log( data );
				
				if ( events[ data.name ] ) {
				
					events[ data.name ].forEach( function ( observer ) {
					
						observer( data );
					
					});
				
				}
				
			}
		
		}
		
	};
	
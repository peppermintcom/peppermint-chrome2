	
	function EventHub () {
		
		var private = {
			
			events: {},            

			add_one: function ( name, observer ) {
			
				if ( typeof private.events[ name ] === 'undefined' ) {
				
					private.events[ name ] = [];

				}
				
				private.events[ name ].push( observer );
			
			},
			
			remove: function ( name ) {

				private.events[ name ] = undefined;

			}
		
		};
	
		var public =  {
	
			add: function ( observers ) {
		
				Object.keys( observers ).forEach( function ( name ) {

					private.add_one( name, observers[ name ] );

				});
			
			},
			
			fire: function ( name, data ) {
				
				if ( typeof private.events[ name ] !== 'undefined' ) {
					
					private.events[ name ].forEach( function ( observer ) {
					
						observer( data );
					
					});
				
				};
				
			}

		};

		return public;
		
	};
	
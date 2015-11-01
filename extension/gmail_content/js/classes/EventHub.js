
	V.EventHub = function ( hub_name ) {
		
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

		var public = {
			
			fire: function ( data ) {
				
				if ( private.events[ data.name ] !== undefined ) {
				
					console.log( hub_name || 'no_name' , 'fired', data );
					
					private.events[ data.name ].forEach( function ( observer ) {
					
						observer( data );
					
					});
				
				};
				
			},
			
			add: function ( observers ) {
		
				Object.keys( observers ).forEach( function ( name ) {

					private.add_one( name, observers[ name ] );

				});
			
			}
			
		};
		
		return public;
		
	};
	
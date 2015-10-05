	
	v = {
	
		events: {},
	
		add_one: function ( name, observer ) {
		
			if ( typeof v.events[ name ] === 'undefined' ) {
			
				v.events[ name ] = [];

			}
			
			v.events[ name ].push( observer );
		
		},
	
		add: function ( observers ) {
	
			Object.keys( observers ).forEach( function ( name ) {

				v.add_one( name, observers[ name ] );

			});
		
		},
	
		fire: function ( data ) {
			
			console.log( data );
			
			if ( v.events[ data.name ] ) {
			
				v.events[ data.name ].forEach( function ( observer ) {
				
					observer( data );
				
				});
			
			}
			
		},
		
	};

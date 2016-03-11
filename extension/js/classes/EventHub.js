	
	function EventHub ( hub_name, utilities ) {
		
		var private = {
			
			events: {},            

            add_metric: function ( metric, log_result ){
                
                if(!utilities)
                    utilities = new Utilities( chrome, $, 'EventHub' );
                    
                utilities.add_metric( metric, function ( result ) {
                    if(log_result)
                        console.log({ metric, result });
                });
            },
	
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
				
			},

			stop: function () {

				public.fire = function () {}

			}
			
		};

        ( function constructor () {
            
            private.add_metric({ name: 'class-load', val: { class: 'EventHub' } });

		} () );
        
		return public;
		
	};
	
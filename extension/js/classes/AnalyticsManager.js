	
	function AnalyticsManager ( source, event_hub, utilities ) {
		
		var state = {

		};

		var private = {
			
			source: 'unknown',
			
			client: null,
			
			project_id: "56e0ac0d46f9a711cd6c91de",
			
			write_key: "cc6c23ec2471b22c29a9760a4dea1611d44b5b07fad2a64b5b892c6883d6ce9d415bc2fcd2742d2f9d5a3d72ba3c7b72fdda0632788ed7bd8aeacac3999ad69dc19e175c1a1375b02d136b429379d5dc1b808fb04f985ffb22244073d801ba99",
			
			load: function ( source ) {
				
				if ( private.client === null ){
					
					private.source = source;
					 
					private.client = new Keen({
						projectId: private.project_id,
						writeKey: private.write_key
					});
					
					private.event_hub_setup();
										
					console.log("Keen loaded from " + source);
					
				}
				
			},
			
			event_hub_setup: function ( ) {
				
				if(!event_hub){
					console.error("event_hub not available to AnalyticsManager");
				} else {
					event_hub.add({
						setup: function( data ){
							private.handle_event( 'setup' , data );
						},class_load: function( data ){
							private.handle_event( 'class_load' , data );
						},
						page_load: function( data ){
							private.handle_event( 'page_load' , data );
						},
						peppermint_compose_button_click: function( data ){
							private.handle_event( 'peppermint_compose_button_click' , data );
						},
						peppermint_reply_button_click: function( data ){
							private.handle_event( 'peppermint_reply_button_click' , data );
						},
						user_click: function( data ){
							private.handle_event( 'user_click' , data );
						},
						tooltip_close_button_click: function( data ){
							private.handle_event( 'tooltip_close_button_click' , data );
						},
						options_change: function( data ){
							private.handle_event( 'options_change' , data );
						},
						timeout: function( data ){
							// private.handle_event( 'timeout' , data );
						},
						tick: function( data ){
							// private.handle_event( 'tick' , data );
						}
					});
				}

			},
			
			handle_event: function ( name, data ){
				private.track( { name: name, val: data } );
			},
			
			// analytic: { name: '', val: { } }
			track: function ( analytic, callback ) {
				
				if( private.source === 'background' )
				
					private.send ( analytic, callback );
					
				else {
											
					chrome.runtime.sendMessage({ name: 'track_analytic', val: analytic }, function(result) {
						if ( callback ) callback( result );
					});
				}
				
			},
			
			send: function ( analytic, callback ) {
				
				private.client.addEvent( analytic.name, analytic.val, function(err, res){
					
					var response = {};
					
					var info = analytic.name + ((analytic.val.name) ? '.' + analytic.val.name : '');
					
					if (err) {							
						
						// todo: log to Raven
						
						response = { 
							_result: 'ERROR: ' + info, 
							analytic, 
							err 
						};							
						
					}
					else {  
						
						response = { 
							_result: 'success: ' + info, 
							analytic,
							res 
						};

                    }
                    
                    if(callback) callback(response);
                    else{
                        console.log(["Analytic Send Result (no callback) > " + response._result, response]);
                    }
                        
                });
            }          


		};

		var public = {
			
			// analytic: { name: '', val: { } }
			track: function ( analytic, callback ) {
				
				private.track ( analytic, callback );
				
			}

		};

		( function constructor () {
			
			private.load( source );
			
			event_hub.fire( 'class_load', { name : 'AnalyticsManager' } );

		} () )

		return public;

	}

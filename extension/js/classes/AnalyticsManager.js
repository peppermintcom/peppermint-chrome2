	
	function AnalyticsManager ( source, event_hub, utilities ) {
		
		var state = {

			client: null,

			source: 'unknown',

			platform: 'chrome',

			cur_project_id: '',

			cur_write_key: ''

		};

		var private = {
			
			dev_project_id: '56f2ac4fd2eaaa65ab2ca95c',

			dev_write_key: '96f74d11402399445d7952888881701758b770918e794cc291f178eadbc2983efeadf44ae452a5c91ddab2eeb8bd8665bd53a89b974d1d7e97a4fd20ca37524d004cc70d271d30d8cdc5e4f9dc9a6973be4d3294ef379cbb4f6bf99448fa3b8e',

			prod_project_id: '56f2ac0296773d6273dbdb98',

			prod_write_key: '8c5bd076e16f5688cf2c15789ca5bcb5002539daf884df90fa2deed78960447d6a5a31278c7b4baed95c141afbd38bed9b30783977d434f79018bbaab90a28b3883d4125f46e17078cece6c7c556a3df426b199326030e88f295ce38c2461590',
			
			
			load: function ( source ) {
				
				if ( state.client === null ) {

					state.source = source;

					chrome.storage.local.get( [ "prod_id", "current_id" ], function ( items ) {

						if( items[ "prod_id" ] === items[ "current_id" ] ) {

							state.cur_project_id = private.prod_project_id;
							state.cur_write_key = private.prod_write_key;

						} else {

							state.cur_project_id = private.dev_project_id;
							state.cur_write_key = private.dev_write_key;

						}

						state.client = new Keen({
							projectId: state.cur_project_id,
							writeKey: state.cur_write_key
						});
						
						private.event_hub_setup();
										
						console.log("Keen loaded from " + source);

					});

					
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

			add_common_attr: function ( analytic ) {

				if( analytic && analytic.val ) {

					analytic.val.platform = state.platform;

					// analytic.val.user = { };

				}
			},
			
			// analytic: { name: '', val: { } }
			track: function ( analytic, callback ) {
				
				if( state.source === 'background' )
				
					private.send ( analytic, callback );
					
				else {
											
					chrome.runtime.sendMessage({ name: 'track_analytic', val: analytic }, function(result) {
						if ( callback ) callback( result );
					});
				}
				
			},
			
			send: function ( analytic, callback ) {

				private.add_common_attr( analytic );
				
				state.client.addEvent( analytic.name, analytic.val, function(err, res){
					
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

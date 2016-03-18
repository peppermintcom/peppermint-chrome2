	
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
                    
                    private.client.addEvent("analytics-load", { source: source });
                    
                    console.log("Keen loaded from " + source);
                    
                }
                
            },
            
            event_hub_setup: function ( ) {
                
                if(!event_hub){
                    console.error("event_hub not available to AnalyticsManager");
                } else {
                    event_hub.add({
                        class_load: function( data ){
                            private.handle_event( 'class_load' , data );
                        },
                        page_load: function( data ){
                            private.handle_event( 'page_load' , data );
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
                    
                    if(!utilities.valid_messaging_state()){
                        
                        setTimeout(function() {
                            private.track( analytic, callback );
                        }, 500);
                        
                    }
                    else{
                        
                        chrome.runtime.sendMessage({ name: 'add_analytic', val: analytic }, function(result) {
                            if ( callback ) callback( result );
                        });
                        
                    }
                }
                
            },
            
            send: function ( analytic, callback ) {
                
                private.client.addEvent( analytic.name, analytic.val, function(err, res){
                    
                    var response = {};
                    
                    if (err) {                            
                        
                        // todo: log to Raven
                        
                        response = { 
                            result: 'Keen ERROR', 
                            analytic_name: analytic.name, 
                            analytic_val: analytic.val, 
                            err 
                        };                            
                        
                    }
                    else {  
                        
                        response = { 
                            result: 'Keen result', 
                            analytic_name: analytic.name, 
                            analytic_val: analytic.val, 
                            res 
                        };

                    }
                    
                    if(callback) callback(response);
                    else{
                        console.log("no callback for ", response);
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

		} () )

		return public;

	}

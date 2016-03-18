
	function PageAlerts ( chrome, $, utilities ) {

		var private = {			          
            
            alert_listener: function( ){
                
                var listener = setInterval(function(){
                
                    if(!utilities.valid_messaging_state()) return;
                        
                    chrome.runtime.sendMessage({name: "page_alert"}, function( data ){
                        
                        // disabling the alerts for now
                        // public.show_alert( data );
                        
                    });
                            
                }, 500);
                
            },

            add_metric: function ( metric, log_result ){
                
                if(!utilities)
                    utilities = new Utilities( chrome, $, 'PageAlerts' );
                    
                utilities.add_metric( metric, function ( result ) {
                    if(log_result)
                        console.log({ metric, result });
                });
            }
            
        };
                
        var public = {

            show_alert: function( data ){
                
                if ($('#ohsnap').length === 0)
                    $('body').append('<div id="ohsnap"></div>');
                    
                if (!ohSnap){
                    console.error('ohSnap alerts not found');
                } else {                    
                    ohSnap(data.message, {color: data.type});                    
                }
                   
            }
                                    
        };

		( function constructor () {
            
            private.alert_listener();
            
            private.add_metric({ name: 'class-load', val: { class: 'PageAlerts' } });

		} () );
        
        return public;

	};


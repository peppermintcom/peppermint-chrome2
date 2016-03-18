
	function PageAlerts ( chrome, $, utilities, event_hub ) {

		var private = {			          
            
            alert_listener: function( ){
                
                var listener = setInterval(function(){
                
                    if(!utilities.valid_messaging_state()) return;
                        
                    chrome.runtime.sendMessage({name: "page_alert"}, function( data ){
                        
                        // disabling the alerts for now
                        // public.show_alert( data );
                        
                    });
                            
                }, 500);
                
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
            
            event_hub.fire( 'class_load', { name: 'PageAlerts' } );

		} () );
        
        return public;

	};


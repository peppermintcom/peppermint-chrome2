
	function Utilities ( chrome, $, source ) {

		var private = {
			
            loglevel: null,
            
            last_alert: null,
            
            get_options_data: function ( ){
                chrome.storage.local.get("options_data", function(data){
                    
                    public.options_data = data.options_data;
                    
                });    
            },
            
            get_log_level: function ( log_result ) {
                setInterval(function(){
                    chrome.storage.local.get("log_level", function(data){
                        if (!private.loglevel || private.loglevel !== data.log_level)
                            if (log_result)
                                console.log('log level set to `' + data.log_level + '`');
                            
                        private.loglevel = data.log_level;    
                    })
                }, 500);
            },
            
            send_page_alert_controller: function(  ) {
                
                // chrome.runtime.onMessage.addListener( function ( req, sender, callback ) {
                
                //     if ( req.name === "page_alert" ) {
                        
                //         if (private.last_alert !== null){
                            
                //             callback( private.last_alert );
                //             private.last_alert = null;
                                
                //         }

                //     }                
                    
                // });	
                
            },
            
            load_error_logger: function( ) {
                
                setTimeout(function(){
                    
                    Raven.config('https://53153404d9bf49e1893fe34d56a180d1@app.getsentry.com/69131')
                    .install();  
                    
                    console.log('Raven loaded from ' + source);
                    Raven.captureMessage('Raven loaded from ' + source);
                    
                }, 50);
                
            } 
            
        };
                
        var public = {

            options_data: {},
            
            copy_to_clipboard: function ( text ) {
				    
			    var doc = document,
			        temp = doc.createElement("textarea"),
			        initScrollTop = doc.body.scrollTop;
			    doc.body.insertBefore(temp, doc.body.firstChild);
			    temp.value = text;
			    temp.focus();
			    doc.execCommand("SelectAll");
			    doc.execCommand("Copy", false, null);
			    temp.blur();
			    doc.body.scrollTop = initScrollTop;
			    doc.body.removeChild(temp);
		
			},
            
            log: function( data ) {
                
                if( private.loglevel == 'verbose' )
                    console.log(data);
                    
            },
            
            set_page_alert: function( data ) {
                
                private.last_alert = data;
                
                public.log({'page_alert_set': data});
                
            },
            
            valid_messaging_state: function(){
                
                try {
                    // chrome.runtime.sendMessage("peppermint-messaging-test");
                } catch (error) {
                    // fail silently, messaging is temporarily unavailable
                    // generally, this only happens when manually refreshing the local extension
                    return false;
                }
                
                return true;

            }
                        
        };

		( function constructor () {
            
            console.log('Utilities instantiated from ' + source);
            
            if ( source === 'gmail_content' || source === 'background' ){
            
                private.load_error_logger();
                
                private.send_page_alert_controller();
                
                private.get_log_level( true );
                
            } else {
                
                private.get_log_level();
            }           
            
            private.get_options_data();
            
		} () );
        
        return public;

	};


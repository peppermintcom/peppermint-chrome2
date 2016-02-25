
	function Utilities ( chrome, $ ) {

		var private = {
			
            loglevel: null,
            
            last_alert: null,
            
            get_options_data: function ( ){
                chrome.storage.local.get("options_data", function(data){
                    
                    public.options_data = data.options_data;
                    
                });    
            },
            
            get_log_level: function ( ) {
                setInterval(function(){
                    chrome.storage.local.get("log_level", function(data){
                        if (!private.loglevel || private.loglevel !== data.log_level)
                            console.log('log level set to `' + data.log_level + '`');
                            
                        private.loglevel = data.log_level;    
                    })
                }, 500);
            },
            
            send_page_alert_controller: function(  ) {
                
                chrome.runtime.onMessage.addListener( function ( req, sender, callback ) {
                
                    if ( req.name === "page_alert" ) {
                        
                        if (private.last_alert !== null){
                            
                            callback( private.last_alert );
                            private.last_alert = null;
                                
                        }

                    }                
                    
                });	
                
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
                
            }
                        
        };

		( function constructor () {
            
            private.get_log_level();
            
            private.get_options_data();
            
            private.send_page_alert_controller();

		} () );
        
        return public;

	};


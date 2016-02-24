
	function Utilities ( chrome, $ ) {

		var private = {
			
            loglevel: null,
            
            get_options_data: function ( ){
                chrome.storage.local.get("options_data", function(data){
                    
                    public.options_data = data.options_data;
                    
                });    
            },
            
            get_log_level: function ( ) {
                setInterval(function(){
                    chrome.storage.local.get(null, function(data){
                        if (!private.loglevel || private.loglevel !== data.log_level)
                            console.log('log level set to `' + data.log_level + '`');
                            
                        private.loglevel = data.log_level;    
                    })
                }, 2000);
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
                        
        };

		( function constructor () {
            
            private.get_log_level();
            
            private.get_options_data();			

		} () );
        
        return public;

	};


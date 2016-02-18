
	function Utilities ( chrome, $ ) {

		var private = {
			
            get_options_data: function ( ){
                chrome.storage.local.get("options_data", function(data){
                    
                    public.options_data = data.options_data;
                    
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
		
			}
                        
        };

		( function constructor () {
            
            private.get_options_data();
			

		} () );
        
        return public;

	};


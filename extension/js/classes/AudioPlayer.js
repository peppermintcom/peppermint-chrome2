	
	function AudioPlayer ( $ ) {
		
		var private = {
			
            inputElement: 'input[name="audio_player"]',
            
            parentTable: function ( element ) {
                return $(element).closest('table').parents('table')[1];
            },
            
            audioLink: function ( element ) {
                if(element){
                    var parent = private.parentTable(element);
                    return $(parent).prev().find(private.inputElement);    
                } else{
                    return $(private.inputElement);
                }
            },
            
            getScript: function ( src ) {
                return '<audio controls src="' + src + '"></audio>';
            }
		};
	
		var public =  {
	
            embed_with_replace: function ( element ) {
		  
                var parent = private.parentTable(element);
                var link = private.audioLink(element);
                
                if( link.length > 0){                
                    var script = private.getScript(link.first().val());
                    
                    $(private.inputElement).replaceWith(script);                    
                    $(parent).remove();
                }
                
                return;
            },
            
            embed_with_insert: function (){
                var link = private.audioLink();
                            
                if(link.length > 0){
                    var script = private.getScript(link.first().val());
                    $(script).insertAfter(link);
                }
                
                return;
            }
			
		};

		return public;
		
	} ( jQuery );
	
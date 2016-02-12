
	function BackgroundUploader ( $, chrome, uploader ) {

		var private = {
            
            inprogress: false,

            run: function ( callback ){
                console.log('background upload check - init');
                
                if(!private.inprogress){
                    private.inprogress = true;
                    
                    try {
                        private.start( callback );    
                    } catch (error) {
                        console.log(error);                        
                        private.inprogress = false;
                    }
                }
            },
            
            start: function( callback ) {
                chrome.storage.local.get("peppermint-upload-queue", function(data){
                    if(data && data.recordings){
                        console.log('data found');
                        console.log(data);
                    } else {
                        console.log('no uploads in queue');
                        private.inprogress = false;
                    }
                })
            }			

		};

		( function constructor () {
            
            setInterval(private.run(function(){
                console.log('backgound upload check - complete');
            }), 500);

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.class_name === 'BackgroundUploader' ) {
					
					return true;

				}

			});

		} () )

	}



	function BackgroundUploader ( $, chrome, uploader ) {

		var private = {
            
            inprogress: false,
            
            loglevel: null,
            
            log: function(data){
                if( private.loglevel == 'verbose' )
                    console.log(data);
            },

            run: function ( callback ){
                private.log('background upload check - init');
                
                if(!private.inprogress){
                    private.inprogress = true;
                    
                    try {
                        private.start( callback );
                    } catch (error) {
                        console.error(error);                        
                        private.inprogress = false;
                    }
                }
            },
            
            start: function( callback ) {
                chrome.storage.local.get("peppermint-upload-queue", function(data){
                    if(data && data.recordings){
                        private.log('data found');
                        private.log(data);
                    } else {
                        private.log('no uploads in queue');
                        private.inprogress = false;
                    }
                    if(callback) callback();
                })
            }			

		};

		( function constructor () {
            
            setInterval(function(){
                chrome.storage.local.get(null, function(data){
                    private.loglevel = data.log_level;    
                })
            }, 2000);
            
            var background_upload_check_interval = setInterval(function(){
                private.run(function(){
                    private.log('backgound upload check - complete');
                })
            }, 500);

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.class_name === 'BackgroundUploader' ) {
					
					return true;

				}

			});

		} () )

	}


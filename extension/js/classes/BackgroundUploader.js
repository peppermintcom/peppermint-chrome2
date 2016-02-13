
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
            },
            
            remove_from_storage: function ( recording_data, callback ){
                chrome.storage.local.get("peppermint_upload_queue", function( data ){
                                        
                    if(data && data.peppermint_upload_queue && data.peppermint_upload_queue.recordings && data.peppermint_upload_queue.recordings.length > 0){
                        console.log('checking storage for ' + recording_data.recording_id);
                        
                        var record_to_remove = -1;
                        
                        $.each(data.peppermint_upload_queue.recordings, function(idx,val){
                            if(val.recording_id === recording_data.recording_id){
                                console.log('found it at index ' + idx + ' with id ' + val.recording_id);
                                record_to_remove = idx;
                                return false;
                            }
                        })
                        
                        if(record_to_remove > -1){                            
                            data.peppermint_upload_queue.recordings.splice(record_to_remove,1);
                            
                            chrome.storage.local.set(data, function(set_data) {
                                if(chrome.runtime.lastError)
                                    console.error(chrome.runtime.lastError);
                                else
                                    console.log('removed from storage-' + recording_data.recording_id); 
                            });   
                        }
                    }
                    
                })    
            }			

		};
        
        chrome.runtime.onMessage.addListener( function ( data ) {

			if ( data.name === "recording_data_uploaded" ) {

                private.remove_from_storage(data.recording_data);

			}
            
            return true;

		});

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

		} () )
        
        
        

	}



	function BackgroundUploader ( $, chrome, utilities, uploader, recorder ) {

		var private = {
            
            minutes_to_wait: 1.25,
            
            inprogress: false,            

            add_metric: function ( metric, log_result ){
                
                if(!utilities)
                    utilities = new Utilities( chrome, $, 'BackgroundUploader' );
                    
                utilities.add_metric( metric, function ( result ) {
                    if(log_result)
                        console.log({ metric, result });
                });
            },

            recordings_exist: function(data){
                return data && data.peppermint_upload_queue && data.peppermint_upload_queue.recordings && data.peppermint_upload_queue.recordings.length > 0;
            },
            
            run: function ( callback ){
                
                if(!private.inprogress){
                    
                    private.inprogress = true;
                    
                    try {
                        
                        private.start( callback );
                        
                    } catch (error) {
                        
                        Raven.captureException(error);
                        console.error(error);                        
                        private.inprogress = false;
                        
                    }
                }
                
            },
            
            start: function( callback ) {
                chrome.storage.local.get("peppermint_upload_queue", function(data){            
                    if(private.recordings_exist(data)){
                        console.log('recording found');
                        utilities.log(data);       
                        
                        var immediate_insert = utilities.options_data.enable_immediate_insert;
                        
                        var recording_data = null;
                        
                        $.each(data.peppermint_upload_queue.recordings, function( idx,val ){
                            
                            // check recording timestamp and only re-upload if older than 1.5 minutes
                            if( val.recording_id && 
                                val.recording_id > 0 && 
                                (Date.now()-val.recording_id) / ( 60 * 1000 ) > private.minutes_to_wait){
                                
                                recording_data = val;
                                return false;
                            }
                                
                        });
                        
                        if( !recording_data ){
                            
                            utilities.log( 'of ' + data.peppermint_upload_queue.recordings.length + ' recordings, none are older than ' + private.minutes_to_wait + ' minutes' );
                            
                            private.inprogress = false;
                            
                        }
                        else{
                         
                            var blob = recorder.data_url_to_blob(recording_data.data_url);
                            
                            recorder.blob_to_buffer( blob )
                            .then(function(buffer){
                                utilities.log(buffer);    
                                
                                var upload_buffer_function = immediate_insert ? uploader.upload_buffer_immediately : uploader.upload_buffer;

                                return upload_buffer_function( recording_data.token, recording_data.urls, buffer, recording_data.transcription_data );
                            })
                            .then( function( upload_success ){
                                
                                if (upload_success){
                                    
                                    console.log( "uploaded:", recording_data.urls.short_url );
                                    
                                    chrome.runtime.sendMessage({ 
                                        name: "recording_data_uploaded", recording_data: recording_data 
                                    });
                                    
                                    utilities.set_page_alert({ 
                                        'message':'Peppermint: recording upload completed!',
                                        'type':'info'
                                    });                                    
                                    
                                } else {
                                    
                                    console.log("failed to upload: ", recording_data.urls.short_url);
                                    
                                }
                                
                                private.inprogress = false;

                            })
                            .catch( function ( error ) {
                                
                                Raven.captureException(error);
                                console.error('failed to complete background upload')                                
                                console.error(error);                        
                                private.inprogress = false;

                            });       
                        }                                          
                        
                    } else {
                        
                        utilities.log('no uploads in queue');
                        private.inprogress = false;
                        
                    }
                    
                    if(callback) callback();
                    
                })
            },
            
            remove_from_storage: function ( recording_data, callback ){
                chrome.storage.local.get("peppermint_upload_queue", function( data ){
                                        
                    if(private.recordings_exist(data)){
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
            },
            
            clear_storage: function ( callback ) {
                
                chrome.storage.local.get("peppermint_upload_queue", function( data ){
                    
                    var recordings_count = 0;
                                        
                    if(private.recordings_exist(data))
                        recordings_count = data.peppermint_upload_queue.recordings.length;               
                    
                    chrome.storage.local.set({ "peppermint_upload_queue":null }, function(){
                        
                        console.log("peppermint_upload_queue cleared of " + recordings_count + " records");
                        
                        if(callback)
                            callback();
                    });
                });
            }
            
		};
        
        chrome.runtime.onMessage.addListener( function ( data ) {

			if ( data.name === "recording_data_uploaded" ) {

                private.remove_from_storage(data.recording_data);

			}
            
            return true;

		});

		( function constructor () {
            
            var background_upload_check_interval = setInterval(function(){
                private.run(function(){
                    utilities.log('backgound upload check - complete');
                })
            }, 500);
            
            private.add_metric({ name: 'class-load', val: { class: 'BackgroundUploader' } });

		} () )

	}


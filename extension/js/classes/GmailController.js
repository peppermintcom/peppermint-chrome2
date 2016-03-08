
	function GmailController ( recorder, uploader, event_hub, chrome, letter_manager, $, tooltip, immediate_insert ) {

		var transcription_time_start = 0;
		var transcription_time_stop = 0;
		
		var state = {

			recording_id: undefined,
			compose_button_id: undefined,
			last_recording_data: undefined,
			recording: false,
			uploading: false,
			timer: null

		};

		var private = {

			start_timer: function () {

				clearTimeout( state.timer );

				state.timer = setTimeout( function () {

					event_hub.fire( "timeout" );

				}, 5 * 60 * 1000 );

			},

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

			begin_recording: function () {

				recorder.start()
				.then( function () {

					private.start_timer();

					$("#peppermint_timer")[0].reset();
					$("#peppermint_timer")[0].start();
					$('#peppermint_popup').show();
					$('#peppermint_popup')[0].set_page("recording_page");
					$('#peppermint_popup')[0].set_page_status("recording");

					state.recording = true;
					state.recording_id = Date.now();
					transcription_time_start = Date.now();

				})
				.catch( function ( error ) {

					console.error( "Failed to begin recording", error );

					if ( error.name === "PermissionDeniedError" ) {
						
						console.log("permission denied");
						chrome.runtime.sendMessage( "open_welcome_page" );
						
					} else {
						
						console.log( error );
						$('#peppermint_popup').show();
						$('#peppermint_popup')[0].set_page("microphone_error_page");
						
					}

				});

			},

			show_uploading_screen: function () {

				if ( !immediate_insert ) {

					$("#peppermint_mini_popup_player")[0].reset();
					$("#peppermint_mini_popup_player")[0].disable();
					$("#peppermint_mini_popup")[0].reset();
					$("#peppermint_mini_popup")[0].set_state("uploading");
					$("#peppermint_mini_popup").show();

				}

				$("#peppermint_popup").hide();

			},
            
            save_recording_to_storage: function ( recording_data ) {
                return new Promise(function(resolve,reject){
                    console.log('save this-' + recording_data.recording_id);
                    chrome.storage.local.get("peppermint_upload_queue", function( data ){
                        
                        var storage;
                        
                        if(data && data.peppermint_upload_queue && data.peppermint_upload_queue.recordings){
                            storage = data;                                
                        } else {
                            storage = { 'peppermint_upload_queue' : { 'recordings' : [] } };
                        }
                        
                        storage.peppermint_upload_queue.recordings.push( recording_data );
                        
                        chrome.storage.local.set(storage, function(data) {
                            if(chrome.runtime.lastError)
                                console.error(chrome.runtime.lastError);
                            else
                                console.log('saved to storage-' + recording_data.recording_id); 
                        });
                        
                    })
                    resolve( recording_data.blob );
                })
            },

			process_recording_data: function ( recording_data ) {

				var recording_id = Date.now();

				state.recording_id = recording_id;
				state.last_recording_data = recording_data;

				$("#peppermint_mini_popup_player")[0].enable();
				$("#peppermint_mini_popup_player")[0].set_url( recording_data.data_url );
                
                recording_data.recording_id = recording_id;
                
                uploader.get_token_urls()
                .then( function( data ){
                    
                    recording_data.token = data.token;
                    recording_data.urls = data.urls;
                                        
                    return private.save_recording_to_storage( recording_data );
                        
                })                
                .then( function ( blob ) {
                    
                    recording_data.urls.object_url = URL.createObjectURL( blob );
                    
                    if(immediate_insert)
                        private.add_to_compose( recording_data );
                        
                    return recorder.blob_to_buffer( blob );

                })
				.then( function ( buffer ) {

					recording_data.buffer = buffer;
                                            
					var upload_buffer_function = immediate_insert ? uploader.upload_buffer_immediately : uploader.upload_buffer;

                    return upload_buffer_function( recording_data.token, recording_data.urls, buffer, recording_data.transcription_data );

				})
				.then( function ( upload_success ) {
                    
                    if(upload_success){
                        
                        console.log( "uploaded: ", recording_data.urls.short_url );
                    
                        chrome.runtime.sendMessage({ 
                            name: "recording_data_uploaded", recording_data 
                        });
                        
                        if(!immediate_insert)
                            private.add_to_compose( recording_data );
                            
                    } else {
                        
                        console.log("failed to upload: ", recording_data.urls.short_url);
                        
                    }                    

				})
				.catch( function ( err ) {

					console.trace( err );
					$("#peppermint_mini_popup")[0].set_state("uploading_failed");

				});

			},
            
            add_to_compose: function( recording_data ){
                                
                $("#peppermint_mi_popup").hide();

                $( document ).one( "click", function () {
                    private.copy_to_clipboard( recording_data.urls.short_url );
                });

                $("#peppermint_mini_popup_player")[0].pause();                

                var duration = transcription_time_end - transcription_time_start;
                
                letter_manager.add_link( recording_data.urls, state.compose_button_id, recording_data.transcription_data.text, duration, recording_data.recording_id );  

            },

			clear_the_state: function () {

				clearTimeout( state.timer );

				state = {

					recording_id: undefined,
					compose_button_id: undefined,
					last_recording_data: undefined,
					recording: false,
					uploading: false

				};

			},

			finish_recording: function ( data ) {

				clearTimeout( state.timer );

				transcription_time_end = Date.now();
				
				if ( data ) {

					state.recording = false;
					private.process_recording_data( data );

				} else {

					recorder.finish()
					.then( function ( data ) {

						state.recording = false;
						private.process_recording_data( data );

					});

				}

			}

		};

		event_hub.add({

			"timeout": function () {
				
				private.show_uploading_screen();
				private.finish_recording();

				alert("You have reached the maximum recording length of 5 minutes");
			
			},

			"tooltip_close_button_click": function () {

				tooltip.stop();
				$( tooltip ).hide();
				chrome.storage.local.set({ compose_button_has_been_used: true });

			},

			popup_error_try_again_button_click: function () {

				if ( !state.recording && !state.uploading ) {

					private.begin_recording();

				}
			
			},

			popup_recording_done_button_click: function () {

				private.show_uploading_screen();
				private.finish_recording();

			},

			popup_error_cancel_button_click: function () {

				$("#peppermint_popup").hide();
				private.clear_the_state();

			},

			popup_recording_cancel_button_click: function () {

				recorder.cancel();
				$('#peppermint_popup').hide();
				private.clear_the_state();

			},

			mini_popup_try_again_click: function () {

				private.show_uploading_screen();
				private.finish_recording( state.last_recording_data );

			},

			mini_popup_cancel_click: function () {

				$("#peppermint_mini_popup").hide();
				$("#peppermint_mini_popup_player")[0].pause();
				private.clear_the_state();

			},

			peppermint_compose_button_click: function ( data ) {

				if ( !state.recording && !state.uploading ) {

					chrome.storage.local.set({ compose_button_has_been_used: true });
					tooltip.stop();
					$( tooltip ).hide();

					state.compose_button_id = data.id;

					private.begin_recording();

				}

			},

			peppermint_reply_button_click: function () {

				if ( $(".ams")[0] ) $(".ams")[0].click();
				
				var interval = setInterval( function () {
					if ( $( '#peppermint_compose_button' ).length > 0 ) {

						$( '#peppermint_compose_button' ).click();
						clearInterval( interval );

					}
				}, 20 );

			}

		});

		( function constructor () {

			chrome.storage.local.get( null, function ( items ) {
			
				if ( ! items[ 'compose_button_has_been_used' ] ) {

					tooltip.stick_to( "#peppermint_compose_button" );

				}
			
			});

		} () );

	}


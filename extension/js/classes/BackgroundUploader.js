
	function BackgroundUploader ( $, chrome, uploader ) {

		var private = {

            run: function ( callback ){
                console.log('run');
            }			

		};

		( function constructor () {
            
            setInterval(private.run, 500);

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.class_name === 'BackgroundUploader' ) {
					
					return true;

				}

			});

		} () )

	}


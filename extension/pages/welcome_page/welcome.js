
( function ( $, chrome, utilities, event_hub ) {

    'use strict';

	window.addEventListener("load", initAudio);
    
    function init(){
        
        utilities = new Utilities( chrome, $, 'welcome_page' );
        
        event_hub = new EventHub( null, utilities );
        
    }

	function initAudio() {
	    if ( !navigator.getUserMedia ) { navigator.getUserMedia = navigator.webkitGetUserMedia; }
	    navigator.getUserMedia(
	        {
	            "audio": true
	        },
	        function() {
            console.log("ok, got a stream");
          },
	        function(e) {
	            console.log(e);
				
				if(e && e.name === "PermissionDeniedError") {
					alert("Hey there! It looks like the microphone is blocked. \n\nTo fix, you'll need to click the video icon at the top right of this page, then select the 'Always allow' option. \n\nYou should only have to do this once and you'll be all set to use Peppermint!");
					// todo: make into a pretty help dialog or page with screenshot of how to re-enable
				}
				
				if (document.querySelector("#errInfo"))
					document.querySelector("#errInfo").style.display = "block";
	        }
	    );
	}
    
    ( function constructor () {
        
        init();
        
        event_hub.fire( 'class_load', { name: 'welcome_page' } );

	} () );
        
} ( jQuery, chrome ) );
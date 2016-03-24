
( function ( $, chrome ) {

    'use strict';

	window.addEventListener("load", initAudio);

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

	} () );
        
} ( jQuery, chrome ) );
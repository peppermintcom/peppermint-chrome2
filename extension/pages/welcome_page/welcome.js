( function () {

    'use strict';

	window.addEventListener("load", initAudio);

    function add_metric ( metric, log_result ){
        
        if(!utilities)
            utilities = new Utilities( chrome, $, 'welcome' );
            
        utilities.add_metric( metric, function ( result ) {
            if(log_result)
                console.log({ metric, result });
        });
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
            
        add_metric({ name: 'class-load', val: { class: 'welcome' } });

	} () );
        
})();
(function(){

    'use strict';

	window.addEventListener("load", initAudio);

	function initAudio() {
	    if ( !navigator.getUserMedia ) { navigator.getUserMedia = navigator.webkitGetUserMedia; }
	    navigator.getUserMedia(
	        {
	            "audio": {
	                "mandatory": {
	                    "googEchoCancellation": "false",
	                    "googAutoGainControl": "false",
	                    "googNoiseSuppression": "false",
	                    "googHighpassFilter": "false"
	                },
	                "optional": []
	            },
	        },
	        function() {
            console.log("ok, got a stream");
          },
	        function(e) {
	            console.log(e);
	            document.querySelector("#errInfo").style.display = "block";
	        }
	    );
	}
})();
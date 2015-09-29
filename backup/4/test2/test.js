
	// GMAIL API

	function client_load () {
		
        gapi.client.setApiKey('AIzaSyDOCP0xOiJ4SDKFFz1Iw5T_0zRP98NOku4');
        gapi.client.load('gmail', 'v1').then(function(){});
		
	}

	function send_mail (data) {
		
		var request = gapi.client.gmail.users.messages.send({
			'userId': 'me',
			'resource': {
				'raw':btoa("MIME-Version: 1.0\n\
Content-Type: multipart/mixed; boundary=frontier\n\
From: me\n\
To: "+document.querySelector('.iw').innerText.match(/[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?/i)[0]+"\n\
Subject: Peppermint Voice Mail\n\
\n\
This is a message with multiple parts in MIME format.\n\
--frontier\n\
Content-Type: text/html\n\
\n\
I sent you an audio reply with <a href='http://peppermint.com'>peppermint.com</a>\n\
--frontier\n\
Content-Type: audio/wav\n\
Content-Transfer-Encoding: base64\n\
Content-Disposition: attachment\n\
\n\
"+data+"\n\
--frontier--" ).replace( /\//gm,'_').replace( /\+/gm,'-')			
			}
			
		});
		
		request.execute(function(response){
			console.log(response);
		});
		
	}

	function authorize (callback) {
		
		gapi.auth.authorize(
			{
				client_id:'10346040300-81s5iin2daqci67lrht3i1hqradsedvq.apps.googleusercontent.com',
				scope:'https://www.googleapis.com/auth/gmail.compose',
				immediate: false
			},
			function ( token_obj ) {
				console.log( token_obj );
				callback();
			}
		);		
		
	}

	function send_data (data) {

			send_mail(data)
		
	}
	
	///////// RECORDING
	
  function __log(e, data) {
	console.log(e,data);
  }

  var audio_context;
  var recorder;

  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');

    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //__log('Input connected to audio context destination.');
    
    recorder = new Recorder(input,
	{
		workerPath:WORKER_PATH
	});
    __log('Recorder initialised.');
	document.dispatchEvent(new CustomEvent('recorder_ready'))
  }

  function startRecording(button) {
    recorder && recorder.record();
    // button.disabled = true;
    // button.nextElementSibling.disabled = false;
    __log('Recording...');
  }

  function stopRecording(button) {
    recorder && recorder.stop();
    // button.disabled = true;
    // button.previousElementSibling.disabled = false;
    __log('Stopped recording.');
    
    // create WAV download link using audio data blob
    createDownloadLink();
    
    recorder.clear();
  }

  function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
		
		 var reader = new FileReader();
		 reader.readAsDataURL(blob); 
		 reader.onloadend = function() {
			base64data = reader.result;                
			send_data( base64data.replace('data:audio/wav;base64,','') );
		 }

    });
  }

	function init() {
	console.log('init');
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
      __log('Audio context set up.');
      __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
  };
  
  
  setTimeout( init, 5000 );
  
  document.addEventListener('start',startRecording)
  document.addEventListener('stop',stopRecording)


	$("#start_recording").click( function () {

		console.log("recording started")
		$("#recorder")[0].audio_recorder.start();

	});

	
	$("#pause_recording").click( function () {

		$("#recorder")[0].audio_recorder.pause();

	});

	
	$("#cancel_recording").click( function () {

		$("#recorder")[0].audio_recorder.cancel();

	});

	
	$("#finish_recording").click( function () {

		$("#recorder")[0].audio_recorder.pause();
		$("#recorder")[0].audio_recorder.get_data_url()
		.then( function ( data_url ) {
			console.log( data_url );
			console.log( data_url.length );
			$("#player")[0].player.set_url( data_url );
			$("#recorder")[0].audio_recorder.cancel();
		});

	});


	$("#file").change( function () {
		
		var reader = new FileReader();
		reader.readAsArrayBuffer( $("#file")[0].files[0] );
		reader.onloadend = function () {
			$("#uploader")[0].uploader.upload_buffer( reader.result ); 
		}

	});



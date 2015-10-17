<?php

	header('Access-Control-Allow-Origin: *');

	file_put_contents(
		'recordings/recording_'.$_GET['id'].'.wav',
		base64_decode(
			file_get_contents('php://input')
		)
	);

?>
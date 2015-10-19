window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

var LAME_HANDLE;
var getBuffers;
var context = new AudioContext();
var fileNamer = new FileName();
var lame = lameworker();
var recordBtn = document.getElementById('recordBtn');
var cancelBtn = document.getElementById('cancelBtn');
// var logoImage = document.getElementById('logoImage');
var recordBtnClasses = recordBtn.classList;
var recNumber = 1;

recordBtn.onclick = function() {
	if ( recordBtn.textContent === "Start recording") {
		startRecord();
	}else {
		stopRecord(true);
	}
};

cancelBtn.onclick = stopRecord;

window.onload = startRecord;

function initialize() {
	lame.init(function (error, handle) {
		if (error || handle <= 0) {
			console.error('LAME error:', error || handle);
			return;
		}
		lame.setMode(handle, lameworker.MONO);
		lame.setNumChannels(handle, 1);
		lame.setInSampleRate(handle, 44100); // Note that sample rates may vary
		lame.setOutSampleRate(handle, 44100);
		lame.setBitrate(handle, 128);
		lame.initParams(handle);
		LAME_HANDLE = handle;
	});
}

function FileName() {
	var self = this,
		start, end;

	self.setStart = function() {
		var d = getDate();
		start = "Start_" + d + "_";
	};

	self.setEnd = function() {
		var d = getDate();
		end = "End_" + d + ".mp3";
	};

	self.get = function() {
		return start + end;
	};

	function getDate() {
		var isoDate = (new Date()).toISOString();
		return isoDate.replace(/(\:\d{2})\:.*$/, "$1").replace(":", "-");
	}
}

function getMP3(buffers, callback) {
	lame.encodeFlush(LAME_HANDLE, function (error, buffer) {
		buffers.push(buffer);
		var blob = new Blob(buffers, { type: 'audio/mp3' });
		callback(blob);
	});
	lame.close(LAME_HANDLE);
	LAME_HANDLE = null;
}

function displayMP3(blob) {
	var item = document.createElement('p');
	// Create an URL for the Blob instance. This can be used for <audio> tags as well.
	var url = URL.createObjectURL(blob),
		fileName = fileNamer.get();
		// '<li class="list-group-item">fileName  - <a download="' + fileName + '" href="' + url + '">Save</a></li>'
	// item.innerHTML = '<a download="' + fileName + '" href="' + url + '">Save record #' + recNumber + '</a>';
	item.innerHTML = 'Record #' + recNumber + '. <a download="' + fileName + '" href="' + url + '">Download</a>';
	document.getElementById('mp3s').appendChild(item);
	recNumber++;
}



function beginRecording(stream) {
	initialize();
	var microphone = context.createMediaStreamSource(stream);
	var processor = context.createScriptProcessor(16384, 1, 1);
	var buffers = [];
	processor.onaudioprocess = function (event) {
		var array = event.inputBuffer.getChannelData(0);
		lame.encodeBufferMono(LAME_HANDLE, array, function (error, buffer) {
			buffers.push(buffer);
		});
	};
	microphone.connect(processor);
	processor.connect(context.destination);
	return function() {
		microphone.disconnect();
		processor.disconnect();
		processor.onaudioprocess = null;
		return buffers;
	};
}

function startRecord() {
	fileNamer.setStart();
	recordBtnClasses.remove("btn-primary");
	recordBtnClasses.add("btn-warning");
	recordBtn.textContent = "Stop recording";
	// logoImage.src = chrome.extension.getURL("img/recording_no_delay.gif");
	navigator.getUserMedia({ audio: true }, function (stream) {
		getBuffers = beginRecording(stream);
	}, function (error) {
		recordBtn.textContent = 'Error! Try again.';
		setTimeout(function() {
			recordBtnClasses.remove("btn-warning");
			recordBtnClasses.add("btn-primary");
			recordBtn.textContent = "Start recording";
		}, 2000);
	});
}

function stopRecord(save) {
	fileNamer.setEnd();
	recordBtnClasses.remove("btn-warning");
	recordBtnClasses.add("btn-primary");
	recordBtn.textContent = "Start recording";
	// logoImage.src = chrome.extension.getURL("img/logo_60x60.png");
	if ( save === true ) {
		getMP3(getBuffers(), displayMP3);
	}else {
		getBuffers();
	}
}
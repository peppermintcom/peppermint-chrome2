window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

var LAME_HANDLE,
	getBuffers,
	uploadUrl,
	apiAuthHeader,
	context = new AudioContext(),
	fileNamer = new FileName(),
	lame = lameworker(),
	recordBtn = document.getElementById('recordBtn'),
	cancelBtn = document.getElementById('cancelBtn'),
	uploadInfo = document.getElementById('uploadInfo'),
	audioPlayerBox = document.getElementById('audioPlayerBox'),
	recorderBox = document.getElementById('recorderBox'),
	audioPlayer = document.getElementById('audioPlayer'),
	downloadBtn = document.getElementById('downloadBtn'),
	reRecordBtn = document.getElementById('reRecordBtn'),
	recordBtnClasses = recordBtn.classList,
	recNumber = 1;

uploadInfo.style.display = "none";
audioPlayerBox.style.display = "none";
audioPlayer.style.width = "270px";

recordBtn.onclick = function() {
	if ( recordBtn.textContent === "Start recording") {
		startRecord();
	}else {
		stopRecord(true);
	}
};

reRecordBtn.onclick = function() {
	audioPlayerBox.style.display = "none";
	recorderBox.style.display = "block";
};

cancelBtn.onclick = stopRecord;

window.onload = startRecord;

function displayMP3(blob) {
	chrome.storage.sync.get(null, function(items) {
		if ( items.apiData ) {
			uploadInfo.style.display = "block";
			apiAuthHeader = "Bearer " + items.apiData.at;
			makeRequest("POST", "https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/uploads", { content_type: "audio/mpeg3" }, { name: "Authorization", value: apiAuthHeader }, function (res) {
			    uploadUrl = res.signed_url;
			    sendMp3(uploadUrl, blob, function () {
					makeRequest("POST", "https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/record", { signed_url: uploadUrl }, { name: "Authorization", value: apiAuthHeader }, function (res) {
						uploadInfo.style.display = "none";
						recorderBox.style.display = "none";
						downloadBtn.href = res.canonical_url;
						audioPlayer.src = res.canonical_url;
						copyToClipboard(res.canonical_url);
						audioPlayerBox.style.display = "block";
					});
			    });
			});
		}
	});
}

function copyToClipboard(text) {
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
}

function sendMp3(url, data, callback) {
	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		if ( ajax.readyState === XMLHttpRequest.DONE ) {
			if ( ajax.status === 200 ) {
				callback();
			}else {
				console.log(ajax.responseText);
			}
		}
	};
	ajax.open("PUT", url);
	ajax.setRequestHeader("Content-Type", "audio/mpeg3");
	ajax.send(data);
}

function makeRequest(method, url, data, header, callback) {
	var ajax = new XMLHttpRequest();
	var json = data ? JSON.stringify(data) : null;
	ajax.onreadystatechange = function() {
		if ( ajax.readyState === XMLHttpRequest.DONE ) {
			if ( ajax.status === 201 ) {
				callback(JSON.parse(ajax.responseText));
			}else {
				console.log(ajax.responseText);
			}
		}
	};
	ajax.open(method, url);
	if ( header ) {
		ajax.setRequestHeader("Content-Type", "application/json");
		ajax.setRequestHeader("Authorization", header.value);
	}
	ajax.send(json);
}

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
		var blob = new Blob(buffers, { type: 'audio/mpeg3' });
		callback(blob);
	});
	lame.close(LAME_HANDLE);
	LAME_HANDLE = null;
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
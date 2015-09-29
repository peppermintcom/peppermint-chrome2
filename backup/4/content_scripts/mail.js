
setTimeout( function () {
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET',chrome.extension.getURL('/test2/recorderWorker.js'),true)
	xhr.onload=function(){
		
		
		var s = document.createElement('script');
		s.innerHTML="WORKER_PATH="+"'"+window.URL.createObjectURL(new Blob([xhr.responseText],{type:'text/javascript'}))+"'";
		(document.head||document.documentElement).appendChild(s);
		
		
			
			var s = document.createElement('script');
			s.src = chrome.extension.getURL('/test2/recorder.js');
			s.onload = function() {
				this.parentNode.removeChild(this);
				
				
				
					
	
						var s = document.createElement('script');
						s.src = chrome.extension.getURL('/test2/mail.js');
						s.onload = function() {
							this.parentNode.removeChild(this);
							
							
							
							
							
							
							
								var s = document.createElement('script');
								s.src = chrome.extension.getURL('/test2/test.js');
								s.onload = function() {
									this.parentNode.removeChild(this);	
									
								
									var s = document.createElement('script');
									s.src = 'https://apis.google.com/js/client.js?onload=client_load';
									s.onload = function() {
										this.parentNode.removeChild(this);
									};
									(document.head||document.documentElement).appendChild(s);

									
								};
								(document.head||document.documentElement).appendChild(s);
							
							
							
							
							
							
							
							
						};
						(document.head||document.documentElement).appendChild(s);

				
				
				
				
				
			};
			(document.head||document.documentElement).appendChild(s);
			
		
		
		
	}
	xhr.send();

	
	
}, 10000 );
	
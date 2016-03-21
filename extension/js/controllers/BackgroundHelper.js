	
	function BackgroundHelper ( chrome, $, event_hub ) {
		
		var state = {

		};

		var private = {

			copy_to_clipboard: function ( text ) {

				var doc = document;
				var temp = doc.createElement("textarea");
				var initScrollTop = doc.body.scrollTop;

				doc.body.insertBefore(temp, doc.body.firstChild);
				temp.value = text;
				temp.focus();
				doc.execCommand("SelectAll");
				doc.execCommand("Copy", false, null);
				temp.blur();
				doc.body.scrollTop = initScrollTop;
				doc.body.removeChild(temp);

			},

			open_welcome_page: function () {

				chrome.tabs.create({
					url: chrome.extension.getURL( "/pages/welcome_page/welcome.html" ),
					active: true
				});

			},

			get_sener_data: function ( callback ) {

				chrome.identity.getProfileUserInfo( function ( info ) {
					callback({
						sender_name: "",
						sender_email: info.email
					});
				});

			}

		};

		chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

			if ( message.receiver === "BackgroundHelper" ) {

				if ( message.name === "copy_to_clipboard" ) {

					private.copy_to_clipboard( message.text );

				} else if ( message.name === "open_welcome_page" ) {

					private.open_welcome_page();

				} else if ( message.name === "get_sender_data" ) {

					private.get_sener_data( callback );

				}

				return true;

			}

		});

	}

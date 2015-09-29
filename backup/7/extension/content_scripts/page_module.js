	
	( function () {
		
		var v = {};

		var button_manager = {
			
			can_add_reply_button: function () {
				if ( document.querySelector('.cf.ix') && !document.getElementById( 'v_reply_button' ) ) {
					button_manager.add_reply_button();
				}
			},
			
			can_add_compose_button: function () {
				if ( document.querySelector('.Cq.aqL') && !document.getElementById( 'v_compose_button' ) ) {
					button_manager.add_compose_button();
				}
			},
			
			create_reply_button: function () {
				
				var button = document.createElement('div');
				button.id = 'v_reply_button';
				button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_02.png)';
			
				button.addEventListener( 'mouseenter', function () {
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_02_hover.png)'
				});
				
				button.addEventListener( 'mouseleave', function () {
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_02.png)'
				});
				
				button.addEventListener( 'click', function () {
					V.notifyObservers( 'authorize_request', null, function () {
						V.notifyObservers( 'start_recording_request', null, function ( response ) {
							if ( response ) {
								v.popup.style.display = 'block';
							}
						});
					});
				});
				
				return button;
			
			},
			
			create_compose_button: function () {
				
				var button = document.createElement('div');
				button.id = 'v_compose_button';
				button.className = "G-Ni J-J5-Ji";
				button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_03.png)';
				
				button.addEventListener( 'mouseenter', function () {
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_03_hover.png)'
				});
				
				button.addEventListener( 'mouseleave', function () {
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_03.png)'
				});
				
				button.addEventListener( 'click', function () {
					V.notifyObservers( 'authorize_request', null, function () {
						V.notifyObservers( 'start_recording_request', null, function ( response ) {
							if ( response ) {
								v.popup.style.display = 'block';
							}
						});
					});
				});
				
				return button;
				
			},
			
			add_reply_button: function () {

				var table = document.querySelector('.cf.ix'),
				tbody = table.tBodies[0],
				row = tbody.rows[0],
				cell = document.createElement('td');
				
				row.appendChild( cell );
				cell.appendChild( button_manager.create_reply_button() );
				table.style.tableLayout = 'auto';
				
			},
			
			add_compose_button: function () {
				
				var container = document.querySelector('.Cq.aqL').firstElementChild.firstElementChild;
				container.appendChild( button_manager.create_compose_button() );
		
			}
			
		};
		
		var popup_manager = {
			
			popup: null,
			
			template: "\
				<div id = 'v_popup_recording' >\
					<img id = 'v_popup_logo' src = 'chrome-extension://"+EXTENSION_ID+"/img/logo_popup.png' >\
					<div id = 'v_popup_status' >Recording Your Message...</div>\
					<div id = 'v_tip' >Tap the icon to complete</div>\
					<div id = 'v_cancel_button' >CANCEL</div>\
				</div>\
				<div id = 'v_popup_sending' >\
					<img id = 'v_spinner' src = 'chrome-extension://"+EXTENSION_ID+"/img/spinner.gif' >\
					<div id = 'v_sending' >Sending Your Message...</div>\
				</div>\
				",
			
			add: function () {
				document.body.appendChild( popup_manager.create() );
			},
			
			create: function () {
			
				var popup = document.createElement( 'div' );
				popup.id = 'v_popup';
				popup.innerHTML = popup_manager.template;
				popup.style.display = 'block';

				popup.querySelector('#v_logo').addEventListener( 'click', function () {
					
					popup.querySelector('#v_popup_recording').style.display = 'none';
					popup.querySelector('#v_popup_sending').style.display = 'block';
					
					V.notifyObservers( 'finish_recording_request', null, function ( data ) {
						V.notifyObservers( 'send_data_request', { audio_data: data, mail_data: get_data_from_page() }, function () {
							popup.style.display = 'none';
							popup.querySelector('#v_popup_recording').style.display = 'block';
							popup.querySelector('#v_popup_sending').style.display = 'none';
						});
					});
					
				});

				popup.querySelector('#v_cancel_button').addEventListener( 'click', function () {
					V.notifyObservers( 'cancel_recording_request' );
					popup.style.display = 'none';	
				});
				
				return popup;
			
			}
			
		}
		
		var observers = {
			
			"gmail_api_ready": function () {
				
				setInterval( ping, 1000 );
			
			}
			
		};
		
		function get_data_from_page () {
			return {
				thread_id: location.href.match(/[^\/]+$/)[0],
				to: document.querySelector('.iw').firstElementChild.getAttribute('email')
			};
		}
		
		function ping () {
			if ( button_manager.can_add_reply_button() ) {
				button_manager.add_reply_button();
			}
			if ( button_manager.can_add_compose_button() ) {
				button_manager.add_compose_button();
			}
		}

		// BOOTSTRAP
		popup_manager.add();
		
		V.addObservers( observers );
		
		V.page_module = {};
		V.page_module.button_manager = button_manager;
		V.page_module.popup_manager = popup_manager;
		
	} () );
	
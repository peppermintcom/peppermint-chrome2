	
	V.View = function ( window, $, hub ) {
		
		// BUTTONS
		( function () {
			
			function add_hover_efect ( element, idle_url, hover_url ) {
				
				element.addEventListener( 'mouseenter', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + hover_url + ')'
				});
				
				element.addEventListener( 'mouseleave', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + idle_url + ')'
				});
				
			};
		
			var button_manager = {
				
				reply_disabled: false,
				compose_disabled: false,
				
				can_add_reply_button: function () {
					if ( window.document.querySelector('.cf.ix') && !window.document.getElementById( 'v_reply_button' ) ) {
						button_manager.add_reply_button();
					}
				},
				
				can_add_compose_button: function () {
					if ( window.document.querySelector('.Cq.aqL') && !window.document.getElementById( 'v_compose_button' ) ) {
						button_manager.add_compose_button();
					}
				},
				
				create_reply_button: function () {
					
					var button = window.document.createElement('div');
					button.id = 'v_reply_button';
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_02.png)';
				
					add_hover_efect( button, 'btn_02.png', 'btn_02_hover.png' );
				
					button.addEventListener( 'click', function () {
						if ( !button_manager.reply_disabled ) hub.fire({ name: 'reply_button_click' });
					});
					
					return button;
				
				},
				
				create_compose_button: function () {
					
					var button = window.document.createElement('div');
					button.id = 'v_compose_button';
					button.className = "G-Ni J-J5-Ji";
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_03.png)';
					
					add_hover_efect( button, 'btn_03.png', 'btn_03_hover.png' );
					
					button.addEventListener( 'click', function () {
						if ( !button_manager.compose_disabled ) hub.fire({ name: 'compose_button_click' });
					});
					
					return button;
					
				},
				
				add_reply_button: function () {

					var table = window.document.querySelector('.cf.ix'),
					tbody = table.tBodies[0],
					row = tbody.rows[0],
					cell = window.document.createElement('td');
					
					row.appendChild( cell );
					cell.appendChild( button_manager.create_reply_button() );
					table.style.tableLayout = 'auto';
					
				},
				
				add_compose_button: function () {
					
					var container = window.document.querySelector('.Cq.aqL').firstElementChild.firstElementChild;
					container.appendChild( button_manager.create_compose_button() );
			
				},
			
			};
	
			hub.add({
				
				'ready': function () {
					
					setInterval( function ping () {
						if ( button_manager.can_add_reply_button() ) {
							button_manager.add_reply_button();
						}
						if ( button_manager.can_add_compose_button() ) {
							button_manager.add_compose_button();
						}
					}, 3000 );

				},
				
				'compose_button_click': function () {
					button_manager.reply_disabled = true;
					button_manager.compose_disabled = true;
				},
				'reply_button_click': function () {
					button_manager.reply_disabled = true;
					button_manager.compose_disabled = true;
				},
				
				"authorize_request_failed": function () {
					button_manager.reply_disabled = false;
					button_manager.compose_disabled = false;
				},
				"popup_cancel_click": function () {
					button_manager.reply_disabled = false;
					button_manager.compose_disabled = false;
				},
				"popup_receiver_done_click": function () {
					button_manager.reply_disabled = false;
					button_manager.compose_disabled = false;
				},
				"popup_error_cancel_click": function () {
					button_manager.reply_disabled = false;
					button_manager.compose_disabled = false;
				},
				
				"data_sent": function () {
					button_manager.reply_disabled = false;
					button_manager.compose_disabled = false;
				}
				
			});
	
		} () );
		
		// POPUP
		( function () {
			
			function add_hover_efect ( element, idle_url, hover_url ) {
				
				element.addEventListener( 'mouseenter', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + hover_url + ')'
				});
				
				element.addEventListener( 'mouseleave', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + idle_url + ')'
				});
				
			};
		
			var popup_manager = {
				
				popup: null,
				
				template: "\
					<div id = 'v_popup_recording' >\
						<img class = 'v_popup_logo' src = 'chrome-extension://"+EXTENSION_ID+"/img/recording_no_delay.gif' >\
						<div class = 'v_popup_status' >Recording Your Message...</div>\
						<div class = 'v_popup_button left' id = 'v_popup_cancel_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_cancel_popup.png)' ></div>\
						<div class = 'v_popup_button right' id = 'v_popup_done_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_done_popup.png)' ></div>\
					</div>\
					<div id = 'v_popup_error' >\
						<img class = 'v_popup_logo' src = 'chrome-extension://"+EXTENSION_ID+"/img/icon_mic_off.png' >\
						<div class = 'v_popup_status' >Your microphone is not working. Please check your audio settings and try again</div>\
						<div class = 'v_popup_button left' id = 'v_error_cancel_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_cancel_popup.png)' ></div>\
						<div class = 'v_popup_button right' id = 'v_error_done_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_done_popup.png)' ></div>\
					</div>\
					<div id = 'v_popup_receiver' >\
						<h4>Send an audio to...</h4>\
						<div class = 'ui-widget' id = 'v_popup_search' >\
							<input id = 'v_popup_receiver_input' >\
							<div id = 'v_popup_receiver_search_icon' ></div>\
						</div>\
					</div>\
					",
				
				show: function ( status ) {
					if ( status === 'recording' ) {
						popup_manager.popup.style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_recording').style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_receiver').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_error').style.display = 'none';
					} else if ( status === 'receiver' ) {
						popup_manager.popup.style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_recording').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_receiver').style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_error').style.display = 'none';
					} else if ( status === 'error' ) {
						popup_manager.popup.style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_recording').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_receiver').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_error').style.display = 'block';
					}
				},
				
				add: function () {
					window.document.body.appendChild( popup_manager.create() );
				},
			
				hide: function () {
					popup_manager.popup.style.display = 'none';
				},
				
				create: function () {
				
					var popup = window.document.createElement( 'div' );
					popup.id = 'v_popup';
					popup.innerHTML = popup_manager.template;
					popup_manager.popup = popup;

					add_hover_efect( popup.querySelector('#v_error_done_button'), 'btn_done_popup.png', 'btn_done_popup_hover.png' );
					add_hover_efect( popup.querySelector('#v_popup_done_button'), 'btn_done_popup.png', 'btn_done_popup_hover.png' );
					add_hover_efect( popup.querySelector('#v_popup_cancel_button'), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
					add_hover_efect( popup.querySelector('#v_error_cancel_button'), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
					
					popup.querySelector('#v_popup_done_button').addEventListener( 'click', function () {
						hub.fire({ name: 'popup_done_click' });
					});
					popup.querySelector('#v_popup_cancel_button').addEventListener( 'click', function () {
						hub.fire({ name: 'popup_cancel_click' });
					});
					popup.querySelector('#v_error_cancel_button').addEventListener( 'click', function () {
						hub.fire({ name: 'popup_error_cancel_click' });
					});
					popup.querySelector('#v_error_done_button').addEventListener( 'click', function () {
						hub.fire({ name: 'popup_error_done_click' });
					});
					$( window.document ).on( 'click', '.ui-menu-item', function ( event ) {
						hub.fire({ name: 'receiver_selected', receiver: event.target.innerHTML });
					});
					
					return popup;
				
				}
				
			};
			
			hub.add({
				
				'ready': function () {
					popup_manager.add();
				},
				
				"contacts_available": function ( data ) {
					$( '#v_popup_receiver_input', popup_manager.popup ).autocomplete({ source: data.contacts });
				},
				
				"compose_button_click": function () {
					popup_manager.show( 'receiver' );
				},
				
				"recording_started": function () {
					popup_manager.show( 'recording' );
				},
				"recording_failed": function () {
					popup_manager.show( 'error' );
				},
				
				"receiver_selected": function () {
					popup_manager.show( 'recording' );
				},
				
				"authorize_request_failed": function () {
					popup_manager.hide();
				},
				
				"popup_cancel_click": function () {
					popup_manager.hide();
				},
				"popup_done_click": function () {
					popup_manager.hide();
				},
				"popup_receiver_done_click": function () {
					popup_manager.hide();
				},
				"popup_error_cancel_click": function () {
					popup_manager.hide();
				}
				
			});
		
		} () );
		
		// NOTIFIER
		( function () {
		
			var notify_manager = {
				
				notifier: null,
			
				add: function () {
					notify_manager.notifier = notify_manager.create();
					window.document.body.appendChild( notify_manager.notifier );
				},
				
				show: function () {
					notify_manager.notifier.style.display = 'block';
				},
				
				hide: function () {
					notify_manager.notifier.style.display = 'none';
				},
				
				write: function ( text ) {
					notify_manager.notifier.innerHTML = text;
				},
				
				create: function () {
				
					var notifier = window.document.createElement( 'div' );
					notifier.id = 'v_notifier';
				
					return notifier;
				
				}
				
			};
			
			hub.add({
				
				'ready': function () {
					notify_manager.add();
				},
				
				"sending_data": function () {
					notify_manager.write( "Sending via Peppermint..." );
					notify_manager.show();
				},
				
				"data_sent": function () {
					notify_manager.write( "Sent" );
					setTimeout( function () {
						notify_manager.hide();
					}, 3000);
				},
				
			});
			
		} () );
		
		// WELCOME SCREEN
		( function () {
		
			var obj = {
				
				template: "\
					<img src = 'chrome-extension://"+EXTENSION_ID+"/img/logo_popup.png'>\
					<p>Get ready to send your first voice message with Peppermint! This app makes it super-easy to send voice messages instead of spending foreeeevvver typing emails. <br><br> You should see a popup where Chrome is asking you to allow Peppermint to use your mic. Please allow and then go to your gmail and re-load your gmail account and send your first message!</p>\
				",
				
				notifier: null,
			
				add: function () {
					obj.screen = obj.create();
					window.document.body.appendChild( obj.screen );
				},

				create: function () {
				
					var screen = window.document.createElement( 'div' );
					screen.id = 'v_welcome_screen';
					screen.innerHTML = obj.template;
				
					screen.addEventListener( 'click', function () {
						obj.screen.style.display = 'none';
					});
				
					return screen;
				
				}
				
			};
			
			hub.add({
				
				'ready': function ( data ) {
					if ( data[ 'first_time_launch' ] ) {
						obj.add();
					}
				}
			
			});
			
		} () );
		
	};
	
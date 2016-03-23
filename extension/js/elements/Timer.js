
	function Timer ( $, event_hub, template, element ) {

		var private = {

			element: null,

			pad: function ( n ) {
				return ( n < 10 ) ? ( "0" + n ) : n;
			},

			display_time: function ( milliseconds ) {
				
				var seconds = parseInt( milliseconds / 1000 );
				var hours = parseInt( seconds / 3600 ) % 24;
				var minutes = parseInt( seconds / 60 ) % 60;
				seconds = private.pad( seconds % 60 );
				var time_string = ( hours > 0 ) ? hours+':'+private.pad( minutes )+':'+seconds : minutes+':'+seconds;

				$( "#time_container", element.shadowRoot ).html( time_string );
				
			},

			notify_tick: function () {

				event_hub.fire( "tick" );

			},

			start_timestamp: null,
			time: null,
			interval: null

		};

		var public = {

			start: function () {

				private.time = 0;
				private.display_time( private.time );
				private.start_timestamp = Date.now();
				private.interval = setInterval( function () {

					private.time = Date.now() - private.start_timestamp;
					private.display_time( private.time );
					private.notify_tick();

				}, 1000 );

			},

			pause: function () {

				clearInterval( private.interval );
				private.time = Date.now() - private.start_timestamp;

			},

			get_timestamp: function () {

				return private.start_timestamp;

			},

			set_time: function ( time ) {

				private.time = time;
				private.display_time( private.time );

			},

			get_time: function () {

				return private.time;

			},

			continue: function () {

				private.start_timestamp = Date.now() - private.time;

				private.interval = setInterval( function () {

					private.time = Date.now() - private.start_timestamp;
					private.display_time( private.time );
					private.notify_tick();

				}, 1000 );

			},

			reset: function () {

				private.time = null;
				private.start_timestamp = null;
				private.inteval = null;

			}

		};

		( function constructor () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$.extend( element, public );

			event_hub.fire( "class_load", { name : "Timer" } );

		} () )

		return element;

	};



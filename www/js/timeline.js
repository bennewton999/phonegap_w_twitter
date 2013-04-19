$(function() {
//test
	function touchHandler(event)
	{
	 var touches = event.changedTouches,
	    first = touches[0],
	    type = "";

	     switch(event.type)
	{
	    case "touchstart": type = "mousedown"; break;
	    case "touchmove":  type="mousemove"; break;        
	    case "touchend":   type="mouseup"; break;
	    default: return;
	}
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1,
	                          first.screenX, first.screenY,
	                          first.clientX, first.clientY, false,
	                          false, false, false, 0/*left*/, null);

	first.target.dispatchEvent(simulatedEvent);
	event.preventDefault();
	}

	function init()
	{
	   document.addEventListener("touchstart", touchHandler, true);
	   document.addEventListener("touchmove", touchHandler, true);
	   document.addEventListener("touchend", touchHandler, true);
	   document.addEventListener("touchcancel", touchHandler, true);    
	}

	var month=new Array();
	month[0]="January";
	month[1]="February";
	month[2]="March";
	month[3]="April";
	month[4]="May";
	month[5]="June";
	month[6]="July";
	month[7]="August";
	month[8]="September";
	month[9]="October";
	month[10]="November";
	month[11]="December";
	var timeline_object = '{"posts":['
		
		
    timeline_object=timeline_object + ']}';
	var new_top='middle';
	var pixels_per_day=120; //timeline
	var pixels_per_day_mini=2; //mini_timeline
	var mini_timeline_slider;
	var event_results=[];
	var timeline_container_width=jQuery('#timeline_container').width();
	var mini_timeline_container_width=jQuery('#mini_timeline_container').width();
	var containment_left;
	var containment_right=jQuery('#timeline_container').offset().left;
	var timeline_width=timeline_container_width;
	var mini_timeline_width=mini_timeline_container_width;
	var timeline_ratio;
	var mini_timeline_ratio;

	function parseDate(input, format) {
		format = format || 'yyyy-mm-dd'; // default format
		var parts = input.match(/(\d+)/g), 
		i = 0, fmt = {};
		// extract date-part indexes from the format
		format.replace(/(yyyy|dd|mm)/g, function(part) { fmt[part] = i++; });

		return new Date(parts[fmt['yyyy']], parts[fmt['mm']]-1, parts[fmt['dd']]);
	}

	function daySuffix(d) {
		d = String(d);
		return d.substr(-(Math.min(d.length, 2))) > 3 && d.substr(-(Math.min(d.length, 2))) < 21 ? "th" : ["th", "st", "nd", "rd", "th"][Math.min(Number(d)%10, 4)];
	}

	var daydiff=function (first, second) {
		return Math.floor(Math.abs((second-first)/(1000*60*60*24)));
	}

	//get data
	jQuery.getJSON('temp_blog.json', function(data) {
	//jQuery.getJSON('/temp_blog.json', function(data) {
		event_results = data;
	})
	.error(function() {
		alert("cannot load data");
	})
	.success(function() {
		sort_data();
	});

	sort_data=function() {
		event_results.posts=event_results.posts.concat(jQuery.parseJSON(timeline_object).posts);
		//sort data by date
		event_results.posts.sort(function(a,b) { return parseDate(a.date) - parseDate(b.date) } );

		// get date range
		var first_date=event_results.posts[0].date;
		var last_date=event_results.posts[event_results.posts.length-1].date;

		// get # of days between
		var number_of_days=daydiff(parseDate(first_date),parseDate(last_date));

		// set width of timeline
		timeline_width = (pixels_per_day * number_of_days);

		// set width of mini_timeline
		mini_timeline_width = (pixels_per_day_mini * number_of_days);

		var days_visible=Math.abs(timeline_container_width/pixels_per_day);

		var timeline_padding=parseInt(days_visible) * pixels_per_day;
		var timeline_padding_mini=parseInt(days_visible) * pixels_per_day_mini;

		timeline_width=timeline_width + (2 * timeline_padding);

		mini_timeline_width=mini_timeline_width + (2 * timeline_padding_mini);

		//add Day divs
		current_day=parseDate(first_date);
		current_day.setDate(current_day.getDate() - (days_visible+1));

		for (n=1;  n<=((timeline_width/pixels_per_day)); n++) {
			if (current_day.getDate()==1) {
				day_text=month[current_day.getMonth()];
				div_class='month_name'
			} else {
				day_text=current_day.getDate() + daySuffix(current_day.getDate());
				div_class='day_number'
			}
			//for ie7&8 add class to every other day for background
			if (n % 2 == 0) {xtra_class=' dayIEeven'} else {xtra_class=' dayIEodd'}
			jQuery('<div/>', {
				html:   '<div class=' + div_class + '><span>' + day_text + '</span><img src="/themes/ncl/images/timeline_ruler.png?x=1"></div>',
				'class': 'day' + xtra_class
			})
			.css({
				width:pixels_per_day + 'px'
			})
			.appendTo("#timeline");
			current_day.setDate(current_day.getDate() + 1);
		}
		//add month divs to mini_timeline
		current_day=parseDate(first_date);
		current_day.setDate(current_day.getDate() - (days_visible+1));
		//current_day.setDate(current_day.getDate() - (days_visible+1));
		for (n=1;  n<=(mini_timeline_width/pixels_per_day_mini); n++) {
			if (current_day.getDate()==1) {
				day_text=month[current_day.getMonth()].substring(0, 3);
				div_class='mini_month_name';
				jQuery('<div/>', {
					html:   '<div class=' + div_class + '>' + day_text + '<img src="/themes/ncl/images/timeline_footer_ruler.png?x=1"></div>',
					'class': 'mini_month'
				})
				.css({
				//	width:pixels_per_day_mini + 'px'
					left: n*pixels_per_day_mini  + 'px'
				})
				.appendTo("#mini_timeline");
			}
			current_day.setDate(current_day.getDate() + 1);
		}
		jQuery('#timeline').width(timeline_width);
		jQuery('#mini_timeline').width(mini_timeline_width);

		//from length set containment
		containment_left = (timeline_container_width-timeline_width) + containment_right ;

		//create and place elements for each event
		jQuery.each(event_results.posts,function(i,timelineevent){
			//get number of days from beginning
			//var number_of_days_from_start=((daydiff(Date.parse(new Date(first_date).toDateString()),Date.parse(new Date(timelineevent.date).toDateString())))+1);

			//first_date=first_date.setDate(current_day.getDate() + 1)

			var number_of_days_from_start=(daydiff(parseDate(first_date).setHours(0,0,0,0),parseDate(timelineevent.date)))+1;

			// mutiply out for left
			var xleft=(number_of_days_from_start * pixels_per_day) + timeline_padding;
			if (timelineevent.attachments[0]) {
				temp_url=timelineevent.attachments[0].url;
			}
			else {
				temp_url='';
			}
			temp_date_month=month[parseDate(timelineevent.date).getMonth()];
			temp_date_day=parseDate(timelineevent.date).getDate();
			temp_date_year=parseDate(timelineevent.date).getFullYear();
			temp_date = temp_date_month + ' '+temp_date_day + ', ' + temp_date_year;
			if (new_top=='bottom') {
				new_top	= 'middle';
			}
			else {
				new_top='bottom';
			}
			var thishtml='<div class="popup_top"></div><div class="popup_mid">';
			if (temp_url!=='') {
				thishtml=thishtml + '<a href="' + timelineevent.url + '" target="_blank"><img src="' + temp_url +'" border="0"></a>'
			}
			thishtml=thishtml + '<h4 class="clearfix">' + timelineevent.title +'</h4><span class="popup_date">' + temp_date +'</span><span class="popup_more"><a href="' + timelineevent.url + '" target="_blank">View More</a></span></div><div class="popup_bottom"></div>';

			jQuery('<div/>', {
				html: thishtml,
				'class': 'popup ' + new_top
			})
			.css({
			float:"left",
			opacity: 1,
			position: "absolute",
			left: ((xleft)+(pixels_per_day/2))-140 + "px"})// 140 is half of width of popup - cannot get because not generated yet
			.appendTo("#timeline");

			xleft=(number_of_days_from_start * pixels_per_day_mini) + timeline_padding_mini;

			//add item to mini timleine
			jQuery('<div/>', {
				'class': 'marker'
			})
			.css({
			left: ((xleft) +(pixels_per_day_mini/2))-6 + "px"})// 6 is half of width of marker - cannot get because not generated yet
			.appendTo("#mini_timeline");
		});

		//set draggable the mini_timeline_slider element
		jQuery('#mini_timeline_slider').draggable({
			drag: function(event, ui) {

				if (ui.position.left < 0) {ui.position.left=0;} //keep from scrolling too far left
				if (ui.position.left * (pixels_per_day/pixels_per_day_mini) > (timeline_width-timeline_container_width)) {ui.position.left=(timeline_width-timeline_container_width)/(pixels_per_day/pixels_per_day_mini);} 

				jQuery('#timeline').css( {left : - Math.abs(jQuery('#mini_timeline_slider').position().left * (pixels_per_day/pixels_per_day_mini))});

			},
			axis: 'x',
			containment: '#mini_timeline' }
		);

		//show mini timeline

		jQuery('#mini_timeline_container').removeClass('hidden');

		//center fisrt item
		center_item('#timeline div.popup:last');
	}

	//function check position
	function check_position() {
		//console.log('check_position() timeline-left:' + Math.abs(jQuery('#timeline').position().left));
	}

	//set draggable the timeline element
	jQuery('#timeline').draggable({
		drag: function(event, ui) {
			if (ui.position.left > 0) {ui.position.left=0;} //keep from scrolling too far left
			if (ui.position.left < -(timeline_width-timeline_container_width)) {ui.position.left=-(timeline_width-timeline_container_width);} 
			jQuery("#mini_timeline_slider" ).css( {left: Math.abs(jQuery(this).position().left/(pixels_per_day/pixels_per_day_mini)) } );				
		},
		axis: "x",
		containment: ([containment_left,0,containment_right,0])
	});

	//on mouse click in mini timeline, scroll to that section
	jQuery('#mini_timeline').click(function(e){
		new_position = -Math.abs((e.pageX - this.offsetLeft) * (pixels_per_day/pixels_per_day_mini));
		move_timeline(new_position);
		check_position();
	});

	//function drag_timline()
	function move_timeline() {
		jQuery("#mini_timeline_slider" ).css( {left: Math.abs(jQuery('#timeline').position().left/(pixels_per_day/pixels_per_day_mini)) } );
		check_position();
	}

	function go_to_next_popup() {
		if(jQuery('.active_pop').next('.popup').length!=0) {
			center_item(jQuery('.active_pop').next('.popup'));
		}
	}

	function go_to_prev_popup() {
		if(jQuery('.active_pop').prev('.popup').length!=0) {
			center_item(jQuery('.active_pop').prev('.popup'));
		}
	}



	function center_item(lookup) {
		jQuery('.popup').removeClass('active_pop');
		jQuery(lookup).addClass('active_pop');
		new_position = -(jQuery(lookup).position().left-(timeline_container_width/2));
		move_timeline(new_position);
	}

	function move_timeline(to_position) {
		if (to_position > 0) {to_position=0;} //keep from scrolling too far left
		if (to_position < -(timeline_width-timeline_container_width)) { to_position=-(timeline_width-timeline_container_width)}
		jQuery('#timeline').stop().animate( {left : to_position }, 500, 'easeOutQuad' );
		jQuery('#mini_timeline_slider').stop().animate( {left: Math.abs(to_position/(pixels_per_day/pixels_per_day_mini)) } );
	}
	init();

});
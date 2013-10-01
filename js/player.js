function Player(){

};

//This function is taken from http://kevin.vanzonneveld.net/
function rawurlencode (str) {
	str = (str + '').toString();
	return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
	replace(/\)/g, '%29').replace(/\*/g, '%2A');
};

//This function is taken from the official vlc-webinterface
function format_time(s) {
	var hours = Math.floor(s / 3600);
	var minutes = Math.floor((s / 60) % 60);
	var seconds = Math.floor(s % 60);
	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;
	return hours + ":" + minutes + ":" + seconds;
}; 

var data = {
	ip: '',
	port: '',
	lastDir: undefined,
	allowedTypes: new Array("3ga", "a52", "aac", "ac3", "ape", "awb", "dts", "flac", "it",
							"m4a", "m4p", "mka", "mlp", "mod", "mp1", "mp2", "mp3",
							"oga", "ogg", "oma", "s3m", "spx", "thd", "tta","wav", "wma",
							"wv", "xm",
							"asf", "avi", "divx", "drc", "dv", "f4v", "flv", "gxf", "iso",
							"m1v", "m2v", "m2t", "m2ts", "m4v", "mkv", "mov", "mp2", "mp4",
							"mpeg", "mpeg1", "mpeg2", "mpeg4", "mpg", "mts", "mtv", "mxf",
							"mxg", "nuv", "ogg", "ogm", "ogv", "ogx", "ps", "rec", "rm", "rmvb",
							"ts", "vob", "wmv",
							"asx", "b4s", "cue", "ifo", "m3u", "m3u8", "pls", "ram", "rar",
							"sdp", "vlc", "xspf", "zip", "conf"
							) //First supported audio, than video, than playlist
							  //Taken from the vlc-webinterface to make sure I support everything
};

function returnNamespace(){ //To be able to access data-namespace in ajax-functions
	return data;
};

Player.prototype.play = function(){
	this.sendCommand({'command':'pl_play'});
};

Player.prototype.stop = function(){
	this.sendCommand({'command':'pl_stop'});
};

Player.prototype.pause = function(){
	this.sendCommand({'command':'pl_pause'});
};

Player.prototype.previous = function(){
	this.sendCommand({'command':'pl_previous'});
};

Player.prototype.forward = function(){
	this.sendCommand({'command':'pl_next'});
};

Player.prototype.repeat = function(){
	this.sendCommand({'command':'pl_repeat'});
};

Player.prototype.repeatAll = function(){
	this.sendCommand({'command':'pl_loop'});
};

Player.prototype.random = function(){
	this.sendCommand({'command':'pl_random'});
};

Player.prototype.volume = function(value){
	var current = $("#volume").text()
	current = current.substring(0, current.length -1);
	var volume = Math.round((Number(current) * 5.12)+value*(5.12*2)); //Just do some weird calculations here
	//100% Volume seems to be 256 for vlc
	volume = Math.round(volume / 2)
	this.sendCommand('command=volume&val='+volume);
	$("#volume").text(Math.round(volume / 5.12) * 2 + "%");
};

Player.prototype.jumpTo = function(value){
	this.sendCommand('command=seek&val='+value);
	$("#positionSlider").val(Number(value)).slider("refresh");
};

Player.prototype.clearPlaylist = function(){
	this.sendCommand({'command':'pl_empty'});
};

/*
* Function which is used to send commands
*/

Player.prototype.sendCommand = function(params, append) {
	console.log(params)
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/status.xml',
		data: params,
		success: function (data, status, jqXHR) {
			//console.log(jqXHR);
		},
		error: function(data){
			console.log("fail")
		}
	});
};

/*
* Function which is used to update the ui-Details
*/

Player.prototype.updateDetails = function(){
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/status.xml',
		dataType: "xml",
		success: function (data, status, jqXHR) {
			$(data).find('root').each(function(){
				//Set variables for the position slider
				var time = 0;
				var length = 0;
				$(this).find('volume').each(function(){
					$("#volume").text(Math.round(Number($(this).text()) / 5.12) * 2 + "%"); //Get current volume, devide it and round it
				});

				//Get the current position (time)
				$(this).find("time").each(function(){
					time = $(this).text();
				});
				//And the total length (time)
				$(this).find("length").each(function(){
					length = $(this).text();
				});
				//Set slider and ps
				$("#positionSlider").attr("max", length);
				$("#positionSlider").val(Number(time)).slider("refresh");
				$("#currentTime").text(format_time(time));
				$("#totalTime").text(format_time(length));

				//If vlc is already playing, change button
				$(this).find("state").each(function(){
					if($(this).text() === "playing"){
						$("#playpause").removeClass("play").addClass("pause");
					};
				});
			});

			$(data).find('information').each(function(){
				$(this).find("category").each(function(){
					if($(this).attr('name') === "meta"){
						$(this).find("info").each(function(){
							switch($(this).attr('name')){
								case "title":
									$("#title").text($(this).text());
								break;
								case "filename":
									$("#title").text($(this).text());
								case "artist":
									$("#artist").text($(this).text());	
								break;
								case "album":
									$("#album").text($(this).text());
								break;
								case "date":
									$("#year").text($(this).text());
								break;
							}
						});
					}
				});
			});
		},
		error: function (jqXHR, status, error) {
			alert(error);
		}
	});
};

/*
* Function which loads the playlist
*/
Player.prototype.loadPlaylist = function(dir) {
	dir = dir == undefined ? 'file://~' : dir;
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/playlist.xml',
		dataType: "xml",
		success: function (data, status, jqXHR) {
			$("li.item").remove();
			$(data).find("leaf").each(function(){
				var li = '<li class="item" data-type=' +$(this).attr("type")+' data-path="file://'+$(this).attr("path")+'" data-id="'+$(this).attr("id")+'">' + $(this).attr('name') + "</li>";
				$(li).bind("click", {id : $(this).attr("id")}, function(event){ //bind the id of the file to the object, to be able
					player.sendCommand('command=pl_play&id='+event.data.id); 	//to play it
				}).appendTo("#playlistfiles");
			});			
			$(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child");
			//Necessary to make sure the list elements look are styled in the jqm-styles
		},
		error: function (jqXHR, status, error) {
			alert("fail")
		}
	});
}; 

/*
* Function which loads the files and defines events for click and taphold
*/
Player.prototype.loadFiles = function(dir) {
	dir = dir == undefined ? 'file://~' : dir;
	$("li.item").remove();
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/browse.xml',
		data: 'uri=' + rawurlencode(dir),
		dataType: "xml",
		success: function (data, status, jqXHR) {
			$(data).find("element").each(function(){
				var li = '<li class="item" data-type=' +$(this).attr("type")+' data-path="file://'+$(this).attr("path")+'">' + $(this).attr('name') + "</li>";
				$(li).bind("click", {type : $(this).attr("type"), //bind click event
									 path : 'file://'+$(this).attr("path")}, function(event){
					if(event.data.type === "dir"){
						player.loadFiles(event.data.path);
					} else if(event.data.type === "file"){
						var file = rawurlencode(event.data.path);
						var command = 'in_play&input=' + file; //add current file to playlist 
						player.sendCommand('command='+command); //and play
					} 
				}).bind("taphold", {path : 'file://'+$(this).attr("path")}, function(event){ //bind taphold event
					$("#itemPopup").css("display","block"); //show popup
					$("#playallLocation").text(event.data.path); //set headline to current file-uri

				    $("body").on("click", "#playAll", function(){ //set up the button behaviour
				        event.preventDefault();
				        player.playAll(event.data.path); //if user wants to play all, call playAll and send path
				    });
				}).appendTo("#filelist");
			});
			$(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child");
			//Necessary to make sure the list elements look are styled in the jqm-styles		
		},
		error: function (jqXHR, status, error) {
			alert(error)
		}
	});
	data.lastDir = dir;
};

/*
* Function gets called from loadFiles if a certain item is clicked, adds all files from thereon to the playlist
*/
Player.prototype.playAll = function(dir){
	console.log(rawurlencode(dir));
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/browse.xml',
		data: 'uri=' + rawurlencode(dir),
		dataType: "xml",
		success: function (data, status, jqXHR) {
			$(data).find("element").each(function(){
				var type = $(this).attr("type");
				var path = 'file://'+$(this).attr("path");
				var pathEnd = path.substring(path.length -2); //try to find out if the last to characters are ..,
				//in which case he would map the whole filesystem

				var lastChars = path.substring(path.length -8); //Get the last characters to get file-extension and make sure to really get it
				var fileType = lastChars.substring(lastChars.indexOf(".") + 1).toLowerCase(); //get the file-extension without the dot
				data = returnNamespace(); //get my data-namespace

				if(type === "dir" && pathEnd !== ".."){
					player.playAll(path); //If the type of the current item is dir, call yourself
				} else if(type === "file" && data.allowedTypes.indexOf(fileType) > -1){ //figure out if file is supported
					var file = rawurlencode(path); 
					var command = 'in_enqueue&input=' + file; //add current file to playlist
					player.sendCommand('command='+command);
				}
			});
		},
		error: function (jqXHR, status, error){
			console.log(error);
		}
	});
	this.sendCommand({'command':'pl_play'}); //After all items are loaded in the playlist, play one of them
};

/*
* Function which loads the few settings there are
*/
Player.prototype.loadSettings = function(){
	try{
		var ip = window.localStorage.getItem("vlcip"); 
		var port = window.localStorage.getItem("vlcport");

		if(ip !== null && port !== null){
			$("#settings #ip").val(ip);
			$("#settings #port").val(port);

			data.ip = ip;
			data.port = port;
		}
	}catch(err){
		console.log(err)
	}

};

/*
* Function which saves settings if they have been changed
*/
Player.prototype.saveSettings = function(){
	try{
		window.localStorage.setItem("vlcip",$("#ip").val());
		window.localStorage.setItem("vlcport",$("#port").val());
	}catch(err){
		console.log(err)
	}

};
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

//Small helper function to set connection status
function connected(con){
	data.connected = con;
}

//Small helper function to figure out, if dir exists
function foundDir(dir){
	data.foundDir = dir;
}

//Personal namespace
var data = {
	ip: '',
	port: '',
	authorization: '',
	location: '',
	lastDir: undefined,
	startLocation: 'none',
	state: 'stopped',
	currentVolume: 0,
	volumeBeforeMuted: 0,
	connected: false,
	foundDir: false,
	updaterStarted: false,
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

function messageCallback(){};

/*
* Display error message
*/
showError = function(error){
	alert(error, messageCallback, "Error", "Ok");
};

/*
* Display a message
*/
Player.prototype.showMessage = function(message){
	alert(message, messageCallback, "Message", "Ok");
};

Player.prototype.play = function(){
	if(data.state === "paused"){
		this.sendCommand({'command':'pl_forceresume'});
	} else if(data.state === "stopped") {
		this.sendCommand({'command':'pl_play'});
	}
};

Player.prototype.stop = function(){
	this.sendCommand({'command':'pl_stop'});
};

Player.prototype.pause = function(){
	this.sendCommand({'command':'pl_pause'});
};10

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
	var current = $("#volume").text();
	current = current.substring(0, current.length -1);
	var volume = Math.round((Number(current) * 5.12)+value*(5.12*2)); //Just do some weird calculations here
	//100% Volume seems to be 256 for vlc
	volume = Math.round(volume / 2)
	this.sendCommand('command=volume&val='+volume);
	$("#volume").text(Math.round(volume / 5.12) * 2 + "%");
};

Player.prototype.mute = function(){
	if($("#volume").text() !== "0%"){
		data.volumeBeforeMuted = data.currentVolume;
		this.sendCommand('command=volume&val=0');
		$("#volume").css("color","grey");
		this.updateDetails();
	} else {
		this.sendCommand('command=volume&val='+data.volumeBeforeMuted);
		$("#volume").css("color","white");
		this.updateDetails();
	}
}

Player.prototype.jumpTo = function(value){
	this.sendCommand('command=seek&val='+value);
	$("#positionSlider").val(Number(value)).slider("refresh");
};

Player.prototype.clearPlaylist = function(){
	this.sendCommand({'command':'pl_empty'});
	$("#playlist #playlistfiles li").remove();
};

/*
* Function which is used to send commands
*/

Player.prototype.sendCommand = function(params, append) {
	console.log(params)
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/status.xml',
		data: params,
		beforeSend : function(xhr) {
			if(data.authorization !== undefined){
				xhr.setRequestHeader("Authorization", "Basic " + data.authorization);
			}
		},
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
		beforeSend : function(xhr) {
			if(data.authorization !== undefined){
				xhr.setRequestHeader("Authorization", "Basic " + data.authorization);
			}
		},
		success: function (requestData, status, jqXHR) {
			$(requestData).find('root').each(function(){
				//Set variables for the position slider
				var time = 0;
				var length = 0;
				$(this).find('volume').each(function(){
					$("#volume").text(Math.round(Number($(this).text()) / 5.12) * 2 + "%"); //Get current volume, devide it and round it
					
					if($(this).text() !== "0"){ //If the player isn't muted
						data = returnNamespace(); //Have to get namespace before I can set it
						data.currentVolume = $(this).text();
					}
				});

				//Highlight or disable controls-left
				$(this).find('repeat').each(function(){
					if($(this).text() === "true"){
						$("#repeat").removeClass("repeat").addClass("re-active");
					} else {
						$("#repeat").removeClass("re-active").addClass("repeat");
					}
				});
				$(this).find('loop').each(function(){
					if($(this).text() === "true"){
						$("#repeat-all").removeClass("repeat-all").addClass("re-all-active");
					} else {
						$("#repeat-all").removeClass("re-all-active").addClass("repeat-all");
					}
				});
				$(this).find('random').each(function(){
					if($(this).text() === "true"){
						$("#random").removeClass("random").addClass("ra-active");
					} else {
						$("#random").removeClass("ra-active").addClass("random");
					}
				});

				$(this).find('state').each(function(){
					data = returnNamespace();
					var state = $(this).text();
					data.state = state;

					if(state === "playing"){
						if($(".playpause").attr("class").indexOf("play") !== -1){
							$(".playpause").removeClass("play").addClass("pause");
						} else {
							$(".playpause").addClass("pause");
						}
					} else if(state === "paused"){
						if($(".playpause").attr("class").indexOf("pause") !== -1){
							$(".playpause").removeClass("pause").addClass("play");
						} else {
							$(".playpause").addClass("play");
						}
					} else { //Player got stopped
						if($(".playpause").attr("class").indexOf("pause") !== -1){
							$(".playpause").removeClass("pause").addClass("play");
						} else {
							$(".playpause").addClass("play");
						}
						$("#positionSlider").val(0).slider("refresh"); //Make sure the slider gets set back
					}
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

				if(time === length){
					$("#positionSlider").val(0).slider("refresh"); //If the song finshed, reset the slider. Important for
					//the end of playlist
				}
			});

			$(requestData).find('information').each(function(){
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
		beforeSend : function(xhr) {
			if(data.authorization !== undefined){
				xhr.setRequestHeader("Authorization", "Basic " + data.authorization);
			}
		},
		success: function (data, status, jqXHR) {
			$("li.item").remove();
			$(data).find("leaf").each(function(){
				var id = $(this).attr("id");
				var li = '<li class="item" data-type=' +$(this).attr("type")+' data-path="file://'+$(this).attr("path")+'" data-id="'+$(this).attr("id")+'">' + $(this).attr('name') + "</li>";
				$(li).hammer().bind("tap", {id : id}, function(event){ //bind the id of the file to the object, to be able
					player.sendCommand('command=pl_play&id='+event.data.id); 	//to play it
				}).bind("hold", {id : id}, function(event){
					$("#playlistItemPopup").css("display","block");
					var itemId = event.data.id;					

					//Configure the removeItem button, append it and add class for design
					$("#removeItem").remove();
					var button = '<a href="#" id="removeItem" data-theme="c" data-role="button" data-icon="delete" data-iconpos="top">Remove Item</a>';
					$(button).bind("click", {id : itemId}, function(event){
				        event.preventDefault();
				        var command = "pl_delete&id=" + event.data.id;
						player.sendCommand('command='+command); //call removeItem and hand over id
						player.loadPlaylist(); //and reload the playlist
					}).appendTo("#playlistItemPopup");
					$("#removeItem").addClass("ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-top ui-btn-up-c")

				}).appendTo("#playlistfiles");
			});			
			$(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child");
			//Necessary to make sure the list elements look are styled in the jqm-styles
		},
		error: function (jqXHR, status, error) {
		}
	});
}; 

/*
* Remove a single Item from the playlist
*/

/*
* Function which loads the files and defines events for click and taphold
*/
Player.prototype.loadFiles = function(dir) {
	dir = dir == undefined ? data.location : dir;
	console.log(dir)
	$("li.item").remove();
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/browse.xml',
		data: 'uri=' + rawurlencode(dir),
		dataType: "xml",
		beforeSend : function(xhr) {
			if(data.authorization !== undefined){
				xhr.setRequestHeader("Authorization", "Basic " + data.authorization);
			}
		},
		success: function (data, status, jqXHR) {
			console.log(data);
			$(data).find("element").each(function(){
				var dataType = $(this).attr("type");
				var li = '<li class="item" data-type=' +dataType+' data-path="file://'+$(this).attr("path")+'">' + $(this).attr('name') + "</li>";
				$(li).hammer().bind("tap", {type : dataType, //bind click event
									 path : 'file://'+$(this).attr("path")}, function(event){
					if(event.data.type === "dir"){
						player.loadFiles(event.data.path);
					} else if(event.data.type === "file"){
						var file = rawurlencode(event.data.path);
						var command = 'in_play&input=' + file; //add current file to playlist 
						player.sendCommand('command='+command); //and play
					} 
				}).bind("hold", {path : 'file://'+$(this).attr("path")}, function(event){ //bind taphold event
						if(dataType === "dir"){
							var path = event.data.path;
							$("#itemPopup").css("display","block"); //show popup
							$("#playallLocation").text(path); //set headline to current file-uri

							//Configure the play all button, append it and add class for design
							$("#playAll").remove();
							var button = '<a href="#" id="playAll" data-theme="c" data-role="button">Play All</a>';
							$(button).bind("click", {path: path}, function(){
								event.preventDefault();
								player.playAll(event.data.path); //if user wants to play all, call playAll and send path
							}).appendTo("#itemPopup");
							$("#playAll").addClass("ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-top ui-btn-up-c")

							//Configure the setHome button, append it and add class for design
							$("#setHome").remove();
							var button = '<a href="#" id="setHome" data-theme="c" data-role="button">Set marked folder as home</a>';
							$(button).bind("click", {path: path}, function(){
								event.preventDefault();
								player.setHome(event.data.path); //if user wants to set the marked folder as home, call function and set home
							}).appendTo("#itemPopup");
							$("#setHome").addClass("ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-top ui-btn-up-c")
						};
				}).appendTo("#filelist");
			});
			$(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child");
			//Necessary to make sure the list elements look are styled in the jqm-styles		
		},
		error: function (jqXHR, status, error) {
			console.log("Error" + status)
		}
	});
	data.lastDir = dir;
};

/*
* Set marked folder as home
*/
Player.prototype.setHome = function(dir){
	window.localStorage.setItem("location",dir);
	this.checkFolder(dir);
	if(data.foundDir == true){
		this.showMessage("Success, needs restart");
		data.foundDir = false;
	}
};

/*
* Function gets called from loadFiles if a certain item is clicked, adds all files from thereon to the playlist
*/
Player.prototype.playAll = function(dir){
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/browse.xml',
		data: 'uri=' + rawurlencode(dir),
		dataType: "xml",
		beforeSend : function(xhr) {
			if(data.authorization !== undefined){
				xhr.setRequestHeader("Authorization", "Basic " + data.authorization);
			}
		},
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
* Function which get the settings if they have been changed and save them, needed to prevent bug
*/
Player.prototype.getSettings = function(){
	try{
		data.ip = $("#ip").val();
		data.port = $("#port").val();
		var password = $("#password").val();
		var username = $("#username").val();

		if(username !== "" && password !== ""){ //If the username and the password is set
			data.authorization = btoa(username+":"+password);
		} else if (username === "" && password !== ""){ //If no username, but the password is set
			data.authorization = btoa(":"+password);
		} else if (username === "" && password === ""){ //If nothing is set
			data.authorization = undefined;
		}

		if(data.location !== ""){ //If the user has set a directory
			data.location = "file://" + $("#location").val();
		} else {
			data.location = "file://~";
		}

		//check connection and folder, if successful save settings
		checkConnection("save",data.location);	
	}catch(err){
		console.log(err)
	}

};

/*
* Function which saves the settings
*/
Player.prototype.saveSettings = function(){
	window.localStorage.setItem("vlcip",data.ip);
	window.localStorage.setItem("vlcport",data.port);
	window.localStorage.setItem("location",data.location);
	window.localStorage.setItem("authorization", data.authorization);
	window.localStorage.setItem("notFirstRun","true"); //Doesn't set the variable true though

	this.showMessage("Settings saved, restart may be required");
	$(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
	this.loadHelper();
};

/*
* Function which loads the few settings there are
*/
Player.prototype.loadHelper = function(){
	var firstRun = window.localStorage.getItem("notFirstRun");
	if(firstRun !== null && firstRun.indexOf("true") > -1){
		try{
			data.ip = window.localStorage.getItem("vlcip"); 
			data.port = window.localStorage.getItem("vlcport");
			data.location = window.localStorage.getItem("location");
			data.authorization = window.localStorage.getItem("authorization");

			//check connection and set data.connected accordingly		
			checkConnection("load", data.location);	

			if(data.updaterStarted === false){
				$("#playerPopup").css("display","block");
			}
		}catch(err){
			console.log("err");
		}
	} else {
		this.showMessage("Please set settings");
		$.mobile.changePage("#settings", "slide", true, true);
	} 

};

/*
* Function which loads the few settings there are
*/
Player.prototype.loadSettings = function(){
	$("#settings #ip").val(data.ip);
	$("#settings #port").val(data.port);
	var folder = data.location;
	if(folder === "file://"){
		folder = folder.replace("file://","");
	} else if(folder === "file://~"){
		folder = folder.replace("file://~","");
	}

	$("#settings #location").val(folder);
	$("#playerPopup").css("display","none");

	player.updateDetails();

	if(data.updaterStarted === false){ //If everything is ok and the updater hasn't been started
		data.updaterStarted = true;
		window.setInterval("player.updateDetails();",1000);
	}
}

/*
* Function that clears the settings
*/
Player.prototype.clearSettings = function(){
	window.localStorage.clear();
	$("#settings #ip").val(null);
	$("#settings #port").val(null);
	$("#settings #location").val(null);
	$("#settings #username").val(null);
	$("#settings #password").val(null);
	this.showMessage("Settings cleared, please restart app");
	$(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
};

/*
* Check the connection, will check folder seprately, to give better feedback
*/
checkConnection = function(id, folder){
	//test user settings
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/status.xml',
		beforeSend : function(xhr) {
			if(data.authorization !== undefined){
				xhr.setRequestHeader("Authorization", "Basic " + data.authorization);
			}
		},
		success: function (data, status, jqXHR) {
			if($(data).find("root").length > 0){
				checkFolder(id,folder); //I'm connected, now go and check the folder	
			} else {
				showError("Couldn't find VLC, please check IP and Port");
				$(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
			}		
		},
		error: function(data){
			if($(data.status).get(0) === 401){ //If the username or password is wrong
				showError("Ups - the username or password must be wrong");
			} else {
				showError("Couldn't find VLC, please check IP and Port");
			}
			$(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
		}
	});
};

/*
* Check the folder
*/
checkFolder= function(id, folder){
	$.ajax({
		url: 'http://' + data.ip + ":" + data.port + '/requests/browse.xml',
		data: "uri=" + rawurlencode(folder),
		beforeSend : function(xhr) {
			if(data.authorization !== undefined){
				xhr.setRequestHeader("Authorization", "Basic " + data.authorization);
			}
		},
		success: function (data, status, jqXHR) {
			if($(data).find('root').length > 0){
				if(id === "load"){ //If I was called from load settings, load settings
					player.loadSettings();
				} else if(id === "save"){ //else save settings
					player.saveSettings();
				}
			} else {
				showError("Connected, but couldn't find choosen directory");
				$(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
			}
		},
		error: function(data){
			showError("Connected, but couldn't find choosen directory");
			$(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
		}
	});
};
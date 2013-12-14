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

//Personal namespace
var plData = {
	ip: '',
	port: '',
	username: '',
	password: '',
	location: '',
	lastDir: undefined,
	startLocation: 'none',
	state: 'stopped',
	currentVolume: 0,
	volumeBeforeMuted: 0,
	connected: false,
	foundDir: false,
    cfCaller: '',
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

//Languages object getting modified by Language
var plLang = {
};

function returnNamespace(){ //To be able to access plData-namespace in ajax-functions
	return plData;
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
showMessage = function(message){
	alert(message, messageCallback, "Message", "Ok");
};

Player.prototype.play = function(){
	if(plData.state === "paused"){
		this.sendCommand({'command':'pl_forceresume'});
	} else if(plData.state === "stopped") {
		this.sendCommand({'command':'pl_play'});
	}
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
		plData.volumeBeforeMuted = plData.currentVolume;
		this.sendCommand('command=volume&val=0');
		$("#volume").css("color","grey");
		this.updateDetails();
	} else {
		this.sendCommand('command=volume&val='+plData.volumeBeforeMuted);
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
		url: 'http://' + plData.ip + ":" + plData.port + '/requests/status.xml',
		data: params,
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username+":"+plData.password));
        },
		timeout: 5000,
		success: function (requestData, status, jqXHR) {
			//console.log(jqXHR);
		},
		error: function (requestData) {
			console.log("fail")
		}
	});
};


/*
* Check the connection, will check folder seprately, to give better feedback
*/
checkConnection = function () {
    $("#settings #settingsPopup").css("display", "block");
    //test user settings

    if (navigator.userAgent.match(/Windows Phone/) != null) {
        var url = "http://" + plData.ip + ":" + plData.port + "/requests/status.xml";
        cordova.exec(checkFolder, connectionError, "BasicAuth", "get", [plData.ip, plData.port, plData.username, plData.password]);
    } else {
        $.ajax({
            url: 'http://' + plData.ip + ":" + plData.port + '/requests/status.xml',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password));

            },
            dataType: "xml",
            timeout: 5000,
            success: function (requestData, status, jqXHR) {
                console.log("Success: " + requestData);
                if ($(requestData).find("root").length > 0) {
                    checkFolder(); //I'm connected, now go and check the folder	
                } else {
                    $("#settings #settingsPopup").css("display", "none");
                    $("#player #playerPopup").css("display", "none");
                    showError(plLang["checkIpAndPort"]);
                    player.clearSettings("error");
                    $(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("hi");
                console.log(jqXHR.status);
                console.log(textStatus);
                console.log(errorThrown);
                if (errorThrown === "timeout") {
                    $("#settings #settingsPopup").css("display", "none");
                    $("#player #playerPopup").css("display", "none");
                    //player.clearSettings();
                }
                if ($(jqXHR.status).get(0) === 401) { //If the username or password is wrong
                    showError(plLang["usernameOrPasswordWrong"]);
                } else {
                    $("#settings #settingsPopup").css("display", "none");
                    $("#playerPopup").css("display", "none");
                    showError(plLang["checkIpAndPort"]);
                    player.clearSettings("error");
                }
                $(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
            }
        });
    }
};

connectionError = function () {
    $("#settings #settingsPopup").css("display", "none");
    $("#playerPopup").css("display", "none");
    showError(plLang["checkSettings"]);
    $(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
    player.clearSettings("error");
}

/*
* Check the folder
*/
checkFolder = function () {
    console.log("cf");

    $.ajax({
        url: 'http://' + plData.ip + ":" + plData.port + '/requests/browse.xml',
        data: "uri=" + rawurlencode(plData.location),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password));
        },
        timeout: 5000,
        success: function (requestData, status, jqXHR) {
            if ($(requestData).find('root').length > 0) {
                ns = returnNamespace(); //get my plData-namespace
                if (ns.cfCaller === "load") { //If I was called from load settings, load settings
                    player.loadSettings();
                } else if (ns.cfCaller === "save") { //else save settings
                    player.saveSettings();
                } else if(ns.cfCaller === "setHome"){ //If the user changed his homefolder
                    return true;
                }
                $("#settings #settingsPopup").css("display", "none");
            } else {
                $("#settings #settingsPopup").css("display", "none");
                showError(plLang["connectedNoDir"]);
                player.clearSettings("error");
            }
        },
        error: function (requestData) {
            $("#settings #settingsPopup").css("display", "none");
            showError(plLang["connectedNoDir"]);
            player.clearSettings("error");
        }
    });
    $(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
};

/*
* Function which get the settings if they have been changed and save them, needed to prevent bug
*/
Player.prototype.getSettings = function () {
    //try{
    plData.ip = $("#ip").val();
    plData.port = $("#port").val();
    plData.password = $("#password").val();
    plData.username = $("#username").val();

    if (plData.location !== "") { //If the user has set a directory
        plData.location = "file://" + $("#location").val();
    } else {
        plData.location = "file://~";
    }

    //check connection and folder, if successful save settings
    plData.cfCaller = "save";
    checkConnection();
    //}catch(err){
    //	console.log(err)
    //}

};

/*
* Function which saves the settings
*/
Player.prototype.saveSettings = function () {
    window.localStorage.setItem("vlcip", plData.ip);
    window.localStorage.setItem("vlcport", plData.port);
    window.localStorage.setItem("location", plData.location);
    window.localStorage.setItem("username", plData.username);
    window.localStorage.setItem("password", plData.password);
    window.localStorage.setItem("notFirstRun", "true"); //Doesn't set the variable true though

    showMessage(plLang["settingsSaved"]);
    $(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
    this.loadHelper();
};

/*
* Function which loads the few settings there are
*/
Player.prototype.loadHelper = function () {
    var firstRun = window.localStorage.getItem("notFirstRun");
    if (firstRun !== null && firstRun.indexOf("true") > -1) {
        try {
            plData.ip = window.localStorage.getItem("vlcip");
            plData.port = window.localStorage.getItem("vlcport");
            plData.location = window.localStorage.getItem("location");
            plData.lastDir = window.localStorage.getItem("location"); //Also set lastDir, to make jump in library possible
            plData.username = window.localStorage.getItem("username");
            plData.password = window.localStorage.getItem("password");

            //check connection
            plData.cfCaller = "load"
            checkConnection();

            if (updater.getState() === false) {
                $("#playerPopup").css("display", "block");
            }
        } catch (err) {
            console.log("err");
        }
    } else {
        showMessage(plLang["setSettings"]);
        $.mobile.changePage("#settings", "slide", true, true);
        $(".dot-active").removeClass("dot-active");
        $(".settingsDot").addClass("dot-active");
    }

};

/*
* Function which loads the few settings there are
*/
Player.prototype.loadSettings = function () {
    $("#settings #ip").val(plData.ip);
    $("#settings #port").val(plData.port);
    var folder = plData.location;
    if (folder === "file://") { //Deletes the standard-value from the setting field
        folder = folder.replace("file://", "");
    } else if (folder === "file://~") {
        folder = folder.replace("file://~", "");
    }

    $("#settings #location").val(folder);
    $("#playerPopup").css("display", "none");

    updater.updateDetails();

    if (updater.getState() === false) { //If everything is ok and the updater hasn't been started
        updater.startUpdater();
    }
}

/*
* Function that clears the settings
*/
Player.prototype.clearSettings = function (caller) {
    plData.location = "";
    if (caller !== "error") {
        showMessage(plLang["settingsDeletedRestart"]);
        window.localStorage.clear();
        $("#settings #ip").val(null);
        $("#settings #port").val(null);
        $("#settings #location").val(null);
        $("#settings #username").val(null);
        $("#settings #password").val(null);
        $(".ui-btn-active").removeClass("ui-btn-active"); //Remove the active-state of the button
        plData = null;
        updater.stopUpdater();
    }
};


/*
* Function which loads the playlist
*/
Player.prototype.loadPlaylist = function() {
	$.ajax({
		url: 'http://' + plData.ip + ":" + plData.port + '/requests/playlist.xml',
		dataType: "xml",
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username+":"+plData.password));
        },
		timeout: 5000,
		success: function (requestData, status, jqXHR) {
			$("li.item").remove();
			$(requestData).find("leaf").each(function(){
				var id = $(this).attr("id");
				var li = '<li class="item">' + $(this).attr('name') + "</li>";
				$(li).hammer().bind("tap", {id : id}, function(event){ //bind the id of the file to the object, to be able
					player.sendCommand('command=pl_play&id='+event.data.id); 	//to play it
				}).bind("hold", {id : id}, function(event){
					$("#playlistItemPopup").css("display","block");
					var itemId = event.data.id;					

					//Configure the removeItem button, append it and add class for design
					$("#removeItem").remove();
					var button = '<a href="#" id="removeItem" class="wp8-styled-button" >Remove Item</a>';
					$(button).bind("click", {id : itemId}, function(event){
				        event.preventDefault();
				        var command = "pl_delete&id=" + event.data.id;
						player.sendCommand('command='+command); //call removeItem and hand over id
						player.loadPlaylist(); //and reload the playlist
					}).appendTo("#playlistItemPopup");

				}).appendTo("#playlistfiles");
			});			
			$(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child");
			//Necessary to make sure the list elements look are styled in the jqm-styles
		},
		error: function (jqXHR, status, error) {
            console.log("loadPlaylist")
		    if (updater.getState === true) {
		        showError(plLang["lostConnection"]);
		        updater.stopUpdater();
		    }
		}
	});
}; 

/*
* Function which loads the files and defines events for click and taphold
*/
Player.prototype.loadFiles = function(dir) {
	dir = dir == undefined ? plData.lastDir : dir;
	console.log(plData.lastDir)
    console.log(plData.location)
    //if (dir !== plData.lastDir) {
        //console.log("here")
	    $("li.item").remove();
	    $.ajax({
	        url: 'http://' + plData.ip + ":" + plData.port + '/requests/browse.xml',
	        data: 'uri=' + rawurlencode(dir),
	        dataType: "xml",
	        beforeSend: function (xhr) {
	            xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password));
	        },
	        timeout: 5000,
	        success: function (requestData, status, jqXHR) {
	            if ($(requestData).find("element").length > 0) {
	                $(requestData).find("element").each(function () {
	                    var dataType = $(this).attr("type");
	                    var path = $(this).attr("path");
	                    var uri = $(this).attr("uri");
	                    var uriEnd = uri.substring(uri.length - 2); //try to find out if the last to characters are ..,
	                    //in which case he would map the whole filesystem
	                    var lastChars = uri.substring(uri.length - 8); //Get the last characters to get file-extension and make sure to really get it
	                    var fileType = lastChars.substring(lastChars.indexOf(".") + 1).toLowerCase(); //get the file-extension without the dot
	                    plData = returnNamespace(); //get my plData-namespace

	                    if (dataType === "dir") { //If dir 
	                        var li = '<li class="item">' + $(this).attr('name') + "</li>";
	                        $(li).hammer().bind("tap", { uri: $(this).attr("uri") }, function (event) {
	                            player.loadFiles(event.data.uri);
	                        }).bind("hold", { uri: $(this).attr("uri") }, function (event) { //bind taphold event
	                            var uri = event.data.uri;
	                            $("#itemPopup").css("display", "block"); //show popup
	                            $("#playallLocation").text(path); //set headline to current file-uri (in the right format, using path instead of uri)

	                            //Configure the play all button, append it and add class for design
	                            $("#playAll").remove();
	                            var button = '<a href="#" id="playAll" class="wp8-styled-button" data-role="button">Play All</a>';
	                            $(button).bind("click", { uri: uri }, function () {
	                                event.preventDefault();
	                                player.playAll(event.data.uri); //if user wants to play all, call playAll and send path
	                                player.sendCommand({ 'command': 'pl_play' }); //After all items are loaded in the playlist, play one of them
	                            }).appendTo("#itemPopup");

	                            //Configure the setHome button, append it and add class for design
	                            $("#setHome").remove();
	                            var button = '<a href="#" id="setHome" class="wp8-styled-button" data-role="button">Set marked folder as home</a>';
	                            $(button).bind("click", { uri: uri }, function () {
	                                event.preventDefault();
	                                player.setHome(event.data.uri); //if user wants to set the marked folder as home, call function and set home
	                            }).appendTo("#itemPopup");

	                        }).appendTo("#filelist");
	                    } else if (dataType === "file" && plData.allowedTypes.indexOf(fileType) > -1) { //Make sure the file displayed is supported
	                        var li = '<li class="item">' + $(this).attr('name') + "</li>";
	                        $(li).hammer().bind("tap", { uri: $(this).attr("uri") }, function (event) {
	                            var file = rawurlencode(event.data.uri);
	                            var command = 'in_play&input=' + file; //add current file to playlist 
	                            player.sendCommand('command=' + command); //and play
	                        }).appendTo("#filelist");
	                    }
	                });
	                plData.lastDir = dir; //If last dir is not empty and the request was successful
	            } else { //If the folder is empty, provide a way back for the user
	                var li = '<li class="item">..</li>';
	                $(li).hammer().bind("tap", function (event) {
	                    player.loadFiles(plData.lastDir);
	                }).appendTo("#filelist");
	            }
	            $(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child");
	            //Necessary to make sure the list elements look are styled in the jqm-styles		
	        },
	        error: function (jqXHR, status, error) {
                console.log("loadFiles")
	            if (updater.getState === true) {
	                showError(plLang["lostConnection"]);
	                updater.stopUpdater();
	            }
	        }
	    });
	//}
};

/*
* Set marked folder as home <- DOESN'T WORK ANYMORE
*/
Player.prototype.setHome = function(dir){
	window.localStorage.setItem("location",dir);
    //check folder
    plData.lastDir = dir;
    plData.cfCaller = "setHome"
    showMessage(plLang["settingsSavedRestart"]);
};

/*
* Function gets called from loadFiles if a certain item is clicked, adds all files from thereon to the playlist
*/
Player.prototype.playAll = function (dir) {
    this.clearPlaylist();
	$.ajax({
		url: 'http://' + plData.ip + ":" + plData.port + '/requests/browse.xml',
		data: 'uri=' + rawurlencode(dir),
		dataType: "xml",
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username+":"+plData.password));
        },
		timeout: 5000,
		success: function (requestData, status, jqXHR) {
		    $(requestData).find("element").each(function () {
				var type = $(this).attr("type");
				var uri = $(this).attr("uri");
				var uriEnd = uri.substring(uri.length -2); //try to find out if the last to characters are ..,
				//in which case he would map the whole filesystem

				var lastChars = uri.substring(uri.length -8); //Get the last characters to get file-extension and make sure to really get it
				var fileType = lastChars.substring(lastChars.indexOf(".") + 1).toLowerCase(); //get the file-extension without the dot
				plData = returnNamespace(); //get my plData-namespace

				if(type === "dir" && uriEnd !== ".."){
					player.playAll(uri); //If the type of the current item is dir, call yourself
				} else if(type === "file" && plData.allowedTypes.indexOf(fileType) > -1){ //figure out if file is supported
					var file = rawurlencode(uri); 
					var command = 'in_enqueue&input=' + file; //add current file to playlist
					player.sendCommand('command='+command);
				}
			});
		},
		error: function (jqXHR, status, error){
			console.log(error);
		}
	});
};
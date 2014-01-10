function Updater() {

};

var upData = {
    interval: '',
    started: false,
    lastTitle: '',
    lastFilename: ''
}

Updater.prototype.getState = function () {
    return upData.started;
};

Updater.prototype.startUpdater = function () {
    upData.interval = window.setInterval("updater.updateDetails();", 1000);
    upData.started = true;
};

Updater.prototype.stopUpdater = function () {
    console.log("here");
    window.clearInterval(upData.interval);
    upData.started = false;
}

stopUpdater = function () {
    window.clearInterval(upData.interval);
    upData.started = false;
}

getUpdaterData = function () { //Neccessary to handle data-namespace in ajax
    return upData;
}

Updater.prototype.updateDetails = function () {
    $.ajax({
        url: 'http://' + plData.ip + ":" + plData.port + '/requests/status.xml',
        dataType: "xml",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password));
        },
        timeout: 5000,
        success: function (requestData, status, jqXHR) {
            $(requestData).find('root').each(function () {
                //Set variables for the position slider
                var time = 0;
                var length = 0;
                $(this).find('volume').each(function () {
                    $("#volume").text(Math.round(Number($(this).text()) / 5.12) * 2 + "%"); //Get current volume, devide it and round it

                    if ($(this).text() !== "0") { //If the player isn't muted
                        plData = returnNamespace(); //Have to get namespace before I can set it
                        plData.currentVolume = $(this).text();
                    }
                });

                //Highlight or disable controls-left
                $(this).find('repeat').each(function () {
                    if ($(this).text() === "true") {
                        $("#repeat").removeClass("repeat").addClass("re-active");
                    } else {
                        $("#repeat").removeClass("re-active").addClass("repeat");
                    }
                });
                $(this).find('loop').each(function () {
                    if ($(this).text() === "true") {
                        $("#repeat-all").removeClass("repeat-all").addClass("re-all-active");
                    } else {
                        $("#repeat-all").removeClass("re-all-active").addClass("repeat-all");
                    }
                });
                $(this).find('random').each(function () {
                    if ($(this).text() === "true") {
                        $("#random").removeClass("random").addClass("ra-active");
                    } else {
                        $("#random").removeClass("ra-active").addClass("random");
                    }
                });

                $(this).find('state').each(function () {
                    plData = returnNamespace();
                    var state = $(this).text();
                    plData.state = state;

                    if (state === "playing") {
                        if ($(".playpause").attr("class").indexOf("play") !== -1) {
                            $(".playpause").removeClass("play").addClass("pause");
                        } else {
                            $(".playpause").addClass("pause");
                        }
                    } else if (state === "paused") {
                        if ($(".playpause").attr("class").indexOf("pause") !== -1) {
                            $(".playpause").removeClass("pause").addClass("play");
                        } else {
                            $(".playpause").addClass("play");
                        }
                    } else { //Player got stopped
                        if ($(".playpause").attr("class").indexOf("pause") !== -1) {
                            $(".playpause").removeClass("pause").addClass("play");
                        } else {
                            $(".playpause").addClass("play");
                        }
                        $("#positionSlider").val(0).slider("refresh"); //Make sure the slider gets set back
                    }
                });

                //Get the current position (time)
                $(this).find("time").each(function () {
                    time = $(this).text();
                });
                //And the total length (time)
                $(this).find("length").each(function () {
                    length = $(this).text();
                });
                //Set slider and ps
                $("#positionSlider").attr("max", length);
                $("#positionSlider").val(Number(time)).slider("refresh");
                $("#currentTime").text(format_time(time));
                $("#totalTime").text(format_time(length));

                if (time === length) {
                    $("#positionSlider").val(0).slider("refresh"); //If the song finshed, reset the slider. Important for
                    //the end of playlist
                }
            });

            //Import namespace to identify the last track
            var updaterData = getUpdaterData();
            var title = $(requestData).find("info[name=title]").text();
            var filename = $(requestData).find("info[name=filename]").text();

            if (title !== updaterData.lastTitle | filename !== updaterData.lastFilename) { //If title is different or the filename changed

                //Update album art
                plData = returnNamespace();
                $("#cover").css({
                    "background": "url(http://" + plData.ip + ":" + plData.port + "/art)",
                    "background-repeat": "no-repeat",
                    "background-position": "center",
                    "background-size": "90%"
                });

                //Update album details
                $("#details p").each(function () { //Delete current details, in case the next track has less information
                    $(this).text("");
                });

                if (title.length > 20) {
                    $("#title").text(title.substring(0, 20) + "...");
                } else if (title.length == 0) { //If title is empty use filename instead
                    $("#title").text(filename.substring(0, 20) + "...");
                } else {
                    $("#title").text(title);
                }

                var artist = $(requestData).find("info[name=artist]").text();
                if (artist.length > 20) {
                    $("#artist").text(artist.substring(0, 20) + "...");
                } else {
                    $("#artist").text(artist);
                }

                var album = $(requestData).find("info[name=album]").text();
                if (album.length > 20) {
                    $("#album").text(album.substring(0, 20) + "...");
                } else {
                    $("#album").text(album);
                }

                var year = $(requestData).find("info[name=date]").text();
                if (year.length > 20) {
                    $("#year").text(year.substring(0, 20) + "...");
                } else {
                    $("#year").text(year);
                }
                updaterData.lastTitle = title;
                updaterData.lastFilename = filename;
            }
        },
        error: function (jqXHR, status, error) {
            /*console.log("updateError")
            showError("Lost connection to the VLC");
            stopUpdater();*/
        }
    });
};

function Player() {

};

//This function is taken from http://kevin.vanzonneveld.net/
function rawurlencode(str) {
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
							"oga", "ogg", "oma", "s3m", "spx", "thd", "tta", "wav", "wma",
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

function returnNamespace() { //To be able to access plData-namespace in ajax-functions
    return plData;
};

function messageCallback() { };

/*
* Display error message
*/
showError = function (error) {
    alert(error, messageCallback, "Error", "Ok");
};

/*
* Display a message
*/
showMessage = function (message) {
    alert(message, messageCallback, "Message", "Ok");
};

Player.prototype.play = function () {
    if (plData.state === "paused") {
        this.sendCommand({ 'command': 'pl_forceresume' });
    } else if (plData.state === "stopped") {
        this.sendCommand({ 'command': 'pl_play' });
    }
};

Player.prototype.stop = function () {
    this.sendCommand({ 'command': 'pl_stop' });
};

Player.prototype.pause = function () {
    this.sendCommand({ 'command': 'pl_pause' });
};

Player.prototype.previous = function () {
    this.sendCommand({ 'command': 'pl_previous' });
};

Player.prototype.forward = function () {
    this.sendCommand({ 'command': 'pl_next' });
};

Player.prototype.repeat = function () {
    this.sendCommand({ 'command': 'pl_repeat' });
};

Player.prototype.repeatAll = function () {
    this.sendCommand({ 'command': 'pl_loop' });
};

Player.prototype.random = function () {
    this.sendCommand({ 'command': 'pl_random' });
};

Player.prototype.volume = function (value) {
    var current = $("#volume").text();
    current = current.substring(0, current.length - 1);
    var volume = Math.round((Number(current) * 5.12) + value * (5.12 * 2)); //Just do some weird calculations here
    //100% Volume seems to be 256 for vlc
    volume = Math.round(volume / 2)
    this.sendCommand('command=volume&val=' + volume);
    $("#volume").text(Math.round(volume / 5.12) * 2 + "%");
};

Player.prototype.mute = function () {
    if ($("#volume").text() !== "0%") {
        plData.volumeBeforeMuted = plData.currentVolume;
        this.sendCommand('command=volume&val=0');
        $("#volume").css("color", "grey");
        this.updateDetails();
    } else {
        this.sendCommand('command=volume&val=' + plData.volumeBeforeMuted);
        $("#volume").css("color", "white");
        this.updateDetails();
    }
}

Player.prototype.jumpTo = function (value) {
    this.sendCommand('command=seek&val=' + value);
    $("#positionSlider").val(Number(value)).slider("refresh");
};

Player.prototype.clearPlaylist = function () {
    this.sendCommand({ 'command': 'pl_empty' });
    $("#playlist #playlistfiles li").remove();
};

/*
* Function which is used to send commands
*/

Player.prototype.sendCommand = function (params, append) {
    console.log(params)
    $.ajax({
        url: 'http://' + plData.ip + ":" + plData.port + '/requests/status.xml',
        data: params,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password));
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
                } else if (ns.cfCaller === "setHome") { //If the user changed his homefolder
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
Player.prototype.loadPlaylist = function () {
    $.ajax({
        url: 'http://' + plData.ip + ":" + plData.port + '/requests/playlist.xml',
        dataType: "xml",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password));
        },
        timeout: 5000,
        success: function (requestData, status, jqXHR) {
            $("li.item").remove();
            $(requestData).find("leaf").each(function () {
                var id = $(this).attr("id");
                var li = '<li class="item">' + $(this).attr('name') + "</li>";
                $(li).hammer().bind("tap", { id: id }, function (event) { //bind the id of the file to the object, to be able
                    player.sendCommand('command=pl_play&id=' + event.data.id); 	//to play it
                }).bind("hold", { id: id }, function (event) {
                    $("#playlistItemPopup").css("display", "block");
                    var itemId = event.data.id;

                    //Configure the removeItem button, append it and add class for design
                    $("#removeItem").remove();
                    var button = '<a href="#" id="removeItem" class="wp8-styled-button" >' + plLang["removeItem"] + '</a>';
                    $(button).bind("click", { id: itemId }, function (event) {
                        event.preventDefault();
                        var command = "pl_delete&id=" + event.data.id;
                        player.sendCommand('command=' + command); //call removeItem and hand over id
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
Player.prototype.loadFiles = function (dir) {
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
                            $(".playAll").remove();
                            var button = '<a href="#" class="wp8-styled-button playAll" data-role="button">' + plLang["playAll"] + '</a>';
                            $(button).bind("click", { uri: uri }, function () {
                                event.preventDefault();
                                player.playAll(event.data.uri); //if user wants to play all, call playAll and send path
                                player.sendCommand({ 'command': 'pl_play' }); //After all items are loaded in the playlist, play one of them
                            }).appendTo("#itemPopup");

                            //Configure the setHome button, append it and add class for design
                            $(".setHome").remove();
                            var button = '<a href="#" class="wp8-styled-button setHome" data-role="button">' + plLang["setHome"] + '</a>';
                            $(button).bind("click", { uri: uri }, function () {
                                event.preventDefault();
                                player.setHome(event.data.uri); //if user wants to set the marked folder as home, call function and set home
                            }).appendTo("#itemPopup");

                        }).appendTo("#filelist");
                    } else if (dataType === "file" && plData.allowedTypes.indexOf(fileType) > -1) { //Make sure the file displayed is supported
                        var li = '<li class="item">' + $(this).attr('name') + "</li>";
                        $(li).hammer().bind("tap", { uri: $(this).attr("uri") }, function (event) {
                            var file = rawurlencode(event.data.uri);
                            var command = 'in_enqueue&input=' + file; //add current file to playlist 
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
Player.prototype.setHome = function (dir) {
    window.localStorage.setItem("location", dir);
    //check folder
    plData.lastDir = dir;
    plData.cfCaller = "setHome"
    showMessage(plLang["settingsSavedRestart"]);
};

/*
* Function gets called from loadFiles if a certain item is clicked, adds all files from thereon to the playlist
*/
Player.prototype.playAll = function (dir) {
    $.ajax({
        url: 'http://' + plData.ip + ":" + plData.port + '/requests/browse.xml',
        data: 'uri=' + rawurlencode(dir),
        dataType: "xml",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password));
        },
        timeout: 5000,
        success: function (requestData, status, jqXHR) {
            $(requestData).find("element").each(function () {
                var type = $(this).attr("type");
                var uri = $(this).attr("uri");
                var uriEnd = uri.substring(uri.length - 2); //try to find out if the last to characters are ..,
                //in which case he would map the whole filesystem

                var lastChars = uri.substring(uri.length - 8); //Get the last characters to get file-extension and make sure to really get it
                var fileType = lastChars.substring(lastChars.indexOf(".") + 1).toLowerCase(); //get the file-extension without the dot
                plData = returnNamespace(); //get my plData-namespace

                if (type === "dir" && uriEnd !== "..") {
                    player.playAll(uri); //If the type of the current item is dir, call yourself
                } else if (type === "file" && plData.allowedTypes.indexOf(fileType) > -1) { //figure out if file is supported
                    var file = rawurlencode(uri);
                    var command = 'in_enqueue&input=' + file; //add current file to playlist
                    player.sendCommand('command=' + command);
                }
            });
        },
        error: function (jqXHR, status, error) {
            console.log(error);
        }
    });
};

function Languages() {

};

var english = {
    //Error messages and dynamically content only, because App is basically english

    "playAll": "play all",
    "setHome": "set marked folder as home",
    "removeItem": "remove item",
    "saveSettingsButton": "save",
    "clearSettingsButton": "clear settings",

    "checkIpAndPort": "Couldn't connect. Please check IP and Port.",
    "usernameOrPasswordWrong": "Ups, the username or password must be wrong",
    "checkSettings": "There is an error in your settings - sorry can't be more specific here.",
    "connectedNoDir": "Connected, but couldn't find choosen directory",
    "settingsSaved": "Settings saved",
    "settingsSavedRestart": "Settings saved, please restart the app.",
    "settingsDeletedRestart": "Settings deleted, please restart the app.",
    "setSettings": "Please set settings, but make sure the VLC-Server is running first: Open the VLC, find the settings, activate the HTTP-Webinterface. For VLC < 2.1, find the .hosts-file of the VLC and enter your smartphones IP. For VLC >= 2.1, set the lua-password, to a password of your choice. Restart the VLC !!! Now test it in your browser, using localhost:8080 (if you haven't changed the port).",
    "lostConnection": "Lost connection."
}

var german = {

    //Strings on the player-site

    "player": "Player",
    "title": "Titel",
    "artist": "Künstler",
    "album": "Album",
    "year": "Jahr",
    "ppHeadline": "Verbindet mit VLC",
    "ppMessage": "Bitte warten",

    //Strings on the playlist-site

    "clearPlaylist": "Wiedergabeliste löschen",
    "pipHeadline": "Wiedergabeliste-Funktionen",
    "removeItem": "Titel entfernen",
    "playlist": "Wiedergabeliste",

    //Strings on the library-site

    "library": "Bibliothek",
    "playAll": "Alle wiedergeben",
    "setHome": "Markierten Ordner als Startpunkt setzen",
    "playAll": "Alle wiedergeben",

    //Strings on the settings-site

    "settings": "Einstellungen",
    "spHeadline": "Verbindet mit VLC",
    "spMessage": "Bitte warten",
    "ipLabel": "IP-Adresse",
    "ip": "z.B. 192.168.0.101",
    "portLabel": "Port",
    "port": "z.B. 8080",
    "homefolder": "Heimatverzeichnis",
    "password": "Passwort",
    "passwordPlaceholder": "Wird nicht wieder angezeigt.",
    "username": "Benutzername",
    "usernamePlaceholder": "Wenn nicht konfiguriert, leer lassen.",
    "save": "Speichern",
    "saveSettingsButton": "Speichern",
    "clearSettings": "Einstellungen löschen",
    "clearSettingsButton": "Einstellungen löschen",

    //Strings in the faq on the settings-site

    "faqHeadline": "FAQ",
    "faqMessage": "Wenn Sie die App zum ersten Mal starten, oder die Einstellungen gelöscht haben, tragen Sie die IP-Adresse und den Port ihres VLCs oben ein. Testen Sie zuerst, ob der VLC-Server richtig läuft! Öffnen Sie die Einstellungen des VLCs und aktivieren Sie das HTTP-Interface (unter Erweiterte Einstellungen). Für VLC < 2.1: Lassen Sie nun die gewünschten IPs in der .hosts-Datei zu. Für VLC >= 2.1: Setzen sie das Lua-Passwort. Jetzt muss der VLC neugestartet werden!!! Testen Sie die Einstellungen nun, in dem Sie den Browser öffnen und folgendes eingeben: localhost:8080 (wenn der Port nicht geöffnet wurde). Außerdem können Sie einen Start-Ordner und ein Passwort setzen (ab VLC-Version 2.1 benötigt). Bitte beachten Sie, dass der VLC manchmal etwas braucht, bevor er reagiert.",
    "iconsHeadline": "Die Knöpfe erklärt",
    "iconHome": "Bringt Sie zum Player zurück",
    "iconRepeatOnce": "Wiederholt die Datei einmal",
    "iconRepeatAll": "Wiederholt alle Dateien",
    "iconShuffle": "Spielt zufällige Titel aus der Wiedergabeliste",
    "muteMessage": "Der Player kann stumm geschaltet werden, indem man auf die Lautstärkeangabe drückt, bzw. andersherum.",
    "aboutMeHeadline": "Über mich",
    "aboutMeMessage": "Ich bin Student und Fan von Open-Source-Software. Das ist auch der Grund, warum die App kostenlos ist. Eine Anwendung für ein offenes Projekt sollte kostenlos sein. Auf Grund der Regeln des Appstores kann ich kein Spenden-Button nutzen. Konstruktive Kritik ist jedoch willkommen, aber bitte denken Sie daran, dass die App kostenlos ist und die Entwicklung Zeit gekostet hat.",
    "contactHeadline": "Kontakt",

    //Error messages

    "checkIpAndPort": "Konnte nicht verbinden. Bitte überprüfen Sie die IP und den Port.",
    "usernameOrPasswordWrong": "Oh, der Nutzername oder das Password sind falsch.",
    "checkSettings": "In den Einstellungen befindet sich ein Fehler.",
    "connectedNoDir": "Verbunden, konnte den Ordner aber nicht finden.",
    "settingsSaved": "Einstellungen gespeichert",
    "settingsSavedRestart": "Einstellungen gespeichert, bitte App neustarten",
    "settingsDeletedRestart": "Einstellungen wurden gelöscht, bitte App neustarten",
    "setSettings": "Bitte geben Sie die Einstellungen an. Testen Sie zuerst, ob der VLC-Server richtig läuft! Öffnen Sie die Einstellungen des VLCs und aktivieren Sie das HTTP-Interface (unter Erweiterte Einstellungen). Für VLC < 2.1: Lassen Sie nun die gewünschten IPs in der .hosts-Datei zu. Für VLC >= 2.1: Setzen sie das Lua-Passwort. Jetzt muss der VLC neugestartet werden!!! Testen Sie die Einstellungen nun, in dem Sie den Browser öffnen und folgendes eingeben: localhost:8080 (wenn der Port nicht geändert wurde)",
    "lostConnection": "Verbindung zum VLC wurde unterbrochen"
};

Languages.prototype.getLanguage = function () {
    var browserLang = navigator.language;
    var systemLang = navigator.systemLanguage;
    if (browserLang === "de" | systemLang === "de-DE") {
        $.extend(plLang, german);
        this.setLanguage();
    } else {
        $.extend(plLang, english);
        this.setLanguage();
    }
};

Languages.prototype.setLanguage = function () {

    //Strings on the player-site

    $("#playerHeadline").text(plLang["player"]);
    $("#titleHeadline").text(plLang["title"]);
    $("#artistHeadline").text(plLang["artist"]);
    $("#albumHeadline").text(plLang["album"]);
    $("#yearHeadline").text(plLang["year"]);
    $("#ppHeadline").text(plLang["ppHeadline"]);
    $("#ppMessage").text(plLang["ppMessage"]);

    //Strings on the playlist-site

    $("#clearPlaylist").text(plLang["clearPlaylist"]);
    $("#pipHeadline").text(plLang["pipHeadline"]);
    $("#removeItem").text(plLang["removeItem"]);
    $("#playlistHeadline").text(plLang["playlist"]);

    //Strings on the library-site

    $("#libraryHeadline").text(plLang["library"]);
    $("#playAll").text(plLang["playAll"]);
    $("#setHome").text(plLang["setHomefolder"]);

    //Strings on the settings-site

    $("#settingsHeadline").text(plLang["settings"]);
    $("#spHeadline").text(plLang["spHeadline"]);
    $("#spMessage").text(plLang["spMessage"]);
    $("#ipLabel").text(plLang["ipLabel"]);
    $("#ip").attr("placeholder", plLang["ip"]);
    $("#portLabel").text(plLang["portLabel"]);
    $("#port").attr("placeholder", plLang["port"]);
    $("#homefolderLabel").text(plLang["homefolder"]);
    $("#passwordLabel").text(plLang["password"]);
    $("#password").prop("placeholder", plLang["passwordPlaceholder"]);
    $("#usernameLabel").text(plLang["username"]);
    $("#username").prop("placeholder", plLang["usernamePlaceholder"]);
    $("#saveLabel").text(plLang["save"]);
    $("#saveSettings").val(plLang["saveSettingsButton"]);
    $("#clearSettingsLabel").text(plLang["clearSettings"]);
    $("#clearSettings").val(plLang["clearSettingsButton"]);

    //Strings in the faq on the settings-site

    $("#faqHeadline").text(plLang["faqHeadline"]);
    if (plLang["faqMessage"] !== null) { //If the faq has been translated
        $("#faqMessage").text(plLang["faqMessage"]);
    }
    $("#iconsHeadline").text(plLang["iconsHeadline"]);
    $("#iconHome").text(plLang["iconHome"]);
    $("#iconRepeatOnce").text(plLang["iconRepeatOnce"]);
    $("#iconRepeatAll").text(plLang["iconRepeatAll"]);
    $("#iconShuffle").text(plLang["iconShuffle"]);
    $("#muteMessage").text(plLang["muteMessage"]);
    $("#aboutMeHeadline").text(plLang["aboutMeHeadline"]);
    if (plLang["aboutMeMessage"] !== null) { //If the about me message has been translated
        $("#aboutMeMessage").text(plLang["aboutMeMessage"]);
    }
    $("#contactHeadline").text(plLang["contactHeadline"]);
};

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function (id) {
        init();
    }
};

function init() {
    player = new Player;
    updater = new Updater;
    language = new Languages;

    $(document).bind("mobileinit", function () {
        // Make your jQuery Mobile framework configuration changes here!
        $.support.cors = true;
        $.mobile.allowCrossDomainPages = true;
    });

    //Setup UI
    setupUi();
    setupButtonUi();
    //Change Language
    language.getLanguage();
    //Load settings
    player.loadHelper();

    $("#player").on("pagebeforeshow", function (event) {
        $(".dot-active").removeClass("dot-active");
        $(".playerDot").addClass("dot-active");
    });

    $("#playlist").on("pageshow", function (event) {
        $("#playlistPopup").css("display", "none");
        $(".dot-active").removeClass("dot-active");
        $(".playlistDot").addClass("dot-active");
        player.loadPlaylist();
    });

    $("#library").on("pageshow", function (event) {
        $(".dot-active").removeClass("dot-active");
        $(".libraryDot").addClass("dot-active");
        $("#libraryPopup").css("display", "none");
        player.loadFiles(plData.lastDir);
    });

    $("#settings").on("pagebeforeshow", function (event) {
        $(".dot-active").removeClass("dot-active");
        $(".settingsDot").addClass("dot-active");
    });
}

function setupUi() {

    /*
    * Configure swipe events for the menu
    */

    $(document).off('swipeleft').on('swipeleft', 'section[data-role="page"]', function (event) {
        if (event.handled !== true) // This will prevent event triggering more then once
        {
            var nextpage = $.mobile.activePage.next('section[data-role="page"]');
            // swipe using id of next page if exists
            if (nextpage.length > 0) {
                $.mobile.changePage(nextpage, "slide", true, true);
            } else {
                $.mobile.changePage("#player", "slide", true, true);
            }
            event.handled = true;
        }
        return false;
    });

    $(document).off('swiperight').on('swiperight', 'section[data-role="page"]', function (event) {
        if (event.handled !== true) // This will prevent event triggering more then once
        {
            var prevpage = $.mobile.activePage.prev('section');
            if (prevpage.length > 0) {
                $.mobile.changePage(prevpage, "slide", true, true);
            } else {
                $.mobile.changePage("#settings", "slide", true, true);
            }
            event.handled = true;
        }
        return false;
    });

    //Ugly workaround for annoying header and footer animation size change

    $("input").focus(function (event) {
        //Fix jqm-css-bugs here
        $("#settings div[data-role=header]").removeClass("slidedown");
        $("#settings div[data-role=footer]").removeClass("slideup");

        //select content of input
        $(this).select();
    });

    //Added to prevent footer hiding during focus of input
    $("[data-role=footer]").fixedtoolbar({ hideDuringFocus: "input, select" });

};

function setupButtonUi() {
    //Do it like this to have the persistent buttons work everywhere

    //Configure Home-Button
    $("body").on("click", ".home", function (event) {
        event.preventDefault();
        $.mobile.changePage("#player", "slide", true, true);
    });

    //Configure Player-Buttons
    $("body").on("click", ".playpause", function () {
        console.log("plData.state" + plData.state);
        if (plData.state === "playing") {
            $(this).removeClass("pause").addClass("play");
            player.pause();
        } else {
            $(this).removeClass("play").addClass("pause");
            player.play();
        }
    });

    $("body").on("click", ".stop", function (event) {
        event.preventDefault();
        $(".pause").removeClass("pause").addClass("play");
        player.stop();
    });

    $("body").on("click", ".forward", function (event) {
        event.preventDefault();
        player.forward();
    });

    $("body").on("click", ".previous", function (event) {
        event.preventDefault();
        player.previous();
    });

    //Configure buttons on Player-Site
    $("body").on("click", "#repeat", function (event) {
        event.preventDefault();
        player.repeat();
    });

    $("body").on("click", "#repeat-all", function (event) {
        event.preventDefault();
        player.repeatAll();
    });

    $("body").on("click", "#random", function (event) {
        event.preventDefault();
        player.random();
    });

    $("body").on("click", "#volume-up", function (event) {
        event.preventDefault();
        player.volume(1);
    });

    $("body").on("click", "#volume", function (event) {
        event.preventDefault();
        player.mute();
    });

    $("body").on("click", "#volume-down", function (event) {
        event.preventDefault();
        player.volume(-1);
    });

    //Configure position slider

    $("#positionSlider").on("slidestop", function () {
        player.jumpTo($(this).val());
    });

    //Configure buttons on Playlist-Site
    $("body").on("click", "#options", function (event) {
        event.preventDefault();
        if ($("#playlistPopup").css("display") === "none") {
            $("#playlistPopup").css("display", "block");
        } else {
            $("#playlistPopup").css("display", "none");
        }
    });

    //Configure Popups on Playlist-Site

    $("body").on("click", "#playlistPopup", function (event) {
        event.preventDefault();
        $("#playlistPopup").css("display", "none");
    });

    $("body").on("click", "#playlistItemPopup", function (event) {
        event.preventDefault();
        $("#playlistItemPopup").css("display", "none");
    });

    $("body").on("click", "#clearPlaylist", function (event) {
        event.preventDefault();
        player.clearPlaylist();
    });

    //Configure Popup on Library-Site

    $("body").on("click", "#itemPopup", function (event) {
        event.preventDefault();
        $("#itemPopup").css("display", "none");
    }); //Button is configure when taphold is bound in player.js


    //Configure buttons on Settings-Site
    $("body").on("click", "#saveSettings", function (event) {
        event.preventDefault();
        player.getSettings();
    });

    //Configure buttons on Settings-Site
    $("body").on("click", "#clearSettings", function (event) {
        event.preventDefault();
        player.clearSettings();
    });
}
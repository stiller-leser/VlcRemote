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

getUpdaterData = function(){ //Neccessary to handle data-namespace in ajax
    return upData;
}

Updater.prototype.updateDetails = function() {
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

            if(title !== updaterData.lastTitle | filename !== updaterData.lastFilename){ //If title is different or the filename changed
                
                //Update album art
                plData = returnNamespace();
                $("#cover").css({
                    "background" : "url(http://"+plData.ip+":"+plData.port+"/art)",
                    "background-repeat" : "no-repeat",
                    "background-position" : "center",
                    "background-size" : "90%" 
                });

                //Update album details
                $("#details p").each(function(){ //Delete current details, in case the next track has less information
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
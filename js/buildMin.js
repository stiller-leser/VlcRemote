﻿function Updater() { } function Player() { } function rawurlencode(e) { e = (e + "").toString(); return encodeURIComponent(e).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A") } function format_time(e) { var t = Math.floor(e / 3600); var n = Math.floor(e / 60 % 60); var r = Math.floor(e % 60); t = t < 10 ? "0" + t : t; n = n < 10 ? "0" + n : n; r = r < 10 ? "0" + r : r; return t + ":" + n + ":" + r } function returnNamespace() { return plData } function messageCallback() { } function Languages() { } function init() { player = new Player; updater = new Updater; language = new Languages; $(document).bind("mobileinit", function () { $.support.cors = true; $.mobile.allowCrossDomainPages = true }); language.getLanguage(); setupUi(); setupButtonUi(); player.loadHelper(); $("#player").on("pagebeforeshow", function (e) { $(".dot-active").removeClass("dot-active"); $(".playerDot").addClass("dot-active") }); $("#playlist").on("pageshow", function (e) { $("#playlistPopup").css("display", "none"); $(".dot-active").removeClass("dot-active"); $(".playlistDot").addClass("dot-active"); player.loadPlaylist() }); $("#library").on("pageshow", function (e) { $(".dot-active").removeClass("dot-active"); $(".libraryDot").addClass("dot-active"); $("#libraryPopup").css("display", "none"); player.loadFiles(plData.lastDir) }); $("#settings").on("pagebeforeshow", function (e) { $(".dot-active").removeClass("dot-active"); $(".settingsDot").addClass("dot-active") }) } function setupUi() { $(document).off("swipeleft").on("swipeleft", 'section[data-role="page"]', function (e) { if (e.handled !== true) { var t = $.mobile.activePage.next('section[data-role="page"]'); if (t.length > 0) { $.mobile.changePage(t, "slide", true, true) } else { $.mobile.changePage("#player", "slide", true, true) } e.handled = true } return false }); $(document).off("swiperight").on("swiperight", 'section[data-role="page"]', function (e) { if (e.handled !== true) { var t = $.mobile.activePage.prev("section"); if (t.length > 0) { $.mobile.changePage(t, "slide", true, true) } else { $.mobile.changePage("#settings", "slide", true, true) } e.handled = true } return false }); $("input").focus(function (e) { $("#settings div[data-role=header]").removeClass("slidedown"); $("#settings div[data-role=footer]").removeClass("slideup"); $(this).select() }); $("[data-role=footer]").fixedtoolbar({ hideDuringFocus: "input, select" }) } function setupButtonUi() { $("body").on("click", ".home", function (e) { e.preventDefault(); $.mobile.changePage("#player", "slide", true, true) }); $("body").on("click", ".playpause", function () { console.log("plData.state" + plData.state); if (plData.state === "playing") { $(this).removeClass("pause").addClass("play"); player.pause() } else { $(this).removeClass("play").addClass("pause"); player.play() } }); $("body").on("click", ".stop", function (e) { e.preventDefault(); $(".pause").removeClass("pause").addClass("play"); player.stop() }); $("body").on("click", ".forward", function (e) { e.preventDefault(); player.forward() }); $("body").on("click", ".previous", function (e) { e.preventDefault(); player.previous() }); $("body").on("click", "#repeat", function (e) { e.preventDefault(); player.repeat() }); $("body").on("click", "#repeat-all", function (e) { e.preventDefault(); player.repeatAll() }); $("body").on("click", "#random", function (e) { e.preventDefault(); player.random() }); $("body").on("click", "#volume-up", function (e) { e.preventDefault(); player.volume(1) }); $("body").on("click", "#volume", function (e) { e.preventDefault(); player.mute() }); $("body").on("click", "#volume-down", function (e) { e.preventDefault(); player.volume(-1) }); $("#positionSlider").on("slidestop", function () { player.jumpTo($(this).val()) }); $("body").on("click", "#options", function (e) { e.preventDefault(); if ($("#playlistPopup").css("display") === "none") { $("#playlistPopup").css("display", "block") } else { $("#playlistPopup").css("display", "none") } }); $("body").on("click", "#playlistPopup", function (e) { e.preventDefault(); $("#playlistPopup").css("display", "none") }); $("body").on("click", "#playlistItemPopup", function (e) { e.preventDefault(); $("#playlistItemPopup").css("display", "none") }); $("body").on("click", "#clearPlaylist", function (e) { e.preventDefault(); player.clearPlaylist() }); $("body").on("click", "#itemPopup", function (e) { e.preventDefault(); $("#itemPopup").css("display", "none") }); $("body").on("click", "#saveSettings", function (e) { e.preventDefault(); player.getSettings() }); $("body").on("click", "#clearSettings", function (e) { e.preventDefault(); player.clearSettings() }) } var upData = { interval: "", started: false, lastTitle: "" }; Updater.prototype.getState = function () { return upData.started }; Updater.prototype.startUpdater = function () { upData.interval = window.setInterval("updater.updateDetails();", 1e3); upData.started = true }; Updater.prototype.stopUpdater = function () { console.log("here"); window.clearInterval(upData.interval); upData.started = false }; stopUpdater = function () { window.clearInterval(upData.interval); upData.started = false }; getUpdaterData = function () { return upData }; Updater.prototype.updateDetails = function () { $.ajax({ url: "http://" + plData.ip + ":" + plData.port + "/requests/status.xml", dataType: "xml", beforeSend: function (e) { e.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password)) }, timeout: 5e3, success: function (e, t, n) { $(e).find("root").each(function () { var e = 0; var t = 0; $(this).find("volume").each(function () { $("#volume").text(Math.round(Number($(this).text()) / 5.12) * 2 + "%"); if ($(this).text() !== "0") { plData = returnNamespace(); plData.currentVolume = $(this).text() } }); $(this).find("repeat").each(function () { if ($(this).text() === "true") { $("#repeat").removeClass("repeat").addClass("re-active") } else { $("#repeat").removeClass("re-active").addClass("repeat") } }); $(this).find("loop").each(function () { if ($(this).text() === "true") { $("#repeat-all").removeClass("repeat-all").addClass("re-all-active") } else { $("#repeat-all").removeClass("re-all-active").addClass("repeat-all") } }); $(this).find("random").each(function () { if ($(this).text() === "true") { $("#random").removeClass("random").addClass("ra-active") } else { $("#random").removeClass("ra-active").addClass("random") } }); $(this).find("state").each(function () { plData = returnNamespace(); var e = $(this).text(); plData.state = e; if (e === "playing") { if ($(".playpause").attr("class").indexOf("play") !== -1) { $(".playpause").removeClass("play").addClass("pause") } else { $(".playpause").addClass("pause") } } else if (e === "paused") { if ($(".playpause").attr("class").indexOf("pause") !== -1) { $(".playpause").removeClass("pause").addClass("play") } else { $(".playpause").addClass("play") } } else { if ($(".playpause").attr("class").indexOf("pause") !== -1) { $(".playpause").removeClass("pause").addClass("play") } else { $(".playpause").addClass("play") } $("#positionSlider").val(0).slider("refresh") } }); $(this).find("time").each(function () { e = $(this).text() }); $(this).find("length").each(function () { t = $(this).text() }); $("#positionSlider").attr("max", t); $("#positionSlider").val(Number(e)).slider("refresh"); $("#currentTime").text(format_time(e)); $("#totalTime").text(format_time(t)); if (e === t) { $("#positionSlider").val(0).slider("refresh") } }); var r = getUpdaterData(); var i = $(e).find("info[name=title]").text(); if (i !== r.lastTitle) { $("#details p").each(function () { $(this).text("") }); $("#title").text(i); $("#filename").text($(e).find("info[name=filename]").text()); $("#artist").text($(e).find("info[name=artist]").text()); $("#album").text($(e).find("info[name=album]").text()); $("#year").text($(e).find("info[name=date]").text()); r.lastTitle = i } }, error: function (e, t, n) { } }) }; var plData = { ip: "", port: "", username: "", password: "", location: "", lastDir: undefined, startLocation: "none", state: "stopped", currentVolume: 0, volumeBeforeMuted: 0, connected: false, foundDir: false, cfCaller: "", updaterStarted: false, allowedTypes: new Array("3ga", "a52", "aac", "ac3", "ape", "awb", "dts", "flac", "it", "m4a", "m4p", "mka", "mlp", "mod", "mp1", "mp2", "mp3", "oga", "ogg", "oma", "s3m", "spx", "thd", "tta", "wav", "wma", "wv", "xm", "asf", "avi", "divx", "drc", "dv", "f4v", "flv", "gxf", "iso", "m1v", "m2v", "m2t", "m2ts", "m4v", "mkv", "mov", "mp2", "mp4", "mpeg", "mpeg1", "mpeg2", "mpeg4", "mpg", "mts", "mtv", "mxf", "mxg", "nuv", "ogg", "ogm", "ogv", "ogx", "ps", "rec", "rm", "rmvb", "ts", "vob", "wmv", "asx", "b4s", "cue", "ifo", "m3u", "m3u8", "pls", "ram", "rar", "sdp", "vlc", "xspf", "zip", "conf") }; var plLang = {}; showError = function (e) { alert(e, messageCallback, "Error", "Ok") }; showMessage = function (e) { alert(e, messageCallback, "Message", "Ok") }; Player.prototype.play = function () { if (plData.state === "paused") { this.sendCommand({ command: "pl_forceresume" }) } else if (plData.state === "stopped") { this.sendCommand({ command: "pl_play" }) } }; Player.prototype.stop = function () { this.sendCommand({ command: "pl_stop" }) }; Player.prototype.pause = function () { this.sendCommand({ command: "pl_pause" }) }; Player.prototype.previous = function () { this.sendCommand({ command: "pl_previous" }) }; Player.prototype.forward = function () { this.sendCommand({ command: "pl_next" }) }; Player.prototype.repeat = function () { this.sendCommand({ command: "pl_repeat" }) }; Player.prototype.repeatAll = function () { this.sendCommand({ command: "pl_loop" }) }; Player.prototype.random = function () { this.sendCommand({ command: "pl_random" }) }; Player.prototype.volume = function (e) { var t = $("#volume").text(); t = t.substring(0, t.length - 1); var n = Math.round(Number(t) * 5.12 + e * 5.12 * 2); n = Math.round(n / 2); this.sendCommand("command=volume&val=" + n); $("#volume").text(Math.round(n / 5.12) * 2 + "%") }; Player.prototype.mute = function () { if ($("#volume").text() !== "0%") { plData.volumeBeforeMuted = plData.currentVolume; this.sendCommand("command=volume&val=0"); $("#volume").css("color", "grey"); this.updateDetails() } else { this.sendCommand("command=volume&val=" + plData.volumeBeforeMuted); $("#volume").css("color", "white"); this.updateDetails() } }; Player.prototype.jumpTo = function (e) { this.sendCommand("command=seek&val=" + e); $("#positionSlider").val(Number(e)).slider("refresh") }; Player.prototype.clearPlaylist = function () { this.sendCommand({ command: "pl_empty" }); $("#playlist #playlistfiles li").remove() }; Player.prototype.sendCommand = function (e, t) { console.log(e); $.ajax({ url: "http://" + plData.ip + ":" + plData.port + "/requests/status.xml", data: e, beforeSend: function (e) { e.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password)) }, timeout: 5e3, success: function (e, t, n) { }, error: function (e) { console.log("fail") } }) }; checkConnection = function () { $("#settings #settingsPopup").css("display", "block"); if (navigator.userAgent.match(/Windows Phone/) != null) { var e = "http://" + plData.ip + ":" + plData.port + "/requests/status.xml"; cordova.exec(checkFolder, connectionError, "BasicAuth", "get", [plData.ip, plData.port, plData.username, plData.password]) } else { $.ajax({ url: "http://" + plData.ip + ":" + plData.port + "/requests/status.xml", beforeSend: function (e) { e.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password)) }, dataType: "xml", timeout: 5e3, success: function (e, t, n) { console.log("Success: " + e); if ($(e).find("root").length > 0) { checkFolder() } else { $("#settings #settingsPopup").css("display", "none"); $("#player #playerPopup").css("display", "none"); showError(plLang["checkIpAndPort"]); player.clearSettings("error"); $(".ui-btn-active").removeClass("ui-btn-active") } }, error: function (e, t, n) { console.log("hi"); console.log(e.status); console.log(t); console.log(n); if (n === "timeout") { $("#settings #settingsPopup").css("display", "none"); $("#player #playerPopup").css("display", "none") } if ($(e.status).get(0) === 401) { showError(plLang["usernameOrPasswordWrong"]) } else { $("#settings #settingsPopup").css("display", "none"); $("#playerPopup").css("display", "none"); showError(plLang["checkIpAndPort"]); player.clearSettings("error") } $(".ui-btn-active").removeClass("ui-btn-active") } }) } }; connectionError = function () { $("#settings #settingsPopup").css("display", "none"); $("#playerPopup").css("display", "none"); showError(plLang["checkSettings"]); $(".ui-btn-active").removeClass("ui-btn-active"); player.clearSettings("error") }; checkFolder = function () { console.log("cf"); $.ajax({ url: "http://" + plData.ip + ":" + plData.port + "/requests/browse.xml", data: "uri=" + rawurlencode(plData.location), beforeSend: function (e) { e.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password)) }, timeout: 5e3, success: function (e, t, n) { if ($(e).find("root").length > 0) { ns = returnNamespace(); if (ns.cfCaller === "load") { player.loadSettings() } else if (ns.cfCaller === "save") { player.saveSettings() } else if (ns.cfCaller === "setHome") { return true } $("#settings #settingsPopup").css("display", "none") } else { $("#settings #settingsPopup").css("display", "none"); showError(plLang["connectedNoDir"]); player.clearSettings("error") } }, error: function (e) { $("#settings #settingsPopup").css("display", "none"); showError(plLang["connectedNoDir"]); player.clearSettings("error") } }); $(".ui-btn-active").removeClass("ui-btn-active") }; Player.prototype.getSettings = function () { plData.ip = $("#ip").val(); plData.port = $("#port").val(); plData.password = $("#password").val(); plData.username = $("#username").val(); if (plData.location !== "") { plData.location = "file://" + $("#location").val() } else { plData.location = "file://~" } plData.cfCaller = "save"; checkConnection() }; Player.prototype.saveSettings = function () { window.localStorage.setItem("vlcip", plData.ip); window.localStorage.setItem("vlcport", plData.port); window.localStorage.setItem("location", plData.location); window.localStorage.setItem("username", plData.username); window.localStorage.setItem("password", plData.password); window.localStorage.setItem("notFirstRun", "true"); showMessage(plLang["settingsSaved"]); $(".ui-btn-active").removeClass("ui-btn-active"); this.loadHelper() }; Player.prototype.loadHelper = function () { var e = window.localStorage.getItem("notFirstRun"); if (e !== null && e.indexOf("true") > -1) { try { plData.ip = window.localStorage.getItem("vlcip"); plData.port = window.localStorage.getItem("vlcport"); plData.location = window.localStorage.getItem("location"); plData.lastDir = window.localStorage.getItem("location"); plData.username = window.localStorage.getItem("username"); plData.password = window.localStorage.getItem("password"); plData.cfCaller = "load"; checkConnection(); if (updater.getState() === false) { $("#playerPopup").css("display", "block") } } catch (t) { console.log("err") } } else { showMessage(plLang["setSettings"]); $.mobile.changePage("#settings", "slide", true, true); $(".dot-active").removeClass("dot-active"); $(".settingsDot").addClass("dot-active") } }; Player.prototype.loadSettings = function () { $("#settings #ip").val(plData.ip); $("#settings #port").val(plData.port); var e = plData.location; if (e === "file://") { e = e.replace("file://", "") } else if (e === "file://~") { e = e.replace("file://~", "") } $("#settings #location").val(e); $("#playerPopup").css("display", "none"); updater.updateDetails(); if (updater.getState() === false) { updater.startUpdater() } }; Player.prototype.clearSettings = function (e) { plData.location = ""; if (e !== "error") { showMessage(plLang["settingsDeletedRestart"]); window.localStorage.clear(); $("#settings #ip").val(null); $("#settings #port").val(null); $("#settings #location").val(null); $("#settings #username").val(null); $("#settings #password").val(null); $(".ui-btn-active").removeClass("ui-btn-active"); plData = null; updater.stopUpdater() } }; Player.prototype.loadPlaylist = function () { $.ajax({ url: "http://" + plData.ip + ":" + plData.port + "/requests/playlist.xml", dataType: "xml", beforeSend: function (e) { e.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password)) }, timeout: 5e3, success: function (e, t, n) { $("li.item").remove(); $(e).find("leaf").each(function () { var e = $(this).attr("id"); var t = '<li class="item">' + $(this).attr("name") + "</li>"; $(t).hammer().bind("tap", { id: e }, function (e) { player.sendCommand("command=pl_play&id=" + e.data.id) }).bind("hold", { id: e }, function (e) { $("#playlistItemPopup").css("display", "block"); var t = e.data.id; $("#removeItem").remove(); var n = '<a href="#" id="removeItem" class="wp8-styled-button" >Remove Item</a>'; $(n).bind("click", { id: t }, function (e) { e.preventDefault(); var t = "pl_delete&id=" + e.data.id; player.sendCommand("command=" + t); player.loadPlaylist() }).appendTo("#playlistItemPopup") }).appendTo("#playlistfiles") }); $(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child") }, error: function (e, t, n) { console.log("loadPlaylist"); if (updater.getState === true) { showError(plLang["lostConnection"]); updater.stopUpdater() } } }) }; Player.prototype.loadFiles = function (e) { e = e == undefined ? plData.lastDir : e; console.log(plData.lastDir); console.log(plData.location); $("li.item").remove(); $.ajax({ url: "http://" + plData.ip + ":" + plData.port + "/requests/browse.xml", data: "uri=" + rawurlencode(e), dataType: "xml", beforeSend: function (e) { e.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password)) }, timeout: 5e3, success: function (t, n, r) { if ($(t).find("element").length > 0) { $(t).find("element").each(function () { var e = $(this).attr("type"); var t = $(this).attr("path"); var n = $(this).attr("uri"); var r = n.substring(n.length - 2); var i = n.substring(n.length - 8); var s = i.substring(i.indexOf(".") + 1).toLowerCase(); plData = returnNamespace(); if (e === "dir") { var o = '<li class="item">' + $(this).attr("name") + "</li>"; $(o).hammer().bind("tap", { uri: $(this).attr("uri") }, function (e) { player.loadFiles(e.data.uri) }).bind("hold", { uri: $(this).attr("uri") }, function (e) { var n = e.data.uri; $("#itemPopup").css("display", "block"); $("#playallLocation").text(t); $("#playAll").remove(); var r = '<a href="#" id="playAll" class="wp8-styled-button" data-role="button">Play All</a>'; $(r).bind("click", { uri: n }, function () { e.preventDefault(); player.playAll(e.data.uri) }).appendTo("#itemPopup"); $("#setHome").remove(); var r = '<a href="#" id="setHome" class="wp8-styled-button" data-role="button">Set marked folder as home</a>'; $(r).bind("click", { uri: n }, function () { e.preventDefault(); player.setHome(e.data.uri) }).appendTo("#itemPopup") }).appendTo("#filelist") } else if (e === "file" && plData.allowedTypes.indexOf(s) > -1) { var o = '<li class="item">' + $(this).attr("name") + "</li>"; $(o).hammer().bind("tap", { uri: $(this).attr("uri") }, function (e) { var t = rawurlencode(e.data.uri); var n = "in_play&input=" + t; player.sendCommand("command=" + n) }).appendTo("#filelist") } }); plData.lastDir = e } else { var i = '<li class="item">..</li>'; $(i).hammer().bind("tap", function (e) { player.loadFiles(plData.lastDir) }).appendTo("#filelist") } $(".item").addClass("ui-li ui-li-static ui-btn-up-a ui-first-child ui-last-child") }, error: function (e, t, n) { console.log("loadFiles"); if (updater.getState === true) { showError(plLang["lostConnection"]); updater.stopUpdater() } } }) }; Player.prototype.setHome = function (e) { window.localStorage.setItem("location", e); plData.lastDir = e; plData.cfCaller = "setHome"; showMessage(plLang["settingsSavedRestart"]) }; Player.prototype.playAll = function (e) { this.clearPlaylist(); $.ajax({ url: "http://" + plData.ip + ":" + plData.port + "/requests/browse.xml", data: "uri=" + rawurlencode(e), dataType: "xml", beforeSend: function (e) { e.setRequestHeader("Authorization", "Basic " + btoa(plData.username + ":" + plData.password)) }, timeout: 5e3, success: function (e, t, n) { $(e).find("element").each(function () { var e = $(this).attr("type"); var t = $(this).attr("uri"); var n = t.substring(t.length - 2); var r = t.substring(t.length - 8); var i = r.substring(r.indexOf(".") + 1).toLowerCase(); plData = returnNamespace(); if (e === "dir" && n !== "..") { player.playAll(t) } else if (e === "file" && plData.allowedTypes.indexOf(i) > -1) { var s = rawurlencode(t); var o = "in_enqueue&input=" + s; player.sendCommand("command=" + o) } }) }, error: function (e, t, n) { console.log(n) } }); this.sendCommand({ command: "pl_play" }) }; var english = { checkIpAndPort: "Couldn't connect. Please check IP and Port.", usernameOrPasswordWrong: "Ups, the username or password must be wrong", checkSettings: "There is an error in your settings - sorry can't be more specific here.", connectedNoDir: "Connected, but couldn't find choosen directory", settingsSaved: "Settings saved", settingsSavedRestart: "Settings saved, please restart the app.", settingsDeletedRestart: "Settings deleted, please restart the app.", setSettings: "Please set settings.", lostConnection: "Lost connection." }; var german = { player: "Player", title: "Titel", artist: "Künstler", album: "Album", year: "Jahr", ppHeadline: "Verbindet mit VLC", ppMessage: "Bitte warten", clearPlaylist: "Wiedergabeliste löschen", pipHeadline: "Wiedergabeliste-Funktionen", removeItem: "Titel entfernen", playlist: "Wiedergabeliste", library: "Bibliothek", playAll: "Alle wiedergeben", setHomefolder: "Markierten Ordner als Startpunkt setzen", settings: "Einstellungen", spHeadline: "Verbindet mit VLC", spMessage: "Bitte warten", ipLabel: "IP-Adresse", ip: "z.B. 192.168.0.101", portLabel: "Port", port: "z.B. 8080", homefolder: "Heimatverzeichnis", password: "Passwort", passwordPlaceholder: "Wird nicht wieder angezeigt.", username: "Benutzername", usernamePlaceholder: "Tragen Sie hier nichts ein, wenn Sie es nicht konfiguriert haben.", save: "Speichern", saveSettingsButton: "Speichern", clearSettings: "Einstellungen löschen", clearSettingsButton: "Einstellungen löschen", faqHeadline: "FAQ", faqMessage: "Wenn sie die App zum ersten Mal starten, oder die Einstellungen gelöscht habe, tragen Sie die IP-Adresse und den Port ihres VLCs oben ein. Außerdem können Sie einen Start-Ordner und ein Passwort setzen (ab VLC-Version 2.1 benötigt). Bitte beachten Sie, dass der VLC manchmal etwas braucht, bevor er reagiert.", iconsHeadline: "Die Knöpfe erklärt", iconHome: "Bringt Sie zum Player zurück", iconRepeatOnce: "Wiederholt die Datei einmal", iconRepeatAll: "Wiederholt alle Dateien", iconShuffle: "Spielt zufällige Titel aus der Wiedergabeliste", muteMessage: "Der Player kann stumm geschaltet werden, in dem man auf die Lautstärke drückt, bzw. andersherum.", aboutMeHeadline: "Über mich", aboutMeMessage: "Ich bin Student und Fan von Open-Source-Software. Das ist auch der Grund, warum die App kostenlos ist. Eine Anwendung für ein offendes Projekt wie den VLC-Player sollte kostenlos sein. Auf Grund der Regeln des Appstores kann ich kein Spenden-Button nutzen. Konstruktive Kritik ist jedoch willkommen, aber bitte denken Sie daran, dass die App kostenlos ist und die Entwicklung Zeit gekostet hat.", contactHeadline: "Kontakt", checkIpAndPort: "Konnte nicht verbinden. Bitte überprüfen Sie die IP und den Port.", usernameOrPasswordWrong: "Oh, der Nutzername oder das Password sind falsch.", checkSettings: "In den Einstellungen befindet sich ein Fehler.", connectedNoDir: "Verbunden, konnte den Ordner aber nicht finden.", settingsSaved: "Einstellungen gespeichert", settingsSavedRestart: "Einstellungen gespeichert, bitte App neustarten", settingsDeletedRestart: "Einstellungen wurden gelöscht, bitte App neustarten", setSettings: "Bitte geben Sie die Einstellungen an", lostConnection: "Verbindung zum VLC wurde unterbrochen" }; Languages.prototype.getLanguage = function () { var e = navigator.language; var t = navigator.systemLanguage; if (e === "de" | t === "de-DE") { $.extend(plLang, german); this.setLanguage() } }; Languages.prototype.setLanguage = function () { $("#playerHeadline").text(plLang["player"]); $("#titleHeadline").text(plLang["title"]); $("#artistHeadline").text(plLang["artist"]); $("#albumHeadline").text(plLang["album"]); $("#yearHeadline").text(plLang["year"]); $("#ppHeadline").text(plLang["ppHeadline"]); $("#ppMessage").text(plLang["ppMessage"]); $("#clearPlaylist").text(plLang["clearPlaylist"]); $("#pipHeadline").text(plLang["pipHeadline"]); $("#removeItem").text(plLang["removeItem"]); $("#playlistHeadline").text(plLang["playlist"]); $("#libraryHeadline").text(plLang["library"]); $("#playAll").text(plLang["playAll"]); $("#setHome").text(plLang["setHomefolder"]); $("#settingsHeadline").text(plLang["settings"]); $("#spHeadline").text(plLang["spHeadline"]); $("#spMessage").text(plLang["spMessage"]); $("#ipLabel").text(plLang["ipLabel"]); $("#ip").attr("placeholder", plLang["ip"]); $("#portLabel").text(plLang["portLabel"]); $("#port").attr("placeholder", plLang["port"]); $("#homefolderLabel").text(plLang["homefolder"]); $("#passwordLabel").text(plLang["password"]); $("#password").prop("placeholder", plLang["passwordPlaceholder"]); $("#usernameLabel").text(plLang["username"]); $("#username").prop("placeholder", plLang["usernamePlaceholder"]); $("#saveLabel").text(plLang["save"]); $("#saveSettings").prev("span").find("span.ui-btn-text").text(plLang["saveSettingsButton"]); $("#clearSettingsLabel").text(plLang["clearSettings"]); $("#clearSettings").prev("span").find("span.ui-btn-text").text(plLang["clearSettingsButton"]); $("#faqHeadline").text(plLang["faqHeadline"]); if (plLang["faqMessage"] !== null) { $("#faqMessage").text(plLang["faqMessage"]) } $("#iconsHeadline").text(plLang["iconsHeadline"]); $("#iconHome").text(plLang["iconHome"]); $("#iconRepeatOnce").text(plLang["iconRepeatOnce"]); $("#iconRepeatAll").text(plLang["iconRepeatAll"]); $("#iconShuffle").text(plLang["iconShuffle"]); $("#muteMessage").text(plLang["muteMessage"]); $("#aboutMeHeadline").text(plLang["aboutMeHeadline"]); if (plLang["aboutMeMessage"] !== null) { $("#aboutMeMessage").text(plLang["aboutMeMessage"]) } $("#contactHeadline").text(plLang["contactHeadline"]) }; var app = { initialize: function () { this.bindEvents() }, bindEvents: function () { document.addEventListener("deviceready", this.onDeviceReady, false) }, onDeviceReady: function () { app.receivedEvent("deviceready") }, receivedEvent: function (e) { init() } };
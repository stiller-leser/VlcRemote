function Languages(){

};

var english = {
	//Error messages and dynamically content only, because App is basically english

    "playAll" : "play all",
    "setHome": "set marked folder as home",
    "removeItem": "remove item",
    "saveSettingsButton": "save",
    "clearSettingsButton": "clear settings",

	"checkIpAndPort" : "Couldn't connect. Please check IP and Port.",
	"usernameOrPasswordWrong" : "Ups, the username or password must be wrong",
	"checkSettings" : "There is an error in your settings - sorry can't be more specific here.",
	"connectedNoDir" : "Connected, but couldn't find choosen directory",
	"settingsSaved" : "Settings saved",
	"settingsSavedRestart" : "Settings saved, please restart the app.",
	"settingsDeletedRestart" : "Settings deleted, please restart the app.",
	"setSettings" : "Please set settings, but make sure the VLC-Server is running first:<br>Open the VLC, find the settings, activate the HTTP-Webinterface.<br>For VLC < 2.1, find the .hosts-file of the VLC and activate your IP.<br>For VLC >= 2.1, set the lua-password, to a password of your choice.<br>Restart the VLC !!! Now test it in your browser, using localhost:8080 (if you heven't changed the port).",
	"lostConnection" : "Lost connection."
}

var german = {

	//Strings on the player-site

	"player" : "Player",
	"title" : "Titel",
	"artist" : "Künstler",
	"album" : "Album",
	"year" : "Jahr",
	"ppHeadline" : "Verbindet mit VLC",
	"ppMessage" : "Bitte warten",

	//Strings on the playlist-site

	"clearPlaylist" : "Wiedergabeliste löschen",	
	"pipHeadline" : "Wiedergabeliste-Funktionen",
	"removeItem" : "Titel entfernen",
	"playlist": "Wiedergabeliste",

	//Strings on the library-site

	"library" : "Bibliothek",
	"playAll" : "Alle wiedergeben",
	"setHome": "Markierten Ordner als Startpunkt setzen",
	"playAll": "Alle wiedergeben",

	//Strings on the settings-site

	"settings" : "Einstellungen",
	"spHeadline" : "Verbindet mit VLC",
	"spMessage" : "Bitte warten",
	"ipLabel" : "IP-Adresse",
	"ip" : "z.B. 192.168.0.101",
	"portLabel" : "Port",
	"port" : "z.B. 8080",
	"homefolder" : "Heimatverzeichnis",
	"password" : "Passwort",
	"passwordPlaceholder" : "Wird nicht wieder angezeigt.",
	"username" : "Benutzername",
	"usernamePlaceholder" : "Wenn nicht konfiguriert, leer lassen.",
	"save" : "Speichern",
	"saveSettingsButton" : "Speichern",
	"clearSettings" : "Einstellungen löschen",
	"clearSettingsButton" : "Einstellungen löschen",

	//Strings in the faq on the settings-site

	"faqHeadline" : "FAQ",
	"faqMessage": "Wenn Sie die App zum ersten Mal starten, oder die Einstellungen gelöscht haben, tragen Sie die IP-Adresse und den Port ihres VLCs oben ein. Testen Sie zuerst, ob der VLC-Server richtig läuft! Öffnen Sie die Einstellungen des VLCs und aktivieren Sie das HTTP-Interface (unter Erweiterte Einstellungen). Für VLC < 2.1: Lassen Sie nun die gewünschten IPs in der .hosts-Datei zu. Für VLC >= 2.1: Setzen sie das Lua-Passwort. Jetzt muss der VLC neugestartet werden!!! Testen Sie die Einstellungen nun, in dem Sie den Browser öffnen und folgendes eingeben: localhost:8080 (wenn der Port nicht geöffnet wurde). Außerdem können Sie einen Start-Ordner und ein Passwort setzen (ab VLC-Version 2.1 benötigt). Bitte beachten Sie, dass der VLC manchmal etwas braucht, bevor er reagiert.",
	"iconsHeadline" : "Die Knöpfe erklärt",
	"iconHome" : "Bringt Sie zum Player zurück",
	"iconRepeatOnce" : "Wiederholt die Datei einmal",
	"iconRepeatAll" : "Wiederholt alle Dateien",
	"iconShuffle" : "Spielt zufällige Titel aus der Wiedergabeliste",
	"muteMessage": "Der Player kann stumm geschaltet werden, indem man auf die Lautstärkeangabe drückt, bzw. andersherum.",
	"aboutMeHeadline" : "Über mich",
	"aboutMeMessage" : "Ich bin Student und Fan von Open-Source-Software. Das ist auch der Grund, warum die App kostenlos ist. Eine Anwendung für ein offenes Projekt sollte kostenlos sein. Auf Grund der Regeln des Appstores kann ich kein Spenden-Button nutzen. Konstruktive Kritik ist jedoch willkommen, aber bitte denken Sie daran, dass die App kostenlos ist und die Entwicklung Zeit gekostet hat.",
	"contactHeadline" : "Kontakt",

	//Error messages

	"checkIpAndPort" : "Konnte nicht verbinden. Bitte überprüfen Sie die IP und den Port.",
	"usernameOrPasswordWrong" : "Oh, der Nutzername oder das Password sind falsch.",
	"checkSettings" : "In den Einstellungen befindet sich ein Fehler.",
	"connectedNoDir" : "Verbunden, konnte den Ordner aber nicht finden.",
	"settingsSaved" : "Einstellungen gespeichert",
	"settingsSavedRestart" : "Einstellungen gespeichert, bitte App neustarten",
	"settingsDeletedRestart" : "Einstellungen wurden gelöscht, bitte App neustarten",
	"setSettings" : "Bitte geben Sie die Einstellungen an. Testen Sie zuerst, ob der VLC-Server richtig läuft! Öffnen Sie die Einstellungen des VLCs und aktivieren Sie das HTTP-Interface (unter Erweiterte Einstellungen). Für VLC < 2.1: Lassen Sie nun die gewünschten IPs in der .hosts-Datei zu. Für VLC >= 2.1: Setzen sie das Lua-Passwort. Jetzt muss der VLC neugestartet werden!!! Testen Sie die Einstellungen nun, in dem Sie den Browser öffnen und folgendes eingeben: localhost:8080 (wenn der Port nicht geöffnet wurde)",
	"lostConnection" : "Verbindung zum VLC wurde unterbrochen"
};

Languages.prototype.getLanguage = function(){
    var browserLang = navigator.language;
    var systemLang = navigator.systemLanguage;
	if(browserLang === "de" | systemLang === "de-DE"){
		$.extend(plLang, german);
		this.setLanguage();
	} else {
	    $.extend(plLang, english);
	    this.setLanguage();
	}
};

Languages.prototype.setLanguage = function(){

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
	$("#ip").attr("placeholder",plLang["ip"]);
	$("#portLabel").text(plLang["portLabel"]);
	$("#port").attr("placeholder",plLang["port"]);
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
	if(plLang["faqMessage"] !== null){ //If the faq has been translated
		$("#faqMessage").text(plLang["faqMessage"]);
	}
	$("#iconsHeadline").text(plLang["iconsHeadline"]);
	$("#iconHome").text(plLang["iconHome"]);
	$("#iconRepeatOnce").text(plLang["iconRepeatOnce"]);
	$("#iconRepeatAll").text(plLang["iconRepeatAll"]);
	$("#iconShuffle").text(plLang["iconShuffle"]);
	$("#muteMessage").text(plLang["muteMessage"]);
	$("#aboutMeHeadline").text(plLang["aboutMeHeadline"]);
	if(plLang["aboutMeMessage"] !== null){ //If the about me message has been translated
		$("#aboutMeMessage").text(plLang["aboutMeMessage"]);
	}
	$("#contactHeadline").text(plLang["contactHeadline"]);
};
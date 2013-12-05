function Languages(){

};

var english = {
	//Error messages only, because the app was in english initally

	"checkIpAndPort" : "Couldn't connect. Please check IP and Port.",
	"usernameOrPasswordWrong" : "Ups, the username or password must be wrong",
	"checkSettings" : "There is an error in your settings - sorry can't be more specific here.",
	"connectedNoDir" : "Connected, but couldn't find choosen directory",
	"settingsSaved" : "Settings saved",
	"settingsSavedRestart" : "Settings saved, please restart the app.",
	"setSettings" : "Please set settings.",
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
	"playlist" : "Wiedergabeliste",

	//Strings on the library-site

	"library" : "Bibliothek",
	"playAll" : "Alle wiedergeben",
	"setHomefolder" : "Markierten Ordner als Startpunkt setzen",

	//Strings on the settings-site

	"settings" : "Einstellungen",
	"spHeadline" : "Verbindet mit VLC",
	"spMessage" : "Bitte warten",
	"ip" : "IP-Adresse",
	"port" : "Port",
	"homefolder" : "Heimatverzeichnis",
	"password" : "Passwort",
	"passwordPlaceholder" : "Wird nicht wieder angezeigt.",
	"username" : "Benutzername",
	"usernamePlaceholder" : "Tragen Sie hier nichts ein, wenn Sie es nicht konfiguriert haben.",
	"save" : "Speichern",
	"saveSettingsButton" : "Speichern",
	"clearSettings" : "Einstellungen löschen",
	"clearSettingsButton" : "Einstellungen löschen",

	//Strings in the faq on the settings-site

	"faqHeadline" : "FAQ",
	"faqMessage"  : "Wenn sie die App zum ersten Mal starten, oder die Einstellungen gelöscht habe, tragen Sie die IP-Adresse und den Port ihres VLCs oben ein. Außerdem können Sie einen Start-Ordner und ein Passwort setzen (ab VLC-Version 2.1 benötigt). Bitte beachten Sie, dass der VLC manchmal etwas braucht, bevor er reagiert.",
	"iconsHeadline" : "Die Knöpfe erklärt",
	"iconHome" : "Bringt Sie zum Player zurück",
	"iconRepeatOnce" : "Wiederholt die Datei einmal",
	"iconRepeatAll" : "Wiederholt alle Dateien",
	"iconShuffle" : "Spielt zufällige Titel aus der Wiedergabeliste",
	"muteMessage" : "Der Player kann stumm geschaltet werden, in dem man auf die Lautstärke drückt, bzw. andersherum.",
	"aboutMeHeadline" : "Über mich",
	"aboutMeMessage" : "Ich bin Student und Fan von Open-Source-Software. Das ist auch der Grund, warum die App kostenlos ist. Eine Anwendung für ein offendes Projekt wie den VLC-Player sollte kostenlos sein. Auf Grund der Regeln des Appstores kann ich kein Spenden-Button nutzen. Konstruktive Kritik ist jedoch willkommen, aber bitte denken Sie daran, dass die App kostenlos ist und die Entwicklung Zeit gekostet hat.",
	"contactHeadline" : "Kontakt",

	//Error messages

	"checkIpAndPort" : "Konnte nicht verbinden. Bitte überprüfen Sie die IP und den Port.",
	"usernameOrPasswordWrong" : "Oh, der Nutzername oder das Password sind falsch.",
	"checkSettings" : "In den Einstellungen befindet sich ein Fehler.",
	"connectedNoDir" : "Verbunden, konnte den Ordner aber nicht finden.",
	"settingsSaved" : "Einstellungen gespeichert, wird nach Neustart aktiv",
	"settingsSavedRestart" : "Einstellungen gespeichert, bitte App neustarten",
	"setSettings" : "Bitte geben Sie die Einstellungen an",
	"lostConnection" : "Verbindung zum VLC wurde unterbrochen"
};

Languages.prototype.getLanguage = function(){
    var browserLang = navigator.language;
    var systemLang = navigator.systemLanguage;
	if(browserLang === "de" | systemLang === "de-DE"){
		$.extend(plLang, german);
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
	$("#ipLabel").text(plLang["ip"]);
	$("#portLabel").text(plLang["port"]);
	$("#homefolderLabel").text(plLang["homefolder"]);
	$("#passwordLabel").text(plLang["password"]);
		$("#password").prop("placeholder", plLang["passwordPlaceholder"]);
	$("#usernameLabel").text(plLang["username"]);
		$("#username").prop("placeholder", plLang["usernamePlaceholder"]);
	$("#saveLabel").text(plLang["save"]);
		$("#saveSettings").prev("span").find("span.ui-btn-text").text(plLang["saveSettingsButton"]);
	$("#clearSettingsLabel").text(plLang["clearSettings"]);
	$("#clearSettings").prev("span").find("span.ui-btn-text").text(plLang["clearSettingsButton"]);

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
function Languages(){

};

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
	"setHomefolder" : "Markierten Ordner als Start",

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
	"faqMessage"  : "Ein wenig Text",
	"iconsHeadline" : "Die Knöpfe erklärt",
	"iconHome" : "Bringt Sie zum Player zurück",
	"iconRepeatOnce" : "Wiederholt die Datei einmal",
	"iconRepeatAll" : "Wiederholt alle Dateien",
	"iconShuffle" : "Spielt zufällige Titel aus der Wiedergabeliste",
	"muteMessage" : "Der Player kann stumm geschaltet werden, in dem man auf die Lautstärke drückt, bzw. andersherum.",
	"aboutMeHeadline" : "Über mich",
	"aboutMeMessage" : "Mehr Text",
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
	var lang = navigator.language;
	if(lang === "de"){
		lang = $.extend(plLang, german);
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
		$("#saveSettings").prop("value", plLang["saveSettingsButton"]);
	$("#clearSettingsLabel").text(plLang["clearSettings"]);
		$("#clearSettings").prop("value", plLang["clearSettingsButton"]);

	//Strings in the faq on the settings-site

	$("#faqHeadline").text(plLang["faqHeadline"]);
	$("#faqMessage").text(plLang["faqMessage"]);
	$("#iconsHeadline").text(plLang["iconsHeadline"]);
	$("#iconHome").text(plLang["iconHome"]);
	$("#iconRepeatOnce").text(plLang["iconRepeatOnce"]);
	$("#iconRepeatAll").text(plLang["iconRepeatAll"]);
	$("#iconShuffle").text(plLang["iconShuffle"]);
	$("#muteMessage").text(plLang["muteMessage"]);
	$("#aboutMeHeadline").text(plLang["aboutMeHeadline"]);
	$("#aboutMeMessage").text(plLang["aboutMeMessage"]);
	$("contactHeadline").text(plLang["contactHeadline"]);
};
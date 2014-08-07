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
        $("#playlistOptionsPopup").css("display", "none");
        $(".dot-active").removeClass("dot-active");
        $(".playlistDot").addClass("dot-active");
        player.loadPlaylist();
    });

    $("#library").on("pageshow", function (event) {
        $(".dot-active").removeClass("dot-active");
        $(".libraryDot").addClass("dot-active");
        player.loadFiles(plData.lastDir);
    });

    $("#settings").on("pagebeforeshow", function (event) {
        $(".dot-active").removeClass("dot-active");
        $(".settingsDot").addClass("dot-active");
    });
};
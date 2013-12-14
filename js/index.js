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
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
       init();
    }
};

function init(){
    player = new Player;
    updater = new Updater;
    language = new Languages;

    $( document ).bind( "mobileinit", function() {
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

    $("#player").on("pagebeforeshow", function(event){
        $(".dot-active").removeClass("dot-active");
        $(".playerDot").addClass("dot-active");
    });

    $("#playlist").on("pageshow", function(event){
        $("#playlistPopup").css("display","none");
        $(".dot-active").removeClass("dot-active");
        $(".playlistDot").addClass("dot-active");
        player.loadPlaylist();
    });

    $("#library").on("pageshow", function(event){
        $(".dot-active").removeClass("dot-active");
        $(".libraryDot").addClass("dot-active");
        $("#libraryPopup").css("display", "none");
        player.loadFiles(plData.lastDir);
    });

    $("#settings").on("pagebeforeshow", function(event){
        $(".dot-active").removeClass("dot-active");
        $(".settingsDot").addClass("dot-active");
    });
}

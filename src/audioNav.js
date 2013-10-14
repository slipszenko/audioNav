// Create a namespace for the program, if not already created
var szko = szko ? szko : {};

szko.audioNav = (function (external) {
    "use strict";

    // Private vars
    var recognition,
        final_transcript,
        links = {},
        success_sound,


    processCommand = function (command) {
        // Get the first word of the command
        command = command.trim();
        var commandWord = command.split(" ", 1)[0];
        var commandParameters = command.substr(commandWord.length + 1);
        switch(commandWord) {
            case 'navigate':
                if(commandParameters.split(" ", 1)[0] != "to") {
                    if(!!links[commandParameters]) {
                        window.location = links[commandParameters];
                        success_sound.play();
                    }
                } else {
                    commandParameters = commandParameters.substr(3);
                    if(!!links[commandParameters]) {
                        window.location = links[commandParameters];
                        success_sound.play();
                    }
                }
                break;

            case 'next':
            case 'previous':
                if(commandParameters == "slide") {
                    if(commandWord == "next") {
                        external.h5pres.nextSlide();
                        success_sound.play();
                    } else {
                        external.h5pres.prevSlide();
                        success_sound.play();
                    }
                }
                break;
            
            case 'presentation':
                if(commandParameters == "start" || commandParameters == "starts") {
                    external.h5pres.startPresenting();
                    success_sound.play();
                } else if(commandParameters == "stop") {
                    external.h5pres.stopPresenting();
                    success_sound.play();
                }
                break;

            case 'scroll':
                // Will implement next
                console.log("Scroll command issued");
                commandParameters = trim(commandParameters);
                if(commandParameters == "up") {
                    console.log("Go up");
                    success_sound.play();
                } else {
                    console.log("Go down");
                    success_sound.play();
                }
                break;

            default:
                console.log("Unrecognised command issued");
                break;
        }
    },


    lastWord = function(o) {
        return (""+o).replace(/[\s-]+$/,'').split(/[\s-]/).pop();
    },


    init = function () {
        // Build up the collection of links
        var linkElems = document.querySelectorAll("a");
        for(var i = 0; i < linkElems.length; i++) {
            links[linkElems[i].innerHTML.toLowerCase()] = linkElems[i].href;
        }

        // Create the success sound element
        success_sound = document.createElement("audio");
        var source= document.createElement("source");
        if(success_sound.canPlayType("audio/mpeg;")) {
            source.type = "audio/mpeg";
            source.src = "/src/resources/beep.mp3";
        } else {
            source.type = "audio/ogg";
            source.src = "/src/resources/beep.ogg";
        }
        success_sound.appendChild(source);

        // Make speechRecognition and URL available crossbrowser without prefixes
        window.speechRecognition = ( window.speechRecognition || window.webkitSpeechRecognition);

        // Check access to the getUserMedia function
        if(!!window.speechRecognition) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            final_transcript = "";
            recognition.lang = "en-GB";
            recognition.start();

            recognition.onstart = function() { console.log("Speech recognition started."); }
            recognition.onresult = function(event) {
                var interim_transcript = '';
                console.log(event);
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    switch(lastWord(event.results[i][0].transcript)) {
                        case "go":
                            console.log(interim_transcript);
                            processCommand(interim_transcript);
                            final_transcript = "";
                            interim_transcript = "";
                        break;
                        case "cancel":
                            if(!event.results[i].isFinal) {
                                interim_transcript = "";
                                final_transcript = "";
                                success_sound.play();
                            }
                            i = event.results.length + 1; // Break out of the outer loop
                        break;
                        default:
                            if(event.results[i].isFinal) {
                                final_transcript = event.results[i][0].transcript;
                                processCommand(event.results[i][0].transcript);
                            } else {
                                interim_transcript += event.results[i][0].transcript;
                            }
                        break;
                    }
                }

                var final_span = document.querySelector("#final_span");
                var interim_span = document.querySelector("#interim_span");

                final_span.innerHTML = final_transcript;
                interim_span.innerHTML = interim_transcript;
            }
            recognition.onerror = function(event) { console.log("Error", event); }
            recognition.onend = function() { console.log("Speech recognition ended"); }
        } else {
            console.error("Speech recognition is not available on this device.");
        }
    };


    // Return exposes some private functions as public
    return {
        init : init.bind(szko.audioNav),
        processCommand : processCommand.bind(szko.audioNav)
    };

}(szko.h5pres ? { h5pres : szko.h5pres } : {}));
window.addEventListener('load', szko.audioNav.init, false);
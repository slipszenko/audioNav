// Create a namespace for the program, if not already created
var szko = szko ? szko : {};

szko.audioNav = (function (external) {
    "use strict";

    // Private vars
    var recognition,
        final_transcript,
        links = {},


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
                    }
                } else {
                    commandParameters = commandParameters.substr(3);
                    if(!!links[commandParameters]) {
                        window.location = links[commandParameters];
                    }
                }
                break;

            case 'next':
            case 'previous':
                if(commandParameters == "slide") {
                    if(commandWord == "next") {
                        external.h5pres.nextSlide();
                    } else {
                        external.h5pres.prevSlide();
                    }
                }
                break;
            
            case 'presentation':
                if(commandParameters == "start") {
                    external.h5pres.startPresenting();
                } else if(commandParameters == "stop") {
                    external.h5pres.stopPresenting();
                }
                break;

            case 'scroll':
                // Will implement next
                console.log("Scroll command issued");
                commandParameters = trim(commandParameters);
                if(commandParameters == "up") {
                    console.log("Go up");
                } else {
                    console.log("Go down");
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

                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    switch(lastWord(event.results[i][0].transcript)) {
                        case "go":
                            processCommand(interim_transcript);
                        break;
                        case "cancel":
                            interim_transcript = "";
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
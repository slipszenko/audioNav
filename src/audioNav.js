var links = {};
$(document).ready(function() {
    $('a').each(function() {
        links[$(this).html().toLowerCase()] = $(this);
    });
});


var recognition, final_transcript;
function init() {
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
                if (event.results[i].isFinal) {
                    final_transcript = event.results[i][0].transcript;
                    processCommand(event.results[i][0].transcript);
                } else {
                    // TODO: Check for a cancel
                    interim_transcript += event.results[i][0].transcript;
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
}
window.addEventListener("load", init, false);

function processCommand(command) {
    // Get the first word of the command
    command = command.trim();
    console.log("Command: \"" + command + "\"");
    var commandWord = command.split(" ", 1)[0];
    console.log("Command word: \"" + commandWord + "\"");
    var commandParameters = command.substr(commandWord.length + 1);
    console.log("Command parameters: \"" + commandParameters + "\"");
    switch(commandWord) {
        case 'navigate':
            if(commandParameters.split(" ", 1)[0] != "to") {
                if(!!links[commandParameters]) {
                    window.location = links[commandParameters].attr('href');
                }
            } else {
                commandParameters = commandParameters.substr(3);
                if(!!links[commandParameters]) {
                    window.location = links[commandParameters].attr('href');
                }
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
    }
}
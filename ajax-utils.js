(function (global) {
    // namespace
    var ajaxUtils = {};

    // make an Ajax GET request to "requestUrl"
    // responseHandler will be called after GET request is completed
    ajaxUtils.sendGetRequest = 
        function(requestURL, responseHandler, isJsonResponse) {
            // test if browser support Ajax
            if (!window.XMLHttpRequest) {
                global.alert("Ajax is not supported");
                return null;
            }

            // defaults
            if (isJsonResponse == undefined)
                isJsonResponse = true;

            // create a new request
            var request = new XMLHttpRequest();

            // called every time there's a change in communication, including the completion (4)
            request.onreadystatechange = function() {handleRespose(request, responseHandler, isJsonResponse);};

            // make an open command, with the GET request
            request.open("GET", requestURL, true); // true is for async, false is for sync

            // execute the request, and send it the server
            request.send(null); 
        };
    
    // only calls user provided 'responseHandler'
    // will execute if response if ready (4) and not error (200)
    function handleRespose(request, responseHandler, isJsonResponse) {
        if (request.readyState == 4 && request.status == 200) {
            if  (isJsonResponse) 
                responseHandler(JSON.parse(request.responseText));
            else
                responseHandler(request.responseText);
        }
    }

    global.$ajaxUtils = ajaxUtils;

}) (window);
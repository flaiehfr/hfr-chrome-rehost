var clickedImage = null;

document.addEventListener("contextmenu", function (event) {
    clickedImage = event.target;
}, true);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request == "fetchImage") {
        fetchImage(clickedImage.src, function (dataURL) {
            sendResponse(dataURL);
        });
    } else if (request.startsWith("storeClip!!!")) {
        navigator.clipboard.writeText(request.split("!!!")[1]);
    }
    return true;
});


function fetchImage(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var fr = new FileReader();

        fr.onload = function () {
            callback(this.result);
        };

        fr.readAsDataURL(xhr.response);
    };

    xhr.send();
}
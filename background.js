chrome.contextMenus.create({
    "title": "Send to Rehost",
    "id": "rehost",
    "contexts": ["image"]
});

const items = {
    picURL: "URL de l'image",
    picBB: "BBCode de l'image",
    resizedURL: "URL de l'image redimensionnée",
    resizedBB: "BBCode de l'image redimensionnée",
    resizedBBLink: "BBCode de l'image redimensionnée avec lien",
    thumbURL: "URL de l'image miniature",
    thumbBB: "BBCode de l'image miniature",
    thumbBBLink: "BBCode de l'image miniature avec lien"
};

for (const [key, value] of Object.entries(items)) {
    chrome.contextMenus.create({
        "title": value,
        "id": "rehost:" + key,
        parentId: "rehost",
        "contexts": ["image"]
    });
}

chrome.contextMenus.onClicked.addListener(function (e, f) {
    if (!e.menuItemId.startsWith("rehost") && e.mediaType !== "image")
        return;

    const url = "https://rehost.diberie.com/Upload?url=" + encodeURI(e.srcUrl);

    chrome.tabs.sendMessage(f.id, "fetchImage", { frameId: e.frameId }, data => {
        srcToFile(data, 'foo.png', 'image/png').then(file => {
            var formData = new FormData();
            formData.append('_' + Math.random().toString(36).substr(2, 9) + ".png", file);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "https://rehost.diberie.com/Host/UploadFiles?PrivateMode=false&SendMail=false&Comment=", true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const jsonResponse = JSON.parse(xhr.responseText);
                    const selected = e.menuItemId.split(":")[1];
                    chrome.tabs.sendMessage(f.id, "storeClip!!!" + jsonResponse[selected], { frameId: e.frameId });
                }
            }
            xhr.send(formData);
        });
    });
});

function srcToFile(src, fileName, mimeType) {
    return (fetch(src)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], fileName, { type: mimeType }); })
    );
}
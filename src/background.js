importScripts("config.js")
console.log("background loaded 1");
let listen_one_time = true;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url && tab.url.startsWith("https://myanimelist.net/?code=")&& listen_one_time) {
    listen_one_time =false;
    const urlObj = new URL(tab.url);
    const code = urlObj.searchParams.get("code");
    console.log(code);

    chrome.storage.local
      .get("code_verifier", function (result) {
        console.log("verifier:", result.code_verifier)
        const Code_Verifier = result.code_verifier;
        fetch("https://myanimelist.net/v1/oauth2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: "https://myanimelist.net",
            code_verifier: Code_Verifier,
          }),
        })  .then((res) => res.json())
      .then((data) => console.log(data));
      });
    
  }
});

importScripts("config.js");
console.log("background loaded 1");
let listen_one_time = true;


function refreshAccessToken() {
  chrome.storage.local.get("refresh_token", function (result) {
    if (!result.refresh_token) return;

    fetch("https://myanimelist.net/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: result.refresh_token,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          chrome.storage.local.set({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          console.log("refreshed tokenn");
        }
      });
  });
}

function fetchWithAuth(url, options, sendResponse) {
  chrome.storage.local.get("access_token", function (result) {
    const token = result.access_token;
    options.headers = {
      ...options.headers,
      Authorization: "Bearer " + token,
    };

    fetch(url, options)
      .then((res) => {
        if (res.status === 401) {

          refreshAccessToken();
          setTimeout(() => fetchWithAuth(url, options, sendResponse), 1000);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) sendResponse({ anime: data });
      });
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    tab.url &&
    tab.url.startsWith("https://myanimelist.net/?code=") &&
    listen_one_time
  ) {
    listen_one_time = false;
    const urlObj = new URL(tab.url);
    const code = urlObj.searchParams.get("code");

    chrome.storage.local.get("code_verifier", function (result) {
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
          redirect_uri: "https://myanimelist.net/",
          code_verifier: result.code_verifier,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          chrome.storage.local.set({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          console.log("connecté !");
        });
    });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "searchAnime") {
    console.log(message.animeName, "episode:", message.episode);

    chrome.storage.local.get("access_token", function (result) {
      const token = result.access_token;


      fetch(
        "https://api.myanimelist.net/v2/anime?q=" +
          message.animeName +
          "&limit=1",
        { headers: { Authorization: "Bearer " + token } },
      )
        .then((res) => res.json())
        .then((data) => {
          const animeId = data.data[0].node.id;

          fetchWithAuth(
            "https://api.myanimelist.net/v2/anime/" +
              animeId +
              "/my_list_status",
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                status: message.status,
                num_watched_episodes: message.episode,
              }),
            },
            sendResponse,
          );
        });
    });
    return true;
  }
});
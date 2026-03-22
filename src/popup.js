document.getElementById("login-btn").addEventListener("click", function () {
  console.log("bouton cliqué !");
  const verifier = generateCodeVerifier();
  chrome.storage.local.set({code_verifier : verifier}, function(){
  chrome.tabs.create({ url: buildAuthUrl(verifier) });
  });
});

function generateCodeVerifier() {
  const array = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(array, (byte) =>
    ("0" + (byte & 0xff).toString(16)).slice(-2),
  ).join("");
}

/*async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const SHA = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(SHA));
  const hashText = String.fromCharCode(...hashArray);
  const convert = btoa(hashText)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return convert;
}*/

function buildAuthUrl(verifier) {
  const url =
    "https://myanimelist.net/v1/oauth2/authorize?response_type=code" +
    "&client_id=" +
    CLIENT_ID +
    "&redirect_uri=https://myanimelist.net/" +
    "&code_challenge=" +
    verifier +
    "&code_challenge_method=plain";
  return url;
}

document.getElementById("login-btn").addEventListener("click", function () {
  console.log("bouton cliqué !");
  const verifier = generateCodeVerifier();
  generateCodeChallenge(verifier).then((challenge) => {
    chrome.storage.local.set({
      code_verifier: verifier,
    });
    chrome.tabs.create({ url: buildAuthUrl(challenge) });
  });
});

function generateCodeVerifier() {
  const rdm_values = String.fromCharCode(
    ...crypto.getRandomValues(new Uint8Array(64)),
  );
  const convert = btoa(rdm_values)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return convert;
}

async function generateCodeChallenge(verifier) {
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
}

function buildAuthUrl(challenge) {
  const url =
    "https://myanimelist.net/v1/oauth2/authorize?response_type=code" +
    "&client_id=" +
    CLIENT_ID +
    "&redirect_uri=https://myanimelist.net" +
    "&code_challenge=" +
    challenge +
    "&code_challenge_method=S256";
  return url;
}

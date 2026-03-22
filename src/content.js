console.log("content.js loaded");

const observer = new MutationObserver(function (mutations) {
  const title = document.getElementById("titreOeuvre");

  if (title) {
    const title_alone = title.innerHTML;
    console.log("titre:", title_alone);
document.getElementById("nextEpisode").addEventListener("click", function() {

  setTimeout(function() {
    const episode = document.getElementById("selectEpisodes").value
    sendAnimeToMAL(episode)
  }, 500)
})
    function sendAnimeToMAL(episodeValue) {
  const select = document.getElementById("selectEpisodes")
  const lastEpisode = select.options[select.options.length - 1].value
  const episode_n = episodeValue.replace(/^\D+/g, "")
  const lastEpisode_n = lastEpisode.replace(/^\D+/g, "")
  
  const status = episode_n === lastEpisode_n ? "completed" : "watching"
  console.log("envoi épisode:", episode_n, "statut:", status)

  chrome.runtime.sendMessage({
    action: "searchAnime",
    animeName: title_alone,
    episode: episode_n,
    status: status,
  }, function(response) {
    console.log(response.anime)
  })
}


    const episodeInitial = document.getElementById("selectEpisodes").value;
    sendAnimeToMAL(episodeInitial);

    document.getElementById("selectEpisodes").addEventListener("change", function () {
      sendAnimeToMAL(this.value);
    });

    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
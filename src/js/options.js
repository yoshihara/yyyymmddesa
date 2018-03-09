import $ from "jquery";

$(function() {
  var defaultConfig = { token: "" };
  chrome.storage.local.get(defaultConfig, function(config) {
    $(".options__token").val(config.token);
  });

  $(".options__save").on("click", function(e) {
    const token = $(".options__token").val();
    chrome.storage.local.set({ token: token }, function() {
      $(".msg").text("saved!");
    });
  });

  $(".options__clear").on("click", function(e) {
    chrome.storage.local.get(null, function(cache) {
      let removedKeys = [];
      removedKeys = Object.keys(cache).filter(key => {
        if (key.startsWith("cache-")) return key;
        return null;
      });

      chrome.storage.local.remove(removedKeys, function(error) {
        let message = "";
        if (error) message = "Failed removing cache...";
        else message = "Removed cache!";
        $(".msg").text(message);
      });
    });
  });
});

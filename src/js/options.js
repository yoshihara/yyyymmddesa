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
    chrome.storage.local.remove("cache", function() {
      $(".msg").text("Removed cache!");
    });
  });
});

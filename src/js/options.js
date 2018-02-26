import $ from 'jquery';

$(function() {
    var defaultMessage = {message: "オプションページを初めて開きました"};
    chrome.storage.local.get(defaultMessage, function(message) {
        $(".msg").text(message.message);

        chrome.storage.local.set({message: "もうオプションページ開いたことあるよ"}, function(message) {})
    });
});

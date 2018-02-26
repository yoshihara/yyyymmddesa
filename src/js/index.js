import $ from 'jquery';

var defaultMessage = {message: "オプションページを初めて開きました"};
chrome.storage.local.get(defaultMessage, function(message) {
   $(".msg").text(message.message);
});

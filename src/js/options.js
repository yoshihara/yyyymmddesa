import $ from 'jquery';

import style from '../sass/options.sass';

class DebugMode {
  constructor(flag) {
    this.isDebug = flag;
    this.display();
  }

  toggle() {
    this.isDebug = !this.isDebug;
    chrome.storage.local.set({ isDebug: this.isDebug }, () => {
      this.display();
    });
  }

  text() {
    const toggleText = this.isDebug ? 'on' : 'off';
    return `Debug mode: ${toggleText}`;
  }

  display() {
    $('.options__is-debug').text(this.text());
  }
}

$(function() {
  let debugMode;
  var defaultInitData = { token: '', isDebug: false };
  chrome.storage.local.get(defaultInitData, function(initData) {
    $('.options__token').val(initData.token);

    debugMode = new DebugMode(initData.isDebug);
    $('.options__is-debug').text(debugMode.text());
  });

  $('.options__save').on('click', function(e) {
    const token = $('.options__token').val();
    chrome.storage.local.set({ token: token }, function() {
      $('.msg').text('saved!');
    });
  });

  $('.options__clear').on('click', function(e) {
    chrome.storage.local.get(null, function(cache) {
      let clearedKeys = [];
      clearedKeys = Object.keys(cache).filter((key) => {
        if (key.startsWith('cache-')) return key;
        return null;
      });

      chrome.storage.local.remove(clearedKeys, function(error) {
        let message = '';
        if (error) message = 'Failed removing cache...';
        else message = 'Cleared cache!';
        $('.msg').text(message);
      });
    });
  });

  $('.options__is-debug').on('click', function(e) {
    debugMode.toggle();
  });
});

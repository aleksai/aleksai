/* jshint browser: true */

(function () {

// We'll copy the properties below into the mirror div.
// Note that some browsers, such as Firefox, do not concatenate properties
// into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
// so we have to list every single property explicitly.
var properties = [
  'direction',  // RTL support
  'boxSizing',
  'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY',  // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',  // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing',

  'tabSize',
  'MozTabSize'

];

var isBrowser = (typeof window !== 'undefined');
var isFirefox = (isBrowser && window.mozInnerScreenX != null);

function getCaretCoordinates(element, position, options) {
  if (!isBrowser) {
    throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
  }

  var debug = options && options.debug || false;
  if (debug) {
    var el = document.querySelector('#input-textarea-caret-position-mirror-div');
    if (el) el.parentNode.removeChild(el);
  }

  // The mirror div will replicate the textarea's style
  var div = document.createElement('div');
  div.id = 'input-textarea-caret-position-mirror-div';
  document.body.appendChild(div);

  var style = div.style;
  var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9
  var isInput = element.nodeName === 'INPUT';

  // Default textarea styles
  style.whiteSpace = 'pre-wrap';
  if (!isInput)
    style.wordWrap = 'break-word';  // only for textarea-s

  // Position off-screen
  style.position = 'absolute';  // required to return coordinates properly
  if (!debug)
    style.visibility = 'hidden';  // not 'display: none' because we want rendering

  // Transfer the element's properties to the div
  properties.forEach(function (prop) {
    if (isInput && prop === 'lineHeight') {
      // Special case for <input>s because text is rendered centered and line height may be != height
      if (computed.boxSizing === "border-box") {
        var height = parseInt(computed.height);
        var outerHeight =
          parseInt(computed.paddingTop) +
          parseInt(computed.paddingBottom) +
          parseInt(computed.borderTopWidth) +
          parseInt(computed.borderBottomWidth);
        var targetHeight = outerHeight + parseInt(computed.lineHeight);
        if (height > targetHeight) {
          style.lineHeight = height - outerHeight + "px";
        } else if (height === targetHeight) {
          style.lineHeight = computed.lineHeight;
        } else {
          style.lineHeight = 0;
        }
      } else {
        style.lineHeight = computed.height;
      }
    } else {
      style[prop] = computed[prop];
    }
  });

  if (isFirefox) {
    // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
    if (element.scrollHeight > parseInt(computed.height))
      style.overflowY = 'scroll';
  } else {
    style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
  }

  div.textContent = element.value.substring(0, position);
  // The second special handling for input type="text" vs textarea:
  // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  if (isInput)
    div.textContent = div.textContent.replace(/\s/g, '\u00a0');

  var span = document.createElement('span');
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // For inputs, just '.' would be enough, but no need to bother.
  span.textContent = element.value.substring(position) || '.';  // || because a completely empty faux span doesn't render at all
  div.appendChild(span);

  var coordinates = {
    top: span.offsetTop + parseInt(computed['borderTopWidth']),
    left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
    height: parseInt(computed['lineHeight'])
  };

  if (debug) {
    span.style.backgroundColor = '#aaa';
  } else {
    document.body.removeChild(div);
  }

  return coordinates;
}

if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
  module.exports = getCaretCoordinates;
} else if(isBrowser) {
  window.getCaretCoordinates = getCaretCoordinates;
}

}());

var _chatdata = {}

function addMessage(message, type) {
  if(!_chatdata.history) _chatdata.history = [];

  document.getElementById("chat").innerHTML += '<div class="message last ' + type + '"><h2>' + message + '</h2></div>';

  if (type === "mine" || type === "user") {
    _chatdata.history.push({ id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), text: message, type: type });

    localStorage.setItem("chat_history", JSON.stringify(_chatdata.history));
  }

  scrollToLastMessage();
}

function sendMessage(message) {
  if(_chatdata.blocked || !message || !message.length) return;

  addMessage(message, "user");

  document.querySelector("#message").blur();

  triggerHistory();
  sendMessages();
}

function triggerHistory() {
  if(_chatdata.history.length === 1 || _chatdata.history.length === 3 || _chatdata.history.length === 5) {
    _chatdata.blocked = true;

    setTimeout(function() {
      switch(_chatdata.history.length) {
        case 1:
          addMessage(locale.message_bot_1, "mine");
        break
        case 3:
          addMessage(locale.message_bot_2, "mine");
        break
        case 5:
          addMessage(locale.message_bot_3, "mine");
        break
      }

      _chatdata.blocked = false;
    }, 1000);
  }
}

function scrollToLastMessage() {
  var last = document.querySelectorAll("main .message.last");
  last = last[last.length - 1];
  if(!last) return;

  var y = last.offsetTop + last.getBoundingClientRect().height - (window.innerHeight - bar.getBoundingClientRect().height) + (window.innerWidth > 800 ? 40 : 130);

  window.scrollTo({
    top: y,
    behavior: 'smooth'
  });
}

function showMessage(message, delay) {
  setTimeout(function(){
      message.classList.remove("transparent");
      message.classList.add("last");
      if(message.classList.contains("code_carret")) {
        message.classList.remove("code_carret");
        setTimeout(function(){
          message.classList.add("code_carret");
        }, 100);
      }

      setTimeout(scrollToLastMessage, 100);
  }, delay);
}

function showMessages() {
  var chat = document.getElementById("chat");
  var message = document.querySelector("#message");
  var carret = document.querySelector("#carret");
  var messages = chat.querySelectorAll(".message");

  if(_chatdata.history && _chatdata.history.length) {
    for (var i = 0; i < messages.length; i++) {
      showMessage(messages[i], 0);
    }

    showMessage(carret, 0);
    showMessage(message, 0);

    setTimeout(function() {
      for (var i = 0; i < _chatdata.history.length; i++) {
        chat.innerHTML += '<div class="message last ' + _chatdata.history[i].type + '"><h2>' + _chatdata.history[i].text + '</h2></div>';
      }

      sendMessages();
    }, 100);

    scrollToLastMessage();

    triggerHistory();

    return;
  }

  var delay = 200;

  for (var i = 0; i < messages.length; i++) {
    showMessage(messages[i], delay);

    switch(i) {
      case 0:
        delay += 300;
      break
      case 1:
        delay += 2000;
      break
      case 2:
        delay += 5000;
      break
      case 3:
        showMessage(carret, delay);
        showMessage(message, delay);
      break
    }
  }
}

function sendMessages() {
  if(!_chatdata.history || !_chatdata.history.length) return;

  var sentMessages = localStorage.getItem("chat_sent");
  sentMessages = sentMessages ? sentMessages.split(",") : [];

  var toSend = [];

  for (var i = 0; i < _chatdata.history.length; i++) {
    var message = _chatdata.history[i];

    if(message.id && message.type === "user" && !sentMessages.includes(message.id)) toSend.push(message);
  }

  if(!toSend || !toSend.length) return;

  XHR("/save-messages", _chatdata.id, function(data) {
    sentMessages.push(data);
    localStorage.setItem("chat_sent", sentMessages.join(","));
  }, function(error) {
    addMessage("Cannot send messages", "error");
  }, "POST", { messages: toSend });
}

function getHistory(cb) {
  _chatdata.id = localStorage.getItem("chat_id");
  if(!_chatdata.id) {
    _chatdata.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    localStorage.setItem("chat_id", _chatdata.id);
  }

  _chatdata.history = JSON.parse(localStorage.getItem("chat_history"));

  cb();
}

function init() {
	var message = document.querySelector("#message");
	var carret = document.querySelector("#carret");

  if(window.innerWidth > 800) {
  	message.addEventListener("blur", function() {
  		message.focus();
  	});
  }

	message.addEventListener("input", function() {
		var max = parseInt(message.getBoundingClientRect().width / 18.5, 10) * 3 - 10;
		message.value = message.value.replace("\n","").substr(0, Math.min(message.value.length, max));

		var coords = getCaretCoordinates(message, message.selectionEnd);

		carret.style.top = 15 + coords.top + 'px';
		carret.style.left = 33 + coords.left + 'px';
	});

	message.addEventListener("keyup", function(e) {
		if (e.key === 'Enter' || e.keyCode === 13) {
			sendMessage(message.value);

			message.value = "";

			carret.style.top = 15 + 'px';
			carret.style.left = 33 + 'px';

			e.preventDefault();
		}
	});

  message.focus();

  getHistory(function(){
    showMessages();
  });
}

addEventListener("load", init);
var _workSurround = function(front, highlighted, back, caretStart, surround) {
  var prevWordIndex =
    Math.max(front.lastIndexOf(' '), front.lastIndexOf('\n')) + 1;
  var nextWordIndex = Math.min.apply(
    Math,
    [back.indexOf(' '), back.indexOf('\n'), back.length].filter(function(x) {
      return x !== -1;
    })
  );
  nextWordIndex = nextWordIndex === -1 ? 0 : nextWordIndex;
  var prevWord = front.substring(prevWordIndex);
  var nextWord = back.substring(0, nextWordIndex);
  if (
    prevWord.substring(0, surround.length) === surround &&
    nextWord.substring(nextWord.length - surround.length) === surround
  ) {
    front =
      front.substring(0, prevWordIndex) +
      front.substring(prevWordIndex + surround.length);
    back =
      back.substring(0, nextWordIndex - surround.length) +
      back.substring(nextWordIndex);
    return {
      value: front + highlighted + back,
      selectionStart: caretStart - surround.length,
      selectionEnd: caretStart - surround.length + highlighted.length
    };
  } else {
    front = front.substring(0, prevWordIndex) + surround + prevWord;
    back =
      back.substring(0, nextWordIndex) +
      surround +
      back.substring(nextWordIndex);
    return {
      value: front + highlighted + back,
      selectionStart: caretStart + surround.length,
      selectionEnd: caretStart + surround.length + highlighted.length
    };
  }
};

var _workNewLineChars = function(
  front,
  highlighted,
  back,
  caretStart,
  newLineChars,
  prefix
) {
  var prefixChars = prefix(front);
  return {
    value: front + prefixChars + newLineChars + highlighted + back,
    selectionStart: caretStart + prefixChars.length + newLineChars.length,
    selectionEnd:
      caretStart + prefixChars.length + newLineChars.length + highlighted.length
  };
};

var _workStartLineChars = function(
  front,
  highlighted,
  back,
  caretStart,
  startLineChars,
  removeFirstX
) {
  var currentLine = front.substring(front.lastIndexOf('\n') + 1);
  if (currentLine.substring(0, startLineChars.length) === startLineChars) {
    front =
      front.substring(0, front.lastIndexOf('\n') + 1) +
      front.substring(front.lastIndexOf('\n') + 1 + startLineChars.length);
    return {
      value: front + highlighted + back,
      selectionStart: caretStart - startLineChars.length,
      selectionEnd: caretStart - startLineChars.length + highlighted.length
    };
  } else {
    var removeFirstXLength = removeFirstX(
      front.substring(front.lastIndexOf('\n') + 1)
    );
    front =
      front.substring(0, front.lastIndexOf('\n') + 1) +
      startLineChars +
      front.substring(front.lastIndexOf('\n') + 1 + removeFirstXLength);
    var offset = startLineChars.length - removeFirstXLength;
    return {
      value: front + highlighted + back,
      selectionStart: caretStart + offset,
      selectionEnd: caretStart + offset + highlighted.length
    };
  }
};

var _workInsert = function(front, highlighted, back, caretStart, obj) {
  var text = typeof obj === 'function' ? obj(highlighted) : obj;

  return {
    value: front + text + back,
    selectionStart: caretStart + (typeof obj === 'string' ? text.length : 0),
    selectionEnd: caretStart + text.length
  };
};

var _work = function(textarea, obj) {
  var caretStart = textarea.selectionStart;
  var caretEnd = textarea.selectionEnd;
  var front = textarea.value.substring(0, caretStart);
  var highlighted = textarea.value.substring(caretStart, caretEnd);
  var back = textarea.value.substring(caretEnd, textarea.value.length);

  if (obj.surround) {
    return _workSurround(front, highlighted, back, caretStart, obj.surround);
  }
  if (obj.newLineChars) {
    return _workNewLineChars(
      front,
      highlighted,
      back,
      caretStart,
      obj.newLineChars,
      obj.prefix
    );
  }
  if (obj.startLineChars) {
    return _workStartLineChars(
      front,
      highlighted,
      back,
      caretStart,
      obj.startLineChars,
      obj.removeFirstX
    );
  }
  return _workInsert(front, highlighted, back, caretStart, obj);
};

var insertAtTheCaret = function(textarea, obj) {
  var r = _work(textarea, obj);
  textarea.value = r.value;
  textarea.selectionStart = r.selectionStart;
  textarea.selectionEnd = r.selectionEnd;
  textarea.focus();
};

module.exports = {
  insertAtTheCaret: insertAtTheCaret,
  _work: _work
};

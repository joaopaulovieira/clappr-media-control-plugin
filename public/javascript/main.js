/* eslint-disable */

var urlParams;
(function() {
  window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
      urlParams[decode(match[1])] = decode(match[2]);
  }
  window.onpopstate();
})();

/*
  Parser
*/
var Parser = function(output) {
    this.output = output
    this.console = $('#console')
    this.context = document
}

Parser.prototype = {
    parse: function(code) {
        try {
            var old = player
            old.destroy()
            document.getElementById('player-wrapper').firstChild && document.getElementById('player-wrapper').removeChild(document.getElementById('player-wrapper').firstChild)
            eval(code)
            window.player = player
            this.console.empty()
        } catch (err) {
            this.console.html(err.message)
        }
    }
}

$(document).ready(function() {
    var parser = new Parser($('#output'))
    $('.run').click(function() {
        var code = ace.edit('editor').getSession().getValue()
        parser.parse(code)
    })
})

/*
  Editor
*/
window.onload = function() {
    var editor = ace.edit('editor')
    var session = editor.getSession()

    editor.setTheme('ace/theme/katzenmilch')
    editor.$blockScrolling = Infinity
    session.setMode('ace/mode/javascript')
    session.setTabSize(2)
    session.setUseSoftTabs(true)
    editor.commands.addCommand({
        name: 'run',
        bindKey: {
            mac: 'Command-Enter'
        },
        exec: function(editor) {
            document.querySelector('.run').click()
        },
    })
}

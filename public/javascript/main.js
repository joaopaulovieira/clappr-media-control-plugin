/* eslint-disable */

var urlParams;
(function() {
  window.onpopstate = function() {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) { return decodeURIComponent(s.replace(pl, " ")); },
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
    this.console = document.getElementById('console')
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
            while(this.console.firstChild) this.console.removeChild(this.console.firstChild)
        } catch (err) {
            this.console.innerText = err.message
        }
    }
}

var docReadyCallback = function() {
    var parser = new Parser(document.getElementById('output'))
    document.querySelector('.run').addEventListener('click', function() {
        var code = ace.edit('editor').getSession().getValue()
        parser.parse(code)
   })
}

function docReady() {
    if (document.readyState === "complete" || document.readyState === "interactive")
        setTimeout(docReadyCallback, 1)
    else
        document.addEventListener("DOMContentLoaded", docReadyCallback)
} 

/*
  Editor
*/
window.onload = function() {
    docReady()
    var editor = ace.edit('editor')
    var session = editor.getSession()

    editor.setTheme('ace/theme/ambiance')
    editor.$blockScrolling = Infinity
    session.setMode('ace/mode/javascript')
    session.setTabSize(2)
    session.setUseSoftTabs(true)
    editor.commands.addCommand({
        name: 'run',
        bindKey: {
            mac: 'Command-Enter'
        },
        exec: function() {
            debugger
            document.querySelector('.run').click()
        },
    })
}

require([], function(){
	console.log('ready bitches');
	CodeMirror.fromTextArea($('#code')[0], {matchBrackets: true, lineNumbers: true, styleActiveLine: true, mode: {name: "javascript", json: true}});
	CodeMirror.fromTextArea($('#code-request')[0], {matchBrackets: true, lineNumbers: true, styleActiveLine: true, mode: {name: "javascript", json: true}});
});
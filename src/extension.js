// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const math = require('mathjs');
const instExp = require('./insert_expression');
const evalExp = require('./evaluate_expression');

let settings = {'scoreboard1': 'obj1', 'scoreboard2': 'obj2', 'exponent_limit': 10};

exports.activate = function(context) {
	let disposable = [];
	disposable.push(vscode.workspace.onDidChangeConfiguration(event => {
		settings.scoreboard1 = vscode.workspace.getConfiguration().get('mc-math.default_scoreboard_1');
		settings.scoreboard2 = vscode.workspace.getConfiguration().get('mc-math.default_scoreboard_2');
		settings.exponent_limit = vscode.workspace.getConfiguration().get('mc-math.exponent_limit');
	}));

	disposable.push(vscode.commands.registerTextEditorCommand('extension.mc-math.insert', async (textEditor, edit, args) => {
		let expression;
		let scoreboard;
		await vscode.window.showInputBox({
			prompt: 'Math expression (first value will be use as selector)', 
			placeHolder: 'E.g. @s + 5 - 3'
		}).then(value => {
			expression = value;
		});
		await vscode.window.showInputBox({
			prompt: 'Scoreboard objective, Use comma (,) to separate scoreboard or leave empty to use default scoreboard',
			placeHolder: 'bb.foo or bb.foo, bb.bar'
		}).then(value => {
			scoreboard = value;
		});

		instExp.mathExpression(expression, scoreboard, settings, (result, error) => {
			if (error) {
				vscode.window.showErrorMessage(error.message);
			}
			if (result) {
				textEditor.edit(editBuilder => {
					for (let selection of textEditor.selections) {
						editBuilder.insert(selection.active, result.join('\n'));
					}
				});
			}
		});
	}));

	disposable.push(vscode.commands.registerTextEditorCommand('extension.mc-math.eval', async (textEditor, edit) => {
		let is_selection = false;
		for (let selection of textEditor.selections) {
			if (selection.start.compareTo(selection.end) < 0) {
				is_selection = true
			}
		}
		if (is_selection) {
			let replaceWith = [];
			for (let selection of textEditor.selections) {
				if (selection.start.compareTo(selection.end) < 0) {
					let textRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
					let expression = textEditor.document.getText(textRange);
					
					await evalExp.eval(expression, (result, error) => {
						if (error) vscode.window.showErrorMessage(error.message);
						if (evalExp.isNumeric(result)) {
							replaceWith.push({range: textRange, text: [result.toString()]});
						}
						else if (result.entries === null || result.entries === undefined) {
							replaceWith.push({range: textRange, text: [result.toString()]});
						}
						else if (typeof result === 'object') {
							let data = result.toJSON();
							let format = [];
							for (let i of data.entries) {
								format.push(i.toString());
							}
							replaceWith.push({range: textRange, text: format});
						}
					});
				}
			}
				textEditor.edit(editBuilder => {			
					for (let i = 0; i < replaceWith.length; i++) {
						let ref = replaceWith[i];
						editBuilder.replace(ref.range, ref.text.join('\n'));
					}
			});
		}
		else {
			let expression = '';
			await vscode.window.showInputBox({
				prompt: 'Math expression to evaluate',
				placeHolder: '2 + 2 - 1 -> that\'s 3 quick maff!'
			}).then(value => {
				expression = value;
			});
			evalExp.eval(expression, (result, error) => {;
				if (error) vscode.window.showErrorMessage(error.message);
				textEditor.edit(editBuilder => {
					for (let selection of textEditor.selections) {
						if (typeof result === 'number') {
							editBuilder.insert(selection.active, `${result}`);
						}
					}
				});
			});
		}
	}));

	context.subscriptions.push(...disposable);
}

// this method is called when your extension is deactivated
exports.deactivate = function() {}

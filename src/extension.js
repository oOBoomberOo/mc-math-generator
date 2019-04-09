// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/*
 * @param {vscode.ExtensionContext} context
 */

let settings = {'scoreboard1': 'obj1', 'scoreboard2': 'obj2'}

function mathExpression(expression, scoreboard, callback) {
	let template = {
		normal: {
			'+': 'scoreboard players add <selector> <scoreboard> <value>',
			'-': 'scoreboard players remove <selector> <scoreboard> <value>'
		},
		operation: {
			'+': 'scoreboard players operation <selector1> <scoreboard1> += <selector2> <scoreboard2>',
			'-': 'scoreboard players operation <selector1> <scoreboard1> -= <selector2> <scoreboard2>',
			'*': 'scoreboard players operation <selector1> <scoreboard1> *= <selector2> <scoreboard2>',
			'/': 'scoreboard players operation <selector1> <scoreboard1> /= <selector2> <scoreboard2>',
			'%': 'scoreboard players operation <selector1> <scoreboard1> %= <selector2> <scoreboard2>'
		}
	};
	let variableRegex = /[A-z@=,.#\s\d]+/g;
	let operatorRegex = /[\+\-\*\/\%]/g;
	scoreboard = scoreboard == false ? [settings['scoreboard1'], settings['scoreboard2']]: scoreboard.replace(/\s/g, '').split(',');
	scoreboard = scoreboard.length === 1 ? [scoreboard[0], scoreboard[0]]: scoreboard;
	scoreboard = scoreboard.length > 2 ? [scoreboard[0], scoreboard[1]]: scoreboard;

	expression = expression.replace(/\s/g, '');
	let variable = expression.match(variableRegex);
	let operator = expression.match(operatorRegex);
	let mainSelector = variable[0];
	let result = [];
	if (variable.length > 1) {
		variable = variable.slice(1, variable.length);
		if (variable.length <= operator.length) {
			for (let i = 0; i < variable.length; i++) {
				let current_variable = variable[i];
				let current_operator = operator[i];

				let current_operation = determineOperator(current_operator, current_variable);
				if (current_operation) {
					let generated = template[current_operation.type][current_operation.operation];
					generated = generated
						.replace(/<selector>/g, mainSelector)
						.replace(/<selector1>/g, mainSelector)
						.replace(/<selector2>/g, current_variable)
						.replace(/<value>/g, current_variable)
						.replace(/<scoreboard>/g, scoreboard[0])
						.replace(/<scoreboard1>/g, scoreboard[0])
						.replace(/<scoreboard2>/g, scoreboard[1]);
					result.push(generated);
				}
			}
			callback(result, null);
		}
	}
	else {
		callback(null, {message: 'Invalid Expression'});
	}
}

function determineOperator(operator, variable) {
	let numberTestRegex = /\d/g;
	let operationRegex = /[\+\-\*\/\%]/g;
	if (numberTestRegex.test(variable) && /[\+\-]/g.test(operator)) {
		return {type: 'normal', operation: operator};
	}
	else if (operationRegex.test(operator)) {
		return {type: 'operation', operation: operator};
	}
	else {
		return null;
	}
}

exports.activate = function(context) {
	let config = vscode.workspace.getConfiguration().get('mc-math.default_scoreboard');
	try {
		settings.scoreboard1 = config[0];
		settings.scoreboard2 = config[1];
	} catch (error) {
		settings.scoreboard1 = 'obj1';
		settings.scoreboard2 = 'obj2';
	}

	let disposable = [];
	disposable.push(vscode.workspace.onDidChangeConfiguration(event => {
		config = vscode.workspace.getConfiguration().get('mc-math.default_scoreboard');
		try {
			settings.scoreboard1 = config[0];
			settings.scoreboard2 = config[1];
		} catch (error) {
			vscode.window.showErrorMessage(error.message);
		}
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

		mathExpression(expression, scoreboard, (result, error) => {
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

	context.subscriptions.push(...disposable);
}

// this method is called when your extension is deactivated
exports.deactivate = function() {}

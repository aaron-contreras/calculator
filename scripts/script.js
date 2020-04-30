function exponent(a, b) {
  return a ** b;
}
function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

function add(a, b) {
  return +a + +b;
}

function subtract(a, b) {
  return a - b;
}
const divisionByZeroMessage = "How can someone split a pizza among no people?";
const validOperators = {
  '**': (a, b) => a ** b,
  '*': (a, b) => a * b,
  '/': (a, b) => {
    if (+b === 0) {
      return divisionByZeroMessage;
    }
    return  a / b;
  },
  '+': (a, b) => +a + +b,
  '-': (a, b) => a - b
}

function operate(a, operator, b) {
  return validOperators[operator](a, b); 
}
const nonOperators = document.querySelectorAll('.non-operator');
nonOperators.forEach(button => {
  button.setAttribute('data-symbol', button.textContent);
});

let operation = '';
let result = '';
function updateDisplay(event) {
  if (event.target.nodeName.toLowerCase() === 'button') {
    if (event.target.className.includes('clear')) {
      operation = ''; 
      resultDisplay.textContent = '0';
      backlogDisplay.textContent = '';
      result = '';
      return;
    }
    if (event.target.className === 'equals') {
      result = calculateResult(operation);
      if (result !== Math.trunc(result)) {
        result = result.toFixed(5);
      }
      resultDisplay.textContent = result;
      operation = '(' + operation + ')';
      backlogDisplay.textContent = operation;
      return;
    }
    if (event.target.className.includes('delete')) {
      operation = operation.slice(0, operation.length - 1);
      result = result.slice(0, result.length - 1); 
      resultDisplay.textContent = operation;
      return;
    }

    operation += event.target.getAttribute('data-symbol');
    result += event.target.getAttribute('data-symbol');
    resultDisplay.textContent = result;
  }
}

function missingParentheses(setOfParens) {
  return setOfParens.lastOpen === -1 && setOfParens.firstCloseAfterLastOpen !== -1 ||
    setOfParens.lastOpen !== -1 && setOfParens.firstCloseAfterLastOpen === -1;
}

function isLastOperation(setOfParens) {
  return setOfParens.lastOpen === -1 && setOfParens.firstCloseAfterLastOpen === -1;
}

const cleanOperation = function (string) {
  const numbers = /([\d]*[.]{0,1}[\d]+)/g;
  const power = /\*{2}/g;
  const operator = /\D{2,}/g;
  const operationElements = string.split(numbers);
  for (let i = operationElements.length - 1; i >= 0; i--) {
    const element = operationElements[i];
    if (element.match(power)) {
      operationElements.splice(i, 1, ...element.split(/(\*{2})/g));
      continue;
    }
    if (element.match(operator)) {
      operationElements.splice(i, 1, ...element.split(''));
    }
  }

  return operationElements.filter(element => element !== '');
}

function buildOperation(elements) {
  return {
    operands: elements.filter(element => +element === +element),
    operators: elements.filter(element => isNaN(+element))
  }
}
const nonOperands = ['(', ')',
  '**', '*',
  '/', '+',
  '-'
];

const isNonOperand = element => nonOperands.includes(element);

function calculateResult(stringOperation) {
  const operation = cleanOperation(stringOperation);
  console.log(operation);
  while (operation.some(isNonOperand)) {
    const parens = {
      lastOpen: operation.lastIndexOf('('),
      firstCloseAfterLastOpen: operation.indexOf(')', operation.lastIndexOf('(')),
    }

    if (missingParentheses(parens)) {
      return "Fix unmatching brackets";
    }

    if (isLastOperation(parens)) {
      return solve(buildOperation(operation));
    }
    const elementsToSolve = operation
      .slice(parens.lastOpen + 1, parens.firstCloseAfterLastOpen);
    const subOperation = buildOperation(elementsToSolve);
    const solution = solve(subOperation);
    if (solution === divisionByZeroMessage) {
      return solution;
    }
    const distance = parens.firstCloseAfterLastOpen - parens.lastOpen + 1;
    operation.splice(parens.lastOpen, distance, solution);
  }

  return operation;
}

function solve(operation) {
  const pendingOperators = operator => {
    return operator in validOperators;
  };
  const operatorList = [
    ['**'],
    ['*', '/'],
    ['+', '-']
  ];
  const getHighestPriorityOperator = () => {
    let index = 0;
    for (let i = 0; i < operatorList.length; i++) {
      index = operation.operators.findIndex(operator => {
        return operatorList[i].includes(operator);
      });
      if (index >= 0) return index;
    }
  }

  while (operation.operators.some(pendingOperators)) {
    let index = getHighestPriorityOperator();
    const operator = operation.operators[index];
    const a = operation.operands[index];
    const b = operation.operands[index + 1];
    const result = operate(a, operator, b);
    if (result === divisionByZeroMessage) {
      return result;
    }
    operation.operands.splice(index, 2, result);
    operation.operators.splice(index, 1);
  }
  return operation.operands[0];
}

const resultDisplay = document.querySelector('.result p');
const backlogDisplay = document.querySelector('.backlog p');
const calculator = document.querySelector('#calc-container');
calculator.addEventListener('click', updateDisplay);

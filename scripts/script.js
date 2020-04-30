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

function operate(a, operator, b) {
  if (operator === '**') {
    return exponent(a, b);
  } else if (operator === '+') {
    return add(a, b);
  } else if (operator === '-') {
    return subtract(a, b);
  } else if (operator === '*') {
    return multiply(a, b);
  } else {
    return divide(a, b);
  }
}
const nonOperators = document.querySelectorAll('.non-operator');
nonOperators.forEach(button => {
  button.setAttribute('data-symbol', button.textContent);
});

let operation = '';
let openedParensNum = 0;
let closedParensNum = 0;
function updateDisplay(event) {
  if (event.target.nodeName.toLowerCase() === 'button') {
    if (event.target.className === 'equals') {
      display.textContent = calculateResult(operation);
      return;
    }
    if (event.target.id === 'delete') {
      operation = operation.slice(0, operation.length - 1);
      console.log(operation);
      display.textContent = operation;
      return;
    }

    operation += event.target.getAttribute('data-symbol');
    display.textContent = operation;
  }
}

function missingParentheses(setOfParens) {
  return setOfParens.lastOpen === -1 && setOfParens.firstClose !== -1 ||
    setOfParens.lastOpen !== -1 && setOfParens.firstClose === -1;
}

function isLastOperation(setOfParens) {
  return setOfParens.lastOpen === -1 && setOfParens.firstClose === -1;
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
  while (operation.some(isNonOperand)) {
    const parens = {
      lastOpen: operation.lastIndexOf('('),
      firstClose: operation.indexOf(')'),
    }

    if (missingParentheses(parens)) {
      return "Fix unmatching brackets";
    }

    if (isLastOperation(parens)) {
      return solve(buildOperation(operation));
    }
    const elementsToSolve = operation
      .slice(parens.lastOpen + 1, parens.firstClose);
    const subOperation = buildOperation(elementsToSolve);
    const solution = solve(subOperation);
    const distance = parens.firstClose - parens.lastOpen + 1;
    operation.splice(parens.lastOpen, distance, solution);
  }

  return operation;
}

function solve(operation) {
  const pendingOperators = operator => {
    return operator === '**' || operator === '*' || operator === '/' ||
      operator === '+' || operator === '-';
  };
  const operatorPriority = [
    ['**'],
    ['*', '/'],
    ['+', '-']
  ];
  const getHighestPriorityOperator = () => {
    let index = 0;
    for (let i = 0; i < operatorPriority.length; i++) {
      index = operation.operators.findIndex(operator => {
        return operatorPriority[i].includes(operator);
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
    operation.operands.splice(index, 2, result);
    operation.operators.splice(index, 1);
  }
  return operation.operands[0];
}

const display = document.querySelector('.display p');
let blankState = true;
const calculator = document.querySelector('#calc-container');
calculator.addEventListener('click', updateDisplay);

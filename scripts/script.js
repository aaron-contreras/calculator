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
  return a + b;
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
const operation = {
  operands: [],
  operators: []
};

let currentOperand = '';
let justClosed = false;
let openedParensNum = 0;
let closedParensNum = 0;
const listOfOperations = [operation];
let indexOfSubOject = 0;
function updateDisplay(event) {
  const button = event.target;
  let current = listOfOperations.length - 1;
  if (button.className === 'open-parens') {
    newOperation = { operands: [], operators: [] };
    listOfOperations[current].operands.push(newOperation);
    listOfOperations.push(newOperation);
  }
  if (button.className === 'close-parens') {
    listOfOperations[current].operands.push(+currentOperand);
    listOfOperations.pop();
    currentOperand = '';
    current--;
    justClosed = true;
  }
  if (button.className == 'digit') {
    currentOperand += button.textContent;
  } else if (event.target.className === 'operator') {
    if (!justClosed) {

      listOfOperations[current].operands.push(+currentOperand);
    }
    currentOperand = '';
    listOfOperations[current].operators.push(button.getAttribute('data-symbol'));
    justClosed = false;
  } else if (event.target.className === 'equals') {
    if (!justClosed) {

      listOfOperations[current].operands.push(+currentOperand);
    }
    currentOperand = '';
    display.textContent = solve();

    console.table(listOfOperations);
    return;
  }

  if (blankState) {
    display.textContent = button.textContent;
    blankState = false;
  } else {
    display.textContent += button.textContent;
  }
  console.table(listOfOperations);
}

function multiplyAndDivide(operation) {
  const pendingOperators = operator => {
    return operator === '**' || operator === '*' || operator === '/' ||
      operator === '+' || operator === '-';
  };
  const hasSubOperations = operand => {
    return typeof operand !== "number";
  };
  const operatorPriority = [
    ['**'],
    ['*', '/'],
    ['+', '-']
  ];
  const getOperatorsInOrder = () => {
    let index = 0;
    for (let i = 0; i < operatorPriority.length; i++) {
      index = operation.operators.findIndex(operator => {
        return operatorPriority[i].includes(operator);
      });
      if (index >= 0) return index;
    }
    return index;
  }

  while (operation.operators.some(pendingOperators) ||
    operation.operands.some(hasSubOperations)) {
    let index = getOperatorsInOrder();
    if (index < 0) {
      index = 0;
    }
    const operator = operation.operators[index];
    const a = typeof operation.operands[index] === 'number' ?
      operation.operands[index] :
      operation.operands[index] = multiplyAndDivide(operation.operands[index]);
      let b = 0;
      if (operation.operands.length < 2) {
        return operation.operands[0];
      }
      b = typeof operation.operands[index + 1] === 'number' ?
        operation.operands[index + 1] :
        operation.operands[index + 1] = multiplyAndDivide(operation.operands[index + 1]);

    const result = operate(a, operator, b);

    operation.operands.splice(index, 2, result);
    operation.operators.splice(index, 1);
  }
  return operation.operands[0];
}
function solve() {
  const result = multiplyAndDivide(operation);
  console.log(result);
  return result;
}

const display = document.querySelector('.display p');
let blankState = true;
const calculator = document.querySelector('#calc-container');
calculator.addEventListener('click', updateDisplay);
function getDisplayContent(display) {
  return display.textContent;
}
const openParens = document.querySelector('.openParens');
const closeParens = document.querySelector('.closeParens');
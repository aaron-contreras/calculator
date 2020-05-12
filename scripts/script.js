const divisionByZeroMessage = "How can someone split a pizza among no people?";
const validOperators = {
  '**': (a, b) => a ** b,
  '*': (a, b) => a * b,
  '/': (a, b) => {
    if (+b === 0) {
      return divisionByZeroMessage;
    }
    return a / b;
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
const fixBracketsMessage = "Add missing parentheses";
let equalJustClicked = false;
function updateDisplay(event) {
  event.preventDefault();
  function showErrorMessage() {
    event.preventDefault();
    resultDisplay.style.fontSize = '16px';
    resultDisplay.textContent = result;
    result = operation;
    backlogDisplay.textContent = operation;
  }
  if (event.target.nodeName.toLowerCase() === 'button') {
    if (event.target.className.includes('clear')) {
      equalJustClicked = false;
      resultDisplay.style.fontSize = '';
      operation = '';
      result = '';
      resultDisplay.textContent = '0';
      backlogDisplay.textContent = '';
      return;
    }

    if (event.target.getAttribute('data-symbol') === '=') {
      result = calculateResult(operation);
      if (typeof result == "string") {
        showErrorMessage();
        return;
      } else if (isNaN(result)) {
        showErrorMessage();
        resultDisplay.textContent = 'Check your operation again.';
        return;
      }
      else {
        resultDisplay.style.fontSize = '';
      }

      if (typeof result === "object") {
        resultDisplay.textContent = result;
        return;

      }
      if (result !== Math.trunc(result)) {
        result = result.toPrecision();
        const numericResult = parseFloat(result).toFixed(7);
        if (result.length > numericResult.length) {
          result = parseFloat(numericResult).toPrecision();
        }
      }
      resultDisplay.textContent = result;
      operation = '(' + operation + ')';
      backlogDisplay.textContent = operation;
      return;
    }
    if (event.target.className.includes('delete')) {
      if (typeof result === "number") {
        return;
      }

      operation = operation.slice(0, operation.length - 1);
      if (result === divisionByZeroMessage) {
        result = operation;
        resultDisplay.textContent = result;
        return;
      }
      result = operation;
      resultDisplay.textContent = result;
      return;
    }
    operation += event.target.getAttribute('data-symbol');
    result += event.target.getAttribute('data-symbol');
    resultDisplay.textContent = result;
  } else {
    copyToClipboard(event.target);
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
function validate(operation) {
  let previous = null;
  const errors = {
    hasMoreThanOneDecimal: false,
    moreThanOnceConsecutiveOperator: false,
    emptyOperator: false
  };
  if (operation[operation.length - 1] in validOperators) {
    errors.emptyOperator = true;
    return errors;
  }
  operation.forEach(element => {
    if (previous) {
      if (typeof previous === "number" && typeof element === "number") {
        errors.hasMoreThanOneDecimal = true;
        return;
      }
      if (previous in validOperators && element in validOperators) {
        errors.moreThanOnceConsecutiveOperator = true;
        return;
      }
    }
    previous = element;
  });
  return errors;
}

function calculateResult(stringOperation) {
  const operation = cleanOperation(stringOperation);
  const errorList = validate(operation);
  if (errorList.hasMoreThanOneDecimal) {
    return 'There\'s more than one period in an operand';
  }
  if (errorList.moreThanOnceConsecutiveOperator) {
    return 'There\'s more than one consecutive operator';
  }
  if (errorList.emptyOperator) {
    return 'Operator at end of operation';
  }
  while (operation.some(isNonOperand)) {
    const parens = {
      lastOpen: operation.lastIndexOf('('),
      firstCloseAfterLastOpen: operation.indexOf(')', operation.lastIndexOf('(')),
    }

    if (missingParentheses(parens)) {
      return fixBracketsMessage;
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
  const pendingOperators = operator => operator in validOperators;
  const operatorList = [
    ['**'],
    ['*', '/'],
    ['+', '-']
  ];

  function getHighestPriorityOperator() {
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
    if (!b && (operator === '+' || operator === '-')) {
      return +(operator + a);
    }
    const result = operate(a, operator, b);
    if (result === divisionByZeroMessage) {
      return result;
    }
    operation.operands.splice(index, 2, result);
    operation.operators.splice(index, 1);
  }
  return operation.operands[0];
}

function addDataSymbolsToDigits() {
  document.querySelectorAll('.digit').forEach(digit => {
    digit.setAttribute('data-symbol', `${digit.textContent}`);
  });
}

addDataSymbolsToDigits();

function addKeyboardSupport() {
  window.addEventListener('keydown', (event) => {
    const eventKeyName = event.key.toLowerCase();
    let clickedButton = null;
    function getElementWithSymbol(name) {
      return document.querySelector(`[data-symbol="${name}"]`);
    }
    clickedButton = getElementWithSymbol(eventKeyName);
    if (eventKeyName === '^') {
      clickedButton = document.querySelector(`[data-symbol="**"]`);
    } else if (eventKeyName === 'enter') {
      clickedButton = document.querySelector('[data-symbol="="]');
    }
    if (clickedButton) {
      clickedButton.classList.add('hovered');
      clickedButton.click();
    }
  });
}
addKeyboardSupport();

const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  button.addEventListener('transitionend', event => {
    event.target.classList.remove('hovered');
  });
});

const resultDisplay = document.querySelector('.result p');
const backlogDisplay = document.querySelector('.backlog p');
const calculator = document.querySelector('#calc-container');
calculator.addEventListener('click', updateDisplay);

function growText(event) {
  const para = event.currentTarget.firstElementChild;
  para.classList.toggle('hovered-display');
}

resultDisplay.parentElement.addEventListener('mouseover', growText);
resultDisplay.parentElement.addEventListener('mouseout', growText);
backlogDisplay.parentElement.addEventListener('mouseover', growText);
backlogDisplay.parentElement.addEventListener('mouseout', growText);

function copyToClipboard(elem) {
  const copiedBanner = document.querySelector('.copied-banner');
  const text = elem.innerText;
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  copiedBanner.classList.add('copied-banner-anim');
  copiedBanner.addEventListener('animationend', () => {
    copiedBanner.classList.remove('copied-banner-anim')
  });
}

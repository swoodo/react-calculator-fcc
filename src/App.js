import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

class App extends Component {

  state = {
    displayCurrent: '0',
    displayHistory: '0',
    digitCounterCurrent: 0,
    operatorUsed: false,
    equalsUsed: false,
    menuClickCount: 0
  }
  
  //CLEAR DISPLAYS
  ////////////////
  clearCurrentDisplay = () => {
    this.setState({
    displayCurrent: '0',
    displayHistory: '0',
    digitCounterCurrent: 0,
    operatorUsed: false,
    equalsUsed: false
    })
    document.getElementById('menu-calculations-ul').innerHTML = '';
  }

  //NUM LIMIT REACHED
  ///////////////////
  invalidNum = () => {
    var target = document.getElementById('display-current');
    let oldNum = this.state.displayCurrent;
    target.innerHTML = 'Limit Reached';
    document.body.style.pointerEvents = 'none';
    setTimeout(function() {
      target.innerHTML = oldNum;
      document.body.style.pointerEvents = 'initial';
    }, 1500);
  }

  //ADD TO DISPLAY
  ////////////////
  addDisplay = (e) => {
    let element = e.target.innerHTML;
    let isOperator = false;

    //check if operator
    let operators = ['+', '-','x', '/'];
    //if operator clicked, put a space around it 
    if (operators.indexOf(element) >= 0) {
      isOperator = true;
      element = ' ' + element + ' ';
    };

    
    if ((element === '0' && this.state.displayCurrent === '0') ||
        (isOperator && this.state.displayHistory === '0') ||
        (isOperator && this.state.displayHistory[this.state.displayHistory.length - 1] === '.') ||
        (this.state.displayHistory[this.state.displayHistory.length - 1] === '.' && element === '.') ||
        (this.state.displayCurrent.includes('.') && element === '.' && !this.state.operatorUsed && !this.state.equalsUsed)) {
      //do nothing 
    }
    //check if overriding operator
    else if (isOperator && this.state.displayHistory[this.state.displayHistory.length - 1] === ' ') {
      //delete old operator and set new state
      this.setState({
        displayHistory: this.state.displayHistory.slice(0, this.state.displayHistory.length - 3) + element
      })
    }
    else {
      //clear menu ul if equals is clicked
      if (this.state.equalsUsed) {
        document.getElementById('menu-calculations-ul').innerHTML = '';
      }
      //check digit counter for limit reached
      if (this.state.digitCounterCurrent > 15 && !isOperator) {
        this.invalidNum();
      }
      else {
        let currentText = '';
        let historyText = '';
        //display current text:
        ///'unchanged' if:
        ///operator was used last and user clicks a new operator,
        ///operator was not used last and user clicks an operator,

        ///'element' if:
        ///operator was used last and user does not click an operator,
        ///operator was not used last user does not click an operator and equals was just used
        ///user clicks a number and displayCurrent equals 0

        ///'displayCurrent + element' if:
        ///user enters consecutive numbers
        if ((this.state.operatorUsed && isOperator) || 
            (!this.state.operatorUsed && isOperator)) {
          currentText = this.state.displayCurrent;
        }
        else if ((this.state.operatorUsed && !isOperator) ||
                 (!this.state.operatorUsed && !isOperator && this.state.equalsUsed) ||
                 (element !== '.' && this.state.displayCurrent === '0')) {
          currentText = element;
        }
        else {
          currentText = this.state.displayCurrent + element;
        }
        //display history text:
        ///'element' if:
        ///operator was not used last and user does not click an operator and equals was just used
        ///user clicks a number and displayCurrent equals 0

        ///if the last element in history is a 0 and the user does not enter a decimal, remove zero and input element

        ///'displayHistory + element' if:
        ///user enters consecutive numbers
        if ((!this.state.operatorUsed && !isOperator && this.state.equalsUsed) ||
            (element !== '.' && this.state.displayCurrent === '0' && this.state.displayHistory.length === 1)) {
          historyText = element;
        }
        else if (element !== '.' && this.state.displayHistory[this.state.displayHistory.length - 1] === '0' && this.state.displayHistory[this.state.displayHistory.length - 2] === ' ') {
          historyText = this.state.displayHistory.slice(0, this.state.displayHistory.length - 1) + element;
        }
        else {
          historyText = this.state.displayHistory + element;
        }
        //set new state
        this.setState({
          displayCurrent: currentText,
          displayHistory: historyText,
          digitCounterCurrent: (isOperator ? 0 : element === '.' ? this.state.digitCounterCurrent : this.state.digitCounterCurrent + 1),
          operatorUsed: (isOperator ? true : false),
          equalsUsed: false

        })
      }
    }
  }

  //CALCULATOR FUNCTION
  /////////////////////
  computeResult = () => {
    //check if history has an operator in it
    let hasOperator = false;
    for (let i = 0; i < this.state.displayHistory.length; i++) {
      let target = this.state.displayHistory[i];
      if (target === 'x' || target === '/' || target === '+' || target === '-') {
        hasOperator = true;
      }
    }
    //make sure display is not empty or is decimal and operator was used
    if (hasOperator && this.state.displayCurrent !== '.' && this.state.displayHistory[this.state.displayHistory.length - 1] !== ' ' && this.state.equalsUsed === false) {

      //compute whatever is in the display history
      let equationsStr = this.state.displayHistory;
      let newStr = '';
      
      //change subtract to add negative
      let subtractFound = false;
      for (let i = 0; i < equationsStr.length; i++) {
        if (subtractFound) {
          newStr += ' -';
          subtractFound = false;
        } else if (equationsStr[i] === '-') {
          subtractFound = true;
          newStr += '+';
        } else {
          subtractFound = false;
          newStr += equationsStr[i];
        }
      }

      //split apart all the equations into an array
      let equationsArr = newStr.split(' = ');

      //will be end result
      let equationArr = [];

      //loop through equations array
      for (let i = 0; i < equationsArr.length; i++) {
        //split each equation to array
        equationArr = equationsArr[i].split(' ');

        //find index of operations and perform order of operations
        //multiplication, division, addition (positive and negative)
        let mIndex = equationArr.indexOf('x');
        let dIndex = equationArr.indexOf('/');
        let aIndex = equationArr.indexOf('+');
        
        menuEquation(equationArr);

        //do maths
        //check order of operations
        //if multi comes before div, do multi first
        if (mIndex >= 0 && mIndex < dIndex) {
          equationArr = doMaths(i, equationsArr, equationArr, mIndex, 'x');
          if (dIndex > 0) {
            equationArr = doMaths(i, equationsArr, equationArr, dIndex, '/');
          }
          //do addition
          if (aIndex > 0) {
            equationArr = doMaths(i, equationsArr, equationArr, aIndex, '+');
          }
        }
        //if div comes before multi, do div first
        else if (dIndex >= 0 && dIndex < mIndex) {
          equationArr = doMaths(i, equationsArr, equationArr, dIndex, '/');
          if (mIndex > 0) {
            equationArr = doMaths(i, equationsArr, equationArr, mIndex, 'x');
          }
          //do addition
          if (aIndex > 0) {
            equationArr = doMaths(i, equationsArr, equationArr, aIndex, '+');
          }
        }
        else {
          if (mIndex > 0) {
            equationArr = doMaths(i, equationsArr, equationArr, mIndex, 'x');
          }
          if (dIndex > 0) {
            equationArr = doMaths(i, equationsArr, equationArr, dIndex, '/');
          }
          if (aIndex > 0) {
            equationArr = doMaths(i, equationsArr, equationArr, aIndex, '+');
          }
        }
        
        
      }
      //set state
      this.setState({
        displayCurrent: equationArr[0].toString(),
        displayHistory: this.state.displayHistory + ' = ' + equationArr[0].toString(),
        equalsUsed: true
      })
    }

    //doMaths FUNCTION
    //////////////////
    function doMaths(arrIndex, equationsArr, equationArr, opIndex, opSymbol) {
      
      
      //continue if operation in found in equation
      if (opIndex >= 0) {
        //get the count of how many times this operation appears in the equation
        let opCount = 0;
        switch(opSymbol) {
          case 'x':
            opCount = equationsArr[arrIndex].match(/\sx\s/g || []).length;
            break;
          case '/':
            opCount = equationsArr[arrIndex].match(/\s\/\s/g || []).length;
            break;
          case '+':
            opCount = equationsArr[arrIndex].match(/\s\+\s/g || []).length;
            break;
          default:
        }
        //do math for each operation count
        for (let i = 0; i < opCount; i++) {
          //get index of operation symbol
          opIndex = equationArr.indexOf(opSymbol);
          //get num of each side of operation
          let num1 = parseFloat(equationArr[opIndex - 1]);
          let num2 = parseFloat(equationArr[opIndex + 1]);
          //perform appropriate operation
          let result = 0;
          switch(opSymbol) {
            case 'x':
              result = num1 * num2;
              break;
            case '/':
              result = num1 / num2;
              break;
            case '+':
              result = num1 + num2;
              break;
            default:
          }
          //put result on the right side
          //round to 4 decimal places if not whole num
          let fixedNum = parseFloat(result.toFixed(4));
          equationArr[opIndex + 1] = fixedNum.toString();

          
          //remove leftovers
          equationArr.splice(opIndex - 1, 2);
          //build solution in menu
          menuEquation(equationArr);
        }
      }
      //return solution
      return equationArr;
    }

    //BUILD MENU EQUATION
    /////////////////////
    function menuEquation(arr) {
      let ul = document.getElementById('menu-calculations-ul');
      let li = document.createElement('li');
      let text = '';
      
      for(let i = 0; i < arr.length; i++) {
        if (arr[i] === 'x') {
          text += ' * ';
        }
        else if (arr[i] === '/' || arr[i] === '+') {
          text += ' ' + arr[i] + ' ';
        }
        else {
          text += arr[i];
        }
      }
      li.appendChild(document.createTextNode(text));
      ul.appendChild(li);
    }
  }

 

  //COPY TO CLIPBOARD
  ///////////////////
  setClipboard = (e) => {
    var text = '';
    if (e.target.id === 'display-current') {
      text = this.state.displayCurrent;
    } else {
      text = this.state.displayHistory;
    }
    var target = e.target.id;
    if (target === 'display-current') {
      document.getElementById(target).style.color = 'white';
    }
    document.getElementById(target).style.backgroundColor = 'var(--equals-bg)';
    document.getElementById(target).innerHTML = 'Copied to clipboard!';
    document.body.style.pointerEvents = 'none';

    setTimeout(function() {
      if (target === 'display-current') {
        document.getElementById(target).style.backgroundColor = 'white';
        document.getElementById(target).style.color = 'black';
      }
      else {
        document.getElementById(target).style.backgroundColor = 'var(--calc-bg)'
      }
      document.getElementById(target).innerHTML = text;
      document.body.style.pointerEvents = 'initial';
    }, 1500);

    async function writeToClipboard(text) {
      try {
          await navigator.clipboard.writeText(text);
      } catch (error) {
          console.error(error);
      }
    }
    writeToClipboard(text);
  }

  //REVEAL MENU
  ///////////////////
  revealMenu = (e) => {
    this.setState({
      menuClickCount: this.state.menuClickCount + 1
    });

    if(this.state.menuClickCount % 2 === 0) {
      // e.target.innerHTML = '&larr;';
      document.getElementById('menu').style.right = 'calc(-30% - calc(2 * var(--border-size)))';
    } else {
      // e.target.innerHTML = '&rarr;';
      document.getElementById('menu').style.right = '0';
    }
  }

  //RENDER
  ////////
  render() {
    return (
      <div className="App">
        <div className="container">
        
        <div id="calculator-border">
          <div id="menu">
            <div className="menu-wrapper">
              <div className="menu-title">operations</div>
              <div className="menu-calculations">
                <ul id="menu-calculations-ul"></ul>
              </div>
            </div>
          </div>
          <div id="calculator-title">react calculator</div>
          <div id="see-more-btn" title="Secret Menu" onClick={this.revealMenu}><div></div></div>
          <div id="calculator">
            

            <div id="display">
              <div id="display-input">
                <div id="display-history" title="Click to copy" onClick={this.setClipboard}>
                  {this.state.displayHistory}
                </div>
                <div id="display-current" title="Click to copy" onClick={this.setClipboard}>
                  {this.state.displayCurrent}
                </div>
              </div>
            </div>

            <div id="buttons">
              <div id="clear" title="Clear" onClick={this.clearCurrentDisplay}>AC</div>
              <div id="divide" title="Divide" onClick={this.addDisplay}>/</div>
              <div id="multiply" title="Multiply" onClick={this.addDisplay}>x</div>

              <div id="seven"onClick={this.addDisplay}>7</div>
              <div id="eight" onClick={this.addDisplay}>8</div>
              <div id="nine" onClick={this.addDisplay}>9</div>
              <div id="subtract" title="Subtract" onClick={this.addDisplay}>-</div>

              <div id="four" onClick={this.addDisplay}>4</div>
              <div id="five" onClick={this.addDisplay}>5</div>
              <div id="six" onClick={this.addDisplay}>6</div>
              <div id="add" title="Add" onClick={this.addDisplay}>+</div>

              <div id="one" onClick={this.addDisplay}>1</div>
              <div id="two" onClick={this.addDisplay}>2</div>
              <div id="three" onClick={this.addDisplay}>3</div>
              <div id="equals" title="Compute" onClick={this.computeResult}>=</div>

              <div id="zero" onClick={this.addDisplay}>0</div>
              <div id="decimal" onClick={this.addDisplay}>.</div>
            </div>

          </div>
        </div>

      </div>
        <div id="footer">
        <div className="footer-content">
          ©{new Date().getFullYear()}<br/>swoodo
        </div>
      </div>
      </div>
    );
  }
}

export default App;

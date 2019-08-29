// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Calculates the percentage
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;            
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1                         
    };

    return {
        addItem: function (type, des, val) {

            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push - adds the new element to the end of the array
            data.allItems[type].push(newItem);                             
            return newItem;
        },

        deleteItem: function (type, id) {

            var ids, index;

            ids = data.allItems[type].map(function (current) {          

                return current.id;                                     

            });

            index = ids.indexOf(id);                           

            if (index !== -1) {
                data.allItems[type].splice(index, 1);               
            }
        },

        calculateBudget: function () {

            // 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of income we spent. Math.round - rounds the number up or down
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);           
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {                                             
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (number, type) {

        var numberSplit, int, decimal;

        // 1. Get the absolute of the number
        number = Math.abs(number);                             

        // 2. Make the integer have 2 decimal places
        number = number.toFixed(2);                            

        // 3. Add comma seperator
        // a. Split the number into the decimal part and the integer part, this will be stored into an array as strings
        numberSplit = number.split('.');

        int = numberSplit[0];                                  
        decimal = numberSplit[1];                              

        // b. Add the comma
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);    
        }

        // c. Add plus or minus sign in front of number
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;
    };

    var nodeListForEach = function (list, callback) {         
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);                             
        }
    };

    return {

        getInput: function () {

            // Reads the data from the interface
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc (income) or exp (expense)
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)       
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            // 1. Create HTML string with placeholder text (html is the HTML code on the index.html page with all the spaces taken out)
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id = "exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);                
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // 3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function (selectorID) {

            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);

        },

        clearFields: function () {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);                     

            // clear the fields
            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            // Get the cursor to go back to 'description' field after enter is pressed
            // fieldsArray[0] is the first array in the fields list (description, value)
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '-';
            }
        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentagesLabel);
            
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, year, month, months;

            now = new Date();                                 

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields;

            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
        
        getDOMstrings: function () {
            return DOMstrings;                                      
        }                                                           
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();                           

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {      

                ctrlAddItem();

            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);   

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updatePercentages = function () {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read them from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var updateBudget = function () {

        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Returns the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the field input data
        input = UIController.getInput();

        // If the input fields are valid, continue
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {         

            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        };        
    };    

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');                                    
            type = splitID[0];                                              
            ID = parseInt(splitID[1]);                                      

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function () {
            console.log('application has started');

            // Set the figures to 0 when the application is launched
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });

            setUpEventListeners();

            UICtrl.displayMonth();
        }
    };    

})(budgetController, UIController);

controller.init();                                                 


window.onload = function() {
    Todo.loadTasks();
};


const Todo = {
    ul: document.querySelector('ul'),
    tasks: [],
    searchTerm: '',
    
    draw() {
        this.ul.innerHTML = '';
        const filteredTasks = this.getFilteredTasks();
        
        filteredTasks.forEach((task, originalIndex) => {
            var li = document.createElement('li');
            const displayName = this.highlightSearchTerm(task.name);
            li.innerHTML = `<span><input type="checkbox"> ${displayName}</span><span>${task.date}</span><button onclick="removeTask(${originalIndex})">usun</button>`;
            li.attributes.setNamedItem(document.createAttribute('data-index'));
            li.attributes['data-index'].value = originalIndex;
            this.ul.appendChild(li);
        });
    },

    getFilteredTasks() {
        if (this.searchTerm.length < 2) {
            return this.tasks.map((task, index) => ({ ...task, originalIndex: index }));
        }
        
        return this.tasks
            .map((task, index) => ({ ...task, originalIndex: index }))
            .filter(task => task.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    },
    
    highlightSearchTerm(text) {
        if (this.searchTerm.length < 2) {
            return text;
        }
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    setSearchTerm(term) {
        this.searchTerm = term;
        this.draw();
    },

    addTask(name, date) {
        this.tasks.push({ name, date });
        this.draw();
        this.saveTasks();
    },
    
    removeTask(index) {
        this.tasks.splice(index, 1);
        this.draw();
        this.saveTasks();
    },
    
    editTask(index, newName, newDate) {
        this.tasks[index] = { name: newName, date: newDate };
        this.draw();
        this.saveTasks();
    },
    
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },
    
    loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (Array.isArray(tasks)) {
            this.tasks = tasks;
            this.draw();
        }
    }
};



var submitButton = document.querySelector('input[type="submit"]');
submitButton.onclick = function(event) {
    event.preventDefault();
    var taskNameInput = document.getElementById('task');
    var taskDateInput = document.getElementById('task-date');
    if (taskNameInput.value === '') {
        alert('podaj nazwe zadania.');
        return;
    }
    if (taskNameInput.value.length < 3 || taskNameInput.value.length > 255) {
        alert('za krotka lub za dluga nazwa zadania. nazwa powinna zawierac conajmniej 3 znaki i być krotsza niz 255 znakow.');
        return;
    }
    if (taskDateInput.value !== '' && Date.parse(taskDateInput.value) <= new Date().setHours(0,0,0,0)) {
        alert('podaj poprawna date.');
        return;
    }
    Todo.addTask(taskNameInput.value, taskDateInput.value);
    taskNameInput.value = '';
    taskDateInput.value = '';
};

function removeTask(index) {
    if (editing) editing = false;
    Todo.removeTask(index);
}


var editing = false;
var fieldIndex = null;
var elm = null;
window.addEventListener('click', function(event) {
    if (!editing && event.target.tagName === 'SPAN') {
        editing = true;
        elm = event;
        var li = event.target.parentElement;
        var index = li.getAttribute('data-index');
        var task = Todo.tasks[index];
        li.innerHTML = `<input type="text" id="todo-task" value="${task.name}"> <input type="date" id="todo-task-date" value="${task.date}"> <input type="submit" value="zapisz"> <button onclick="removeTask(${index})">usun</button>`;

        var taskNameInput = document.getElementById('todo-task');
        var taskDateInput = document.getElementById('todo-task-date');

        fieldIndex = index;

        li.querySelector('input[type="submit"]').onclick = function(event) {
            event.preventDefault();
            Todo.editTask(fieldIndex, taskNameInput.value, taskDateInput.value);
            fieldIndex = null;
            elm = null;
            editing = false;
        }
    }
    if (editing && (event.target.tagName !== 'SPAN' || elm !== event)) {
        if (event.target.tagName === 'INPUT') return;
        console.log(event.target.tagName)
        var taskNameInput = document.getElementById('todo-task');
        var taskDateInput = document.getElementById('todo-task-date');
        Todo.editTask(fieldIndex, taskNameInput.value, taskDateInput.value);
        fieldIndex = null;
        elm = null;
        editing = false;
    }
});

var searchInput = document.querySelector('input[type="text"][placeholder="szukajka"]');
searchInput.addEventListener('input', function(event) {
    Todo.setSearchTerm(event.target.value);
});

// ================================== CALENDAR ( USED YOUTUBE TO MAKE AND CHANGED) ==================================

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const daysContainer = document.querySelector("#days");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const today = document.querySelector(".today");
const month = document.getElementById("month");

const date = new Date(); 
let currMonth = date.getMonth();
let currYear = date.getFullYear(); 
let chosenDate = null;
let selectedDay = null;

function renderCalendar() {
    //prev,curr,next months
    date.setDate(1);
    const firstDay = new Date(currYear, currMonth, 1);
    const lastDay = new Date(currYear, currMonth + 1, 0);
    const lastDayIndex = lastDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDay = new Date(currYear, currMonth, 0);
    const prevLastDayDate = prevLastDay.getDate();
    const nextDays = 7 - lastDayIndex - 1;

    //header month
    month.innerHTML = `${months[currMonth]} ${currYear}`;

    let days = "";

    //prev days
    for (let i = firstDay.getDay(); i > 0; i--) {
        days += `<div class="day prev">${prevLastDayDate - i + 1}</div>`
    }
    
    //curr days
    for (let i = 1; i <= lastDayDate; i++) {
        if (i === new Date().getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear()) {
            days += `<div class="day today" id="day-${i}" onclick="chooseDate(${i}, ${currMonth})">${i}</div>`
        } else {
            days += `<div class="day" id="day-${i}" onclick="chooseDate(${i}, ${currMonth})">${i}</div>`
        }
    }

    //next days
    for (let i = 1; i <= nextDays; i++) {
        days += `<div class="day next">${i}</div>`
    }

    daysContainer.innerHTML = days;

    if (selectedDay && selectedDay.month === currMonth && selectedDay.year === currYear) {
        const dayElement = document.getElementById(`day-${selectedDay.day}`);
        if (dayElement) {
            dayElement.classList.add("chosen-day");
        }
    }
}

function next() {
    currMonth++;
    if(currMonth > 11) {
        currMonth = 0;
        currYear++;
    }
    renderCalendar();
}

function previous() {
    currMonth--;
    if(currMonth < 0) {
        currMonth = 11;
        currYear--;
    }
    renderCalendar();
}

function doToday() {
    currMonth = date.getMonth();
    currYear = date.getFullYear();
    renderCalendar();
}

function chooseDate(chosenDay, chosenMonth) {

    if (selectedDay) {
        const prevSelectedDay = document.getElementById(`day-${selectedDay.day}`);
        if (prevSelectedDay) {
            prevSelectedDay.classList.remove("chosen-day");
        }
    }

    selectedDay = { 
        day: chosenDay, 
        month: chosenMonth, 
        year: currYear 
    };

    const newSelectedDay = document.getElementById(`day-${chosenDay}`);
    if (newSelectedDay) {
        newSelectedDay.classList.add("chosen-day");
    }

    chosenDate = `${currYear}-${chosenMonth < 10 ? "0" + chosenMonth : chosenMonth}-${chosenDay < 10 ? "0" + chosenDay : chosenDay}`;    

}

renderCalendar();

// ================================== CLEAR ==================================

const timePicker = document.getElementById("timePicker");
const miniDate = document.getElementById("miniDate");

function clearTime() {
    timePicker.value = "";
}

function clearMiniDate() {
    miniDate.value = "";
}

function clearSelectedDay() {
    if (selectedDay) {
        const prevSelectedDay = document.getElementById(`day-${selectedDay.day}`);
        if (prevSelectedDay) {
            prevSelectedDay.classList.remove("chosen-day");
        }
        selectedDay = null;
        chosenDate = null;
    }
}

// ================================== TASKS ==================================

let tasksArr = [];

const titleBox = document.getElementById("titleBox");
const newTaskBox = document.getElementById("newTaskBox");
const tasksContainer = document.getElementById("tasksContainer");
const taskBox = document.getElementById("taskBox");

function loadTasks() {
    const json = localStorage.getItem("tasksArr");
    if (!json) return;    
    tasksArr = JSON.parse(json);
    console.log(tasksArr)
    tasksArr = tasksArr.map((item)=>{
        return {
            ...item, isEdit: false
        }
    })
    if(tasksArr.length>=0){
        drawTask(tasksArr);
    }
}

function clearAll() {
    titleBox.value = "";
    newTaskBox.value = "";
    clearTime();
    clearMiniDate();
    clearSelectedDay();
    renderCalendar();
}

function addTask() {
    let formattedText = newTaskBox.value.replace(/\n/g, "<br>");

    let title = titleBox.value;
    let newTask = formattedText;
    let time = timePicker.value ? timePicker.value : "---";
    let date =  chosenDate ? chosenDate : 
                miniDate ? miniDate.value : "--/--/--";
    let isDone = false;
    let isEdit = false;

    if(!validate()) return;

    const task = {title,newTask,time,date,isDone,isEdit};
    tasksArr.push(task);
    drawTask(tasksArr);
    clearAll();

    saveTasks();
}

function drawTask(tasksArr) {
    if(tasksArr.length === 0) return;
    let html='';
    
    for(let i = 0; i < tasksArr.length; i++) {
        let isDone = tasksArr[i].isDone;
        let isEditing = tasksArr[i].isEdit;

        html += `
            <div class="task-box isDone-${isDone} isEditing-${isEditing}" id="taskId-${i}">
                <div class="task-left">
                    <div class="task-title"><h3>${tasksArr[i].title}</h3></div>
                    <div class="task-content" contenteditable="${tasksArr[i].isEdit}"><p>${tasksArr[i].newTask}</p></div>
                    <div class="date-time-box">
                        <div class="task-time"><p>${tasksArr[i].time}</p></div>
                        <div class="task-date"><p>${tasksArr[i].date}</p></div>
                    </div>
                </div>
                <div class="task-right">
                    <i class="fa-regular fa-circle-check" onclick="completeTask(${i})"></i>
                    <i class="fa-regular fa-pen-to-square" onclick="editTask(${i})"></i>
                    <i class="fa-regular fa-trash-can" onclick="deleteTask(${i})"></i>
                </div>
            </div>
        `;   
    }

    tasksContainer.innerHTML = html;
}

function editTask(index) {
    tasksArr[index].isEdit = !tasksArr[index].isEdit;

    if(!tasksArr[index].isEdit){
        tasksArr[index].newTask = document.querySelector(`[id='taskId-${index}'] [class='task-content']`).innerText.replace(/\n/g, "<br>");
        saveTasks();
        drawTask(tasksArr);
        alert("Saved!");
    }    

    saveTasks();
    drawTask(tasksArr);
}

function validate() {
    if (!titleBox.value || !titleBox.value.trim().length) {
        alert("Missing Task");
        titleBox.focus();
        return false;
    }
    if(!newTaskBox || !newTaskBox.value.trim().length) {
        alert("Missing Task");
        newTaskBox.focus();
        return false;
    }
    return true;
}

function saveTasks() {
    const json = JSON.stringify(tasksArr); 
    localStorage.setItem("tasksArr", json);
}

function completeTask(Id) {
    tasksArr[Id].isDone = !tasksArr[Id].isDone;
    saveTasks();
    drawTask(tasksArr);
}

function deleteTask(index) {
    const sure = confirm("Are you sure you want to delete this task: " + tasksArr[index].title);
    if(!sure) return;

    tasksArr.splice(index, 1);
    drawTask(tasksArr);

    saveTasks();
}

// ================================== MINI CALENDAR ( GPT HELPED TO ADD THIS ) ==================================

function toggleDateInput() {
    const calendar = document.getElementById('calendar');
    const dateInput = document.querySelector('.date-input');
    if (window.innerWidth <= 768) {
        calendar.style.display = 'none';
        dateInput.style.display = 'block';
    } else {
        calendar.style.display = 'block';
        dateInput.style.display = 'none';
    }
}

window.addEventListener('load', toggleDateInput);
window.addEventListener('resize', toggleDateInput);
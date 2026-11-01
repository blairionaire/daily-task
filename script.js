const $ = (id) => document.getElementById(id);
const startBtn = $("start-btn"), welcomePage = $("welcome-page"), dashboardPage = $("dashboard-page");
const dayText = $("day-text"), dateNumber = $("date-number"), monthText = $("month-text");
const dateBox = $("date-box"), datePickerInput = $("date-picker-input");
const taskInput = $("task-input"), addTaskBtn = $("add-task-btn"), taskList = $("task-list");
const progressFill = $("progress-fill"), finishBtn = $("finish-btn");

let selectedDateKey = "", currentTasks = [];

startBtn.addEventListener("click", () => {
    welcomePage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");
    initDashboard();
});

function initDashboard() {
    const today = new Date();
    selectedDateKey = formatDateKey(today);
    datePickerInput.value = selectedDateKey;
    updateDateDisplay(today);
    loadTasks(selectedDateKey);
}

function formatDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function updateDateDisplay(d) {
    dayText.textContent = d.toLocaleDateString("en-US", { weekday: "long" });
    dateNumber.textContent = d.getDate();
    monthText.textContent = d.toLocaleDateString("en-US", { month: "long" });
}

dateBox.addEventListener("click", () => (datePickerInput.showPicker ? datePickerInput.showPicker() : datePickerInput.focus()));

datePickerInput.addEventListener("change", function() {
    if (!this.value) return;
    const [y, m, d] = this.value.split("-").map(Number);
    const localDate = new Date(y, m - 1, d);
    updateDateDisplay(localDate);
    selectedDateKey = this.value;
    loadTasks(selectedDateKey);
});

function loadTasks(dateKey) {
    try {
        currentTasks = JSON.parse(localStorage.getItem(`tasks_${dateKey}`)) || [];
    } catch {
        currentTasks = [];
    }
    renderTasks();
}

function saveTasks() {
    localStorage.setItem(`tasks_${selectedDateKey}`, JSON.stringify(currentTasks));
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return alert("Tulis dulu tugasnya ya!");
    
    currentTasks.push({ id: Date.now(), text, completed: false });
    saveTasks();
    taskInput.value = "";
    renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => e.key === "Enter" && addTask());

function renderTasks() {
    taskList.innerHTML = "";
    
    if (currentTasks.length === 0) {
        taskList.innerHTML = `<p style="text-align:center; color:#888; font-size:0.85rem; margin-top:20px;">Belum ada tugas untuk tanggal ini~</p>`;
        progressFill.style.width = "0%";
        return;
    }

    let completed = 0;
    currentTasks.forEach(task => {
        if (task.completed) completed++;
        
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;
        if (task.completed) li.style.opacity = "0.6";

        li.innerHTML = `
            <ion-icon name="leaf" style="color: ${task.completed ? '#88ab8e' : '#557c55'}"></ion-icon>
            <span style="flex-grow:1; ${task.completed ? 'text-decoration:line-through;' : ''}">${task.text}</span>
            <button>✕</button>
        `;

        li.querySelector("ion-icon").addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        li.querySelector("button").addEventListener("click", () => {
            currentTasks = currentTasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        taskList.appendChild(li);
    });

    progressFill.style.width = `${(completed / currentTasks.length) * 100}%`;
}

finishBtn.addEventListener("click", () => {
    const total = currentTasks.length;
    if (total === 0) return alert("Belum ada tugas untuk diselesaikan. Yuk mulai produktif!");
    
    const completed = currentTasks.filter(t => t.completed).length;
    if (completed === total) {
        alert("Kerja bagus! Semua tugas sudah selesai. 🎉");
    } else {
        alert(`Kamu sudah menyelesaikan ${completed} dari ${total} tugas. Tetap semangat! 🌿`);
    }
});
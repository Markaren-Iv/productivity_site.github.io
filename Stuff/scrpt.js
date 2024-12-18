import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import { } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"

let tasksComp = 0;


const firebaseConfig = {
    apiKey: "AIzaSyBBhTp6rUls7mQemt2FHDFyTc_mbM0NXdw",
    authDomain: "markaren-7e92d.firebaseapp.com",
    databaseURL: "https://markaren-7e92d-default-rtdb.firebaseio.com",
    projectId: "markaren-7e92d",
    storageBucket: "markaren-7e92d.firebasestorage.app",
    messagingSenderId: "699147462653",
    appId: "1:699147462653:web:39e46024ed3a9534ec1b94",
    measurementId: "G-YFKDQTL3ZC"
};

const app = firebase.initializeApp(firebaseConfig);
console.log(app)

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("User is signed in:", user.email, user.uid);
      firebase.database().ref("users/"+user.uid+"/completedTasks").get().then((snapshot) => {
        tasksComp = snapshot.val()
        localStorage.setItem("completedTasks", JSON.stringify(tasksComp))
    })
    } else {
      console.log("No user is signed in.");
      tasksComp = 0
      localStorage.setItem("completedTasks", JSON.stringify(tasksComp))
    }
  });
  
document.addEventListener('DOMContentLoaded', () => {
    const isIndexPage = document.querySelector('.to-do') !== null;
    const isProgressPage = document.querySelector('#table') !== null;
    const isContactPage = document.querySelector('#contact') !== null;
    const isLoginPage = document.querySelector('#login-form') !== null;

    if (isIndexPage) {
        const addButton = document.getElementById('button-add');
        const taskInput = document.querySelector('.form-control');
        const taskList = document.querySelector('.list-group');

        function handleTaskClick(listItem, taskText) {
            listItem.addEventListener('click', () => {
                if (listItem.classList.contains('completed')) {
                    taskList.removeChild(listItem);
                    localStorage.removeItem(taskText);
                    firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/tasks/"+taskText).remove()
                } else {
                    listItem.classList.add('completed');
                    const now = new Date();
                    const timeComplete = now.toLocaleTimeString();
                    
                    const taskData = JSON.parse(localStorage.getItem(taskText));
                    taskData.timeComplete = timeComplete;
                    localStorage.setItem(taskText, JSON.stringify(taskData));
                    
                    tasksComp = JSON.parse(localStorage.getItem("completedTasks"));
                    tasksComp++;
                    localStorage.setItem("completedTasks", JSON.stringify(tasksComp))
                    firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
                        completedTasks: tasksComp
                    })
                    firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/tasks/"+taskText).update({
                        timeComplete: timeComplete
                    })
            }
            });
        }

        for (let i = 0; i < localStorage.length ; i++) {
            const taskText = localStorage.key(i);
            
            if (taskText === "completedTasks" || taskText.startsWith("firebase:")) continue;
            const taskData = JSON.parse(localStorage.getItem(taskText));

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item list-group-item-action';
            listItem.textContent = taskText;

            if (taskData.timeComplete) {
                listItem.classList.add('completed');
            }
            

            taskList.appendChild(listItem);
            handleTaskClick(listItem, taskText);
        
        }

        function addTask() {
            const taskText = taskInput.value.trim();
            if (taskText) {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item list-group-item-action';
                listItem.textContent = taskText;

                const now = new Date();
                const timeCreate = now.toLocaleTimeString();
                const taskData = { timeCreate, timeComplete: "" };

                localStorage.setItem(taskText, JSON.stringify(taskData));
                firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/tasks/" + taskText).set(taskData);
                handleTaskClick(listItem, taskText);
                taskList.appendChild(listItem);
                taskInput.value = '';
            }
        }

        addButton.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }

    if (isProgressPage) {
        loadProgressData();

        tasksComp = JSON.parse(localStorage.getItem("completedTasks"));
        const btn = document.getElementById("btn-conf");
        btn.textContent = tasksComp;
        btn.addEventListener("click", makeConfetti)
        btn.addEventListener('dblclick', () => {
            tasksComp=0;
            localStorage.setItem("completedTasks", JSON.stringify(tasksComp))
            btn.textContent = tasksComp;
        });
               

    }
    


    function makeConfetti(){
    confetti()
    }


    function loadProgressData() {
        const taskTable = document.querySelector('#table tbody');

        for (let i = 0; i < localStorage.length; i++) {
            const taskText = localStorage.key(i);
            const taskData = JSON.parse(localStorage.getItem(taskText));

            if (taskText === "completedTasks" || taskText.startsWith("firebase:")) continue;

            const row = document.createElement('tr');
            const numCell = document.createElement('td');
            const taskCell = document.createElement('td');
            const createdCell = document.createElement('td');
            const completedCell = document.createElement('td');

            numCell.textContent = i;
            taskCell.textContent = taskText;
            createdCell.textContent = taskData.timeCreate;
            completedCell.textContent = taskData.timeComplete || '';

            row.appendChild(numCell);
            row.appendChild(taskCell);
            row.appendChild(createdCell);
            row.appendChild(completedCell);
            taskTable.appendChild(row);
        }
    }

    if (isContactPage) {
        emailjs.init("AnvbEdFjcPYihTRYP"); 

        const form = document.getElementById('contactForm');
        const sendCheckbox = document.getElementById('send-check');

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            if (sendCheckbox.checked) {
                const templateParams = {
                    full_name: document.getElementById('Name').value,
                    gender: document.querySelector('input[name="fav_language"]:checked') ? document.querySelector('input[name="fav_language"]:checked').value : '',
                    email: document.getElementById('exampleFormControlInput1').value,
                    subject: document.getElementById('contact-select').value,
                    message: document.getElementById('exampleFormControlTextarea1').value,
                };

                emailjs.send('service_dfn04uz', 'template_bqtj9r5', templateParams)
                    .then(response => {
                        alert('Email sent successfully!');
                    })
                    .catch(error => {
                        console.error('Email send error:', error);
                        alert('Failed to send email. Please try again.');
                    });
            } 
            else {
                form.reset()         
            }

        });
       
    }
    if(isLoginPage){
    const signupBtn = document.getElementById("signup-btn");
    
    signupBtn.addEventListener('click', createAcount);

    function createAcount(){
        //clears local storage
        Object.keys(localStorage).forEach((taskText) => {
            if (taskText !== "completedTasks" && !taskText.startsWith("firebase:")) {
                localStorage.removeItem(taskText);
            }
        });
    
        const name = document.getElementById("name").value
        const pass = document.getElementById("password_s").value
        const email = document.getElementById("email_s").value
        const age = document.getElementById("age").value
        const person = document.getElementById("person_type").value
        //error check
        firebase.auth().createUserWithEmailAndPassword(email, pass)
            .then((userCredential) => {
                // Signed in 
                var user = userCredential.user;
                
                console.log(user.uid)
                const tempUser = {name:name, email:email, age:age, person:person, uid:user.uid, completedTasks: 0}
                firebase.database().ref("users/"+user.uid).set(tempUser)

            })
            .catch((error) => {
                var errorMessage = error.message;
                console.log(errorMessage)
            });
     }


     const loginBtn = document.getElementById("login-btn");

     loginBtn.addEventListener("click", () => {
       const email = document.getElementById("email").value;
       const password = document.getElementById("password").value;
     
       firebase.auth().signInWithEmailAndPassword(email, password)
         .then((userCredential) => {
            
            const user = userCredential.user
            console.log("User logged in: ", user.email);
            //clears local storage
            Object.keys(localStorage).forEach((taskText) => {
                if (taskText !== "completedTasks" && !taskText.startsWith("firebase:")) {
                    localStorage.removeItem(taskText);
                }
            });
            
            firebase.database().ref("users/" + user.uid + "/tasks").get()
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const tasks = snapshot.val();
                  
                  // Save each task to localStorage
                  Object.keys(tasks).forEach((taskKey) => {
                    localStorage.setItem(taskKey, JSON.stringify(tasks[taskKey]));
                  });
      
                  console.log("Tasks synchronized with localStorage.");
                } else {
                  console.log("No tasks found for the user.");
                }
              })
              .catch((error) => {
                console.error("Error fetching tasks: ", error);
              });
          })
          .catch((error) => {
            console.error("Login error: ", error);
          });
      });
     
    }
    });
    
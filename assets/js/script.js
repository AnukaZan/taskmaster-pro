var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


//Clicking on p element turns it into a textarea
$(".list-group").on("click", "p", function(){
  var text=$(this)
    .text() //save the current element's inner text content
    .trim(); //remove extra white pace

  var textInput = $("<textarea>") //create a new <textarea> element - <> means create
  //but $("textarea") tells jQuery to find all existing <textarea> elements - basically as a selector
    .addClass("form-control")  //add the class "form-control"
    .val(text); //get current value of first element in set of matched elements

  $(this).replaceWith(textInput)  

  textInput.trigger("focus"); //when textInput is triggered, highlight element
});

$(".list-group").on("blur", "textarea", function(){ // when user interacts with somethin gother than textarea
  //get the textarea's current value/text
  var text=$(this)
    .text()
    .trim(); //save the text in the element as"text"

  //get parent ul's id attribute
  var status = $(this) //why is this an array
    .closest(".list-group") //get first .list-group element by travelling up the ancestors
    .attr("id") //returns the ID
    .replace("list-", "");  //remove "list-" from text which gives us the category name (ex "toDo") which matches one of the array (ex tasks.toDo)

  //get the task's position in the list of other li elements  
  var index = $(this)
    .closest(".list-group-item") //get first .list-group-item (task item) by travelling up ancestors
    .index(); //returns index position

  //example output:  text="walk"; status="toDo"; index: 0;  

  tasks[status][index].text = text; //returns the text property of object at given index ex tasks.toDo.[0]
  saveTasks();

  //recreate p element
  var taskP = $("<p>") //create new p element as taskP
    .addClass("m-1")
    .text(text);

  //replace textarea with p element
  $(this).replaceWith(taskP);
});

//DUE DATE WAS CLICKED (span within .list-group)
$(".list-group").on("click", "span", function(){
  //get current text
  var date = $(this)
    .text()
    .trim();

  //create new input element
  var dateInput = $("<input>") //create input element
    .attr("type", "text")  //set type="text"
    .addClass("form-control")
    .val(date); //returns input value of date

  //swap out elements  
  $(this).replaceWith(dateInput); //turn the due dates into text inputs when clicked

  //when triggered, focus on new element
  dateInput.trigger("focus");
});

//VALUE OF DUE DATE WAS CHANGED 
$(".list-group").on("blur", "input[type='text']", function(){ //when you click on anything other than input
  //get current text
  var date = $(this)
    .val()  //returns values of form inputs, select, textarea
    .trim();

  //  get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group") //parent's ul
    .attr("id") //get id
    .replace("list-", ""); 

  // get the task's position in the list of other li elements
  var index =  $(this)
    .closest(".list-group-item") 
    .index(); //get index number
    
  //update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks;

  //revert back by recreating new span element with bootstrap classes
  var taskSpan = $("<span>") //new element
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);

});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();



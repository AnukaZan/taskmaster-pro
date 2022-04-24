var tasks = {};

var auditTask = function(taskEl) {
  //get date from task element
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();
  
  //convert to moment object at 5pm (17:00)
  var time = moment(date, "L").set("hour", 17);

  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");//in case we're updating overdue task

  //apply new class if task is near/over due date
  if (moment().isAfter(time)){ //if today is after task time
    $(taskEl).addClass("list-group-item-danger");
  }

  else if (Math.abs(moment().diff(time, "days")) <=2){ //if day difference is more than 2 days (in absolute numbers)
    $(taskEl).addClass("list-group-item-warning");
  }

};


//DRAG FUNCTION
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll:false,
  tolerance: "pointer",
  helper: "clone", //create a copy of dragged element and move copy instead of OG
  activate: function(event){ //triggers as soon as dragging starts and stops
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
    console.log("activate", this);
  },
  deactivate: function(event){//triggers as soon as dragging starts and stops
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
    console.log("deactivate", this);
  },
  over: function(event){ //triggers when a dragged item enters or leaves a connected list
    $(event.target).addClass("dropover-active");
    $(".bottom-trash").addClass("bottom-trash-active");
    console.log("over", event.target);
  },
  out: function(event){ //triggers when a dragged item enters or leaves a connected list
    $(event.target).addClass("dropover-active");
    $(".bottom-trash").addClass("bottom-trash-active");
    console.log("out", event.target);
  },
  update: function(event){ //triggers when the contents of a list has changes (reorder, remove, add)
    //array to store the task data in
    var tempArr =[];
   
    //loop over current set of children in sortable list
    $(this).children().each(function(){
      var text=$(this)
        .find("p") //extract the text from li
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();
        
      //add task data to the temp array as an object
      tempArr.push({
        text:text,
        data:date
      });
    });

    //trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    //update array on tasks object and save
    tasks[arrName]=tempArr;
    saveTasks();  

    console.log(tempArr);  
  }

});

$("#modalDueDate").datepicker({
  minDate: 1 //limit is until tomorrow
});


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

  auditTask(taskLi);

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
$(".list-group").on("click", "span", function(){ //any span element in list group
  //get current text
  var date = $(this)
    .text()
    .trim();

  //create new input element (the date input area)
  var dateInput = $("<input>") //create input element
    .attr("type", "text")  //set type="text"
    .addClass("form-control")
    .val(date); //returns input value of date

  //swap out elements  
  $(this).replaceWith(dateInput); //turn the due dates into text inputs when clicked


  //enable jquery ui datepicker
  dateInput.datepicker({ //turn dateInput input area into calendar
    minDate:1,
    onClose: function(){
      //when calendar closes, force a change event on dateInput
      $(this).trigger("change");
    }
  });

  //when triggered, focus on new element
  dateInput.trigger("focus");
});

//VALUE OF DUE DATE WAS CHANGED 
$(".list-group").on("change", "input[type='text']", function(){ //when you dateinput is changed
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

  //Pass task's li element into auditTask to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));

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
$("#task-form-modal .btn-save").click(function() {
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


//delete a task
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui){
    console.log("drop");
    ui.draggable.remove(); //remove jquery object representing draggable element
  },
  over: function(event, ui){
    console.log("over");
  },
  out: function(event, ui){
    console.log("out");
  }
});

setInterval(function(){
  $(".card .list-group-item").each(function(index, el){ //loop every task with .list-group-item & express it as el
    auditTask(el);
  });
}, (1000 * 60) * 30);
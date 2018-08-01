"use strict";

//REFERENCE:
//https://code.lengstorf.com/get-form-values-as-json/

//LAYOUT:
//Have a fixed tab system on the top of the page that scrolls you down to whatever part of the form you need
//MOU
//RFR
//Service Selection
//Editable Cart
//Grand Total
//Signature block

$(function() {
  
  /**Hides and shows the Human Subjects Research Id whether or not the Human subjects research input is selected "Yes" */
  $("#Human_Subjects_Id_Div").hide();
  $("#Human_Subjects_Research").change(function(){
    var id = $(this).find("option:selected").attr("id");
    switch (id){
      case "Human_Subjects_Yes":
       $("#Human_Subjects_Id_Div").show(); 
      break;
    }
  });

  /**Hides and shows the IACUC Protocol Number whether or not the Vertebrate Animals input is selected "Yes" */
  $("#Animal_Research_Id_Div").hide();
  $("#Animal_Research").change(function(){
    var id = $(this).find("option:selected").attr("id");
    switch (id){
      case "Animal_Research_Yes":
       $("#Animal_Research_Id_Div").show(); 
      break;
    }
  });

  /**Uses the "chosen" plugin for jquery to make a multiselect input type*/
  $(".multiselect").chosen();

  /**Makes the general html single select look nicer by using the "chosen" plugin for jquery*/
  $(".select-options").chosen({
    disable_search_threshold: 10,
    width: "35%"
  });

  /**Shows a calender to pick a date for all input boxes with the class name "datepicker"*/
  $(".datepicker").datepicker({
    'setDate': new Date(),
    showOn: "button",
    buttonImage:
      "images/calendar.gif",
    buttonImageOnly: true
  });
  
  /**Accepts input in a very specific manner */
  $(".datepicker").mask("99/99/9999");
  
   /**Makes the general html single select look nicer by using the "chosen" plugin for jquery (Same as select-options but with a larger width and a search box)*/
  $(".select-options-personnel-main").chosen({
    width: "150px"
  });
  
  /**Hides the template row so it is not possible for the user to delete it in order to clone it when needed*/
  $(".template").hide();
  
  /**Hides the form summary div so I can show it after someone clicks on the summary button*/
  $(".results").hide();
});

/**Dynamically adds rows to the table when the user clicks on the plus button*/
function addRow(){
  var newRow = $(".template").clone();
  newRow.appendTo( ".personnel_table" );
  var rowNumber = newRow.index()-1; /**Subtract 1 to subtract the header row*/
  var className = "clone-".concat(rowNumber);
  
  changeValues(newRow, rowNumber);
  
  newRow.addClass(className); 
  newRow.removeClass("template");
  /**Makes the general html single select box look nicer by using the "chosen" plugin for jquery (Same as select-options but with a larger width and a search box)*/
  newRow.find(".select-options-personnel").chosen({
    width: "150px"
  });
  newRow.show();
}

/**Changes the values of the table components so it is in accordance with the row number in order to convert it to json easily*/
function changeValues(newRow, rowNumber){
  var val;
  var newVal;
  var i;
  
  //change values for the select box in the second column
  var numOptions = newRow.find(".select-options-personnel option").length; 
  for(i=1; i<numOptions; i++){
    val = newRow.find(".select-options-personnel option").eq(i).attr("value");
    newVal = val.concat("-".concat(rowNumber));
    newRow.find(".select-options-personnel option").eq(i).val(newVal);
  }
  
  //change names for the input boxes and the headings
  numOptions = newRow.find(".contact-form__input--text").length;
  for(i=0; i<numOptions; i++){
    val = newRow.find(".contact-form__input--text").eq(i).attr("name");
    newVal = val.concat("-".concat(rowNumber));
    val = newRow.find(".contact-form__input--text").eq(i).attr("name", newVal);
  }
  
  //change name of the first heading ("Role") based on the row number
  numOptions = newRow.find(".select-options-personnel").length;
  for(i=0; i<numOptions; i++){
    val = newRow.find(".select-options-personnel").eq(i).attr("name");
    newVal = val.concat("-".concat(rowNumber));
    val = newRow.find(".select-options-personnel").eq(i).attr("name", newVal);
  }
  
}

//function to delete row from the personnel table when needed
function deleteRow(event){
  $(event).closest("tr").remove();
}

//show the form summary div
function showResults(){
  $(".results").show();
}

/**
 * Checks that an element has a non-empty `name` and `value` property.
 * @param  {Element} element  the element to check
 * @return {Bool}             true if the element is an input, false if not
 */
var isValidElement = function isValidElement(element) {
  return element.name && element.value;
};

/**
 * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the value should be added, false if not
 */
var isValidValue = function isValidValue(element) {
  return !["checkbox", "radio"].includes(element.type) || element.checked;
};

/**
 * Checks if an input is a checkbox, because checkboxes allow multiple values.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a checkbox, false if not
 */
var isCheckbox = function isCheckbox(element) {
  return element.type === "checkbox";
};

/**
 * Checks if an input is a `select` with the `multiple` attribute.
 * @param  {Element} element  the element to check
 * @return {Boolean} true if the element is a multiselect, false if not
 */
var isMultiSelect = function isMultiSelect(element) {
  return element.options && element.multiple;
};

/**
 * Retrieves the selected options from a multi-select as an array.
 * @param  {HTMLOptionsCollection} options  the options for the select
 * @return {Array}                          an array of selected option values
 */
var getSelectValues = function getSelectValues(options) {
  return [].reduce.call(
    options,
    function(values, option) {
      return option.selected ? values.concat(option.value) : values;
    },
    []
  );
};

/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
var formToJSON = function formToJSON(elements) {
  return [].reduce.call(
    elements,
    function(data, element) {
      // Make sure the element has the required properties and should be added.
      if (isValidElement(element) && isValidValue(element)) {
        /*
       * Some fields allow for more than one value, so we need to check if this
       * is one of those fields and, if so, store the values as an array.
       */
        if (isCheckbox(element)) {
          data[element.name] = (data[element.name] || []).concat(element.value);
        } else if (isMultiSelect(element)) {
          data[element.name] = getSelectValues(element);
        } else {
          data[element.name] = element.value;
        }
      }
      
      console.log(data);

      return data;
    },
    {}
  );
};

/**
 * A handler function to prevent default submission and run our custom script.
 * @param  {Event} event  the submit event triggered by the user
 * @return {void}
 */
var handleFormSubmit = function handleFormSubmit(event) {
   
  // Stop the form from submitting since we’re handling that with AJAX.
  event.preventDefault();

  // Call our function to get the form data.
  var data = formToJSON(form.elements);

  // Demo only: print the form data onscreen as a formatted JSON object.
  var dataContainer = document.getElementsByClassName("results__display")[0];

  // Use `JSON.stringify()` to make the output valid, human-readable JSON.
  dataContainer.textContent = JSON.stringify(data, null, "  ");

  // ...this is where we’d actually do something with the form data...
};

/*
 * This is where things actually get started. We find the form element using
 * its class name, then attach the `handleFormSubmit()` function to the 
 * `submit` event.
 */
var form = document.getElementsByClassName("contact-form")[0];
form.addEventListener("submit", handleFormSubmit);
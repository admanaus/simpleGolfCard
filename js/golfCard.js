var nearbyCourses = {};
var selectedCourse = {};
var teeSelection = 0; //indicates tee position in tee array
var holesSelection = 0; //must be 0 = 18 holes, 1 = front 9, 2 = back 9
var players = [ {name: "player 1", score: [] }, {name: "player 2", score: [] } ]

$('#nearbyCoursesButton').hide();
$('#availableTeesButton').hide();
$('#courseInfo').hide();
$('#scoreCard').hide();
$('#availableHolesButton').hide();

getUserLocation().then(getNearbyCourses).then(createCoursesMenu);


function getUserLocation(){
    return new Promise(executor);
    function executor(resolve, reject){
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function (position){
                    resolve(position);
                },
                function(error){
                    reject(error);
                });

        } else {
            reject({message: 'no geolocation avalible'});
        }
    }
}

function getNearbyCourses(userPosition){
    var latitude = userPosition.coords.latitude;
    var longitude = userPosition.coords.longitude;
    var radius = 50; //in kilometers
    //get nearby courses object
    return new Promise(execute);

    function execute(resolve, reject){
        var httpRequest = new XMLHttpRequest();

        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == XMLHttpRequest.DONE && httpRequest.status == 200){
                var data = JSON.parse(httpRequest.responseText);
                nearbyCourses = data;
                console.log(nearbyCourses);
                resolve(nearbyCourses);
            }
        };

        httpRequest.open("POST", "http://golf-courses-api.herokuapp.com/courses/", true);
        httpRequest.setRequestHeader("Content-Type", "application/json");
        var body = {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius
        };

        httpRequest.send(JSON.stringify(body));
    }
}

function createCoursesMenu(courses){
    //delete loading icon
    $('#findingLocation').remove();
    //populate dropdown
    courses.courses.forEach(function(course){
        $('#coursesDropdown').append("<li><a class='dropdown-item' onclick='getSelectedCourse("+course.id+")'>" + course.name + "</a></li>")
    });
    $('#nearbyCoursesButton').show();
}

function getSelectedCourse(courseID){

    return new Promise(execute);

    function execute(resolve, reject){
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == XMLHttpRequest.DONE && httpRequest.status == 200){
                selectedCourse = JSON.parse(httpRequest.responseText);
                var name = selectedCourse.course.name;
                showCourseInfo(selectedCourse);
                //empty courses menu
                $('#courseDropdownMenuButton').empty();
                $('#courseDropdownMenuButton').append(selectedCourse.course.name + " <span class='caret'></span>");
                //reset tee menu if a different course is selected
                $('#teesDropdownMenuButton').empty();
                $('#teesDropdownMenuButton').append("Select Tee Type <span class='caret'></span>");
                createTeeMenu(selectedCourse);
                createHoleMenu(selectedCourse);
                $('#courseInfo').show();
                resolve(selectedCourse);
            }
        };
        httpRequest.open("GET", "https://golf-courses-api.herokuapp.com/courses/" + courseID , true);
        httpRequest.send();
    }
}

function createTeeMenu(selectedCourse){
    console.log(selectedCourse);
    //clear tee menu
    $('#teesDropdown').empty();
    //populate tee menu
    var teeBoxesArray = selectedCourse.course.holes[0].tee_boxes;
    teeBoxesArray.forEach(function(tee, index){
        if(index < teeBoxesArray.length - 1){ //ignore the last element in the array
            $('#teesDropdown').append("<li><a class='dropdown-item' onclick='chosenTee(" + index + ")' >" + tee.tee_type + "</a></li>");
        }
    });
    $('#availableTeesButton').show();
    //onclick generateCard(selectedCourse, teeSelection, playersArray)
}
function chosenTee(teeIndex){
    var teeName = selectedCourse.course.holes[0].tee_boxes[teeIndex].tee_type;
    teeSelection = teeIndex; //set global teeSelection variable to the selected tee
    $('#teesDropdownMenuButton').empty();
    $('#teesDropdownMenuButton').append(teeName + " <span class='caret'></span>");
    //populate yardage to card
}
function createHoleMenu(selectedCourse){
    $('#availableHolesButton').show();
    $('#holesDropdownMenuButton').empty();
    $('#holesDropdownMenuButton').append("Select Holes <span class='caret'></span>");
    //clear hole menu
    $('#holesDropdown').empty();
    //populate hole menu
    var holesQuantity = selectedCourse.course.holes.length;
    console.log(holesQuantity);
    if(holesQuantity <= 9){
        $('#back9').hide();
        //chosenHole input must be 0, 1, or 2 -- 0 = 18 holes, 1 = front 9, 2 = back 9
        $('#holesDropdown').empty();
        $('#holesDropdown').append("<li><a class='dropdown-item' onclick='chosenHole(1)' >Front 9</a></li>");
    } else {
        $('#holesDropdown').empty();
        $('#holesDropdown').append("<li><a class='dropdown-item' onclick='chosenHole(0)' >All 18</a></li>");
        $('#holesDropdown').append("<li><a class='dropdown-item' onclick='chosenHole(1)' >Front 9</a></li>");
        $('#holesDropdown').append("<li><a class='dropdown-item' onclick='chosenHole(2)' >Back 9</a></li>");
    }

    //onclick generateCard(selectedCourse, teeSelection, playersArray)
    //check to see the number of holes on course
    //populate menu
    //onclick generateCard(selectedCourse, teeSelection, playersArray)
}
function chosenHole(selection){
    // if(selection !== 0 || 1 || 2){selection = 0};
    if(selection == 0){
        console.log("18 Holes");
        $('#holesDropdownMenuButton').empty();
        $('#holesDropdownMenuButton').append("18 Holes <span class='caret'></span>");
    } else if(selection == 1){
        console.log("Front 9");
        $('#holesDropdownMenuButton').empty();
        $('#holesDropdownMenuButton').append("Front 9 <span class='caret'></span>");
    } else if(selection == 2){
        console.log("Back 9");
        $('#holesDropdownMenuButton').empty();
        $('#holesDropdownMenuButton').append("Back 9 <span class='caret'></span>");
    }
}
function showCourseInfo(selectedCourse){
    var name = selectedCourse.course.name;
    var latitude = selectedCourse.course.location.lat;
    var longitude = selectedCourse.course.location.lng;
    var zipcode = selectedCourse.course.zip_code.slice(0, 5); //this trims off the sub-zipcode for passing into weather API

    $('#courseName').empty();
    $('#courseName').append(name);

    generateMap(latitude, longitude, "courseMap");

    getWeather(zipcode).then(function (weather){
        var description = weather.weather[0].description;
        var temp = Math.floor(weather.main.temp) + "°F";
        $('#weatherDescription').empty();
        $('#weatherDescription').append("Currently, " + description + " and " + temp);
    });

    $('#courseInfo').show();
}

function generateMap(latitude, longitude, HTMLID){
    var map = new google.maps.Map(document.getElementById(HTMLID), {
        zoom: 14,
        center: {lat: latitude, lng: longitude},
        mapTypeId: 'terrain'
    });
    new google.maps.Marker({
        position: {lat: latitude, lng: longitude},
        map: map
    });
}

function getWeather(zipcode){
    return new Promise(execute);

    function execute(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                weather = JSON.parse(xhttp.responseText);
                resolve(weather);
            }
        };
        xhttp.open("GET", "http://api.openweathermap.org/data/2.5/weather?zip="+ zipcode +"&units=imperial&appid=cc8ef8e5c209d938ab3801daa42b5e31", true);
        xhttp.send();
    }
}

function addPlayer(){
    //add input box for new player
    //onclick (or whatever) generateCard(selectedCourse, teeSelection, playersArray)
    //push players array to local data
}

function generateCard(selectedCourse, teeSelection, players){


    //create card for each hole
        //hole title - "Hole 1"
        //par display
        //Tee: yards
        //map
        //enter score each player
            //onclick (or whatever) update players array, push to local data
}

function updateScore(currentHole, player, score){
    //update players array with score
    //push players array to local data
}




var nearbyCourses = {};
var selectedCourse = {};
var teeSelection = 0; //indicates tee position in tee array
var holesSelection = "18"; //can be changed to either "front" or "back"
var players = [ {name: "player 1", score: [] }, {name: "player 2", score: [] } ]

$('#nearbyCoursesButton').hide();
$('#availableTeesButton').hide();

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
                //empty courses menu
                $('#courseDropdownMenuButton').empty();
                $('#courseDropdownMenuButton').append(selectedCourse.course.name + " <span class='caret'></span>");
                //reset tee menu if a different course is selected
                $('#teesDropdownMenuButton').empty();
                $('#teesDropdownMenuButton').append("Select Tee Type <span class='caret'></span>");
                createTeeMenu(selectedCourse);
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

    //clear tee menu name
    $('#teesDropdownMenuButton').empty();
    $('#teesDropdownMenuButton').append(teeName + " <span class='caret'></span>");
    //populate yardage to card
}
function createHoleMenu(courseObject){
    //check to see the number of holes on course
    //populate menu
    //onclick generateCard(selectedCourse, teeSelection, playersArray)
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




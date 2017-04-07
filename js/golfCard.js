var nearbyCourses = {};
var selectedCourse = {};
var teeSelection = 0; //indicates tee position in tee array
var holesSelection = 1; //must be 0 = 18 holes, 1 = front 9, 2 = back 9 !!Default should be 1!!
var quantityPlayers = 1;
var players = [];
var scores = [];

$('#nearbyCoursesButton').hide();
$('#availableTeesButton').hide();
$('#availableHolesButton').hide();
$('#courseInfo').hide();
$('#playerInfo').hide();


//!!!!! Change this back!

getNearbyCourses().then(createCoursesMenu);

// getUserLocation().then(getNearbyCourses).then(createCoursesMenu);
//!!!!!!!


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

    /////////!!!!!!  Change this!!
    var latitude = 40.1645914;
    var longitude = -111.6477293;

    // var latitude = userPosition.coords.latitude;
    // var longitude = userPosition.coords.longitude;

    ///!!!!!!!!


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

    $("#scoreCard").empty();
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
    holesSelection = selection; // pass value out to global variable
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

    $('#playerInfo').show();
}
function showCourseInfo(selectedCourse){
    var name = selectedCourse.course.name;
    var latitude = selectedCourse.course.location.lat;
    var longitude = selectedCourse.course.location.lng;
    var zipcode = selectedCourse.course.zip_code.slice(0, 5); //this trims off the sub-zipcode for passing into weather API

    $('#courseName').empty();
    $('#courseName').append(name);

    generateCourseMap(latitude, longitude, "courseMap");

    getWeather(zipcode).then(function (weather){
        var description = weather.weather[0].description;
        var temp = Math.floor(weather.main.temp) + "°F";
        $('#weatherDescription').empty();
        $('#weatherDescription').append("Currently, " + description + " and " + temp);
    });

    $('#courseInfo').show();
}

function generateCourseMap(latitude, longitude, HTMLID){
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

function generateHoleMap(hole) {

    return new Promise(execute);

    function execute(resolve, reject) {
        var teeLocation = selectedCourse.course.holes[hole - 1].tee_boxes[teeSelection].location;
        var greenLocation = selectedCourse.course.holes[hole - 1].green_location;
        var holeCenter = {lat:((teeLocation.lat + greenLocation.lat) / 2) , lng:((teeLocation.lng + greenLocation.lng) /2)};
        var HTMLID = "map" + hole;

        var map = new google.maps.Map(document.getElementById(HTMLID), {
            zoom: 16,
            center: {lat: holeCenter.lat, lng: holeCenter.lng},
            mapTypeId: 'satellite'
        });
        var tee = new google.maps.Marker({
            position: {lat: teeLocation.lat, lng: teeLocation.lng},
            map: map,
            //label: "tee",
            icon: {url: "images/fixedTee.png"}
        });
        var green = new google.maps.Marker({
            position: {lat: greenLocation.lat, lng: greenLocation.lng},
            map: map,
            //label: "green"
            icon: {url: "images/fixedFlag.png"}
        });
        resolve();
    }
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
    quantityPlayers++;
    players = [];
    $('#playersForm').append("<label for='nameField'>Player "+quantityPlayers+"</label><a href='#' onclick='removePlayer("+quantityPlayers+")' class='close' data-dismiss='alert' aria-label='close' title='close'>×</a> <input type='name' class='form-control' id='"+quantityPlayers+"'  placeholder='Arnold Palmer'>");
}
function savePlayerNames(){
    players = [];
    for (var i = 1; i <= quantityPlayers + 15; i++) {
        var name = $('#'+i).val();
        if (name){
            if (players.includes(name)){
                $('#playersForm').append('<div class="alert alert-warning fade in alert-dismissable" id="playerAlert"><a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">×</a><strong>Please remove duplicate names</strong></div>');
                players = [];
                setTimeout(function (){ $("#playerAlert").remove() }, 2500);
            } else { players.push(name) }
        }
    }
    generateCard();
    addPlayersToCards();
    $("#playerInfo").hide();
}
function saveScores(){
    players.forEach(function (name) {
        var score = $("#"+name+"Hole1score").val();
        console.log(score);
        scores.push([name, score]);
    });
    console.log(scores);
}
function addPlayersToCards(){
    if (players){
        for (var i = 1; i < 19; i++) {
            $("#hole"+i).append(" <div class='row'> <div id='scoreNamesHole"+i+"'> </div> </div><div class='row'><div class=' ' id='saveButton'><button type='submit' class='btn btn-primary' onclick='saveScores()'>Save</button></div> </div> ");
        }
        for (var i = 1; i < 19; i++) {
            players.forEach(function (playerName) {
                $("#scoreNamesHole" + i).append("<div class='col-xs-6 col-sm-6 col-md-6'><label for='"+playerName+"Hole"+i+"score'>"+playerName+"</label><input class='form-control' type='number' value='1' id='"+playerName+"Hole"+i+"score'></div>");
            })
        }
    }
}
function removePlayer(player){
    players = [];
    quantityPlayers--;
    $("#"+player).prev().prev().remove();
    $("#"+player).prev().remove();
    $("#"+player).remove();
}

function generateCard(){
    var teeName = selectedCourse.course.holes[0].tee_boxes[teeSelection].tee_type;
    cardHTMLSkeleton();
    $('#scoreCard').show();
    for (var i = 1; i < 19; i++) {
        var HTMLID = "map" + i;
        $('#hole' + i).append("<div class='map' id='"+ HTMLID +"' ></div>");
        generateHoleMap(i);
    }

}

function cardHTMLSkeleton(){

    $('#scoreCard').empty();
    $('#scoreCard').append("<div id='front9'></div>");
    $('#scoreCard').append("<div id='back9'></div>");

    if (holesSelection == 1){
        frontNine();
    } else if (holesSelection == 2){
        backNine();
    } else {
        frontNine();
        backNine();
    }

    function frontNine(){
        for (var i = 1; i < 10; i++) {
            var yards = selectedCourse.course.holes[i - 1].tee_boxes[teeSelection].yards;
            var par = (selectedCourse.course.holes[i - 1].tee_boxes[teeSelection].par);
            $('#front9').append("<div class='col-sm-6 col-md-4' id='hole"+i+"'><h2>"+i+"</h2><div class='row'><div class='col-xs-6 col-sm-6 col-md-6'><h3>Par</h3><h3>"+par+"</h3></div><div class='col-xs-6 col-sm-6 col-md-6'><h3>Yards</h3><h3>"+yards+"</h3></div></div></div>");
        }
    }
    function backNine(){
        for (var i = 10; i < 19; i++){
            var yards = selectedCourse.course.holes[i - 1].tee_boxes[teeSelection].yards;
            var par = (selectedCourse.course.holes[i - 1].tee_boxes[teeSelection].par);
            $('#back9').append("<div class='col-sm-6 col-md-4' id='hole"+i+"'><h2>"+i+"</h2><div class='row'><div class='col-xs-6 col-sm-6 col-md-6'><h3>Par</h3><h3>"+par+"</h3></div><div class='col-xs-6 col-sm-6 col-md-6'><h3>Yards</h3><h3>"+yards+"</h3></div></div></div>");
        }
    }

}

function showHoleMap(hole) {
    var ID = "#map" + hole;

    $(ID).show();
    generateHoleMap(hole);
}

function updateScore(currentHole, player, score){
    //update players array with score
    //push players array to local data
}




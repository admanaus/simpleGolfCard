var nearbyCourses = {};
var selectedCourse = {};
var teeSelection = 0; //indicates tee position in tee array
var holesSelection = 1; //must be 0 = 18 holes, 1 = front 9, 2 = back 9 !!Default should be 1!!
var quantityPlayers = 1;
var players = [];
var playerCount = 1;
var selectedCoursePlayerData;
var currentGame = {};



$('#nearbyCoursesButton').hide();
$('#availableTeesButton').hide();
$('#availableHolesButton').hide();
$('#courseInfo').hide();
$('#playerInfo').hide();
function createSavedGamesMenu(){
    //clear tee menu
    $('#gamesDropdown').empty();
    for (var i = 0; i <= 100000; i++) {

        if (db.get(i)) {
            currentGame = db.get(i);
            var tempName = currentGame.course.course.name;
            var tempPlayerNames = "";
            currentGame.players.forEach(function (player) { tempPlayerNames = tempPlayerNames + player.name + " "; });

            $('#gamesDropdown').append("<li><a class='dropdown-item' onclick='loadGame(" + i + ")' >" + tempName + " ("+tempPlayerNames+")</a></li>");
        }

    }
}
createSavedGamesMenu();
function loadGame(gameID){
    currentGame = db.get(gameID);
    selectedCourse = currentGame.course;
    teeSelection = currentGame.tee;
    holesSelection = currentGame.holes;
    showCourseInfo(selectedCourse);
    generateCard();
    addSavedPlayersToCards();
    buildSummary();
}

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
        $('#holesDropdownMenuButton').empty();
        $('#holesDropdownMenuButton').append("18 Holes <span class='caret'></span>");
    } else if(selection == 1){
        $('#holesDropdownMenuButton').empty();
        $('#holesDropdownMenuButton').append("Front 9 <span class='caret'></span>");
    } else if(selection == 2){
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
        if ( $("#"+HTMLID) ){
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
        }
        resolve();
    }
}
function hideMaps(){ $(".map").toggle() }

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

    $('#playersForm').append("<label for='nameField'>Player "+quantityPlayers+"</label><a href='#' onclick='removePlayer("+quantityPlayers+")' class='close' data-dismiss='alert' aria-label='close' title='close'>×</a> <input type='name' class='form-control' id='"+quantityPlayers+"'  placeholder='Arnold Palmer'>");
}
function savePlayerNames(){
    players = [];


    for (var i = 1; i <= quantityPlayers + 15; i++) {
        var name = $('#'+i).val();
        if (name){ players.push(name) }
    }
    if(players.length > 0){
        generateCard();
        addPlayersToCards();
        generateCurrentGame();
        $("#playerInfo").hide();
    }

}
function Game(gameID) {
    this.gameID = gameID;
    this.course = {};
    this.players = [];
    this.tee = teeSelection;
    this.holes = holesSelection;
}
function Player(name) {
    this.name = name;
    this.score = [0];
}
function generateCurrentGame(){
    var gameID = Math.floor(Math.random() * 100000);
    currentGame = new Game(gameID);
    currentGame.course = selectedCourse;
    players.forEach(function (name) {
        currentGame.players.push( new Player(name) );
    });
}
function saveScores(){
    currentGame.tee = teeSelection;
    currentGame.holes = holesSelection;
    currentGame.players.forEach(function (player) {
        player.score = [];
        for (var i = 1; i < 19; i++) {
            var score = $("#"+player.name+"Hole"+i+"score").val();
            player.score.push(score);
        }
    });
    db.save(currentGame.gameID , currentGame);
    buildSummary();
}

function addPlayersToCards(){
    if (players){
        for (var i = 1; i < 19; i++) {
            $("#hole"+i).append(" <div class='row'> <div id='scoreNamesHole"+i+"'> </div> </div>");
        }
        for (var i = 1; i < 19; i++) {
            players.forEach(function (playerName) {
                $("#scoreNamesHole" + i).append("<div class='col-xs-6 col-sm-6 col-md-6'><label for='"+playerName+"Hole"+i+"score'>"+playerName+"</label><input oninput='saveScores()' class='form-control "+playerName+"Score ' type='number' value='0' id='"+playerName+"Hole"+i+"score'></div>");
            })
        }
    }
}
function addSavedPlayersToCards() {
    for (var i = 1; i < 19; i++) {
        $("#hole"+i).append(" <div class='row'> <div id='scoreNamesHole"+i+"'> </div> </div>");
    }
    for (var i = 1; i < 19; i++) {
        currentGame.players.forEach(function (player, index) {
            var playerName = player.name;
            var score = player.score[i-1];
            $("#scoreNamesHole" + i).append("<div class='col-xs-6 col-sm-6 col-md-6'><label for='"+playerName+"Hole"+i+"score'>"+playerName+"</label><input oninput='saveScores()' class='form-control "+playerName+"Score ' type='number' value='"+score+"' id='"+playerName+"Hole"+i+"score'></div>");
        })
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
    cardHTMLSkeleton();
    $('#scoreCard').show();
    if (holesSelection == 1) {
        for (var i = 1; i <= 9; i++) {
            var HTMLID = "map" + i;
            $('#hole' + i).append("<div class='map' id='"+ HTMLID +"' ></div>");
            generateHoleMap(i);
        }
    } else if (holesSelection == 2) {
        for (var i = 10; i <= 18; i++) {
            var HTMLID = "map" + i;
            $('#hole' + i).append("<div class='map' id='"+ HTMLID +"' ></div>");
            generateHoleMap(i);
        }
    } else {
        for (var i = 1; i <= 18; i++) {
            var HTMLID = "map" + i;
            $('#hole' + i).append("<div class='map' id='"+ HTMLID +"' ></div>");
            generateHoleMap(i);
        }
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
            $('#front9').append("<div class='col-sm-6 col-md-4 col-lg-3 card' id='hole"+i+"'><h2>"+i+"</h2><div class='row'><div class='col-xs-6 col-sm-6 col-md-6 parYards'><h3>Par</h3><h3>"+par+"</h3></div><div class='col-xs-6 col-sm-6 col-md-6 parYards'><h3>Yards</h3><h3>"+yards+"</h3></div></div></div>");
        }
    }
    function backNine(){
        for (var i = 10; i < 19; i++){
            var yards = selectedCourse.course.holes[i - 1].tee_boxes[teeSelection].yards;
            var par = (selectedCourse.course.holes[i - 1].tee_boxes[teeSelection].par);
            $('#back9').append("<div class='col-sm-6 col-md-4 col-lg-3 card' id='hole"+i+"'><h2>"+i+"</h2><div class='row'><div class='col-xs-6 col-sm-6 col-md-6 parYards'><h3>Par</h3><h3>"+par+"</h3></div><div class='col-xs-6 col-sm-6 col-md-6 parYards'><h3>Yards</h3><h3>"+yards+"</h3></div></div></div>");
        }
    }

}
function buildSummary() {
    summaryHTMLSkeleton();
    summaryInfo();
}
function summaryHTMLSkeleton(){
    $("#summary").empty();
    $("#summary").append("<div class='row'><table class='table'><thead><tr class = 'success'><th id = 'tableTee'> </th><th>Front 9</th><th>Back 9</th><th>Total</th></tr> </thead> <tbody id = 'summaryBody'> </tbody></table></div>");
}
function summaryInfo(){
    //add Tee name
    var tee = currentGame.tee;
    var teeName = currentGame.course.course.holes[0].tee_boxes[tee].tee_type;
    var front9Par = 0;
    var back9Par = 0;
    var all18Par = 0;
    $("#tableTee").append("Tee: " + teeName);

    // $("#summaryBody").append("<tr id='summaryPar'></tr>"); //add row for par

    for (var i = 0; i < 9; i++) { //Front 9 Par
        front9Par += currentGame.course.course.holes[i].tee_boxes[0].par;
    }
    for (var i = 9; i < 18; i++) { //Back 9 Par
        back9Par += currentGame.course.course.holes[i].tee_boxes[0].par;
    }
    all18Par = front9Par + back9Par;

    $("#summaryBody").append("<tr class='warning'><td>Par</td><td>"+front9Par+"</td><td>"+back9Par+"</td><td>"+all18Par+"</td></tr>")
    //add each player
    var players = currentGame.players;

    players.forEach(function (player, index) {
        var name = player.name;
        var front9 = 0;
        var back9 = 0;

        for (var i = 0; i < 9; i++) {

                front9 += parseInt(player.score[i]);

        }
        for (var i = 9; i < 18; i++) {
                back9 += parseInt(player.score[i]);

        }

        var all18 = front9 + back9;
        $("#summaryBody").append("<tr class='info'><td>"+name+"</td><td>"+front9+"</td><td>"+back9+"</td><td>"+all18+"</td></tr>");

        // if(front9 + back9 == false) {
        //     $("#summaryBody").append("<tr class='info'><td>"+name+"</td><td>0</td><td>0</td><td>0</td></tr>");
        // } else {
        //     $("#summaryBody").append("<tr class='info'><td>"+name+"</td><td>"+front9+"</td><td>"+back9+"</td><td>"+all18+"</td></tr>");
        // }


    });

    //add each player
    //add each player score
}






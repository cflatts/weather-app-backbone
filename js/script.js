var token = '24f2aa04159572709868a25ac5846300'
var rootUrl = 'https://api.forecast.io/forecast/'

var container = document.querySelector('#selectedWeather'),
    buttonsContainer = document.querySelector('.buttons')
    currentButton = document.querySelector('#current'),
    hourlyButton = document.querySelector('#hourly'),
    dailyButton = document.querySelector('#daily')

var STATE = {
    lat: null,
    lng: null
}



// CURRENT WEATHER SET UP

// var currentWeather = function(posObj) {
//     // var latitude = posObj.coords.latitude,
//     //     longitude = posObj.coords.longitude
//     var completeUrl = rootUrl + '/' + latitude + ',' + longitude,
//         currentPromise = $.getJSON(completeUrl)
//     currentPromise.then(currentHTML)
// }

var currentHTML = function(apiResponse){
    var formattedTime = new Date(apiResponse.currently.time).toLocaleTimeString()
    var htmlString = '<div class = "currentTempStyles">'
        htmlString += '<p>The temperature is now: </p>'
        htmlString +=   '<p>' + Math.round(apiResponse.currently.temperature) + '&deg; F</p>'
        htmlString +=   '<p> at: ' + formattedTime + '</p>'
        htmlString += '</div>'
    container.innerHTML = htmlString
}

// HOURLY WEATHER SET UP

// var hourlyWeather = function(posObj) {
//     var latitude = posObj.coords.latitude,
//         longitude = posObj.coords.longitude
//     var completeUrl = rootUrl + '/' + latitude + ',' + longitude,
//         hourlyPromise = $.getJSON(completeUrl)
//     hourlyPromise.then(hourlyHTML)
// }

var hourlyHTML = function(apiResponse) {
    var hourlyArray = apiResponse.hourly.data
    var completeHtmlString = ''
    for(var i = 0; i < 12; i++) {
        var singleHour = hourlyArray[i]
        completeHtmlString += singleHourHtml(singleHour)
    }
    container.innerHTML = completeHtmlString
}

var singleHourHtml = function(apiResponse){
    // console.log(apiResponse)
    var time = apiResponse.time
        time = time * 1000
    var d = new Date(time)
    var hours = (d.getHours() > 12) ? '0' + d.getHours() + ':00 PM': d.getHours() + ':00 AM'
    var htmlString = '<div class = "hourlyTempStyles">'
        htmlString +=   '<p>' + hours + ' hrs</p>'
        htmlString +=   '<p>' + Math.round(apiResponse.apparentTemperature) + '&deg; F</p>'
        htmlString +=   '<p>' + apiResponse.summary + '</p>'
        htmlString += '</div>'
    return htmlString
}

// DAILY WEATHER SET UP

// var dailyWeather = function(posObj) {
//     var latitude = posObj.coords.latitude,
//         longitude = posObj.coords.longitude
//     var completeUrl = rootUrl + '/' + latitude + ',' + longitude,
//         dailyPromise = $.getJSON(completeUrl)
//     dailyPromise.then(dailyHTML)
// }

var dailyHTML = function(apiResponse) {
    var daysArray = apiResponse.daily.data
    var completeHtmlString = ''
    for(var i = 0; i < daysArray.length; i++){
        var singleDay = daysArray[i]
        completeHtmlString += singleDayHTML(singleDay)
    }
    container.innerHTML = completeHtmlString
}

var singleDayHTML = function(apiResponse){
    var timeValue = apiResponse.time
    var presentDate = new Date(timeValue * 1000)
    var daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    var singleDay = daysOfTheWeek[presentDate.getDay()]
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    var singleMonth = months[presentDate.getMonth()]
    var date = presentDate.getDate()
    var dateString = singleDay + ', ' + singleMonth + ' ' + date
    var htmlString = '<div class = "dailyTempStyles">'
        htmlString +=   '<p>' + dateString + '</p>'
        htmlString +=   '<p>High ' + Math.round(apiResponse.apparentTemperatureMax) + '&deg; F</p>'
        htmlString +=   '<p>Low ' + Math.round(apiResponse.apparentTemperatureMin) + '&deg; F</p>'
        htmlString +=   '<p>' + apiResponse.summary + '</p>'
        htmlString += '</div>'
    return htmlString
}


// var viewChange = function(event) {
//     var buttonEl = event.target
//     window.location.hash =  buttonEl.value
// }


// var controller = function() {
//     var viewType = window.location.hash.substring(1)
//     if (viewType === 'current') {
//         navigator.geolocation.getCurrentPosition(currentWeather)
//     }
//     else if (viewType === 'daily') {
//         navigator.geolocation.getCurrentPosition(dailyWeather)
//     }
//     else {
//         navigator.geolocation.getCurrentPosition(hourlyWeather)
//     }
// }


// if (window.location.hash === '') window.location.hash = 'current'
// else controller()

var addEvtLists = function() {
    var switchViewTypes = function(eventObj) {
        buttonNode = eventObj.target
        viewType= buttonNode.value
        console.log(buttonNode)
        location.hash = STATE.lat + '/' + STATE.lng + '/' + viewType
        console.log(location.hash)
    }
    buttonsContainer.addEventListener('click', switchViewTypes)
}

var geolocate = function() {
    var success = function(posObj) {
        var lat = posObj.coords.latitude
        var lng = posObj.coords.longitude
        STATE.lat = lat
        STATE.lng = lng
        location.hash = lat + '/' + lng + '/current'
    }
    var error = function(positionError) {
        return 'Can not find location, please try again!'
    }
    navigator.geolocation.getCurrentPosition(success, error)
}

var WeatherModel = Backbone.Model.extend({
    url: function () {
        var fullUrl = rootUrl + token + '/' + this.lat + ',' + this.lng
        return fullUrl
    },
    initialize: function (inputLat, inputLng) {
        this.lat = inputLat
        this.lng = inputLng
    }
})

var WeatherRouter = Backbone.Router.extend({
    routes: {
        ':lat/:lng/current': 'showCurrent',
        ':lat/:lng/hourly': 'showHourly',
        ':lat/:lng/daily':'showDaily',
        '*anything':'geolocate'
    },
    geolocate: function() {
        geolocate()

    },
    showCurrent: function(lat, lng) {
        STATE.lat = lat
        STATE.lng = lng

        var weatherModel = new WeatherModel(lat, lng)
        weatherModel.fetch().then(currentHTML)
    },
    showHourly: function(lat, lng) {
        STATE.lat = lat
        STATE.lng = lng

        var weatherModel = new WeatherModel(lat, lng)
        weatherModel.fetch().then(hourlyHTML)

    },
    showDaily: function(lat, lng) {
        STATE.lat = lat
        STATE.lng = lng

        var weatherModel = new WeatherModel(lat, lng)
        weatherModel.fetch().then(dailyHTML)
    }
})

var rtr = new WeatherRouter()
Backbone.history.start()

addEvtLists()

// // window.addEventListener('hashchange', controller)
// currentButton.addEventListener('click', viewChange)
// dailyButton.addEventListener('click', viewChange)
// hourlyButton.addEventListener('click', viewChange)

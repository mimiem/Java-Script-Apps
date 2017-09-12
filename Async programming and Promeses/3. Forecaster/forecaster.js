function attachEvents() {
    $("#submit").click(display);
    const baseUrl ='https://judgetests.firebaseio.com/';

    function display() {
        let townName = $('#location').val();
        request('locations.json')
            .then(getTownCode)
            .catch(displayError);

        function getTownCode(data) {
            let townCode;

            for (let town of data) {
                if (townName === town.name){
                    townCode = town.code;
                }
            }

            if (!townCode){
                displayError();
            }

            let today = request(`forecast/today/${townCode}.json`);
            let upcoming = request(`forecast/upcoming/${townCode}.json`);

            Promise.all([today, upcoming])
                .then(displayInfo)
                .catch(displayError);
        }
    }

    function displayInfo([today, upcoming]) {
        $("#forecast").css("display", "block");
        displayCurrent(today);
        displayUpcoming(upcoming);
    }

    function displayCurrent(today) {
        let current = $("#current");
        current.find('span').remove();

        let conditionSpanSymbol = $('<span>').addClass('condition symbol');
        let low = today.forecast.low;
        let high = today.forecast.high;

        let condition = today.forecast.condition;
        conditionSpanSymbol.html(getCondition(condition));
        let conditionSpan = $('<span>').addClass('condition');

        conditionSpan.append($(`<span class="forecast-data">${today.name}</span>`));
        conditionSpan.append($(`<span class="forecast-data">${low}&#176;/${high}&#176;</span>`));
        conditionSpan.append($(`<span class="forecast-data">${condition}</span>`));
        current.append(conditionSpanSymbol);
        current.append(conditionSpan);
    }

    function displayUpcoming(upcoming) {
        let forecast = $("#upcoming");
        forecast.find('span').remove();

        for (let day of upcoming.forecast) {
            let span = $('<span>').addClass('upcoming');
            let dayCondition = day.condition;
            span.append($(`<span class="symbol">${getCondition(dayCondition)}</span>`));
            span.append($(`<span class="forecast-data">${day.low}&#176;/${day.high}&#176;</span>`));
            span.append($(`<span class="forecast-data">${dayCondition}</span>`));
            forecast.append(span);
        }
    }

    function displayError(err) {
        $("#current").find('span').remove();
        $("#upcoming").find('span').remove();

        $("#forecast").append($(`<span>Error: ${err}</span>`));
    }

    function getCondition(condition) {
        switch (condition){
            case 'Sunny': return '&#x2600';
            case 'Partly sunny': return '&#x26C5;';
            case 'Overcast': return '&#x2601;';
            case 'Rain': return '&#x2614;';
        }
    }

    function request(endUrl) {
        return $.ajax({
            url: baseUrl + endUrl,
        });
    }
}
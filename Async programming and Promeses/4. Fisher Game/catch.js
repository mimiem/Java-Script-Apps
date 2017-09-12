function attachEvents() {
    $(".load").click(displayAllCatches);
    $(".update").click(updateCatch);
    $(".delete").click(deleteCatch);
    $(".add").click(addCatch);

    const baseUrl = 'https://baas.kinvey.com/appdata/kid_BkJgwm08-/biggestCatches';
    const username = 'peter';
    const password = 'p';

    function displayAllCatches() {
        request("", "GET")
            .then(displayAll);
        
        function displayAll(data) {
            let catches = $("#catches");
            catches.empty();

            for (let cat of data) {
                let catchDiv = $(`<div class="catch" data-id="${cat._id}">`);
                catchDiv.append($("<label>Angler</label>"))
                    .append($(`<input type="text" class="angler" value="${cat.angler}"/>`))
                    .append($("<label>Weight</label>"))
                    .append($(`<input type="number" class="weight" value="${cat.weight}"/>`))
                    .append($("<label>Species</label>"))
                    .append($(`<input type="text" class="species" value="${cat.species}"/>`))
                    .append($("<label>Location</label>"))
                    .append($(`<input type="text" class="location" value="${cat.location}"/>`))
                    .append($("<label>Bait</label>"))
                    .append($(`<input type="text" class="bait" value="${cat.bait}"/>`))
                    .append($("<label>Capture Time</label>"))
                    .append($(`<input type="number" class="captureTime" value="${cat.captureTime}"/>`))
                    .append($('<button class="update">Update</button>').click(updateCatch))
                    .append($('<button class="delete">Delete</button>').click(deleteCatch));

                catches.append(catchDiv);
            }
        }
    }

    function updateCatch() {
        let element = $(this).parent();
        let elementId = $(this).parent().attr('data-id');
        let data = createDataObject(element);
        request(`/${elementId}`,"PUT", data)
            .then(displayAllCatches);
    }

    function deleteCatch() {
        let elementId = $(this).parent().attr('data-id');
        console.log(elementId);
        request(`/${elementId}`, "DELETE")
            .then(displayAllCatches);
    }

    function addCatch() {
        let addForm = $("#addForm");
        let data = createDataObject(addForm);

        request("", "POST", data)
            .then(displayAllCatches);
    }

    function createDataObject(id) {
        let angler = id.find('input.angler').val();
        let weight = id.find('input.weight').val();
        let species = id.find('input.species').val();
        let location = id.find('input.location').val();
        let bait = id.find('input.bait').val();
        let captureTime = id.find('input.captureTime').val();

        let data = {
            angler: angler,
            weight: +weight,
            species: species,
            location: location,
            bait: bait,
            captureTime: +captureTime
        };

        return data;
    }

    function request(endUrl, method, data) {
        return $.ajax({
            url: baseUrl + endUrl,
            method: method,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-type': 'application/json'
            },
            data: JSON.stringify(data)
        });
    }
}
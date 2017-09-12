let result = (function solve() {
    let currentId = 'depot';
    let oldName = '';
    let info = $("#info span");
    let departBtn = $("#depart");
    let arriveBtn =$("#arrive");

    function depart(){
        let request = {
            url: `https://judgetests.firebaseio.com/schedule/${currentId}.json`,
            method: "GET",
            success: display,
            error: displayError
        };
        departBtn.prop("disabled", true);
        arriveBtn.prop("disabled", false);

        $.ajax(request);

    }

    function arrive() {
        departBtn.prop("disabled", false);
        arriveBtn.prop("disabled", true);

        info.text(`Arriving at ${oldName}`);
    }

    function display(data) {
        let name = data.name;
        currentId = data.next;
        info.text(`Next stop ${name}`);
        oldName = name;
    }

    function displayError(err) {
        departBtn.prop("disabled", true);
        arriveBtn.prop("disabled", true);

        info.text("Error");
    }

    return {
        depart,
        arrive
    };
})();

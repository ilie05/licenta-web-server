$(document).ready(function () {
    let domainNames = $('#domain_name').on('change', function () {
        let optionSelected = $("option:selected", this);
        console.log(optionSelected.val());

        $.ajax({
            url: '/getDomain',
            data: JSON.stringify({domain_name: optionSelected.val()}),
            method: 'POST',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',

            success: function (data) {
                console.log("Ajax response success function!");
                createDomainContent(data);
                //window.document.write(data);
                //window.history.pushState("data", "Inserted", '/inserted');
            },
            error: function (data) {
                console.log("Ajax response error function!!!");
                console.log(data.status);
                //window.document.write(data.responseText)
            }
        });
    });
});

function createDomainContent(data) {

}
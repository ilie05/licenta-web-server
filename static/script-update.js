counterNsRecords = 1;

$(document).ready(function () {
    
    $('#domain_name').on('change', function () {
        let optionSelected = $("option:selected", this);

        $.ajax({
            url: '/getDomain',
            data: JSON.stringify({domain_name: optionSelected.val()}),
            method: 'POST',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',

            success: function (data) {
                //  console.log("Ajax response success function!");
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
    data = JSON.parse(data);

    let ns_records = data.ns_records;
    let ns_record_wrapper = $('.ns_record_wrapper');

    let content;

    ns_records.forEach((record, index) => {
        content = `
		  	<div class='ns_record form-inline'>
				<input type="text" name="ns${counterNsRecords}" id="ns${counterNsRecords}" placeholder="Name server..." 
				    class="form-control" value="${record.ns}"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
		        <select name="ns_ip_addr_type${counterNsRecords}" id="ns_ip_addr_type${counterNsRecords}" class="form-control">
		        	<option disabled selected value="">Ip record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="ns_ip${counterNsRecords}" id="ns_ip${counterNsRecords}" 
				    placeholder="Ip address..." class="form-control" value="${record.ns_ip}">					
				<input type="number" name="ns_ttl${counterNsRecords}" id="ns_ttl${counterNsRecords}" value="${record.ns_ttl}"
				    placeholder="Time to live..." min="0" max="1209600" class="form-control">
			    <button class="btn btn-danger btn-del" type="button" id="btn-dlt">delete</button>
                <button class="btn btn-primary btn-edit" type="button" id="btn-edit">edit</button>
		  	</div>`;
        ns_record_wrapper.append(content);
        counterNsRecords++;
    });
    $(".ns_record :input").attr("disabled", true);
    $("button").attr("disabled", false);
    $('.btn-del').click(function () {
        $(this).parent('div').remove();
    });
    $('#btn-edit').click(function () {
        $(this).parent("div").find(':input').attr("disabled", false);
    });
}
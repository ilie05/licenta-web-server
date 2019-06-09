let counterNsRecords = 1;
let counterHostRecords = 1;
let counterMailRecords = 1;
let enableAddButtons = false;

$(document).ready(function () {

    $('#domain_name_select').on('change', function () {
        let optionSelected = $("option:selected", this);
        emptyPage();

        $.ajax({
            url: '/getDomain',
            data: JSON.stringify({domain_name: optionSelected.val()}),
            method: 'POST',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',

            success: function (data) {
                //  console.log("Ajax response success function!");
                createDomainContent(data);

                if(!enableAddButtons) {
                    enableButtons();
                    enableAddButtons = true;
                }
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

function enableButtons() {
    $("#add_ns").click(function () {
        return addNsRecord(counterNsRecords++);
    });

    $("#add_host").click(function () {
        return addHostRecord(counterHostRecords++);
    });

    $("#add_mail").click(function () {
        return addMailRecord(counterMailRecords++);
    });
}

function emptyPage() {
    $(".domain-field").empty();
    $('.ns_record_wrapper').empty();
    $('.host_record_wrapper').empty();
    $('.mail_record_wrapper').empty();

    counterNsRecords = 1;
    counterHostRecords = 1;
    counterMailRecords = 1;
}

function createDomainContent(data) {
    data = JSON.parse(data);
    let domain_details = data.domain_details;

    let content = `                    
        <label for="domain_name">Domain name</label>
        <input name="domain_name" id="domain_name" class="form-control" type="text" value="${domain_details.domain_name}"
            pattern="[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\\.[a-zA-Z]{2,})+" required
            oninvalid="this.setCustomValidity('Invalid domain name!')" oninput="this.setCustomValidity('')">
        <label for="admin_mail">Admin mail</label>
        <input name="admin_mail" id="admin_mail" class="form-control" type="email" value="${domain_details.original_admin_mail}" required>
        <label for="domain_ttl">Default TTL</label>
        <input name="domain_ttl" id="domain_ttl" class="form-control" type="number" value="${domain_details.domain_ttl}" min="0" max="3024000"
               placeholder="Time to live..." required>
        <button class="btn btn-danger" type="button" id="btn-delete-domain">Delete Domain</button>
        <button class="btn btn-primary btn-edit" type="button">Edit Domain</button>`;

    $(".domain-field").append(content);
    $(".domain-field :input").attr("disabled", true);
    $('#btn-delete-domain').click(function () {
        emptyPage();
    });

    let ns_records = data.ns_records;
    createNsRecord(ns_records);

    let host_records = data.hosts_records;
    createHostRecords(host_records);

    let mails_records = data.mails_records;
    createMailRecords(mails_records);

    setButtonsAndInputs();
}

function createNsRecord(ns_records) {
    let content, ns_record_wrapper = $('.ns_record_wrapper');

    ns_records.forEach((record) => {
        content = `
		  	<div class='ns_record form-inline'>
				<input type="text" name="ns${counterNsRecords}" id="ns${counterNsRecords}" placeholder="Name server..." 
				    class="form-control" value="${record.ns}"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
		        <select name="ns_ip_addr_type${counterNsRecords}" id="ns_ip_addr_type${counterNsRecords}" class="form-control">
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="ns_ip${counterNsRecords}" id="ns_ip${counterNsRecords}" 
				    placeholder="Ip address..." class="form-control" value="${record.ns_ip}">					
				<input type="number" name="ns_ttl${counterNsRecords}" id="ns_ttl${counterNsRecords}" value="${record.ns_ttl}"
				    placeholder="Time to live..." min="0" max="1209600" class="form-control">
			    <button class="btn btn-danger btn-del" type="button">delete</button>
                <button class="btn btn-primary btn-edit" type="button">edit</button>
		  	</div>`;
        ns_record_wrapper.append(content);
        counterNsRecords++;

        if (record.ns_ip_addr_type === 'A') {
            $('.ns_record:last > select > option[value="A"]').attr('selected', 'selected');
        } else {
            $('.ns_record:last > select > option[value="AAAA"]').attr('selected', 'selected');
        }
    });
    $(".ns_record :input").attr("disabled", true);
}

function createHostRecords(hosts_records) {
    let content, host_record_wrapper = $('.host_record_wrapper');

    hosts_records.forEach((record) => {
        content = `
			<div class="host_record form-inline">
				<input type="text" name="host_name${counterHostRecords}" id="host_name${counterHostRecords}" 
				    placeholder="Host name..." class="form-control" value="${record.host_name}"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
		        <select name="host_name_ip_addr_type${counterHostRecords}" id="host_name_ip_addr_type${counterHostRecords}" class="form-control">
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select>
				<input type="text" name="host_name_ip${counterHostRecords}" id="host_name_ip${counterHostRecords}" 
				    placeholder="Ip address..." class="form-control" value="${record.host_name_ip}">					
				<input type="number" name="host_name_ttl${counterHostRecords}" id="host_name_ttl${counterHostRecords}" 
				    placeholder="Time to live..." min="0" max="86400" class="form-control" value="${record.host_name_ttl}">
				<button class="btn btn-danger btn-del" type="button">delete</button>
                <button class="btn btn-primary btn-edit" type="button">edit</button>
			</div>`;

        host_record_wrapper.append(content);
        counterHostRecords++;

        if (record.host_name_ip_addr_type === 'A') {
            $('.host_record:last > select > option[value="A"]').attr('selected', 'selected');
        } else {
            $('.host_record:last > select > option[value="AAAA"]').attr('selected', 'selected');
        }
    });
    $(".host_record :input").attr("disabled", true);
}

function createMailRecords(mails_records) {
    let content, mails_records_wrapper = $('.mail_record_wrapper');

    mails_records.forEach((record) => {
        let ip_addr;
        if (Object.keys(record).length === 5) {ip_addr = record.mail_ip_host;}
        else {ip_addr = '';}

        content = `
			<div class="mail_record form-inline">
			    <input name="mail_host${counterMailRecords}" id="mail_host${counterMailRecords}" type="text" 
			        placeholder="Mail host name..." class="form-control" value="${record.mail_host}"
			        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
			    <select name="mail_addr_type${counterMailRecords}" id="mail_addr_type${counterMailRecords}" class="form-control">
                    <option disabled selected value="">IP record type</option>
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                </select >
			    <input name="mail_ip_host${counterMailRecords}" id="mail_ip_host${counterMailRecords}" type="text" 
			        placeholder="Mail host ip address..." class="form-control" value="${ip_addr}">
			    <input name="mail_preference${counterMailRecords}" id="mail_preference${counterMailRecords}" 
			        type="number" min="0" max="65535" placeholder="Preference..." class="form-control" value="${record.mail_preference}">
			    <input type="number" name="mail_ttl${counterMailRecords}" id="mail_ttl${counterMailRecords}" 
			        class="form-control" placeholder="Time to live..." min="0" max="3024000" value="${record.mail_ttl}">
                <label class="form-check-label">
                    <input type="checkbox" class="external-check  form-check-input" name="external${counterMailRecords}">External
                </label> 
				<button class="btn btn-danger btn-del" type="button">delete</button>
                <button class="btn btn-primary btn-edit" type="button">edit</button>                
			</div>`;

        mails_records_wrapper.append(content);
        counterMailRecords++;

        if (Object.keys(record).length == 3) {
            $('.mail_record:last > label > input').attr('checked', 'checked');
        } else {
            if (record.mail_addr_type === 'A') {
                $('.mail_record:last > select > option[value="A"]').attr('selected', 'selected');
            } else {
                $('.mail_record:last > select > option[value="AAAA"]').attr('selected', 'selected');
            }
        }
        $(".external-check").change(CheckChangeEvent);
    });
    $(".mail_record :input").attr("disabled", true);
}

function setButtonsAndInputs() {
    $("button").attr("disabled", false);
    $('.btn-del').click(function () {
        $(this).parent('div').remove();
    });
    $('.btn-edit').click(function () {
        $(this).parent("div").find(':input').attr("disabled", false);
        $(this).parent("div").css({'background-color': 'white', 'border': '0'});
    });
}

function saveFunction() {
    let name_servers = $('.ns_record_wrapper .ns_record');
    //console.log(name_servers.length);
    let ns_records = getNsRecords(name_servers.length);
    console.log(ns_records);
    return false;
}


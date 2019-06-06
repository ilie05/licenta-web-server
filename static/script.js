let counterNsRecords = 2;
let counterHostRecords = 2;
let counterMailRecords = 2;


$(document).ready(function () {

    document.getElementById("defaultOpen").click();

    $(".external-check").change(ChangeEvent);

    $("#add_ns").click(function () {
        let content = `
		  	<div class='ns_record'>
				<input type="text" name="ns${counterNsRecords}" id="ns${counterNsRecords}" placeholder="name"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
		        <select name="ns_ip_addr_type${counterNsRecords}" id="ns_ip_addr_type${counterNsRecords}">
		        	<option disabled selected value="">Ip record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="ns_ip${counterNsRecords}" id="ns_ip${counterNsRecords}" placeholder="ip address">					
				<input type="number" name="ns_ttl${counterNsRecords}" id="ns_ttl${counterNsRecords}" placeholder="time to live" min="0" max="1209600">
		  	</div>`;
        $(".ns_record_wrapper").append(content);
        counterNsRecords++;
    });

    $("#add_host").click(function () {
        let content = `
			<div class="host_record">
				<input type="text" name="host_name${counterHostRecords}" id="host_name${counterHostRecords}" placeholder="host name"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
		        <select name="host_name_ip_addr_type${counterHostRecords}" id="host_name_ip_addr_type${counterHostRecords}">
		        	<option disabled selected value="">IP record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="host_name_ip${counterHostRecords}" id="host_name_ip${counterHostRecords}" placeholder="ip address">					
				<input type="number" name="host_name_ttl${counterHostRecords}" id="host_name_ttl${counterHostRecords}" placeholder="time to live" min="0" max="86400">
			</div>`;
        $(".host_record_wrapper").append(content);
        counterHostRecords++;
    });

    $("#add_mail").click(function () {
        let content = `
			<div class="mail_record">
			    <input name="mail_host${counterMailRecords}" id="mail_host${counterMailRecords}" type="text" placeholder="mail host name"
			        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
			    <select name="mail_addr_type${counterMailRecords}" id="mail_addr_type${counterMailRecords}">
                    <option disabled selected value="">IP record type</option>
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                </select >
			    <input name="mail_ip_host${counterMailRecords}" id="mail_ip_host${counterMailRecords}" type="text" placeholder="mail host ip address">
			    <input name="mail_preference${counterMailRecords}" id="mail_preference${counterMailRecords}" type="number" min="0" max="65535" placeholder="preference">
			    <input type="number" name="mail_ttl${counterMailRecords}" id="mail_ttl${counterMailRecords}" placeholder="time to live" min="0" max="3024000">
                <label class="checkbox-inline">
                    <input type="checkbox" class="external-check  form-check-input" name="external${counterMailRecords}">External record
                </label> 
			</div>`;
        $(".mail_record_wrapper").append(content);
        counterMailRecords++;
        $('.external-check:last').change(ChangeEvent);
    });

    $('#btn-submit').click(sendFrom);

});


function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}


function ChangeEvent() {
    let order_of_this = this.name.substring(8);
    let input_target = $('#mail_ip_host' + order_of_this)[0];
    let select_target = $('#mail_addr_type' + order_of_this)[0];

    if (this.checked) {
        input_target.disabled = true;
        input_target.value = '';
        select_target.disabled = true;
    } else {
        select_target.disabled = false;
        input_target.disabled = false;
    }
}


function mySubmitFunction() {
    let form = document.getElementById('record_form');
    //let res = form.checkValidity();

    // get Domain details
    let domain_name = $('#domain_name')[0];
    let admin_mail = $('#admin_mail')[0];
    let domain_ttl = $('#domain_ttl')[0];


    //get Name Server Records
    let name_servers = $('.ns_record_wrapper .ns_record');
    let ns_records = [];

    name_servers.each((index) => {
        let ns = $('#ns' + (index + 1))[0];
        let ns_ip_addr_type = $('#ns_ip_addr_type' + (index + 1) + ' :selected');
        let ns_ip = $('#ns_ip' + (index + 1))[0];
        let ns_ttl = $('#ns_ttl' + (index + 1))[0];


        if (index > 0) {
            if (ns.value != '' && ns_ip_addr_type.val() != '' && ns_ip.value != '')
                ns_records.push({
                    ns: ns.value,
                    ns_ip_addr_type: ns_ip_addr_type.val(),
                    ns_ip: ns_ip.value,
                    ns_ttl: ns_ttl.value
                });
        } else {
            ns_records.push({
                ns: ns.value,
                ns_ip_addr_type: ns_ip_addr_type.val(),
                ns_ip: ns_ip.value,
                ns_ttl: ns_ttl.value
            });
        }
    });


    //get HOST Records
    let hosts = $('.host_record_wrapper .host_record');
    let hosts_records = [];

    hosts.each((index) => {
        let host_name = $('#host_name' + (index + 1))[0];
        let host_name_ip_addr_type = $('#host_name_ip_addr_type' + (index + 1) + ' :selected');
        let host_name_ip = $('#host_name_ip' + (index + 1))[0];
        let host_name_ttl = $('#host_name_ttl' + (index + 1))[0];

        if (index > 0) {
            if (host_name.value != '' && host_name_ip_addr_type.val() != '' && host_name_ip.value != '')
                hosts_records.push({
                    host_name: host_name.value,
                    host_name_ip_addr_type: host_name_ip_addr_type.val(),
                    host_name_ip: host_name_ip.value,
                    host_name_ttl: host_name_ttl.value
                });
        } else {
            hosts_records.push({
                host_name: host_name.value,
                host_name_ip_addr_type: host_name_ip_addr_type.val(),
                host_name_ip: host_name_ip.value,
                host_name_ttl: host_name_ttl.value
            });
        }
    });


    //get MAIL Records
    let mails = $('.mail_record_wrapper .mail_record');
    let mails_records = [];

    mails.each((index) => {
        let mail_host = $('#mail_host' + (index + 1))[0];
        let mail_addr_type = $('#mail_addr_type' + (index + 1) + ' :selected');
        let mail_ip_host = $('#mail_ip_host' + (index + 1))[0];
        let mail_preference = $('#mail_preference' + (index + 1))[0];
        let mail_ttl = $('#mail_ttl' + (index + 1))[0];
        let external = $('[name=external' + (index + 1) + ']');

        if (!external.is(':checked')) {
            if (mail_host.value != '' && mail_addr_type.val() != '' && mail_ip_host.value != '' && mail_preference.value != '') {
                mails_records.push({
                    mail_host: mail_host.value,
                    mail_addr_type: mail_addr_type.val(),
                    mail_ip_host: mail_ip_host.value,
                    mail_preference: mail_preference.value,
                    mail_ttl: mail_ttl.value,
                    external: true
                })
            }
        } else {
            if (mail_host.value != '' && mail_preference.value != '') {
                mails_records.push({
                    mail_host: mail_host.value,
                    mail_preference: mail_preference.value,
                    mail_ttl: mail_ttl.value,
                    external: false
                })
            }
        }
    });

    let domain_details = {domain_name: domain_name.value, admin_mail: admin_mail.value, domain_ttl: domain_ttl.value};

    let obj_to_send = {
        domain_details: domain_details,
        ns_records: ns_records,
        hosts_records: hosts_records,
        mails_records: mails_records
    };

    ajaxRequest(obj_to_send);

    return false;
}


function ajaxRequest(data_to_send) {
    $.ajax({
        url: '/dream',
        data: JSON.stringify(data_to_send),
        method: 'POST',
        dataType: 'text',
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            console.log("Ajax response success function!");
            console.log(data);
            window.document.write(data);
            window.history.pushState("", "", '/dream');
        },
        error: function (data) {
            console.log("Ajax response error function!");
            console.log(data);
            //window.document.write(data.responseText)
        }
    });
}
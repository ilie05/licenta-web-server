let counterNsRecords = 1;
let counterHostRecords = 1;
let counterMailRecords = 1;
let enableAddButtons = false;

$(document).ready(function () {
    $('.errors').css('display', 'none');
    $('#domain_name').popover();
    $('#btn-save').css('display', 'none');

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
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    window.location.href = '/400';
                }
                createDomainContent(data);
                $('#btn-save').css('display', 'block');
                if (!enableAddButtons) {
                    enableButtons();
                    enableAddButtons = true;
                }
            },
            error: function (data) {
                console.log("Ajax response error function!");
                if (data.status == 400) {
                    let errors = JSON.parse(data.responseText);
                    displayErrors(errors)
                } else if (data.status == 412) {
                    window.location.href = '/400';
                } else if (data.status == 500) {
                    window.location.href = '/500';
                } else {
                    window.location.href = '/404';
                }
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
    let domain_details = data.domain_details;
    let content = `                    
        <label for="domain_name">Domain name</label>
        <input data-toggle="popover" data-trigger="focus" title="Attention! Modifying this field will result creating a brand new domain record and deleting the old one!" 
            name="domain_name" id="domain_name" class="form-control" type="text" value="${domain_details.domain_name}"
            pattern="[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\\.[a-zA-Z]{2,})+" required
            oninvalid="this.setCustomValidity('Invalid domain name!')" oninput="this.setCustomValidity('')">
        <label for="admin_mail">Admin mail</label>
        <input name="admin_mail" id="admin_mail" class="form-control" type="email" value="${domain_details.original_admin_mail}" required>
        <label for="domain_ttl">Default TTL</label>
        <input name="domain_ttl" id="domain_ttl" class="form-control" type="number" value="${domain_details.domain_ttl}" min="0" max="3024000"
               placeholder="Time to live..." required>

        <button class="btn" type="button" id="btn-delete-domain"><i class="fa fa-trash-o" style="font-size:25px;color:red"></i></button>
        <button class="btn btn-edit" type="button"><i class="material-icons" style="font-size:25px;color:blue">edit</i></button>
            <div class="form-inline" style="margin: 10px;">
            Ip address / subnet &nbsp;
            <input type="text" name="domain_ip_address" id="domain_ip_address" class="form-control" value="${domain_details.domain_ip_address}"
                style="width: 50%" placeholder=" Enter ipv4 or ipv6 address..." required>&nbsp;
            <input type="number" name="domain_subnet" id="domain_subnet" class="form-control" required value="${domain_details.domain_subnet.split('/')[1]}"
                style="width: 25%;display: inline-block;" min="0" max="128" placeholder="Enter subnet...">
        </div>`;

    $(".domain-field").append(content);
    $(".domain-field :input").attr("disabled", true);
    $('#btn-delete-domain').attr('title', 'Delete Domain record from DNS Server');

    $('#btn-delete-domain').click(function () {
        emptyPage();
        $('#btn-save').css('display', 'none');
        let optionSelected = $('#domain_name_select option:selected');
        $.ajax({
            url: '/delete',
            data: JSON.stringify({domain_name: optionSelected.val()}),
            method: 'POST',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                window.location.href = '/successDelete';
            },
            error: function (data) {
                console.log("Ajax response error function!");
                if (data.status == 400) {
                    window.location.href = '/400';
                } else if (data.status == 500) {
                    window.location.href = '/500';
                } else {
                    window.location.href = '/404';
                }
            }
        });

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
    let content, ip_addr, ns_record_wrapper = $('.ns_record_wrapper');

    ns_records.forEach((record) => {
        if (Object.keys(record).length === 4) ip_addr = record.ns_ip;
        else ip_addr = '';
        content = `
		  	<div class='ns_record form-inline'>
				<input type="text" name="ns${counterNsRecords}" id="ns${counterNsRecords}" placeholder="Name server..." 
				    class="form-control" value="${record.ns}"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
				<input type="text" name="ns_ip${counterNsRecords}" id="ns_ip${counterNsRecords}" 
				    placeholder="Ip address..." class="form-control" value="${ip_addr}">					
				<input type="number" name="ns_ttl${counterNsRecords}" id="ns_ttl${counterNsRecords}" value="${record.ns_ttl}"
				    placeholder="Time to live..." min="0" max="1209600" class="form-control">
                <label class="form-check-label">
                    <input type="checkbox" class="external-check form-check-input" name="ns_external${counterNsRecords}">External
                </label>
			    <button class="btn btn-del" type="button"><i class="fa fa-trash-o" style="font-size:25px;color:red"></i></button>
                <button class="btn btn-edit" type="button"><i class="material-icons" style="font-size:25px;color:blue">edit</i></button>
                <span class="not-complete">not complete</span>
		  	</div>`;
        ns_record_wrapper.append(content);
        counterNsRecords++;
        ns_record_wrapper.find('.ns_record span.not-complete').css('visibility', 'hidden');
        ns_record_wrapper.find('.ns_record').on('focusout', checkCompleteNsRecord);

        if (Object.keys(record).length == 2) {
            $('.ns_record:last > label > input').attr('checked', 'checked');
        }
        $(".external-check").change(CheckChangeEvent);
    });
    $(".ns_record :input").attr("disabled", true);
}

function createHostRecords(hosts_records) {
    let content, host_record_wrapper = $('.host_record_wrapper');
    let ttl, cname, txt;
    hosts_records.forEach((record) => {
        ttl = record.host_name_ttl;
        if(!ttl) ttl = '';
        cname = record.host_cname;
        if(!cname) cname = '';
        txt = record.host_txt;
        if(!txt) txt = '';

        content = `
			<div class="host_record form-inline">
				<input type="text" name="host_name${counterHostRecords}" id="host_name${counterHostRecords}" 
				    placeholder="Host name..." class="form-control" value="${record.host_name}"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
				<input type="text" name="host_name_ip${counterHostRecords}" id="host_name_ip${counterHostRecords}" 
				    placeholder="Ip address..." class="form-control" value="${record.host_name_ip}">					
				<input type="number" name="host_name_ttl${counterHostRecords}" id="host_name_ttl${counterHostRecords}" 
				    placeholder="Time to live..." min="0" max="86400" class="form-control" value="${ttl}">
				<input type="text" name="host_txt${counterHostRecords}" id="host_txt${counterHostRecords}" 
				    placeholder="TXT record..." class="form-control" value="${txt}">
                <input type="text" name="host_cname${counterHostRecords}" id="host_cname${counterHostRecords}" 
				    placeholder="CNAME..." class="form-control" value="${cname}"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
				<button class="btn btn-del" type="button"><i class="fa fa-trash-o" style="font-size:25px;color:red"></i></button>
                <button class="btn btn-edit" type="button"><i class="material-icons" style="font-size:25px;color:blue">edit</i></button>
                <span class="not-complete">not complete</span>
			</div>`;

        host_record_wrapper.append(content);
        counterHostRecords++;
        host_record_wrapper.find('.host_record span.not-complete').css('visibility', 'hidden');
        host_record_wrapper.find('.host_record').on('focusout', checkCompleteHostRecord);
    });
    $(".host_record :input").attr("disabled", true);
}

function createMailRecords(mails_records) {
    let content, mails_records_wrapper = $('.mail_record_wrapper');
    let ttl, cname, ip_addr, txt;
    mails_records.forEach((record) => {
        if (Object.keys(record).length === 7) ip_addr = record.mail_ip_host;
        else ip_addr = '';

        ttl = record.mail_ttl;
        if(!ttl) ttl = '';
        cname = record.mail_cname;
        if(!cname) cname = '';
        txt = record.mail_txt;
        if(!txt) txt = '';

        content = `
			<div class="mail_record form-inline">
			    <input name="mail_host${counterMailRecords}" id="mail_host${counterMailRecords}" type="text" 
			        placeholder="Mail host name..." class="form-control" value="${record.mail_host}"
			        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
			    <input name="mail_ip_host${counterMailRecords}" id="mail_ip_host${counterMailRecords}" type="text" 
			        placeholder="Mail host ip address..." class="form-control" value="${ip_addr}">
			    <input name="mail_preference${counterMailRecords}" id="mail_preference${counterMailRecords}" 
			        type="number" min="0" max="65535" placeholder="Preference..." class="form-control" value="${record.mail_preference}">
			    <input type="number" name="mail_ttl${counterMailRecords}" id="mail_ttl${counterMailRecords}" 
			        class="form-control" placeholder="Time to live..." min="0" max="3024000" value="${ttl}">
			    <input type="text" name="mail_txt${counterMailRecords}" id="mail_txt${counterMailRecords}" 
			        placeholder="TXT record..." class="form-control" value="${txt}">
			    <input name="mail_cname${counterMailRecords}" id="mail_cname${counterMailRecords}" type="text" 
			        placeholder="CNAME..." class="form-control" value="${cname}"
			        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
                <label class="form-check-label">
                    <input type="checkbox" class="external-check form-check-input" name="external${counterMailRecords}">External
                </label> 
				<button class="btn btn-del" type="button"><i class="fa fa-trash-o" style="font-size:25px;color:red"></i></button>
                <button class="btn btn-edit" type="button"><i class="material-icons" style="font-size:25px;color:blue">edit</i></button> 
                <span class="not-complete">not complete</span>               
			</div>`;

        mails_records_wrapper.append(content);
        counterMailRecords++;
        mails_records_wrapper.find('.mail_record span.not-complete').css('visibility', 'hidden');
        mails_records_wrapper.find('.mail_record').on('focusout', checkCompleteMailRecord);

        if (Object.keys(record).length == 3) {
            $('.mail_record:last > label > input').attr('checked', 'checked');
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
        $(this).parent('div').find(':input').attr("disabled", false);
        $(this).parent("div").find('label input').trigger('change');
    });
}

function saveFunction() {
    // get Domain details
    let domain_name = $('#domain_name')[0];
    let admin_mail = $('#admin_mail')[0];
    let domain_ttl = $('#domain_ttl')[0];
    let domain_ip_address = $('#domain_ip_address')[0];
    let domain_subnet = $('#domain_subnet')[0];

    let name_servers = $('.ns_record_wrapper .ns_record');
    let ns_records = getNsRecords(name_servers.length);

    let hosts = $('.host_record_wrapper .host_record');
    let hosts_records = getHostRecords(hosts.length);

    let mails = $('.mail_record_wrapper .mail_record');
    let mails_records = getMailRecords(mails.length);

    let domain_details = {
        domain_name: domain_name.value,
        admin_mail: admin_mail.value,
        domain_ttl: domain_ttl.value,
        domain_ip_address: domain_ip_address.value,
        domain_subnet: domain_subnet.value
    };

    let obj_to_send = {
        domain_details: domain_details,
        ns_records: ns_records,
        hosts_records: hosts_records,
        mails_records: mails_records
    };
    console.log("Object to send: ");
    console.log(obj_to_send);
    ajaxRequest(obj_to_send);
    return false;
}

function ajaxRequest(data_to_send) {
    $.ajax({
        url: '/updateRecord',
        data: JSON.stringify(data_to_send),
        method: 'POST',
        dataType: 'text',
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            console.log("Ajax response success function!");
            console.log(data);
            window.location.href = '/successUpdate';
        },
        error: function (data) {
            console.log(data.status);
            console.log("Ajax response error function!");
            if (data.status == 400) {
                try {
                    let errors = JSON.parse(data.responseText);
                    displayErrors(errors);
                }catch (e) {
                    window.location.href = '/500';
                }
            } else if(data.status == 412) {
                window.location.href = '/400';
            } else if (data.status == 500) {
                window.location.href = '/500';
            }else{
                window.location.href = '/404';
            }
        }
    });
}

function displayErrors(errors) {
    $('.row .errors').empty();

    let div = $('.domain-field').parent('div').parent('.row').find('.errors');
    console.log(div)
    div.css('display', 'none');
    if (Object.keys(errors.domain_details).length != 0) {
        console.log(JSON.stringify(errors.domain_details))
        div.css('display', 'block');
        for (const key in errors.domain_details) {
            let value = errors.domain_details[key];
            div.append(`<p>${value}</p>`);
        }
    }

    div = $('.ns_record_wrapper').parent('.row').find('.errors');
    div.css('display', 'none');
    if (errors.ns_records && errors.ns_records.length) {
        div.css('display', 'block');
        errors.ns_records.forEach((record) => {
            for (const key in record) {
                let value = record[key];
                div.append(`<p>${value}</p>`);
            }
        });
    }

    div = $('.host_record_wrapper').parent('.row').find('.errors');
    div.css('display', 'none');
    if (errors.hosts_records && errors.hosts_records.length) {
        div.css('display', 'block');
        errors.hosts_records.forEach((record) => {
            for (const key in record) {
                let value = record[key];
                div.append(`<p>${value}</p>`);
            }
        });
    }

    div = $('.mail_record_wrapper').parent('.row').find('.errors');
    div.css('display', 'none');
    if (errors.mails_records && errors.mails_records.length) {
        div.css('display', 'block');
        errors.mails_records.forEach((record) => {
            for (const key in record) {
                let value = record[key];
                div.append(`<p>${value}</p>`);
            }
        });
    }
}
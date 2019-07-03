let counterNsRecords = 2;
let counterHostRecords = 2;
let counterMailRecords = 2;

$(document).ready(function () {
    document.getElementById('defaultOpen').click();

    $('span.span-error').css('display', 'none');

    // activate event on already existing elements on page
    $('.ns_record').on('focusout', checkCompleteNsRecord);
    $('.host_record').on('focusout', checkCompleteHostRecord);
    $('.mail_record').on('focusout', checkCompleteMailRecord);

    $(".external-check").change(CheckChangeEvent);

    $("#add_ns").click(function () {
        return addNsRecord(counterNsRecords++);
    });

    $("#add_host").click(function () {
        return addHostRecord(counterHostRecords++);
    });

    $("#add_mail").click(function () {
        return addMailRecord(counterMailRecords++);
    });
});

function openTab(evt, tabName, _this) {
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

    $(_this).find('span.arrow').css('display', 'none');
    $(_this).find('span.span-error').css('display', 'none');
}

function mySubmitFunction() {
    // get Domain details
    let domain_name = $('#domain_name')[0];
    let admin_mail = $('#admin_mail')[0];
    let domain_ttl = $('#domain_ttl')[0];
    let domain_ip_address = $('#domain_ip_address')[0];
    let domain_subnet = $('#domain_subnet')[0];

    //get Name Server Records
    let name_servers = $('.ns_record_wrapper .ns_record');
    let ns_records = getNsRecords(name_servers.length);

    //get HOST Records
    let hosts = $('.host_record_wrapper .host_record');
    let hosts_records = getHostRecords(hosts.length);

    //get MAIL Records
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

    // clear errors from page
    $('.tabcontent .errors').empty();

    ajaxRequest(obj_to_send);
    $('span.span-error').css('display', 'none');
    return false;
}

function ajaxRequest(data_to_send) {
    $.ajax({
        url: '/record',
        data: JSON.stringify(data_to_send),
        method: 'POST',
        dataType: 'text',
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            window.location.href = '/successInsert';
        },
        error: function (data) {
            if (data.status == 400) {
                let errors = JSON.parse(data.responseText);
                displayErrors(errors)
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
    let div = $('#domain .errors');
    div.css('display', 'none');
    if (Object.keys(errors.domain_details).length != 0) {
        div.css('display', 'block');
        $('button#defaultOpen span.span-error').css('display', 'inline');
        for (const key in errors.domain_details) {
            let value = errors.domain_details[key];
            div.append(`<p>${value}</p>`);
        }
    }

    if (errors.ns_records && errors.ns_records.length) {
        $('button#defaultOpen span.span-error').css('display', 'inline');
        div.css('display', 'block');
        errors.ns_records.forEach((record) => {
            for (const key in record) {
                let value = record[key];
                div.append(`<p>${value}</p>`);
            }
        });
    }

    div = $('#hosts .errors');
    div.css('display', 'none');
    if (errors.hosts_records && errors.hosts_records.length) {
        div.css('display', 'block');
        $('button#btn-tab-host span.span-error').css('display', 'inline');
        errors.hosts_records.forEach((record) => {
            for (const key in record) {
                let value = record[key];
                div.append(`<p>${value}</p>`);
            }
        });
    }

    div = $('#mail .errors');
    div.css('display', 'none');
    if (errors.mails_records && errors.mails_records.length) {
        $('button#btn-tab-mail span.span-error').css('display', 'inline');
        div.css('display', 'block');
        errors.mails_records.forEach((record) => {
            for (const key in record) {
                let value = record[key];
                div.append(`<p>${value}</p>`);
            }
        });
    }
}
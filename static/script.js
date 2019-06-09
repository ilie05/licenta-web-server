let counterNsRecords = 2;
let counterHostRecords = 2;
let counterMailRecords = 2;


$(document).ready(function () {

    document.getElementById("defaultOpen").click();

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


function mySubmitFunction() {
    // get Domain details
    let domain_name = $('#domain_name')[0];
    let admin_mail = $('#admin_mail')[0];
    let domain_ttl = $('#domain_ttl')[0];

    //get Name Server Records
    let name_servers = $('.ns_record_wrapper .ns_record');
    let ns_records = getNsRecords(name_servers.length);


    //get HOST Records
    let hosts = $('.host_record_wrapper .host_record');
    let hosts_records = [];

    hosts.each((index) => {
        let host_name = $('#host_name' + (index + 1))[0];
        let host_name_ip_addr_type = $('#host_name_ip_addr_type' + (index + 1) + ' :selected');
        let host_name_ip = $('#host_name_ip' + (index + 1))[0];
        let host_name_ttl = $('#host_name_ttl' + (index + 1))[0];

        if (host_name.value != '' && host_name_ip_addr_type.val() != '' && host_name_ip.value != '') {
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
                    external: false
                })
            }
        } else {
            if (mail_host.value != '' && mail_preference.value != '') {
                mails_records.push({
                    mail_host: mail_host.value,
                    mail_preference: mail_preference.value,
                    mail_ttl: mail_ttl.value,
                    external: true
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

    console.log(obj_to_send);
    ajaxRequest(obj_to_send);

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
            console.log("Ajax response success function!");
            console.log(data);
            //window.document.write(data);
            //window.history.pushState("data", "Inserted", '/inserted');
        },
        error: function (data) {
            console.log("Ajax response error function!");
            console.log(data);

            //window.document.write(data.responseText)
        }
    });
}
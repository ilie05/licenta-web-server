function CheckChangeEvent() {
    let type = this.name.split('_')[0];
    if (type == 'mail') {
        let order_of_this = this.name.substring(13);
        let input_target = $('#mail_ip_host' + order_of_this)[0];
        let host_domain_input = $('#mail_host' + order_of_this);
        let mail_txt = $('#mail_txt' + order_of_this)[0];

        if (this.checked) {
            input_target.disabled = true;
            input_target.value = '';
            mail_txt.disabled = true;
            mail_txt.value = '';
            host_domain_input.attr('placeholder', 'Mail domain name...');
            host_domain_input.attr('pattern', '[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\\.[a-zA-Z]{2,})+');
        } else {
            mail_txt.disabled = false;
            input_target.disabled = false;
            host_domain_input.attr('placeholder', 'Mail host name...');
            host_domain_input.attr('pattern', '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$');
        }
    }else if(type == 'ns'){
        let order_of_this = this.name.substring(11);
        let ns = $('#ns' + order_of_this);
        let ns_ip = $('#ns_ip' + order_of_this)[0];

        if (this.checked) {
            ns_ip.disabled = true;
            ns.attr('placeholder', 'External NS domain...');
            ns.attr('pattern', '[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\\.[a-zA-Z]{2,})+');
        } else {
            ns_ip.disabled = false;
            ns.attr('placeholder', 'Internal NS label...');
            ns.attr('pattern', '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$');
        }
    }
}

function addNsRecord(counterNsRecords) {
    let content = `
		  	<div class='ns_record form-inline'>
				<input type="text" name="ns${counterNsRecords}" id="ns${counterNsRecords}" placeholder="Name server..." class="form-control"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
				<input type="text" name="ns_ip${counterNsRecords}" id="ns_ip${counterNsRecords}" placeholder="ipv4 or ipv6 address..." class="form-control">					
				<input type="number" name="ns_ttl${counterNsRecords}" id="ns_ttl${counterNsRecords}" placeholder="Time to live..."
				    min="0" max="1209600" class="form-control form-control">
                <label class="form-check-label">
                    <input type="checkbox" class="external-check form-check-input" name="ns_external${counterNsRecords}">External
                </label>
			    <span class="not-complete">not complete</span>
		  	</div>`;
    $(".ns_record_wrapper").append(content);
    $('.ns_record').on('focusout', checkCompleteNsRecord);
    $('.external-check').change(CheckChangeEvent);
}

function addHostRecord(counterHostRecords) {
    let content = `
			<div class="host_record form-inline">
				<input type="text" name="host_name${counterHostRecords}" id="host_name${counterHostRecords}" placeholder="Host name..." class="form-control"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
				<input type="text" name="host_name_ip${counterHostRecords}" id="host_name_ip${counterHostRecords}" placeholder="ipv4 or ipv6 address..." class="form-control">					
				<input type="number" name="host_name_ttl${counterHostRecords}" id="host_name_ttl${counterHostRecords}" 
				    placeholder="Time to live..." min="0" max="86400" class="form-control">
				<input type="text" name="host_txt${counterHostRecords}" id="host_txt${counterHostRecords}" placeholder="TXT record..." class="form-control">
                <input type="text" name="host_cname${counterHostRecords}" id="host_cname${counterHostRecords}" placeholder="CNAME..." class="form-control"
                    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
                <span class="not-complete form-control">not complete</span>
			</div>`;
    $(".host_record_wrapper").append(content);
    $('.host_record').on('focusout', checkCompleteHostRecord);
}

function addMailRecord(counterMailRecords) {
    let content = `
			<div class="mail_record form-inline">
			    <input name="mail_host${counterMailRecords}" id="mail_host${counterMailRecords}" type="text" placeholder="Mail host name..." class="form-control"
			        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
			    <input name="mail_ip_host${counterMailRecords}" id="mail_ip_host${counterMailRecords}" type="text" 
			        placeholder="Mail host ip address..." class="form-control">
			    <input name="mail_preference${counterMailRecords}" id="mail_preference${counterMailRecords}" 
			        type="number" min="0" max="65535" placeholder="Preference..." class="form-control">
			    <input type="number" name="mail_ttl${counterMailRecords}" id="mail_ttl${counterMailRecords}" 
			        class="form-control" placeholder="Time to live..." min="0" max="3024000">
			    <input type="text" name="mail_txt${counterMailRecords}" id="mail_txt${counterMailRecords}" placeholder="TXT record..." class="form-control">
                <input name="mail_cname${counterMailRecords}" id="mail_cname${counterMailRecords}" type="text" placeholder="CNAME..." class="form-control"
                    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
                <label class="form-check-label">
                    <input type="checkbox" class="external-check  form-check-input" name="mail_external${counterMailRecords}">External
                </label> 
                <span class="not-complete form-control">not complete</span>
			</div>`;
    $(".mail_record_wrapper").append(content);
    $('.mail_record').on('focusout', checkCompleteMailRecord);
    $('.external-check:last').change(CheckChangeEvent);
}

function getNsRecords(numRecords) {
    let ns_records = [];
    let index = 1;
    let count = 0;

    while (numRecords > count && index < 15) {
        if (!$('#ns' + index).length) {
            index++;
            continue;
        }
        let ns = $('#ns' + index)[0];
        let ns_ip = $('#ns_ip' + index)[0];
        let ns_ttl = $('#ns_ttl' + index)[0];
        let ns_external = $('[name=ns_external' + index + ']');

        if (!ns_external.is(':checked')) {
            if (ns.value && ns_ip.value) {
                ns_records.push({
                    ns: ns.value,
                    ns_ip: ns_ip.value,
                    ns_ttl: ns_ttl.value,
                    external: false
                });
            }
        } else {
            if (ns.value) {
                ns_records.push({
                    ns: ns.value,
                    ns_ttl: ns_ttl.value,
                    external: true
                });
            }
        }
        index++;
        count++;
    }
    return ns_records;
}

function getHostRecords(numRecords) {
    let hosts_records = [];
    let index = 1;
    let count = 0;

    while (numRecords > count && index < 15) {
        if (!$('#host_name' + index).length) {
            index++;
            continue;
        }
        let host_name = $('#host_name' + index)[0];
        let host_name_ip = $('#host_name_ip' + index)[0];
        let host_name_ttl = $('#host_name_ttl' + index)[0];
        let host_cname = $('#host_cname' + index)[0];
        let host_txt = $('#host_txt' + index)[0];

        if (host_name.value && host_name_ip.value) {
            hosts_records.push({
                host_name: host_name.value,
                host_name_ip: host_name_ip.value,
                host_name_ttl: host_name_ttl.value,
                host_cname: host_cname.value,
                host_txt: host_txt.value
            });
        }
        index++;
        count++;
    }
    return hosts_records;
}

function getMailRecords(numRecords) {
    let mails_records = [];
    let index = 1;
    let count = 0;

    while (numRecords > count && index < 15) {
        if (!$('#mail_host' + index).length) {
            index++;
            continue;
        }

        let mail_host = $('#mail_host' + index)[0];
        let mail_ip_host = $('#mail_ip_host' + index)[0];
        let mail_preference = $('#mail_preference' + index)[0];
        let mail_ttl = $('#mail_ttl' + index)[0];
        let mail_external = $('[name=mail_external' + index + ']');
        let mail_cname = $('#mail_cname' + index)[0];
        let mail_txt = $('#mail_txt' + index)[0];

        if (!mail_external.is(':checked')) {
            if (mail_host.value && mail_ip_host.value && mail_preference.value) {
                mails_records.push({
                    mail_host: mail_host.value,
                    mail_ip_host: mail_ip_host.value,
                    mail_preference: mail_preference.value,
                    mail_ttl: mail_ttl.value,
                    mail_cname: mail_cname.value,
                    mail_txt: mail_txt.value,
                    external: false
                });
            }
        } else {
            if (mail_host.value != '' && mail_preference.value != '') {
                mails_records.push({
                    mail_host: mail_host.value,
                    mail_preference: mail_preference.value,
                    mail_ttl: mail_ttl.value,
                    mail_cname: mail_cname.value,
                    external: true
                });
            }
        }
        index++;
        count++;
    }
    return mails_records;
}

function checkCompleteNsRecord() {
    let index = $(this).find('input:first')[0].name.substring(2);
    let ns = $('#ns' + index)[0];
    let ns_ip = $('#ns_ip' + index)[0];
    let ns_external = $('[name=ns_external' + index + ']');

    if (!ns_external.is(':checked')) {
        if (ns.value && ns_ip.value) {
            $(this).find('span').css('visibility', 'hidden');
        } else {
            $(this).find('span').css('visibility', 'visible');
        }
    } else {
        if (ns.value) {
            $(this).find('span').css('visibility', 'hidden');
        } else {
            $(this).find('span').css('visibility', 'visible');
        }
    }
}

function checkCompleteHostRecord() {
    let index = $(this).find('input:first')[0].name.substring(9);
    let host_name = $('#host_name' + index)[0];
    let host_name_ip = $('#host_name_ip' + index)[0];

    if(host_name.value && host_name_ip.value){
        $(this).find('span').css('visibility', 'hidden');
    }else{
        $(this).find('span').css('visibility', 'visible');
    }
}

function checkCompleteMailRecord() {
    let index = $(this).find('input:first')[0].name.substring(9);
    let mail_host = $('#mail_host' + index)[0];
    let mail_ip_host = $('#mail_ip_host' + index)[0];
    let mail_preference = $('#mail_preference' + index)[0];
    let mail_external = $('[name=mail_external' + index + ']');

    if (!mail_external.is(':checked')) {
        if (mail_host.value && mail_ip_host.value && mail_preference.value) {
            $(this).find('span').css('visibility', 'hidden');
        } else {
            $(this).find('span').css('visibility', 'visible');
        }
    } else {
        if (mail_host.value && mail_preference.value) {
            $(this).find('span').css('visibility', 'hidden');
        } else {
            $(this).find('span').css('visibility', 'visible');
        }
    }
}
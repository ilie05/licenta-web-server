function CheckChangeEvent() {
    let order_of_this = this.name.substring(8);
    let input_target = $('#mail_ip_host' + order_of_this)[0];
    let select_target = $('#mail_addr_type' + order_of_this)[0];
    let host_domain_input = $('#mail_host' + order_of_this);

    if (this.checked) {
        input_target.disabled = true;
        input_target.value = '';
        select_target.disabled = true;
        host_domain_input.attr('placeholder', 'Domain name...');
        host_domain_input[0].value = '';
    } else {
        select_target.disabled = false;
        input_target.disabled = false;
        host_domain_input.attr('placeholder', 'Mail host name...');
        host_domain_input[0].value = '';
    }
}

function addNsRecord(counterNsRecords) {
    let content = `
		  	<div class='ns_record form-inline'>
				<input type="text" name="ns${counterNsRecords}" id="ns${counterNsRecords}" placeholder="Name server..." class="form-control"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
		        <select name="ns_ip_addr_type${counterNsRecords}" id="ns_ip_addr_type${counterNsRecords}" class="form-control">
		        	<option disabled selected value="">Ip record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="ns_ip${counterNsRecords}" id="ns_ip${counterNsRecords}" placeholder="Ip address..." class="form-control">					
				<input type="number" name="ns_ttl${counterNsRecords}" id="ns_ttl${counterNsRecords}" placeholder="Time to live..." min="0" max="1209600" class="form-control">
		  	</div>`;
    $(".ns_record_wrapper").append(content);
}

function addHostRecord(counterHostRecords) {
    let content = `
			<div class="host_record form-inline">
				<input type="text" name="host_name${counterHostRecords}" id="host_name${counterHostRecords}" placeholder="Host name..." class="form-control"
				    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
		        <select name="host_name_ip_addr_type${counterHostRecords}" id="host_name_ip_addr_type${counterHostRecords}" class="form-control">
		        	<option disabled selected value="">IP record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="host_name_ip${counterHostRecords}" id="host_name_ip${counterHostRecords}" placeholder="Ip address..." class="form-control">					
				<input type="number" name="host_name_ttl${counterHostRecords}" id="host_name_ttl${counterHostRecords}" 
				    placeholder="Time to live..." min="0" max="86400" class="form-control">
			</div>`;
    $(".host_record_wrapper").append(content);
}

function addMailRecord(counterMailRecords) {
    let content = `
			<div class="mail_record form-inline">
			    <input name="mail_host${counterMailRecords}" id="mail_host${counterMailRecords}" type="text" placeholder="Mail host name..." class="form-control"
			        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$">
			    <select name="mail_addr_type${counterMailRecords}" id="mail_addr_type${counterMailRecords}" class="form-control">
                    <option disabled selected value="">IP record type</option>
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                </select >
			    <input name="mail_ip_host${counterMailRecords}" id="mail_ip_host${counterMailRecords}" type="text" 
			        placeholder="Mail host ip address..." class="form-control">
			    <input name="mail_preference${counterMailRecords}" id="mail_preference${counterMailRecords}" 
			        type="number" min="0" max="65535" placeholder="Preference..." class="form-control">
			    <input type="number" name="mail_ttl${counterMailRecords}" id="mail_ttl${counterMailRecords}" 
			        class="form-control" placeholder="Time to live..." min="0" max="3024000">
                <label class="form-check-label">
                    <input type="checkbox" class="external-check  form-check-input" name="external${counterMailRecords}">External record
                </label> 
			</div>`;
    $(".mail_record_wrapper").append(content);
    $('.external-check:last').change(CheckChangeEvent);
}
let counterNsRecors = 2;
let counterHostRecors = 2;
let counterMailRecors = 2;

$(document).ready(function(){

	document.getElementById("defaultOpen").click();

	$(".external-check").change(ChangeEvent);

	$("#add_ns").click(function(){
		let content = `
		  	<div class='ns_record'>
				<input type="text" name="ns${counterNsRecors}" id="ns${counterNsRecors}" placeholder="name">
		        <select name="ns_ip_addr_type${counterNsRecors}" id="ns_ip_addr_type${counterNsRecors}">
		        	<option disabled selected>IP record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="ns_ip${counterNsRecors}" id="ns_ip${counterNsRecors}" placeholder="ip address">					
				<input type="number" name="ns_ttl${counterNsRecors}" id="ns_ttl${counterNsRecors}" placeholder="time to live" min="0" max="1209600">
		  	</div>`;
		$(".ns_record_wrapper").append(content);
		counterNsRecors++;
	});

	$("#add_host").click(function(){
		let content = `
			<div class="host_record">
				<input type="text" name="host_name${counterHostRecors}" id="host_name${counterHostRecors}" placeholder="host name">
		        <select name="host_name_ip_addr_type${counterHostRecors}" id="host_name_ip_addr_type${counterHostRecors}">
		        	<option disabled selected>IP record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="host_name_ip${counterHostRecors}" id="host_name_ip${counterHostRecors}" placeholder="ip address">					
				<input type="number" name="host_name_ttl${counterHostRecors}" id="host_name_ttl${counterHostRecors}" placeholder="time to live" min="0" max="86400">
			</div>
		`;
		$(".host_record_wrapper").append(content);
		counterHostRecors++;
	});

	$("#add_mail").click(function(){
		let content = `
			<div class="mail_record">
			    <input name="mail_host${counterMailRecors}" id="mail_host${counterMailRecors}" type="text" placeholder="mail host name">
			    <input name="mail_ip_host${counterMailRecors}" id="mail_ip_host${counterMailRecors}" type="text" placeholder="mail host ip address">
			    <input name="mail_preference${counterMailRecors}" id="mail_preference${counterMailRecors}" type="number" min="0" max="65535" placeholder="preference">
			    <input type="number" name="mail_ttl${counterMailRecors}" id="mail_ttl${counterMailRecors}" placeholder="time to live" min="0" max="3024000">
                <label class="checkbox-inline">
                    <input type="checkbox" class="external-check  form-check-input" name="external${counterMailRecors}" value="true">External record
                </label> 
			</div>
		`;
		$(".mail_record_wrapper").append(content);
		counterMailRecors++;
		$('.external-check:last').change(ChangeEvent);
	});

});

function openCity(evt, cityName) {
	let i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
	tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
	tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(cityName).style.display = "block";
	evt.currentTarget.className += " active";
}


function ChangeEvent(){
	let order_of_this = this.name.substring(8);	
	let input_target = $('#mail_ip_host' + order_of_this)[0];

    if(this.checked){
        input_target.disabled = true;
        input_target.value = '';
    }
    else{
    	input_target.disabled = false;
    }
}
let counterNsRecords = 2;
let counterHostRecords = 2;
let counterMailRecords = 2;

$(document).ready(function(){

    document.getElementById("defaultOpen").click();

    $(".external-check").change(ChangeEvent);

    $("#add_ns").click(function(){
        let content = `
		  	<div class='ns_record'>
				<input type="text" name="ns${counterNsRecords}" id="ns${counterNsRecords}" placeholder="name">
		        <select name="ns_ip_addr_type${counterNsRecords}" id="ns_ip_addr_type${counterNsRecords}">
		        	<option disabled selected>IP record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="ns_ip${counterNsRecords}" id="ns_ip${counterNsRecords}" placeholder="ip address">					
				<input type="number" name="ns_ttl${counterNsRecords}" id="ns_ttl${counterNsRecords}" placeholder="time to live" min="0" max="1209600">
		  	</div>`;
        $(".ns_record_wrapper").append(content);
        counterNsRecords++;
    });

    $("#add_host").click(function(){
        let content = `
			<div class="host_record">
				<input type="text" name="host_name${counterHostRecords}" id="host_name${counterHostRecords}" placeholder="host name">
		        <select name="host_name_ip_addr_type${counterHostRecords}" id="host_name_ip_addr_type${counterHostRecords}">
		        	<option disabled selected>IP record type</option>
		            <option value="A">A</option>
		        	<option value="AAAA">AAAA</option>
		        </select >
				<input type="text" name="host_name_ip${counterHostRecords}" id="host_name_ip${counterHostRecords}" placeholder="ip address">					
				<input type="number" name="host_name_ttl${counterHostRecords}" id="host_name_ttl${counterHostRecords}" placeholder="time to live" min="0" max="86400">
			</div>
		`;
        $(".host_record_wrapper").append(content);
        counterHostRecords++;
    });

    $("#add_mail").click(function(){
        let content = `
			<div class="mail_record">
			    <input name="mail_host${counterMailRecords}" id="mail_host${counterMailRecords}" type="text" placeholder="mail host name">
			    <input name="mail_ip_host${counterMailRecords}" id="mail_ip_host${counterMailRecords}" type="text" placeholder="mail host ip address">
			    <input name="mail_preference${counterMailRecords}" id="mail_preference${counterMailRecords}" type="number" min="0" max="65535" placeholder="preference">
			    <input type="number" name="mail_ttl${counterMailRecords}" id="mail_ttl${counterMailRecords}" placeholder="time to live" min="0" max="3024000">
                <label class="checkbox-inline">
                    <input type="checkbox" class="external-check  form-check-input" name="external${counterMailRecords}" value="true">External record
                </label> 
			</div>
		`;
        $(".mail_record_wrapper").append(content);
        counterMailRecords++;
        $('.external-check:last').change(ChangeEvent);
    });

    $('#btn-submit').click(sendFrom);

});

function openTab(evt, cityName) {
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

function sendFrom(){

}
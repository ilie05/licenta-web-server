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
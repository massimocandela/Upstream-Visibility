define([
    "bgpst.view.graphdrawer",
    "bgpst.controller.validator",
    "bgpst.controller.dateconverter",
    "bgpst.view.broker",
    "bgpst.view.scroller",
    "bgpst.lib.moment",
    "bgpst.lib.jquery-amd",
    "bgpst.lib.stache!main"
], function(GraphDrawer, Validator, DateConverter, RipeDataBroker, EPPZScrollTo, moment, $, template){


    //setup the whole gui interface actions, events and styles <-- TO CALL AT DOM READY
    var GuiManager = function(env) {

        /*************************************** DOM elements ************************************/
        env.parentDom.append(template());
        this.drawer = new GraphDrawer(env);
        this.loader = $(".loading_text");
        this.mask = $("div.loader_mask");
        this.container = $("div.body_container");

        this.tokenfield = $(".tokenfield");

        //new to try

        this.preserve_map = true;
        this.localstorage_enabled = true;
        this.global_visibility = true;
        this.prepending_prevention = true;
        this.asn_level = 1;
        this.ip_version = [4];
        this.graph_type = "stream";
        this.streaming = false;
        this.steps = false;
        this.merge_cp = false;
        this.merge_events = 1;
        this.events_labels = false;
        this.cp_labels = false;
        this.use_scrollbars = false;
        this.cp_info_done = false;
        this.asn_info_done = false;
        this.gather_information = true;
        this.heatmap_time_map = true;
        this.streaming_speed = 10000;
        this.max_tokens = 5;

        this.url = location.protocol + '//' + location.host + location.pathname;
        this.context = env.main;
        this.RipeDataBroker = new RipeDataBroker(this.drawer, this.context, this);
        this.validator = new Validator();
        this.DateConverter = new DateConverter();
        this.scroller = new EPPZScrollTo();


    };

    GuiManager.prototype.init = function(){
        this.drawer.drawer_init();
        this.get_local_ip();
        this.pickers_setup();
        this.tokenfield_setup();
        this.input_address_setup();
        this.ipversion_setup();
        this.clear_button_setup();
        this.my_ip_button_setup();
        this.go_button_setup();
        this.other_command_button_setup();
        this.tooltip_setup();
    };

    GuiManager.prototype.isGraphPresent = function(text) {
        //return d3.select("svg").select(".chart").node() != null;
        return this.drawer.isGraphPresent();
    };

    //Loader splashscreen managing
    GuiManager.prototype.changeLoaderText = function(text) {
        //console.log("CAMBIA in "+text);
        $(this.loader).html(text);
    };

    GuiManager.prototype.toggleLoader = function() {
        $(this.mask).toggleClass("hidden");
        $(this.container).toggleClass("blur");
    };

    //add tooltip  <-- TO CALL AT SETUP
    GuiManager.prototype.tooltip_setup = function() {
        $('[data-toggle="tooltip"]').tooltip();
    };

    GuiManager.prototype.draggable_setup = function(){
        $(".drag_sort_list").sortable();
    };

    //setup the pickers <-- TO CALL AT SETUP
    GuiManager.prototype.pickers_setup = function() {
        var GuiManager = this;
        /*formats & date linking*/
        $('.datetimepicker.date_only.start').datetimepicker({
            format:'l',
            useCurrent: true, //Important! See issue #1075
        });
        $('.datetimepicker.time_only.start').datetimepicker({
            format:'LTS'
        });
        $('.datetimepicker.date_only.end').datetimepicker({
            format:'l',
            useCurrent: true, //Important! See issue #1075
        });
        $('.datetimepicker.time_only.end').datetimepicker({
            format:'LTS',
            //useCurrent: true //Important! See issue #1075
        });
        $('.datetimepicker.date_only.start').data("DateTimePicker").maxDate(moment());
        $('.datetimepicker.date_only.end').data("DateTimePicker").maxDate(moment());
        /*time linking*/
        $(".datetimepicker.date_only.start").on("dp.change", function (e) {
            var date_start = $('.datetimepicker.date_only.start').data("DateTimePicker").date();
            var date_end = $('.datetimepicker.date_only.end').data("DateTimePicker").date();
            if(date_end == null || date_end == undefined)
                $('.datetimepicker.date_only.end').data("DateTimePicker").date(date_start);
            $('.datetimepicker.date_only.end').data("DateTimePicker").minDate(e.date);
        });
        $(".datetimepicker.time_only.start").on("dp.change", function (e) {
            GuiManager.check_end_time(e);
        });
        $('.datetimepicker.date_only').on("dp.change", function (e) {
            GuiManager.check_end_time(e);
        });
        $('.datetimepicker').on("dp.change", function (e) {
            GuiManager.UIerror_check(this);

        });

        $('.datetimepicker').on("dp.change", function (e) {
            $('.datetimepicker.date_only.start').data("DateTimePicker").viewDate($('.datetimepicker.date_only.start').data("DateTimePicker").date());
            $('.datetimepicker.date_only.end').data("DateTimePicker").viewDate($('.datetimepicker.date_only.end').data("DateTimePicker").date());
        });

        //setting current date
        var cur_date = moment();
        $('.datetimepicker.date_only.end').data("DateTimePicker").date(this.DateConverter.formatInterface(cur_date));
        $('.datetimepicker.time_only.end').data("DateTimePicker").date(this.DateConverter.formatInterfaceTime(cur_date));
        var day_before = moment().subtract(1,'days');
        $('.datetimepicker.date_only.start').data("DateTimePicker").date(this.DateConverter.formatInterface(day_before));
        $('.datetimepicker.time_only.start').data("DateTimePicker").date(this.DateConverter.formatInterfaceTime(day_before));
    };

    //avoid time clipping on hours time pickers
    GuiManager.prototype.check_end_time = function(e){
        var date_start = $('.datetimepicker.date_only.start').data("DateTimePicker").date();
        var date_end = $('.datetimepicker.date_only.end').data("DateTimePicker").date();
        var time_start = $('.datetimepicker.time_only.start').data("DateTimePicker").date();
        if(date_start == null && date_end == null)
            $('.datetimepicker.time_only.end').data("DateTimePicker").minDate(time_start);
        else
        if(moment(date_start).isSame(date_end,'date') && !((time_start == null)||(time_start == "")||(time_start == undefined))) {
            $('.datetimepicker.time_only.end').data("DateTimePicker").minDate(time_start);
        }
        else
            $('.datetimepicker.time_only.end').data("DateTimePicker").minDate(false);
    };

    //setup the tokenfield <-- TO CALL AT SETUP
    GuiManager.prototype.tokenfield_setup = function() {
        var GuiManager = this;
        //tokenfield
        this.tokenfield.tokenfield();//{limit:GuiManager.max_tokens}
        //var placeholder=$('.tokenfield').find('input').attr('placeholder');
        //$('.tokenfield').find('input').attr('placeholder', placeholder+" ("+GuiManager.max_tokens+" max)");
        this.tokenfield.on('keydown',function(e){
            e.preventDefault();
            e.stopPropagation();
        });
        this.tokenfield.on("change",function(e) {
            GuiManager.UIerror_check($(this).parent().parent());
        });
    };

    /**if the field get updated remove the error class**/
    GuiManager.prototype.UIerror_check = function(e) {
        var val = $(e).find('input').val();
        if(val != null && val != "" && val != undefined)
            $(e).removeClass("has-error");
    };

    //setup the input address <-- TO CALL AT SETUP
    GuiManager.prototype.input_address_setup = function() {
        var GuiManager = this;
        $('input.add_address').on('keydown',function(e){
            var version = $("input[name='ipversion']:checked").val();
            var val = $(this).parent().find('input').val();
            var valid = false;
            if((val != null && val != undefined && val != "") && GuiManager.valid_address())
                var valid = true;
            if(e.which == 13) {
                e.preventDefault();
                if(valid) {
                    switch(version) {
                        case "asn":
                            val = "AS"+val;
                            break;
                        case "4":
                            var bar = $('input[name="add_bar"]').val();
                            if(bar != "" && bar != null && bar != undefined)
                                val = val+"/"+bar;
                            $('input[name="add_bar"]').val("");
                            break;
                        case "6":
                            var bar = $('input[name="add_bar"]').val();
                            if(bar != "" && bar != null && bar != undefined)
                                val = val+"/"+bar;
                            $('input[name="add_bar"]').val("");
                            break;
                    }
                    if($(".tokenfield").find("input").val().replace(/\s/g, '').split(",").indexOf(val)<0)
                        $('.tokenfield').tokenfield('createToken',val);
                    $(this).parent().find('input').val("");
                }
                $("input.token-input").css("width","auto");
            }
        });

        $('input.add_address').on('keyup',function(e){
            var val = $(this).parent().find('input').val();
            if(val == null || val == undefined || val == ""){
                $(this).parent().removeClass("has-success");
                $(this).parent().removeClass("has-error");
            }
        });

        $('input.add_address').on('paste',function(e){
            var pasteData = e.originalEvent.clipboardData.getData('text');
            var fields;
            if(GuiManager.validator.check_ipv4(pasteData)||GuiManager.validator.check_ipv6(pasteData)||GuiManager.validator.check_asn(pasteData)){
                if(GuiManager.validator.check_asn(pasteData)){
                    fields = pasteData.replace(/^(A|a)(S|s)/,"").trim();
                    $('input[name="ipversion"][value="asn"]').prop('checked', true);
                    $('input.add_address').val(fields);
                    $('input[name="ipversion"]').change();
                    e.preventDefault();
                    e.stopPropagation();
                }
                else {
                    fields = pasteData.trim().split("/");
                    if(fields.length == 2)
                        if((GuiManager.validator.check_ipv6(fields[0])&&parseInt(fields[1])<129)||(GuiManager.validator.check_ipv4(fields[0])&&parseInt(fields[1])<33)){
                            if(GuiManager.validator.check_ipv4(fields[0]))
                                $('input[name="ipversion"][value="4"]').prop('checked', true);
                            if(GuiManager.validator.check_ipv6(fields[0]))
                                $('input[name="ipversion"][value="6"]').prop('checked', true);
                            $('input.add_address').val(fields[0]);
                            $('input[name="ipversion"]').change();
                            $('input.bar').val(fields[1]);
                            e.preventDefault();
                            e.stopPropagation();
                        }
                }
            }
        });

        $('input.add_address').on('focusout',function(e){
            var val = $('input.add_address').val();
            if(val == "")
                $('input.add_address').parent().removeClass("has-error");
        });
    };

    //setup the bar address <-- TO CALL WHEN BAR IS CREATED
    GuiManager.prototype.input_bar_setup = function() {
        $('input.bar').on('keydown',function(e){
            if(e.which == 13) {
                e.preventDefault();
                $('input.add_address').trigger(e);
                $('input.add_address').focus();
            }
        })
            .on("focus", function(){$("input.add_address").tooltip('show')});;

        $('input.bar').on('focusout',function(e){
            var val = $('input.bar').val();
            if(val == "")
                $('input.bar').parent().removeClass("has-error");
        });
    };

    //check if the address field is in a valid state
    GuiManager.prototype.valid_address = function(val) {
        var version = $("input[name='ipversion']:checked").val();
        var has_error = $('.add_address').parent().parent().find('.has-error').length;
        var has_success = $('.add_address').parent().parent().find('.has-success').length
        if(has_success && !has_error)
            return true;
        else
            return false;
    };

    //radio button setup
    //call the new validator on the address field  <-- TO CALL AT SETUP FUNCTION
    GuiManager.prototype.ipversion_setup = function() {
        var GuiManager = this;
        $('input[name="ipversion"]').on('change',function(e){

            GuiManager.validator_destroy();
            var version = $("input[name='ipversion']:checked").val();
            //destroy old validator
            $('input.add_address').parent().find('.asnumber').remove();
            $('input.add_address').parent().find('.bar').remove();
            switch(version) {
                case "4" :
                    GuiManager.set_ipv4_validator();
                    break;
                case "6" :
                    GuiManager.set_ipv6_validator();
                    break;
                case "asn" :
                    GuiManager.set_asn_validator();
                    break;
                case "free" :
                    GuiManager.set_free_validator();
                    break;
                default :
                    break;
            }
            //call the new validator to validate
            GuiManager.validator_validate();
            $('input.add_address').parent().find('input.add_address').trigger('focus');
        });
        //default first validaor
        GuiManager.set_ipv4_validator();
    };

    //call the validation method
    GuiManager.prototype.validator_validate = function() {
        $('.registrationForm').bootstrapValidator('validate');
    };

    //detroy the validator
    GuiManager.prototype.validator_destroy = function() {
        $('.registrationForm').data('bootstrapValidator').destroy();
    };

    //setup the new validator ipv4
    GuiManager.prototype.set_ipv4_validator = function() {
        $('input.add_address').parent().addClass("input-group");
        $('input.add_address').parent().append("<span class='input-group-addon bar'>/</span>");
        $('input.add_address').parent().append("<input type='text' class='form-control bar righ_radius' name='add_bar' maxlength='2' placeholder='Subnet' />");
        $('input.add_address').attr('placeholder','IPv4 address');
        $('input.add_address').attr('maxlength','15');
        this.input_bar_setup();
        $('.registrationForm').bootstrapValidator({
            // I am validating Bootstrap form
            framework: 'bootstrap',

            // Feedback icons
            icon: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },

            // List of fields and their validation rules
            fields: {
                add_address: {
                    validators: {
                        ip: {
                            ipv4: true,
                            ipv6: false
                        },
                        notEmpty: {}
                    }
                },
                add_bar: {
                    validators: {
                        integer: {},
                        between: {
                            min: 0,
                            max: 32
                        }
                    }
                }
            }
        });
    };

    //setup the new validator ipv6
    GuiManager.prototype.set_ipv6_validator = function() {
        $('input.add_address').parent().addClass("input-group");
        $('input.add_address').parent().append("<span class='input-group-addon bar'>/</span>");
        $('input.add_address').parent().append("<input type='text' class='form-control bar righ_radius' name='add_bar' maxlength='3' placeholder='Subnet' />");
        $('input.add_address').attr('placeholder','IPv6 address');
        $('input.add_address').attr('maxlength','45');
        this.input_bar_setup();
        $('.registrationForm').bootstrapValidator({
            // I am validating Bootstrap form
            framework: 'bootstrap',

            // Feedback icons
            icon: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },

            // List of fields and their validation rules
            fields: {
                add_address: {
                    validators: {
                        ip: {
                            ipv4: false,
                            ipv6: true
                        },
                        notEmpty: {}
                    }
                },
                add_bar: {
                    validators: {
                        integer: {},
                        between: {
                            min: 0,
                            max: 128
                        }
                    }
                }
            }
        });
    };

    //setup the new validator ipv6
    GuiManager.prototype.set_asn_validator = function() {
        $('input.add_address').parent().addClass("input-group");
        $('input.add_address').parent().append("<span class='input-group-addon asnumber righ_radius'>AS</span>");
        $('input.add_address').attr('maxlength','10');
        $('input.add_address').attr('placeholder','AS Number');
        $('.registrationForm').bootstrapValidator({
            // I am validating Bootstrap form
            framework: 'bootstrap',

            // Feedback icons
            icon: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },

            // List of fields and their validation rules
            fields: {
                add_address: {
                    validators: {
                        integer: {
                        },
                        between: {
                            min: 0,
                            max: 4294967296
                        },
                        notEmpty: {}
                    }
                }
            }
        });
    };

    //setup the new validator ipv6
    GuiManager.prototype.set_free_validator = function() {
        $('input.add_address').parent().removeClass("input-group");
        $('input.add_address').parent().find('.asnumber').remove();
        $('input.add_address').parent().find('.bar').remove();
        $('input.add_address').attr('placeholder','Enter something');
        $('.registrationForm').bootstrapValidator({
            // I am validating Bootstrap form
            framework: 'bootstrap',

            // Feedback icons
            icon: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },

            // List of fields and their validation rules
            fields: {
                add_address: {
                    validators: {
                        notEmpty: {
                        }
                    }
                }
            }
        });
    };

    //clear_targets_button setup <-- TO CALL AT SETUP FUNCTION
    //empty the tokenfield
    GuiManager.prototype.clear_button_setup = function (){
        $(".clear_targets_button").on('click',function(){
            $('.tokenfield').tokenfield('setTokens', []);
            $('.tokenfield').find('input').val('');
        });
    };

    //go_button click setup  <-- TO CALL AT SETUP FUNCTION
    //check if the fields are valid and then submit the query to RIPEstat rest API
    GuiManager.prototype.go_button_setup = function() {
        var GuiManager = this;
        $(".go_button").on('click',function(){
            var time_start = $(".datetimepicker.time_only.start").find("input").val();
            var time_end = $(".datetimepicker.time_only.end").find("input").val();
            var date_start = $(".datetimepicker.date_only.start").find("input").val();
            var date_end = $(".datetimepicker.date_only.end").find("input").val();
            var tgs = $(".tokenfield").find("input").val().replace(/\s/g, '');
            var bar = $("input.bar").val();
            var input = $("input.add_address").val();
            if(tgs == ""&&$("div.input_add").hasClass("has-success")){
                var tgs = input;
                if(GuiManager.validator.check_asn(tgs))
                    tgs = "AS"+tgs;
                else
                if(bar != ""&&bar != null&&!isNaN(parseInt(bar)))
                    tgs+="/"+bar;
            }
            var check = true;
            if(time_start == null || time_start == ""){
                check = false;
                $(".datetimepicker.time_only.start").addClass("has-error");
            }
            if(time_end == null || time_end == ""){
                check = false;
                $(".datetimepicker.time_only.end").addClass("has-error");
            }
            if(date_start == null || date_start == ""){
                check = false;
                $(".datetimepicker.date_only.start").addClass("has-error");
            }
            if(date_end == null || date_end == ""){
                check = false;
                $(".datetimepicker.date_only.end").addClass("has-error");
            }
            if(tgs == null || tgs == ""){
                check = false;
                $(".tokenfield").parent().addClass("has-error");
            }
            if(check){
                $("input.add_address").val("");
                $("input.bar").val("");
                $("div.input_add").removeClass("has-success");
                GuiManager.changeLoaderText("Connecting to RIPEStat");
                GuiManager.toggleLoader();
                GuiManager.RipeDataBroker.requestBuilderData(date_start,time_start,date_end,time_end,tgs);
                GuiManager.RipeDataBroker.getData();
            }
        });
    };

    GuiManager.prototype.url_string = function() {
        var GuiManager = this;
        var url_to_push =GuiManager.url+"?";
        url_to_push+='w.starttime='+GuiManager.RipeDataBroker.current_starttime;
        url_to_push+="&w.endtime="+GuiManager.RipeDataBroker.current_endtime;
        url_to_push+="&w.type="+GuiManager.graph_type;
        url_to_push+="&w.level="+GuiManager.asn_level;
        url_to_push+="&w.prepending="+GuiManager.prepending_prevention;
        url_to_push+="&w.merge_cp="+GuiManager.merge_cp;
        url_to_push+="&w.merge_events="+GuiManager.merge_events;
        url_to_push+="&w.timemap="+GuiManager.heatmap_time_map;
        url_to_push+="&w.global="+GuiManager.global_visibility;
        url_to_push+="&w.info="+GuiManager.gather_information;
        url_to_push+="&w.heu="+GuiManager.RipeDataBroker.HeuristicsManager.current_heuristic;
        if(GuiManager.RipeDataBroker.HeuristicsManager.current_sort_type)
            url_to_push+="&w.sort_type="+GuiManager.RipeDataBroker.HeuristicsManager.current_sort_type;
        url_to_push+="&w.colors="+GuiManager.preserve_map;
        if(GuiManager.drawer.events_range){
            url_to_push+="&w.brush_s="+GuiManager.DateConverter.formatRipe(GuiManager.drawer.events_range[0]);
            url_to_push+="&w.brush_e="+GuiManager.DateConverter.formatRipe(GuiManager.drawer.events_range[1]);
        }
        url_to_push+="&w.resources="+GuiManager.RipeDataBroker.current_targets;
        history.pushState("", 'BGPStreamgraph', url_to_push);
    };

    //cache the current local ip <-- TO CALL AT SETUP FUNCTION
    //return the current pubblic ip of the local machine  <-- TO CALL AT SETUP FUNCTION
    GuiManager.prototype.get_local_ip = function() {
        var GuiManager = this;
        $.ajax({
            type: "GET",
            data: {},
            url: "https://ipinfo.io/json",
            error: function(response) {
                console.log(response);
                var code = parseInt(response.status/100);
                if(code == 0)
                    alert("IpInfo: Blocked by client, may disable AdBlock.");
                else
                    switch(code) {
                        case 4:
                            alert("IpInfo: Client error.");
                            break;
                        case 5:
                            alert("IpInfo: server is not responding.");
                            break;
                        default: break;
                    }
            },
            success: function(response) {
                console.log("== GUiManager IP info");
                console.log(response);
                GuiManager.current_local_ip = response.ip;
            }
        });
    };

    //my_ip_button click setup  <-- TO CALL AT SETUP FUNCTION
    //check for the current machine pubblic ip
    GuiManager.prototype.my_ip_button_setup = function() {
        var GuiManager = this;
        $(".my_ip_button").on("click", function(){
            if(!GuiManager.current_local_ip)
                GuiManager.get_local_ip();
            GuiManager.set_address(GuiManager.current_local_ip)
        });
    };

    GuiManager.prototype.set_address = function(val) {
        $('input.add_address').parent().find('input').val(val);
        $('input.add_address').trigger('focus');
        $('input[name="ipversion"]').trigger('change');
    };

    //other_command_menu
    GuiManager.prototype.other_command_button_setup = function() {
        this.shuffle_color_map_btn_setup();
        this.draw_last_data_btn_setup();
        this.erase_graph_btn_setup();
        this.gather_information_btn_setup();
        this.preserve_color_map_btn_setup();
        this.local_storage_enabled_btn_setup();
        this.prepending_prevention_btn_setup();
        this.merge_events_btn_setup();
        this.merge_cp_btn_setup();
        this.events_labels_btn_setup();
        this.cp_labels_btn_setup();
        this.scrollbars_btn_setup();
        this.heatmap_time_btn_setup();
        this.global_visiblity_btn_setup();
        this.graph_type_radio_setup();
        this.ip_version_checkbox_setup();
        this.asn_level_setup();
        this.streaming_btn_setup();
        this.steps_btn_setup();
        this.asn_list_btn_setup();
        this.cp_list_btn_setup();
        this.boolean_checker();
        /***********************************************/
        this.sort_asn_ascstdev_btn_setup();
        this.sort_asn_dscstdev_btn_setup();
        this.sort_asn_ascvar_btn_setup();
        this.sort_asn_dscvar_btn_setup();
        this.sort_asn_ascavg_btn_setup();
        this.sort_asn_dscavg_btn_setup();
        this.sort_asn_ascsum_btn_setup();
        this.sort_asn_dscsum_btn_setup();
        this.lev_dist_randwalk_cum_btn_setup();
        this.lev_dist_randwalk_max_btn_setup();
        this.point_dist_by_randwalk_btn_setup();
        this.point_dist_by_inference_btn_setup();
        this.point_dist_greedy_btn_setup();
        this.exchange_greedy_sort_btn_setup();
        this.wiggle_max_btn_setup();
        this.wiggle_sum_btn_setup();
        /**********************************************/
        this.heat_greedy_sort_1_btn_setup();
        this.heat_greedy_sort_2_btn_setup();
        this.heat_stdev_sort_btn_setup();
        this.heat_geo_sort_btn_setup();
        this.heat_asn_sort_btn_setup();
        this.draw_last_data_btn_enabler();
        this.draw_functions_btn_enabler();
        /**********************************************/
        this.docs_btn_setup();
        this.about_btn_setup();
        this.embed_btn_setup();
    };

    GuiManager.prototype.shuffle_color_map_btn_setup = function() {
        var GuiManager = this;
        $(".shuffle_color_map_btn").on("click", function(e){
            if(GuiManager.isGraphPresent())
                GuiManager.drawer.shuffle_color_map(GuiManager.graph_type);
        });
    };

    GuiManager.prototype.draw_last_data_btn_setup = function() {
        var GuiManager = this;
        $(".draw_last_data_btn").on("click", function(e){
            GuiManager.changeLoaderText("Restoring Context");
            GuiManager.toggleLoader();
            setTimeout(function(){GuiManager.context.restoreContext();GuiManager.draw_functions_btn_enabler();GuiManager.toggleLoader();},0);
        });
    };

    GuiManager.prototype.draw_last_data_btn_enabler = function() {
        if(localStorage['last_context_original_data']){
            $(".draw_last_data_btn").parent().removeClass("disabled");
            $(".draw_last_data_btn").removeClass("not-active");
        }
        else {
            $(".draw_last_data_btn").parent().addClass("disabled");
            $(".draw_last_data_btn").addClass("not-active");
        }
    };

    //d3.select("svg").select(".chart").node()
    GuiManager.prototype.draw_functions_btn_enabler = function() {
        GuiManager = this;
        if(!this.streaming){
            $(".option_command_btn").removeClass("disabled");
            $(".clear_targets_button").removeClass("disabled");
            $(".my_ip_button").removeClass("disabled");
            $(".go_button").removeClass("disabled");
            $(".input_add").find("input").removeClass("disabled");
            $(".date").removeClass("disabled");

            $(".option_command_btn").removeClass("not-active");
            $(".clear_targets_button").removeClass("not-active");
            $(".my_ip_button").removeClass("not-active");
            $(".go_button").removeClass("not-active");
            $(".input_add").find("input").removeClass("not-active");
            $(".date").removeClass("not-active");

            $(".tokenfield").tokenfield('enable');
            $(".tokenfield").removeClass('disabled');
            $(".tokenfield").removeClass('not-active');

            $("input[name='ipversion']").attr("disabled",false);
            $("input[name='ipversion']").parent().removeClass("disabled");
            $("input[name='ipversion']").parent().removeClass("not-active");

            $("input[name='graph_type']").parent().removeClass("disabled");
            $("input[name='graph_type']").parent().removeClass("not-active");
            $("input[name='graph_type']").parent().attr("disabled",false);

            if(this.isGraphPresent()){
                $(".path_btn").removeClass("disabled");
                $(".list_btn").removeClass("disabled");
                $(".sort_btn").removeClass("disabled");
                $(".path_btn").removeClass("not-active");
                $(".list_btn").removeClass("not-active");
                $(".sort_btn").removeClass("not-active");
                if(!this.RipeDataBroker.current_parsed.targets.some(function(e){return GuiManager.validator.check_ipv4(e);})){
                    $("input[name='ip_version'][value='4']").parent().addClass("disabled");
                    $("input[name='ip_version'][value='4']").parent().addClass("not-active");
                    $("input[name='ip_version'][value='4']").parent().attr("disabled",true);
                }
                else {
                    $("input[name='ip_version'][value='4']").parent().removeClass("disabled");
                    $("input[name='ip_version'][value='4']").parent().removeClass("not-active");
                    $("input[name='ip_version'][value='4']").parent().attr("disabled",false);
                }
                if(!this.RipeDataBroker.current_parsed.targets.some(function(e){return GuiManager.validator.check_ipv6(e);})){
                    $("input[name='ip_version'][value='6']").parent().addClass("disabled");
                    $("input[name='ip_version'][value='6']").parent().addClass("not-active");
                    $("input[name='ip_version'][value='6']").parent().attr("disabled",true);
                }
                else {
                    $("input[name='ip_version'][value='6']").parent().removeClass("disabled");
                    $("input[name='ip_version'][value='6']").parent().removeClass("not-active");
                    $("input[name='ip_version'][value='6']").parent().attr("disabled",false);
                }
                if(this.ip_version.indexOf(4) != -1){
                    $('input[name="ip_version"]').filter('[value="4"]').prop('checked', true);
                    $('input[name="ip_version"]').filter('[value="4"]').parent().addClass("active");
                }
                else {
                    $('input[name="ip_version"]').filter('[value="4"]').prop('checked', false);
                    $('input[name="ip_version"]').filter('[value="4"]').parent().removeClass("active");
                }
                if(this.ip_version.indexOf(6) != -1){
                    $('input[name="ip_version"]').filter('[value="6"]').prop('checked', true);
                    $('input[name="ip_version"]').filter('[value="6"]').parent().addClass("active");
                }
                else {
                    $('input[name="ip_version"]').filter('[value="6"]').prop('checked', false);
                    $('input[name="ip_version"]').filter('[value="6"]').parent().removeClass("active");
                }
                $(".counter").removeClass("hidden");
                this.draggable_setup();
                if(this.graph_type == "stream"){
                    $("input[name='steps'][value='steps']").parent().removeClass("disabled");
                    $("input[name='steps'][value='steps']").parent().removeClass("not-active");
                    $("input[name='steps'][value='steps']").parent().attr("disabled",false);
                    $(".steps_btn").removeClass("not-active");

                    $("input[name='streaming'][value='streaming']").parent().removeClass("disabled");
                    $("input[name='streaming'][value='streaming']").parent().removeClass("not-active");
                    $("input[name='streaming'][value='streaming']").parent().attr("disabled",false);
                    $(".streaming_btn").removeClass("not-active");
                }
                if(this.graph_type == "heat"){
                    $("input[name='steps'][value='steps']").parent().addClass("disabled");
                    $("input[name='steps'][value='steps']").parent().addClass("not-active");
                    $("input[name='steps'][value='steps']").parent().attr("disabled",true);
                    $(".steps_btn").addClass("not-active");

                    $("input[name='streaming'][value='streaming']").parent().addClass("disabled");
                    $("input[name='streaming'][value='streaming']").parent().addClass("not-active");
                    $("input[name='streaming'][value='streaming']").parent().attr("disabled",true);
                    $(".streaming_btn").addClass("not-active");
                }
                if(!this.steps){
                    $('input[name="steps"][value="steps"]').prop('checked', false);
                    $('input[name="steps"][value="steps"]').parent().removeClass("active");
                }
            }
            else {
                $(".path_btn").addClass("disabled");
                $(".list_btn").addClass("disabled");
                $(".sort_btn").addClass("disabled");
                $(".path_btn").addClass("not-active");
                $(".list_btn").addClass("not-active");
                $(".sort_btn").addClass("not-active");

                $("input[name='ip_version'][value='6']").parent().addClass("disabled");
                $("input[name='ip_version'][value='6']").parent().addClass("not-active");
                $("input[name='ip_version'][value='6']").parent().attr("disabled",true);

                $("input[name='ip_version'][value='4']").parent().addClass("disabled");
                $("input[name='ip_version'][value='4']").parent().addClass("not-active");
                $("input[name='ip_version'][value='4']").parent().attr("disabled",true);

                $(".counter").addClass("hidden");

                $("input[name='steps'][value='steps']").parent().addClass("disabled");
                $("input[name='steps'][value='steps']").parent().addClass("not-active");
                $("input[name='steps'][value='steps']").parent().attr("disabled",true);
                $(".steps_btn").addClass("not-active");

                $("input[name='streaming'][value='streaming']").parent().addClass("disabled");
                $("input[name='streaming'][value='streaming']").parent().addClass("not-active");
                $("input[name='streaming'][value='streaming']").parent().attr("disabled",true);
                $(".streaming_btn").addClass("not-active");
            }
        }
        $("input.token-input").css("width","auto");
    };

    GuiManager.prototype.lock_all = function(){
        $(".path_btn").addClass("disabled");
        $(".list_btn").addClass("disabled");
        $(".sort_btn").addClass("disabled");
        $(".option_command_btn").addClass("disabled");
        $(".clear_targets_button").addClass("disabled");
        $(".my_ip_button").addClass("disabled");
        $(".go_button").addClass("disabled");
        $(".input_add").find("input").addClass("disabled");
        $(".date").addClass("disabled");

        $(".path_btn").addClass("not-active");
        $(".list_btn").addClass("not-active");
        $(".sort_btn").addClass("not-active");
        $(".option_command_btn").addClass("not-active");
        $(".clear_targets_button").addClass("not-active");
        $(".my_ip_button").addClass("not-active");
        $(".go_button").addClass("not-active");
        $(".input_add").find("input").addClass("not-active");
        $(".date").addClass("not-active");

        $(".tokenfield").tokenfield('disable');
        $(".tokenfield").addClass('disabled');
        $(".tokenfield").addClass('not-active');

        $("input[name='graph_type']").parent().addClass("disabled");
        $("input[name='graph_type']").parent().addClass("not-active");
        $("input[name='graph_type']").parent().attr("disabled",true);

        $("input[name='ipversion']").parent().addClass("disabled");
        $("input[name='ipversion']").parent().addClass("not-active");
        $("input[name='ipversion']").attr("disabled",true);

        $("input[name='ip_version'][value='6']").parent().addClass("disabled");
        $("input[name='ip_version'][value='6']").parent().addClass("not-active");
        $("input[name='ip_version'][value='6']").parent().attr("disabled",true);

        $("input[name='ip_version'][value='4']").parent().addClass("disabled");
        $("input[name='ip_version'][value='4']").parent().addClass("not-active");
        $("input[name='ip_version'][value='4']").parent().attr("disabled",true);

        $("input[name='steps'][value='steps']").parent().addClass("disabled");
        $("input[name='steps'][value='steps']").parent().addClass("not-active");
        $("input[name='steps'][value='steps']").parent().attr("disabled",true);
        $(".steps_btn").addClass("not-active");

        if(!this.streaming){
            $("input[name='streaming'][value='streaming']").parent().addClass("disabled");
            $("input[name='streaming'][value='streaming']").parent().addClass("not-active");
            $("input[name='streaming'][value='streaming']").parent().attr("disabled",true);
            $(".streaming_btn").addClass("not-active");
        }
    };

    GuiManager.prototype.erase_graph_btn_setup = function() {
        var GuiManager = this;
        $(".erase_graph_btn").on("click", function(e){
            GuiManager.drawer.drawer_init();
            GuiManager.draw_functions_btn_enabler();
        });
    };

    GuiManager.prototype.gather_information_btn_setup = function() {
        var GuiManager = this;
        $(".gather_information_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.gather_information = !GuiManager.gather_information;
            GuiManager.url_string();
        });
    };

    GuiManager.prototype.preserve_color_map_btn_setup = function() {
        var GuiManager = this;
        $(".preserve_color_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.preserve_map = !GuiManager.preserve_map;
            GuiManager.url_string();
        });
    };

    GuiManager.prototype.local_storage_enabled_btn_setup = function() {
        var GuiManager = this;
        $(".localstorage_enabled_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.localstorage_enabled = !GuiManager.localstorage_enabled;
        });
    };

    GuiManager.prototype.prepending_prevention_btn_setup = function () {
        var GuiManager = this;
        $(".prepending_prevention_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.prepending_prevention = !GuiManager.prepending_prevention;
            if(GuiManager.isGraphPresent())
                if(GuiManager.graph_type == "stream")
                    GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
                else
                if(GuiManager.graph_type == "heat")
                    GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
        });
    };

    GuiManager.prototype.merge_cp_btn_setup = function () {
        var GuiManager = this;
        $(".merge_cp_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.merge_cp = !GuiManager.merge_cp;
            if(GuiManager.isGraphPresent()) {
                GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
                if(GuiManager.merge_cp)
                    GuiManager.update_counters(".counter_asn", GuiManager.drawer.keys.length+"/"+GuiManager.RipeDataBroker.current_parsed.cp_set.length);
                else
                    GuiManager.update_counters(".counter_asn", GuiManager.drawer.keys.length);
            }
        });
    };

    GuiManager.prototype.merge_events_btn_setup = function () {
        var GuiManager = this;
        $("input[name='merge_events']:input").on("change", function( e, ui ) {
            GuiManager.merge_events = $("input[name='merge_events']").spinner("value");
            if(GuiManager.isGraphPresent()) {
                GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
                if(GuiManager.merge_events)
                    GuiManager.update_counters(".counter_events",GuiManager.drawer.event_set.length+"/"+GuiManager.RipeDataBroker.current_parsed.events.length);
                else
                    GuiManager.update_counters(".counter_events",GuiManager.RipeDataBroker.current_parsed.events.length);
            }
        });
    };

    GuiManager.prototype.events_labels_btn_setup = function () {
        var GuiManager = this;
        $(".events_labels_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.events_labels = !GuiManager.events_labels;
            if(GuiManager.isGraphPresent())
                GuiManager.RipeDataBroker.loadCurrentState(false,null,false);
        });
    };

    GuiManager.prototype.cp_labels_btn_setup = function () {
        var GuiManager = this;
        $(".cp_labels_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.cp_labels = !GuiManager.cp_labels;
            if(GuiManager.isGraphPresent())
                GuiManager.RipeDataBroker.loadCurrentState(false,null,false);
        });
    };

    GuiManager.prototype.heatmap_time_btn_setup = function(){
        var GuiManager = this;
        $(".heatmap_time_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.heatmap_time_map = !GuiManager.heatmap_time_map;
            if(GuiManager.isGraphPresent())
                GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
        });
    };

    GuiManager.prototype.scrollbars_btn_setup = function () {
        var GuiManager = this;
        $(".scrollbars_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.use_scrollbars = !GuiManager.use_scrollbars;
            if(GuiManager.use_scrollbars){
                $("svg").parent().css("overflow","scroll");

            }
            else{
                $("svg").parent().css("overflow","visible");
            }
        });
    };

    GuiManager.prototype.global_visiblity_btn_setup = function () {
        var GuiManager = this;
        $(".global_visibility_btn").on("click", function(e){
            var target = e.target;
            $(target).find("span").toggleClass("hidden");
            $(target).parent().toggleClass("active");
            GuiManager.global_visibility = !GuiManager.global_visibility;
            if(GuiManager.isGraphPresent())
                if(GuiManager.graph_type == "stream")
                    GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
                else
                if(GuiManager.graph_type == "heat")
                    GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
        });
    };

    GuiManager.prototype.boolean_checker = function () {
        if(!this.gather_information){
            $(".gather_information_btn").find("span").addClass("hidden");
            $(".gather_information_btn").parent().removeClass("active");
        }
        else{
            $(".gather_information_btn").find("span").removeClass("hidden");
            $(".gather_information_btn").parent().addClass("active");
        }

        if(!this.preserve_map){
            $(".preserve_color_btn").find("span").addClass("hidden");
            $(".preserve_color_btn").parent().removeClass("active");
        }
        else{
            $(".preserve_color_btn").find("span").removeClass("hidden");
            $(".preserve_color_btn").parent().addClass("active");
        }

        if(!this.localstorage_enabled){
            $(".localstorage_enabled_btn").find("span").addClass("hidden");
            $(".localstorage_enabled_btn").parent().removeClass("active");
        }
        else{
            $(".localstorage_enabled_btn").find("span").removeClass("hidden");
            $(".localstorage_enabled_btn").parent().addClass("active");
        }

        if(!this.global_visibility){
            $(".global_visibility_btn").find("span").addClass("hidden");
            $(".global_visibility_btn").parent().removeClass("active");
        }
        else{
            $(".global_visibility_btn").find("span").removeClass("hidden");
            $(".global_visibility_btn").parent().addClass("active");
        }

        if(!this.prepending_prevention){
            $(".prepending_prevention_btn").find("span").addClass("hidden");
            $(".prepending_prevention_btn").parent().removeClass("active");
        }
        else{
            $(".prepending_prevention_btn").find("span").removeClass("hidden");
            $(".prepending_prevention_btn").parent().addClass("active");
        }

        if(!this.merge_cp){
            $(".merge_cp_btn").find("span").addClass("hidden");
            $(".merge_cp_btn").parent().removeClass("active");
        }
        else{
            $(".merge_cp_btn").find("span").removeClass("hidden");
            $(".merge_cp_btn").parent().addClass("active");
        }

        if(!this.events_labels){
            $(".events_labels_btn").find("span").addClass("hidden");
            $(".events_labels_btn").parent().removeClass("active");
        }
        else{
            $(".events_labels_btn").find("span").removeClass("hidden");
            $(".events_labels_btn").parent().addClass("active");
        }

        if(!this.cp_labels){
            $(".cp_labels_btn").find("span").addClass("hidden");
            $(".cp_labels_btn").parent().removeClass("active");
        }
        else{
            $(".cp_labels_btn").find("span").removeClass("hidden");
            $(".cp_labels_btn").parent().addClass("active");
        }

        if(!this.heatmap_time_map){
            $(".heatmap_time_btn").find("span").addClass("hidden");
            $(".heatmap_time_btn").parent().removeClass("active");
        }
        else{
            $(".heatmap_time_btn").find("span").removeClass("hidden");
            $(".heatmap_time_btn").parent().addClass("active");
        }

        if(!this.use_scrollbars){
            $(".scrollbars_btn").find("span").addClass("hidden");
            $(".scrollbars_btn").parent().removeClass("active");
        }
        else{
            $(".scrollbars_btn").find("span").removeClass("hidden");
            $(".scrollbars_btn").parent().addClass("active");
        }

        if(this.graph_type == "stream"){
            $('input[name="graph_type"][value="stream"]').prop('checked', true);
            $('input[name="graph_type"][value="stream"]').parent().addClass("active");
            $('input[name="graph_type"][value="heat"]').parent().removeClass("active");
            $(".stream_option").removeClass("hidden");
            $(".heat_option").addClass("hidden");
        }
        else
        if(this.graph_type == "heat"){
            $('input[name="graph_type"][value="heat"]').prop('checked', true);
            $('input[name="graph_type"][value="heat"]').parent().addClass("active");
            $('input[name="graph_type"][value="stream"]').parent().removeClass("active");
            $(".heat_option").removeClass("hidden");
            $(".stream_option").addClass("hidden");
        }
        if(this.ip_version.indexOf(4) != -1){
            $('input[name="ip_version"][value="4"]').prop('checked', true);
            $('input[name="ip_version"][value="4"]').parent().addClass("active");
        }
        if(this.ip_version.indexOf(6) != -1){
            $('input[name="ip_version"][value="6"]').prop('checked', true);
            $('input[name="ip_version"][value="6"]').parent().addClass("active");
        }

        $(".asn_lvl").spinner();
        $(".asn_lvl").spinner("value", this.asn_level);
        $(".merge_events").spinner();
        $(".merge_events").spinner("value", this.merge_events);
    };

    GuiManager.prototype.graph_type_radio_setup = function(){
        var GuiManager = this;
        $("input[name='graph_type']").on("change",function(e){
            GuiManager.graph_type = $("input[name='graph_type']:checked").val();
            if(GuiManager.graph_type == "stream"){
                $(".title").html("Global View");
                $("div.main_svg").css("height","70vh");
                $("div.main_svg").css("width","auto");
                $(".canvas_container").css("width","auto");
                $("svg").parent().css("overflow","visible");
                $(".counter_asn").parent().find("label").text("#ASN");
                $(".stream_option").removeClass("hidden");
                $(".heat_option").addClass("hidden");
            }
            if(GuiManager.graph_type == "heat"){
                $(".title").html("Local View");
                $(".canvas_container").css("width","100%");
                if(GuiManager.use_scrollbars){
                    $("svg").parent().css("overflow","scroll");
                }
                else
                    $("body").css("overflow-y","scroll");
                $(".counter_asn").parent().find("label").text("#CP");
                $(".stream_option").addClass("hidden");
                $(".heat_option").removeClass("hidden");
            }
            GuiManager.RipeDataBroker.HeuristicsManager.setDefaultHeuristic(GuiManager.graph_type);
            if(GuiManager.isGraphPresent())
                GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
        });
    };

    GuiManager.prototype.ip_version_checkbox_setup = function(){
        var GuiManager = this;
        $("input[name='ip_version']").on("change",function(e){
            GuiManager.ip_version = [];
            $("input[name='ip_version']:checked").each(function() {
                GuiManager.ip_version.push(parseInt($(this).val()));
            });
            if(GuiManager.isGraphPresent()){
                if(GuiManager.graph_type == "heat")
                    GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
                else
                if(GuiManager.graph_type == "stream")
                    GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
            }
        });
    };

    GuiManager.prototype.ip_version_checkbox_enabler = function(){
        GuiManager = this;
        if(!this.streaming){
            if(this.RipeDataBroker.current_parsed.targets.every(function(e){return GuiManager.validator.check_ipv4(e);})){
                $("input[name='ip_version'][value='4']").parent().removeClass("disabled");
                $("input[name='ip_version'][value='4']").parent().removeClass("not-active");
                $("input[name='ip_version'][value='4']").parent().attr("disabled",false);
                this.ip_version = [4];
            }
            else {
                $("input[name='ip_version'][value='4']").parent().addClass("disabled");
                $("input[name='ip_version'][value='4']").parent().addClass("not-active");
                $("input[name='ip_version'][value='4']").parent().attr("disabled",true);
            }
            if(this.RipeDataBroker.current_parsed.targets.every(function(e){return GuiManager.validator.check_ipv6(e);})){
                $("input[name='ip_version'][value='6']").parent().removeClass("disabled");
                $("input[name='ip_version'][value='6']").parent().removeClass("not-active");
                $("input[name='ip_version'][value='6']").parent().attr("disabled",false);
                this.ip_version = [6];
            }
            else{
                $("input[name='ip_version'][value='6']").parent().addClass("disabled");
                $("input[name='ip_version'][value='6']").parent().addClass("not-active");
                $("input[name='ip_version'][value='6']").parent().attr("disabled",true);
            }
            if(this.RipeDataBroker.current_parsed.targets.some(function(e){return GuiManager.validator.check_ipv4(e);}) && this.RipeDataBroker.current_parsed.targets.some(function(e){return GuiManager.validator.check_ipv6(e);})){
                $("input[name='ip_version'][value='4']").parent().removeClass("disabled");
                $("input[name='ip_version'][value='4']").parent().removeClass("not-active");
                $("input[name='ip_version'][value='4']").parent().attr("disabled",false);
                $("input[name='ip_version'][value='6']").parent().removeClass("disabled");
                $("input[name='ip_version'][value='6']").parent().removeClass("not-active");
                $("input[name='ip_version'][value='6']").parent().attr("disabled",false);
                if(this.ip_version.length == 0)
                    this.ip_version = [4];
            }
        }
    };

    GuiManager.prototype.asn_level_setup = function(){
        var GuiManager = this;
        $("input[name='asn_lvl']:input").on("change", function( e, ui ) {
            GuiManager.asn_level = $("input[name='asn_lvl']").spinner("value");
            if(GuiManager.isGraphPresent())
                GuiManager.RipeDataBroker.loadCurrentState(false,null,true);
        });
    };

    GuiManager.prototype.streaming_btn_setup = function(){
        var GuiManager = this;
        var interval;
        $(".streaming_btn").on("click", function( e, ui ) {
            GuiManager.streaming = !GuiManager.streaming;
            GuiManager.streaming_icon_swap();
            if(GuiManager.streaming){
                GuiManager.lock_all();
                interval = GuiManager.RipeDataBroker.streamgraph_streaming(GuiManager.streaming_speed);
            }
            else{
                clearInterval(interval);
                console.log("== GuiManager Streaming stopped");
                GuiManager.draw_functions_btn_enabler();
            }
        });
    };

    GuiManager.prototype.streaming_icon_swap = function(){
        var icon = $(".streaming_btn").find("span");
        if(this.streaming){
            icon.removeClass("glyphicon-record");
            icon.addClass("glyphicon-stop");
        }
        else {
            icon.addClass("glyphicon-record");
            icon.removeClass("glyphicon-stop");
        }
    };

    GuiManager.prototype.steps_btn_setup = function(){
        var GuiManager = this;
        $(".steps_btn").on("click", function( e, ui ) {
            GuiManager.steps = !GuiManager.steps;
            if(GuiManager.steps){
                GuiManager.lock_all();
                GuiManager.RipeDataBroker.streamgraph_stepped_view(50);
            }
        });
    };

    GuiManager.prototype.list_btn_setup = function(){
        var GuiManager = this;
        $(".list_btn").on("click", function(e) {
            if(GuiManager.asn_info_done){
                $(".asn_list_btn").parent().removeClass("not-active");
                $(".asn_list_btn").parent().removeClass("disabled");
            }
            else {
                $(".asn_list_btn").parent().addClass("not-active");
                $(".asn_list_btn").parent().addClass("disabled");
            }
            if(GuiManager.cp_info_done){
                $(".cp_list_btn").parent().removeClass("not-active");
                $(".cp_list_btn").parent().removeClass("disabled");
            }
            else {
                $(".cp_list_btn").parent().addClass("not-active");
                $(".cp_list_btn").parent().addClass("disabled");
            }
        });
    };

    GuiManager.prototype.asn_list_btn_setup = function() {
        var GuiManager = this;
        $(".asn_list_btn").hover(function(event){
            var html = "";
            var set;
            if(GuiManager.graph_type == "stream")
                set = GuiManager.drawer.keys.slice(0).reverse();
            else
            if(GuiManager.graph_type == "heat")
                set = GuiManager.drawer.asn_set.slice(0);
            for(var i in set) {
                var asn = set[i];
                var color_background = GuiManager.drawer.z(asn);
                var color_text = GuiManager.drawer.colorManager.furthestLabelColor(color_background);
                html+='<li class="list-group-item as'+asn+'" style="color:'+color_text+'; background-color:'+color_background+';"'
                if(GuiManager.graph_type == "stream")
                    html+='onmouseover="d3.selectAll(\'.area\').filter(function(d){return d.key!='+asn+';}).style(\'fill-opacity\',\'0.35\');" onmouseout="d3.selectAll(\'.area\').style(\'fill-opacity\',1);">';
                else
                if(GuiManager.graph_type == 'heat')
                    html+='onmouseover="d3.selectAll(\'.area\').filter(function(d){return d.asn!='+asn+';}).style(\'fill-opacity\',\'0.35\');" onmouseout="d3.selectAll(\'.area\').style(\'fill-opacity\',1);">';
                html+="<div> ASN: "+asn+"</div>";
                var info = GuiManager.RipeDataBroker.current_parsed.known_asn[asn];
                if(info){
                    var tokens = info.split(",");
                    html+="<div>"+tokens[0].trim()+"</div>";
                    var country = tokens[tokens.length-1].trim().split("-")[0];
                    html+='<div> Country: ('+country+') <span class="flag-icon flag-icon-'+country.toLowerCase()+'" alt="'+country+'" title="'+country+'"></span></div>';
                }
                html+="</li>";
            }
            $(".asn_list").html(html);
            if(set.length<11){
                $(".asn_list").css("height","auto");
                $(".asn_list").css("overflow-y","visible");
            }
            else {
                $(".asn_list").css("height","");
                $(".asn_list").css("overflow-y","");
            }
        });
    };

    GuiManager.prototype.cp_list_btn_setup = function() {
        var GuiManager = this;
        $(".cp_list_btn").hover(function(event){
            var html = "";
            var set;
            if(GuiManager.graph_type == "stream")
                set = GuiManager.RipeDataBroker.current_parsed.cp_set;
            else
            if(GuiManager.graph_type == "heat")
                set = GuiManager.drawer.keys;
            for(var i in set) {
                var cp = set[i];
                html+="<li>";
                html+="<div> ID: "+cp+"</div>";
                var info = GuiManager.RipeDataBroker.current_parsed.known_cp[cp];
                if(info){
                    html+="<div> IP: "+info["ip"]+"</div>";
                    html+="<div> Peering with CP: "+info["cp"]+"</div>";
                    html+="<div> From AS: "+info["as_number"]+"</div>";
                    var country = info["geo"].trim().split("-")[0];
                    html+='<div> Country: ('+country+') <span class="flag-icon flag-icon-'+country.toLowerCase()+'" alt="'+country+'" title="'+country+'"></span></div>';
                }
                html+="</li>";
            }
            $(".cp_list").html(html);
            if(set.length<11){
                $(".cp_list").css("height","auto");
                $(".cp_list").css("overflow-y","visible");
            }
            else {
                $(".cp_list").css("height","");
                $(".cp_list").css("overflow-y","");
            }
        });
    };

    /************************** ORDERING **************************/
    //levensthein
    GuiManager.prototype.lev_dist_randwalk_cum_btn_setup = function(){
        var manager = this;
        $(".lev_dist_randwalk_cum_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "lev_rnd_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.lev_dist_randwalk_max_btn_setup = function(){
        var manager = this;
        $(".lev_dist_randwalk_max_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "lev_rnd_max";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    //best std dev random walking
    GuiManager.prototype.point_dist_by_randwalk_btn_setup = function(){
        var manager = this;
        $(".point_dist_by_randwalk_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "st_rnd_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.point_dist_by_inference_btn_setup = function(){
        var manager = this;
        $(".point_dist_by_inference_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "st_inf_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    //STD DEV SWAP
    GuiManager.prototype.point_dist_greedy_btn_setup = function(){
        var manager = this;
        $(".point_dist_greedy_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "st_grdy_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    //NEARFLOWS
    GuiManager.prototype.exchange_greedy_sort_btn_setup = function(){
        var manager = this;
        $(".exchange_greedy_sort_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "n_f";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    //WIGGLES
    GuiManager.prototype.wiggle_sum_btn_setup = function(){
        var manager = this;
        $(".wiggle_sum_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "w_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.wiggle_max_btn_setup = function(){
        var manager = this;
        $(".wiggle_max_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "w_max";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    //SORTS
    GuiManager.prototype.sort_asn_ascstdev_btn_setup = function(){
        var manager = this;
        $(".sort_asn_ascstdev_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_st";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "asc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.sort_asn_dscstdev_btn_setup = function(){
        var manager = this;
        $(".sort_asn_dscstdev_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_st";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "dsc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.sort_asn_ascvar_btn_setup = function(){
        var manager = this;
        $(".sort_asn_ascvar_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_var";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "asc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.sort_asn_dscvar_btn_setup = function(){
        var manager = this;
        $(".sort_asn_dscvar_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_var";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "dsc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.sort_asn_ascavg_btn_setup = function(){
        var manager = this;
        $(".sort_asn_ascavg_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_avg";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "asc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.sort_asn_dscavg_btn_setup = function(){
        var manager = this;
        $(".sort_asn_dscavg_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_avg";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "dsc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.sort_asn_ascsum_btn_setup = function(){
        var manager = this;
        $(".sort_asn_ascsum_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "asc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.sort_asn_dscsum_btn_setup = function(){
        var manager = this;
        $(".sort_asn_dscsum_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "s_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = "dsc";
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    /**HEATMAP**/
    GuiManager.prototype.heat_greedy_sort_1_btn_setup = function(){
        var manager = this;
        $(".heat_greedy_sort_1_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "nf_1";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.heat_greedy_sort_2_btn_setup = function(){
        var manager = this;
        $(".heat_greedy_sort_2_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "nf_2";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.heat_stdev_sort_btn_setup = function(){
        var manager = this;
        $(".heat_stdev_sort_btn").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "st_grdy_cum";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.heat_geo_sort_btn_setup = function(){
        var manager = this;
        $(".heat_country_sort").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "geo";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.heat_asn_sort_btn_setup = function(){
        var manager = this;
        $(".heat_as_sort").on("click", function(e){
            manager.changeLoaderText("Applying Changes");manager.toggleLoader();
            manager.RipeDataBroker.HeuristicsManager.current_heuristic = "asn";
            manager.RipeDataBroker.HeuristicsManager.current_sort_type = null;
            manager.RipeDataBroker.loadCurrentState(false,null,true);
            manager.toggleLoader();
        });
    };

    GuiManager.prototype.set_ordering = function(order){
        this.RipeDataBroker.loadCurrentState(order,false,null,true);
    };

    GuiManager.prototype.get_ordering = function(){
        return this.drawer.keys;
    };

    GuiManager.prototype.restoreQuery = function(q_start, q_end, q_targets) {
        // var s = moment.unix(q_start).format("YYYY-MM-DDThh:mm:ss");
        // var e = moment.unix(q_end).format("YYYY-MM-DDThh:mm:ss");
        var start = q_start.split('T');
        var q_start_date = this.DateConverter.formatInterfaceDate(this.DateConverter.parseRipeDate(start[0]));
        var q_start_time =  this.DateConverter.formatInterfaceTime(this.DateConverter.parseRipeTime(start[1]));
        var end = q_end.split('T');
        var q_end_date = this.DateConverter.formatInterfaceDate(this.DateConverter.parseRipeDate(end[0]));
        var q_end_time = this.DateConverter.formatInterfaceTime(this.DateConverter.parseRipeTime(end[1]));
        $('.datetimepicker.date_only.start').data("DateTimePicker").date(q_start_date);
        $('.datetimepicker.time_only.start').data("DateTimePicker").date(q_start_time);
        $('.datetimepicker.date_only.end').data("DateTimePicker").date(q_end_date);
        $('.datetimepicker.time_only.end').data("DateTimePicker").date(q_end_time);
        $(".clear_targets_button").click();
        var tgs = q_targets.split(",");
        for(var t in tgs)
            $('.tokenfield').tokenfield('createToken',tgs[t]);
    };

    GuiManager.prototype.update_counters = function (selector, quantity) {
        $(selector).text(quantity);
    };

    /*******************************************************************************/
    GuiManager.prototype.docs_btn_setup = function(){
        var GuiManager = this;
        $(".docs_btn").on("click", function(e) {
            var thewindow = window.open('https://massimo.ripe.net/bgpstreamgraph/','_blank');
            thewindow.blur();
        });
    };

    GuiManager.prototype.about_btn_setup = function(){
        var GuiManager = this;
        $(".about_btn").on("click", function(e) {
            var thewindow = window.open('https://massimo.ripe.net/bgpstreamgraph/','_blank');
            thewindow.blur();
        });
    };

    GuiManager.prototype.embed_btn_setup = function(){
        var GuiManager = this;
        $(".embed_btn").on("click", function(e) {
            var thewindow = window.open('https://massimo.ripe.net/bgpstreamgraph/#embed','_blank');
            thewindow.blur();
        });
    };

    return GuiManager;
});
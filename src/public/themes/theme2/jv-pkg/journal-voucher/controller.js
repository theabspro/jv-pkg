app.component('journalVoucherList', {
    templateUrl: journal_voucher_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location, $mdSelect) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        $http.get(
            laravel_routes['getVerificationFilter'],
        ).then(function(response) { console.log(response.data);
            self.extras = response.data.extras;
            $rootScope.loading = false;
            //console.log(self.extras);
        });
        var table_scroll;
        var dataTable;
        setTimeout(function() {
            table_scroll = $('.page-main-content.list-page-content').height() - 37;
            dataTable = $('#journal_vouchers_list').DataTable({
                "dom": cndn_dom_structure,
                "language": {
                    // "search": "",
                    // "searchPlaceholder": "Search",
                    "lengthMenu": "Rows _MENU_",
                    "paginate": {
                        "next": '<i class="icon ion-ios-arrow-forward"></i>',
                        "previous": '<i class="icon ion-ios-arrow-back"></i>'
                    },
                },
                pageLength: 10,
                processing: true,
                stateSaveCallback: function(settings, data) {
                    localStorage.setItem('CDataTables_' + settings.sInstance, JSON.stringify(data));
                },
                stateLoadCallback: function(settings) {
                    var state_save_val = JSON.parse(localStorage.getItem('CDataTables_' + settings.sInstance));
                    if (state_save_val) {
                        $('#search_journal_voucher').val(state_save_val.search.search);
                    }
                    return JSON.parse(localStorage.getItem('CDataTables_' + settings.sInstance));
                },
                serverSide: true,
                paging: true,
                stateSave: true,
                ordering: false,
                scrollY: table_scroll + "px",
                scrollCollapse: true,
                ajax: {
                    url: laravel_routes['getJournalVoucherList'],
                    type: "GET",
                    dataType: "json",
                    data: function(d) {
                        d.voucher_number = $('#voucher_number').val();
                        d.jv_date = $('#jv_date').val();
                        d.type_id = $('#type_id').val();
                        d.from_account_type_id = $('#from_account_type_id').val();
                        d.to_account_type_id = $('#to_account_type_id').val();
                        d.status_id = $('#status_id').val();
                    },
                },

                columns: [
                    { data: 'child_checkbox', searchable: false },
                    { data: 'action', class: 'action', name: 'action', searchable: false },
                    { data: 'voucher_number', name: 'journal_vouchers.voucher_number', searchable: true },
                    { data: 'jv_status', name: 'approval_type_statuses.status', searchable: false },
                    { data: 'jv_date', searchable: false },
                    { data: 'jv_type', name: 'journal_vouchers.type_id', searchable: false },
                    { data: 'from_account_type', name: 'from_account_types.name', searchable: false },
                    { data: 'from_ac_code', searchable: false },
                    { data: 'to_account_type', name: 'to_account_types.name', searchable: false },
                    { data: 'to_ac_code', searchable: false },
                    { data: 'amount', name: 'journal_vouchers.amount', searchable: false },
                ],
                "initComplete": function(settings, json) {
                    $('.dataTables_length select').select2();
                },
                "infoCallback": function(settings, start, end, max, total, pre) {
                    $('#table_info').html(total)
                    $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
                },
                rowCallback: function(row, data) {
                    $(row).addClass('highlight-row');
                }
            });
        }, 1000);
        $('.modal').bind('click', function(event) {
            if ($('.md-select-menu-container').hasClass('md-active')) {
                $mdSelect.hide();
            }
        });
        $('.refresh').on('click', function() {
            $('#journal_vouchers_list').DataTable().ajax.reload();
        });
        $("#search_journal_voucher").on('keyup', function() {
            dataTable
                .search(this.value)
                .draw();
        });
        $scope.clear_search = function() {
            $('#search_journal_voucher').val('');
            $('#journal_vouchers_list').DataTable().search('').draw();
        }

        $('body').on('click', '.applyBtn', function() { //alert('sd');
            setTimeout(function() {
                dataTable.draw();
            }, 900);
        });
        $('body').on('click', '.cancelBtn', function() { //alert('sd');
            setTimeout(function() {
                dataTable.draw();
            }, 900);
        });

        $('.align-left.daterange').daterangepicker({
            autoUpdateInput: false,
            "opens": "left",
            locale: {
                cancelLabel: 'Clear',
                format: "DD-MM-YYYY"
            }
        });

        $('.daterange').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('DD-MM-YYYY') + ' to ' + picker.endDate.format('DD-MM-YYYY'));
        });

        $('.daterange').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });
        //FOR FILTER
        $('#voucher_number').keyup(function() {
            setTimeout(function() {
                dataTable.draw();
            }, 900);
        });

        $scope.onSelectedType = function(selected_type) {
            setTimeout(function() {
                $('#type_id').val(selected_type);
                dataTable.draw();
            }, 900);
        }
        $scope.onSelectedFromAccType = function(selected_from_acc_type) {
            setTimeout(function() {
                $('#from_account_type_id').val(selected_from_acc_type);
                dataTable.draw();
            }, 900);
        }
        $scope.onSelectedToAccType = function(selected_to_acc_type) {
            setTimeout(function() {
                $('#to_account_type_id').val(selected_to_acc_type);
                dataTable.draw();
            }, 900);
        }
        $scope.getSelectedStatus = function(selected_status_id) {
            setTimeout(function() {
                $('#status_id').val(selected_status_id);
                dataTable.draw();
            }, 900);
        }
        $scope.reset_filter = function() {
            $('#voucher_number').val('');
            $('#jv_date').val('');
            $('#type_id').val('');
            $('#from_account_type_id').val('');
            $('#to_account_type_id').val('');
            $('#status_id').val('');
            dataTable.draw();
        }

        //DELETE
        $scope.deleteJournalVoucher = function($id) {
            $('#journal_voucher_id').val($id);
        }
        $scope.deleteConfirm = function() {
            $id = $('#journal_voucher_id').val();
            $http.get(
                journal_voucher_delete_data_url + '/' + $id,
            ).then(function(response) {
                if (response.data.success) {
                    $noty = new Noty({
                        type: 'success',
                        layout: 'topRight',
                        text: 'Journal Voucher Deleted Successfully',
                    }).show();
                    setTimeout(function() {
                        $noty.close();
                    }, 3000);
                    $('#journal_vouchers_list').DataTable().ajax.reload(function(json) {});
                    $location.path('/jv-pkg/journal-voucher/list');
                }
            });
        }

        $('#send_for_approval').on('click', function() { //alert('dsf');
            if ($('.journal_voucher_checkbox:checked').length > 0) {
                var send_for_approval = []
                $('input[name="child_boxes"]:checked').each(function() {
                    send_for_approval.push(this.value);
                });
                console.log(send_for_approval);
                // return false;
                $http.post(
                    laravel_routes['journalVoucherMultipleApproval'], {
                        send_for_approval: send_for_approval,
                        // approval_level_id: $routeParams.level_id,
                    }
                ).then(function(response) {
                    if (response.data.success == true) {
                        custom_noty('success', response.data.message);
                            $('#journal_vouchers_list').DataTable().ajax.reload();
                            $scope.$apply();
                        // $timeout(function() {
                        //     RefreshTable();
                        // }, 1000);
                    } else {
                        custom_noty('error', response.data.errors);
                    }
                });
            } else {
                custom_noty('error', 'Please Select Checkbox');
            }
        })
        // $('.refresh_table').on("click", function() {
        //     RefreshTable();
        // });
        $('#parent').on('click', function() {
            if (this.checked) {
                $('.journal_voucher_checkbox').each(function() {
                    this.checked = true;
                });
            } else {
                $('.journal_voucher_checkbox').each(function() {
                    this.checked = false;
                });
            }
        });
        $(document.body).on('click', '.journal_voucher_checkbox', function() {
            if ($('.journal_voucher_checkbox:checked').length == $('.journal_voucher_checkbox').length) {
                $('#parent').prop('checked', true);
            } else {
                $('#parent').prop('checked', false);
            }
        });

        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('journalVoucherForm', {
    templateUrl: journal_voucher_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.angular_routes = angular_routes;
        var attachment_removal_ids = [];

        $http({
            url: laravel_routes['getJournalVoucherFormData'],
            method: "GET",
            params: {
                'id': typeof($routeParams.id) == 'undefined' ? null : $routeParams.id,
            }
        }).then(function(response) {
            console.log(response.data);
            self.journal_voucher = response.data.journal_voucher;
            self.jv_type_list = response.data.jv_type_list;
            self.journals = response.data.journals;
            self.jv_types = response.data.jv_types;
            self.fromAcc_field = response.data.fromAcc_field;
            self.toAcc_field = response.data.toAcc_field;
            self.action = response.data.action;
            $rootScope.loading = false;
            if (self.action == 'Edit') {
                if (self.journal_voucher.deleted_at) {
                    self.switch_value = 'Inactive';
                } else {
                    self.switch_value = 'Active';
                }
                // self.jv_attachements_url = jv_attachements_url;
                $scope.onSelectedJVType(self.journal_voucher.type_id);
                setTimeout(function(){
                    $scope.onSelectedFromAcc(self.journal_voucher.from_account_type_id);
                    $scope.onSelectedToAcc(self.journal_voucher.to_account_type_id);
                    $scope.onSelectedJournal(self.journal_voucher.journal_id);
                },2500);
                
                //ATTACHMENTS
                if (self.journal_voucher.attachments.length) {
                    $(self.journal_voucher.attachments).each(function(key, attachment) {
                        var design = '<div class="imageuploadify-container" data-attachment_id="' + attachment.id + '" style="margin-left: 0px; margin-right: 0px;">' +
                            '<div class="imageuploadify-btn-remove"><button type="button" class="btn btn-danger glyphicon glyphicon-remove"></button> ' +
                            ' <div class="imageuploadify-details"><div class="imageuploadify-file-icon"></div><span class="imageuploadify-file-name"><a href="'+jv_attachements_url+'/'+attachment.name+'">' + attachment.name + '' +
                            '</span><span class="imageuploadify-file-type">image/jpeg</span>' +
                            '</a><span class="imageuploadify-file-size">369960</span></div>' +
                            '</div></div>';
                        $('.imageuploadify-images-list').append(design);
                    });
                }
            } else {
                self.switch_value = 'Active';
            }
        });

        //ATTACHMENT REMOVE
        $(document).on('click', ".main-wrap .imageuploadify-container .imageuploadify-btn-remove button", function() {
            var attachment_id = $(this).parent().parent().data('attachment_id');
            attachment_removal_ids.push(attachment_id);
            $('#attachment_removal_ids').val(JSON.stringify(attachment_removal_ids));
            $(this).parent().parent().remove();
        });

        /* Tab Funtion */
        $('.btn-nxt').on("click", function() {
            $('.cndn-tabs li.active').next().children('a').trigger("click");
            tabPaneFooter();
        });
        $('.btn-prev').on("click", function() {
            $('.cndn-tabs li.active').prev().children('a').trigger("click");
            tabPaneFooter();
        });
        $('.btn-pills').on("click", function() {
            tabPaneFooter();
        });

        /* Image Uploadify Funtion */
        $('.image_uploadify').imageuploadify();
        
        /* JV DatePicker*/
        $('.jvDatePicker').bootstrapDP({
            format: "dd-mm-yyyy",
            autoclose: "true",
            todayHighlight: true,
            // startDate: min_offset,
            // endDate: max_offset
        });
        //SELECT JV TYPE GET JOURNAL && FROM ACC && TO ACC 
        $scope.onSelectedJVType = function($id) {
            $http.get(
                laravel_routes['jvTypes'], {
                    params: {
                        id: $id,
                    }
                }
            ).then(function(response) {
                console.log(response.data);
                self.journal = response.data.journal;
                self.journals_list = response.data.journals_list;
                self.jv_types = response.data.jv_types;
                self.jv_account_type_list = response.data.jv_account_type_list;

                $scope.onSelectedFromAcc = function($selected_fromValue) {
                    if($selected_fromValue == 1440){
                        self.journal_voucher.from_name = "Customer";
                        self.journal_voucher.from_id = 1440;
                    }else if($selected_fromValue == 1441){
                        self.journal_voucher.from_name = 'Vendor';
                        self.journal_voucher.from_id = 1441;
                    }else if($selected_fromValue == 1442){
                        self.journal_voucher.from_name = 'Ledger';   
                        self.journal_voucher.from_id = 1442;
                    }
                    var fromAccount_value = $selected_fromValue;
                    // alert(fromAccount_value);
                    if (fromAccount_value != '') {
                        self.fromAcc_field = false;
                    } else if (fromAccount_value == '') {
                        self.fromAcc_field = true;
                    }
                    console.log(self.journal_voucher.from_name);
                    console.log(self.journal_voucher.from_id);
                }

                $scope.onSelectedToAcc = function($selected_toValue) {
                if($selected_toValue == 1440){
                    self.journal_voucher.to_name = 'Customer';
                    self.journal_voucher.to_id = 1440;
                }else if($selected_toValue == 1441){
                    self.journal_voucher.to_name = 'Vendor';
                    self.journal_voucher.to_id = 1441;
                }else if($selected_toValue == 1442){
                    self.journal_voucher.to_name = 'Ledger'; 
                    self.journal_voucher.to_id = 1442;  
                }
                    var toAccount_value = $selected_toValue;
                    // alert(toAccount_value);
                    if (toAccount_value != '') {
                        self.toAcc_field = false;
                    } else if (toAccount_value == '') {
                        self.toAcc_field = true;
                    }
                    console.log(self.journal_voucher.to_name);
                    console.log(self.journal_voucher.to_id);
                }

                //JOURNAL 
                $scope.onSelectedJournal = function($id){
                    console.log($id);
                    if($id){
                        angular.forEach(self.journals_list, function(value, key){
                            if(value.id = $id){
                                self.journal_voucher.journal_name = value.name;
                            }
                        });
                        console.log(self.journal_voucher.journal_name);
                    }
                }

                if (self.jv_types != null) {
                    if (self.jv_types[1].value != null && self.jv_types[1].value == 1440) {
                        self.fromAcc_field = false;
                        //console.log('from1 ' + self.fromAcc_field);
                    } else if (self.jv_types[1].value == null) {
                        self.fromAcc_field = true; //console.log('from1_empty ' + self.fromAcc_field);
                    } 
                    if(self.jv_types[2].value != null && self.jv_types[2].value == 1440) {
                        self.toAcc_field = false;
                        //console.log('to2 ' +self.toAcc_field);
                    } else if (self.jv_types[2].value == null) {
                        self.toAcc_field = true; //console.log('to2_empty ' + self.toAcc_field);
                    }
                } else {
                    self.fromAcc_field = true; //console.log('initial_fromValue ' + self.fromAcc_field);
                    self.toAcc_field = true; //console.log('initial_toValue ' + self.toAcc_field);
                }
            });
        }

        //SEARCH CUSTOMER
        self.searchCustomer = function(query) {
            if (query) {
                return new Promise(function(resolve, reject) {
                    $http
                        .post(
                            // search_customer_url, {
                            laravel_routes['searchJVCustomer'], {
                                key: query,
                            }
                        )
                        .then(function(response) {
                            resolve(response.data);
                        });
                    //reject(response);
                });
            } else {
                return [];
            }
        }
        //GET CUSTOMER DETAILS
        $scope.getCustomerDetails = function(value) {
            // console.log(value);
            if (value == 'fromAcc' && self.journal_voucher.from_account_id == null) {
                return
            } else if(value == 'fromAcc' && self.journal_voucher.from_account_id != null) {
                $transferType = self.journal_voucher.from_account_id;
            }
            if(value == 'toAcc' && self.journal_voucher.to_account_id == null) {
                return
            } else if(value == 'toAcc' && self.journal_voucher.to_account_id != null) {
                $transferType = self.journal_voucher.to_account_id;
            }
            //console.log($transferType);
            $http.post(
                laravel_routes['getJVCustomerDetails'], {
                    value: value,
                    customer_id: $transferType,
                }
            ).then(function(response) {
                //console.log(response.data);
                if (response.data.success) {
                    if (response.data.transfer_type == 'FromAccount') {
                        self.fromAccountCustomer = response.data.customer;
                    } else if (response.data.transfer_type == 'ToAccount') {
                        self.toAccountCustomer = response.data.customer;
                    }
                } else {
                    custom_noty('error', response.data.error);
                }
            });
        }

        self.customerChanged = function(value) {//console.log(value);
            if (value == 'fromAcc') {
                self.fromAccountCustomer = {};
                self.checkedFromAcc = false;
                // self.checked_fromList = false;
                self.check_List = false;
            } else {
                self.toAccountCustomer = {};
                self.checkedToAcc = false;
                // self.checked_toList = false;
                self.check_List = false;
            }
            // self.customer = {};
        }
        if (self.jv_types != null) {
            if (self.jv_types[1].value != null && self.jv_types[1].value == 1440) {
                self.fromAcc_field = false;
            // } else if(self.jv_types[1].value != null && self.jv_types[1].value == 1441) {

            // } else if(self.jv_types[1].value != null && self.jv_types[1].value == 1442) {

            } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1440) {
                self.toAcc_field = false;
            // } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1441) {

            // } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1442) {

            }
        } else if (self.jv_types == null) {
            self.fromAcc_field = true;
            self.toAcc_field = true;
        }

        if($("input[name='transfer_type']").is(":checked") == false){
            //console.log('no-change');
            self.search_FromButton = false;
            self.search_ToButton = false;
            self.add_FromReceipt = false;
            self.add_ToReceipt = false;
            self.add_FromButton = false;
            self.add_ToButton = false;
        }
        $("input[name='transfer_type']:radio").change(function () {
            //alert('radio');
            if ($(this).val() == 'invoice') {
                self.search_FromButton = true;
                self.checkedFromAcc = true;
                self.search_ToButton = false;
                self.add_FromReceipt = false;
                self.add_FromButton = false;
                self.add_ToButton = true;
                self.add_ToReceipt = true;
            } else if($(this).val() == 'receipt') {
                self.search_FromButton = false;
                self.checkedFromAcc = false;
                self.search_ToButton = true;
                self.add_FromReceipt = true;
                self.add_FromButton = true;
                self.add_ToButton = false;
                self.add_ToReceipt = false;
            }
            $scope.$apply();
        });

        self.jv_receipts = [];

    // $(documen).ready(function () {
        $(document).on("click",".button",function(e){
            alert($(this).attr('id'));
            var buttonId = $(this).attr('id');
            console.log(buttonId);
            $(buttonId).button('loading');
        // $('#search_fromAcc').on('click', function() {
            // $('#search_fromAcc').button('loading');
            if($("input[name='transfer_type']").is(":checked") == false){
                $(buttonId).button('reset');
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'Choose Transfer Document Type',
                }).show();
            }
            if (buttonId == 'search_fromAcc') {
                if($('.fromAcc').val() == ''){
                    $(buttonId).button('reset');
                    $noty = new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: 'Please Enter From Account Code',
                    }).show();
                }
            } else if (buttonId == 'search_toAcc') {
                if($('.toAcc').val() == ''){
                    $(buttonId).button('reset');
                    $noty = new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: 'Please Enter To Account Code',
                    }).show();
                }
            } else if (buttonId == 'add_fromAcc') {
                if($('.fromAcc').val() == ''){
                    $(buttonId).button('reset');
                    $noty = new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: 'Please Enter From Account Code',
                    }).show();
                }
                if ($('#from_receipt_number').val() == '') {
                    $(buttonId).button('reset');
                    $noty = new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: 'Please Enter Receipt Number',
                    }).show();
                }
            } else if (buttonId == 'add_toAcc') {
                if($('.toAcc').val() == ''){
                    $(buttonId).button('reset');
                    $noty = new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: 'Please Enter To Account Code',
                    }).show();
                }
                if ($('#to_receipt_number').val() == '') {
                    $(buttonId).button('reset');
                    $noty = new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: 'Please Enter Receipt Number',
                    }).show();
                }
            } 

            
            $(buttonId).button('reset');
            if(($("input[name='transfer_type']").is(":checked") == true) && ($('.fromAcc').val() != '' || $('.toAcc').val() != '')) {
                if(buttonId == 'search_fromAcc' || buttonId =='search_toAcc'){
                    console.log('searchButton');
                    if (buttonId == 'search_fromAcc') {
                        self.checkedFromAcc = true;
                        $('.fromAcc_Title').html('Invoices');
                        var from_AccHeads = '<th><div class="table-checkbox"><input type="checkbox" id="parent_checkbox" /><label for="parent_checkbox"></label></div></th><th>Invoice No</th><th>Invoice Date</th><th>Description</th><th>Outlet</th><th>Business Unit</th><th>Invoiced Amount</th><th>Balance Amount</th>';
                        $('#from_AccountList').html(from_AccHeads);
                    } else if (buttonId == 'search_toAcc') {
                        self.checkedToAcc = true;
                        $('.toAcc_Title').html('Invoices');
                        var to_AccHeads = '<th><div class="table-checkbox"><input type="checkbox" id="parent_checkbox" /><label for="parent_checkbox"></label></div></th><th>Invoice No</th><th>Invoice Date</th><th>Description</th><th>Outlet</th><th>Business Unit</th><th>Invoiced Amount</th><th>Balance Amount</th>';
                        $('#to_AccountList').html(to_AccHeads);
                    }
                    /*Uncheck the checkbox in list page*/
                    $('#parent_checkbox').prop('checked', false);
                    $('.jv_Checkbox').each(function() {
                        this.checked = false;
                    });

                    if (buttonId == 'search_fromAcc') {
                        var dataTable_id = '#jv_FromAccList';
                        var customer_code = $('.fromAccCode').val();
                    } else if (buttonId == 'search_toAcc') {
                        var dataTable_id = '#jv_ToAccList';
                        var customer_code = $('.toAccCode').val();
                    }

                    // $(dataTable_id).DataTable().ajax.reload(function(json) {});
                    setTimeout(function() {
                        // e.preventDefault();
                        // alert();
                        var dataTable;
                        var table_scroll;
                        table_scroll = $('.page-main-content.list-page-content').height() - 37;
                        dataTable = $(dataTable_id).DataTable({
                            // "dom": cndn_dom_structure,
                            "language": {
                                // "search": "",
                                // "searchPlaceholder": "Search",
                                // "lengthMenu": "Rows _MENU_",
                                "paginate": {
                                    "next": '<i class="icon ion-ios-arrow-forward"></i>',
                                    "previous": '<i class="icon ion-ios-arrow-back"></i>'
                                },
                            },
                            scrollX: true,
                            scrollY: table_scroll + "px",
                            scrollCollapse: true,
                            stateSave: true,
                            stateSaveCallback: function(settings, data) {
                                localStorage.setItem('SIDataTables_' + settings.sInstance, JSON.stringify(data));
                            },
                            stateLoadCallback: function(settings) {
                                var state_save_val = JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
                                if (state_save_val) {
                                    $('#search').val(state_save_val.search.search);
                                }
                                return JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
                            },
                            processing: true,
                            serverSide: true,
                            paging: true,
                            searching: false,
                            ordering: false,
                            retrieve: true,
                            ajax: {
                                url: laravel_routes['getCustomerInvoice'],
                                type: "GET",
                                dataType: "json",
                                data: function(d) {
                                    d.accountNumber= customer_code;
                                    d.customer_id= $('.fromAcc').val();
                                    // d.docType = $("input[name='transfer_type']:checked").val();
                                },
                            },
                            
                            columns: [
                                { data: 'child_checkbox', searchable: false },
                                { data: 'invoice_number', searchable: true },
                                { data: 'invoice_date', name: 'TRANSDATE', searchable: false },
                                { data: 'remarks', name: 'remarks', searchable: false },
                                { data: 'outlet_name', name: 'outlets.code', searchable: true },
                                { data: 'business_name', name: 'sbus.name', searchable: true },
                                { data: 'invoice_amount', name: 'invoices.invoice_amount', searchable: true, class: 'text-right' },
                                { data: 'balence_amount', name: 'Balance', searchable: false, class: 'text-right' },
                            ],
                            "initComplete": function(settings, json) {
                                // $('.dataTables_length select').select2();
                            },
                            rowCallback: function(row, data) {
                                $(row).addClass('highlight-row');
                            },
                            infoCallback: function(settings, start, end, max, total, pre) {
                                // $('#table_info').html(total)
                                $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
                            },
                        });
                    
                        // $rootScope.loading = false;
                        $('#parent_checkbox').on('click', function() {
                            if (this.checked) {
                                self.check_List = true;
                                //console.log(self.checked_fromList);
                                $('.jv_Checkbox').each(function() {
                                    this.checked = true;
                                });
                                self.added_Title = 'Invoices added';
                                self.checked_Count = $('.jv_Checkbox:checked').length;
                                if ($('.jv_Checkbox:checked').length > 0) {
                                    var selected_List = []
                                    // var checked_invoices;
                                    $('input[name="child_boxes"]:checked').each(function() {
                                        selected_List.push(this.value);
                                    });
                                    self.checked_List = selected_List.join(', ');
                                    console.log(self.checked_List);
                                }
                            } else {//console.log('uncheckParent');
                                self.check_List = false;
                                self.added_Title = '';
                                self.checked_Count = $('.jv_Checkbox:checked').length;
                                self.checked_List = '';
                                $('.jv_Checkbox').each(function() {
                                    this.checked = false;
                                });
                            }
                            $scope.$apply();
                        });
                        $(document.body).on('click', '.jv_Checkbox', function() {
                            if ($('.jv_Checkbox').is(':checked') == true) {
                                console.log('sample 1');

                                self.check_List = true; //console.log('jv_Checkbox ' + self.check_List);
                                if ($('.jv_Checkbox:checked').length == $('.jv_Checkbox').length) {
                                    $('#parent_checkbox').prop('checked', true);
                                } else {
                                    $('#parent_checkbox').prop('checked', false);
                                }
                                self.added_Title = 'Invoices added';
                                self.checked_Count = $('.jv_Checkbox:checked').length;
                                if ($('.jv_Checkbox:checked').length > 0) {
                                    var selected_List = []
                                    // var checked_invoices;
                                    $('input[name="child_boxes"]:checked').each(function() {
                                        selected_List.push(this.value);
                                    });
                                    self.checked_List = selected_List.join(', ');
                                    console.log(self.checked_List);
                                }
                            } else {
                                console.log('sample');
                                self.check_List = false; //console.log('jv_Checkbox ' + self.check_List);
                                self.added_Title = '';
                                self.checked_Count = $('.jv_Checkbox:checked').length;
                                self.checked_List = '';
                            }
                            $scope.$apply();
                        });
                    }, 3000);
                } else if ((buttonId == 'add_fromAcc' || buttonId =='add_toAcc') && ($('#from_receipt_number').val() != '' || $('#to_receipt_number').val() != '')) {
                    console.log('addButton');
                    if (buttonId == 'add_fromAcc') {
                        self.checkedFromAcc = false;
                        self.add_FromButton = true;
                        // $('.fromAcc_Title').html('Receipts');
                        var customer_code = $('.fromAccCode').val();
                        var receipt_number = $('#from_receipt_number').val();
                    } else if (buttonId == 'add_toAcc') {
                        self.checkedToAcc = false;
                        self.add_ToButton = true;
                        // $('.toAcc_Title').html('Receipts');
                        var customer_code = $('.toAccCode').val();
                        var receipt_number = $('#to_receipt_number').val();
                    }

                    $http.get(
                        laravel_routes['getCustomerReceipt'], {
                            params: {
                                accountNumber: customer_code,
                                receiptNumber: receipt_number,
                            }
                        }
                    ).then(function(response) { 
                        console.log(response.data);
                        if (!response.data.errors) {
                            self.jv_receipts.push(response.data.receipts);
                            console.log(self.jv_receipts);
                        } else {
                            custom_noty('error',response.data.errors);
                        }
                    });

                    //REMOVE SERVICE INVOICE ITEM
                    $scope.removeJvReceipt = function(receipt_id, index) {
                        self.jv_receipt_removal_id = [];
                        if (buttonId == 'add_fromAcc') {
                            $('#from_receipt_number').val('');
                        } else if (buttonId == 'add_toAcc') {
                            $('#to_receipt_number').val('');
                        }
                        if (receipt_id) {
                            self.jv_receipt_removal_id.push(receipt_id);
                            $('#jv_receipt_removal_ids').val(JSON.stringify(self.jv_receipt_removal_id));
                        }
                        self.journal_voucher.jv_receipts.splice(index, 1);
                    }
                }
            } else { //console.log('else');
                self.checkedFromAcc = false;
                self.checkedToAcc = false;
            }
        // });
        });
    // });
        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            rules: {
                'type_id': {
                    required: true,
                },
                'date': {
                    required: true,
                },
                'from_account_id': {
                    required: true,
                },
                'to_account_id': {
                    required: true,
                },
                'reason': {
                    required: true,
                },
                'amount': {
                    required: true,
                    number: true,
                },
            },
            invalidHandler: function(event, validator) {
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'You have errors,Please check all tabs'
                }).show();
            },
            submitHandler: function(form) {
                let formData = new FormData($(form_id)[0]);
                $('.submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveJournalVoucher'],
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                    })
                    .done(function(res) {
                        if (res.success == true) {
                            $noty = new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: res.message,
                            }).show();
                            setTimeout(function() {
                                $noty.close();
                            }, 3000);
                            $location.path('/jv-pkg/journal-voucher/list');
                            $scope.$apply();
                        } else {
                            if (!res.success == true) {
                                $('.submit').button('reset');
                                var errors = '';
                                for (var i in res.errors) {
                                    errors += '<li>' + res.errors[i] + '</li>';
                                }
                                $noty = new Noty({
                                    type: 'error',
                                    layout: 'topRight',
                                    text: errors
                                }).show();
                                setTimeout(function() {
                                    $noty.close();
                                }, 3000);
                            } else {
                                $('.submit').button('reset');
                                $location.path('/jv-pkg/journal-voucher/list');
                                $scope.$apply();
                            }
                        }
                    })
                    .fail(function(xhr) {
                        $('.submit').button('reset');
                        $noty = new Noty({
                            type: 'error',
                            layout: 'topRight',
                            text: 'Something went wrong at server',
                        }).show();
                    });
            }
        });
    }
});
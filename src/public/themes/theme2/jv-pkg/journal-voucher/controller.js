app.component('journalVoucherList', {
    templateUrl: journal_voucher_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        var table_scroll;
        table_scroll = $('.page-main-content.list-page-content').height() - 37;
        var dataTable = $('#journal_vouchers_list').DataTable({
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
                    d.journal_voucher_code = $('#journal_voucher_code').val();
                    d.journal_voucher_name = $('#journal_voucher_name').val();
                    d.mobile_no = $('#mobile_no').val();
                    d.email = $('#email').val();
                },
            },

            columns: [
                { data: 'action', class: 'action', name: 'action', searchable: false },
                { data: 'number', name: 'journal_vouchers.number', searchable: true },
                { data: 'jv_date', searchable: false },
                { data: 'jv_type', name: 'journal_vouchers.type_id', searchable: false },
                { data: 'from_account_type', name: 'from_account_types.name', searchable: false },
                { data: 'from_ac_code', searchable: false },
                { data: 'to_account_type', name: 'to_account_types.name', searchable: false },
                { data: 'to_ac_code', searchable: false },
                { data: 'amount', name: 'journal_vouchers.amount', searchable: false },
                { data: 'jv_status', name: 'approval_type_statuses.status', searchable: false },
            ],
            "infoCallback": function(settings, start, end, max, total, pre) {
                $('#table_info').html(total)
                $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
            },
            rowCallback: function(row, data) {
                $(row).addClass('highlight-row');
            }
        });
        $('.dataTables_length select').select2();

        $scope.clear_search = function() {
            $('#search_journal_voucher').val('');
            $('#journal_vouchers_list').DataTable().search('').draw();
        }

        var dataTables = $('#journal_vouchers_list').dataTable();
        $("#search_journal_voucher").keyup(function() {
            dataTables.fnFilter(this.value);
        });

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

        //FOR FILTER
        $('#journal_voucher_code').on('keyup', function() {
            dataTables.fnFilter();
        });
        $('#journal_voucher_name').on('keyup', function() {
            dataTables.fnFilter();
        });
        $('#mobile_no').on('keyup', function() {
            dataTables.fnFilter();
        });
        $('#email').on('keyup', function() {
            dataTables.fnFilter();
        });
        $scope.reset_filter = function() {
            $("#journal_voucher_name").val('');
            $("#journal_voucher_code").val('');
            $("#mobile_no").val('');
            $("#email").val('');
            dataTables.fnFilter();
        }

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
            } else {
                self.switch_value = 'Active';
            }
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

                $scope.onSelectedFromAcc = function($selected_fromValue) {//console.log($selected_fromValue);
                    var fromAccount_value = $selected_fromValue;
                    // alert(fromAccount_value);
                    if (fromAccount_value != '') {
                        self.fromAcc_field = false;
                    } else if (fromAccount_value == '') {
                        self.fromAcc_field = true;
                    }
                }
                $scope.onSelectedToAcc = function($selected_toValue) {//console.log($selected_toValue);
                    var toAccount_value = $selected_toValue;
                    // alert(toAccount_value);
                    if (toAccount_value != '') {
                        self.toAcc_field = false;
                    } else if (toAccount_value == '') {
                        self.toAcc_field = true;
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
                // self.added_FromAccTitle = '';
                // self.checked_FromAccCount = '';
                // self.checked_fromAccList = '';
                self.checked_fromList = false;
            } else {
                self.toAccountCustomer = {};
                self.checkedToAcc = false;
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

        $('#search_fromAcc').on('click', function() {
            $('#search_fromAcc').button('loading');
            if($("input[name='transfer_type']").is(":checked") == false){
                $('#search_fromAcc').button('reset');
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'Choose Transfer Document Type',
                }).show();
            }
            if($('.fromAcc').val() == ''){
                $('#search_fromAcc').button('reset');
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'Please Enter From Account Code',
                }).show();
            }
            $('#search_fromAcc').button('reset');
            if(($("input[name='transfer_type']").is(":checked") == true) && ($('.fromAcc').val() != '')) {
                if($("input[name='transfer_type']:checked").val() == 'invoice'){
                    self.checkedFromAcc = true;
                    $('.fromAcc_Title').html('Invoices');
                    //$('#from_AccountList').html('');
                    var from_AccHeads = '<th><div class="table-checkbox"><input type="checkbox" id="parent_forAcc" /><label for="parent_forAcc"></label></div></th><th>Invoice No</th><th>Invoice Date</th><th>Description</th><th>Outlet</th><th>Business Unit</th><th>Invoiced Amount</th><th>Balance Amount</th>';
                    $('#from_AccountList').html(from_AccHeads);
                    // console.log('if-checked');
                    setTimeout(function() {
                        var dataTable;
                        var table_scroll;
                        table_scroll = $('.page-main-content.list-page-content').height() - 37;
                        dataTable = $('#jv_FromAccList').DataTable({
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
                                    d.accountNumber= $('.fromAccCode').val();
                                    // d.docType = $("input[name='transfer_type']:checked").val();
                                },
                            },
                            
                            columns: [
                                { data: 'child_checkbox', searchable: false },
                                { data: 'INVOICE', searchable: true },
                                { data: 'TRANSDATE', name: 'TRANSDATE', searchable: true },
                                { data: 'TXT', name: 'TXT', searchable: true },
                                { data: 'OUTLET', name: 'OUTLET', searchable: true },
                                { data: 'BUSINESSUNIT', name: 'BUSINESSUNIT', searchable: true },
                                { data: 'AMOUNTCUR', name: 'AMOUNTCUR', searchable: true, class: 'text-right' },
                                { data: 'Balance', name: 'Balance', searchable: true, class: 'text-right' },
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
                    $('#parent_forAcc').on('click', function() {
                        if (this.checked) {console.log('CheckParent');
                            self.checked_fromList = true;
                            console.log(self.checked_fromList);
                            $('.jv_fromAcc_Checkbox').each(function() {
                                this.checked = true;
                            });
                            self.added_FromAccTitle = 'Invoices added';
                            self.checked_FromAccCount = $('.jv_fromAcc_Checkbox:checked').length;
                            if ($('.jv_fromAcc_Checkbox:checked').length > 0) {
                                var selected_fromAccList = []
                                // var checked_invoices;
                                $('input[name="child_boxes"]:checked').each(function() {
                                    selected_fromAccList.push(this.value);
                                });
                                self.checked_fromAccList = selected_fromAccList.join(', ');
                                $('#add_fromAcc').button('reset');
                                console.log(self.checked_fromAccList);
                            }
                        } else {console.log('uncheckParent');
                            self.checked_fromList = false;
                            console.log(self.checked_fromList);
                            self.added_FromAccTitle = '';
                            self.checked_FromAccCount = $('.jv_fromAcc_Checkbox:checked').length;
                            $('.jv_fromAcc_Checkbox').each(function() {
                                this.checked = false;
                            });
                        }
                        $scope.$apply();
                    });
                    $(document.body).on('click', '.jv_fromAcc_Checkbox', function() {
                        if ($('.jv_fromAcc_Checkbox').is('checked') == true) {
                            self.checked_fromList = true;
                            if ($('.jv_fromAcc_Checkbox:checked').length == $('.jv_fromAcc_Checkbox').length) {
                                $('#parent_forAcc').prop('checked', true);
                            } else {
                                $('#parent_forAcc').prop('checked', false);
                            }
                        } else {
                            self.checked_fromList = true;
                        }
                        
                        $scope.$apply();
                    });
                    //Selected Invoice
                    $('#add_fromAcc').on('click', function() {
                        $('#add_fromAcc').button('loading');
                        self.added_FromAccTitle = 'Invoices added';
                        self.checked_FromAccCount = $('.jv_fromAcc_Checkbox:checked').length;
                        console.log(self.checked_FromAccCount);
                        if ($('.jv_fromAcc_Checkbox:checked').length > 0) {
                            var selected_fromAccList = []
                            // var checked_invoices;
                            $('input[name="child_boxes"]:checked').each(function() {
                                selected_fromAccList.push(this.value);
                            });
                            self.checked_fromAccList = selected_fromAccList.join(', ');
                            $('#add_fromAcc').button('reset');
                            console.log(self.checked_fromAccList);
                            //return
                            
                            // console.log(checked_invoices.join(', '));
                            // return
                            // $http.post(
                            //     laravel_routes['sendMultipleApproval'], {
                            //         send_for_approval: send_for_approval,
                            //     }
                            // ).then(function(response) {
                            //     if (response.data.success == true) {
                            //         custom_noty('success', response.data.message);
                            //         $timeout(function() {
                            //             // $('#service-invoice-table').DataTable().ajax.reload();
                            //             RefreshTable();
                            //             // $scope.$apply();
                            //         }, 1000);
                            //     } else {
                            //         custom_noty('error', response.data.errors);
                            //     }
                            // });
                        } else {
                            $('#add_fromAcc').button('reset');
                            custom_noty('error', 'Please Select Invoice');
                        }
                        $scope.$apply();
                    });
                    }, 3000);
                }
            } else { console.log('else');
                self.checkedFromAcc = false;
            }
        });
        
        $('#search_toAcc').on('click', function() {
            if($("input[name='transfer_type']").is(":checked") == false){
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'Choose Transfer Document Type',
                }).show();
            }
            if($('.toAcc').val() == ''){
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'Please Enter To Account Code',
                }).show();
            }
            if (($("input[name='transfer_type']").is(":checked") == true) && ($('.toAcc').val() != '')) {
                if($("input[name='transfer_type']:checked").val() != 'receipt') {
                    self.checkedToAcc = true;
                    $('#to_AccountList').append('');
                    var to_AccHeads = '<th>Receipt No</th><th>Receipt Date</th><th>Description</th><th>Outlet</th><th>Business Unit</th><th>Receipt Amount</th><th>Available Amount</th>';
                    $('#to_AccountList').append(to_AccHeads);
                    $('.toAcc_Title').html('Receipts');
                    var dataTable;
                    var table_scroll;
                    table_scroll = $('.page-main-content.list-page-content').height() - 37;
                    dataTable = $('#jv_ToAccList').DataTable({
                        // "dom": cndn_dom_structure,
                        "language": {
                            // "search": "",
                            // "searchPlaceholder": "Search",
                            "lengthMenu": "Rows _MENU_",
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
                        // paging: true,
                        searching: true,
                        ordering: false,
                        ajax: {
                            url: laravel_routes['getCustomerReceipt'],
                            type: "GET",
                            dataType: "json",
                            data: function(d) {
                                d.accountNumber= $('.toAccCode').val();
                                // d.docType = $("input[name='transfer_type']:checked").val();
                            },
                        },
                        
                        columns: [
                            // { data: 'child_checkbox', searchable: false },
                            { data: 'INVOICE', searchable: true },
                            { data: 'LASTSETTLEDATE', name: 'LASTSETTLEDATE', searchable: true },
                            { data: 'TXT', name: 'TXT', searchable: true },
                            { data: 'OUTLET', name: 'OUTLET', searchable: true },
                            { data: 'BUSINESSUNIT', name: 'BUSINESSUNIT', searchable: true },
                            { data: 'AMOUNTMST', name: 'AMOUNTMST', searchable: true },
                            { data: 'SETTLEAMOUNTCUR', name: 'SETTLEAMOUNTCUR', searchable: true },
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
                }
            } else {
                self.checkedToAcc = false;
            }
        });

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
                $('#submit').button('loading');
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
                                $('#submit').button('reset');
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
                                $('#submit').button('reset');
                                $location.path('/jv-pkg/journal-voucher/list');
                                $scope.$apply();
                            }
                        }
                    })
                    .fail(function(xhr) {
                        $('#submit').button('reset');
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
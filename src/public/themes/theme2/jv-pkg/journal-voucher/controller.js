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
            } else {
                self.toAccountCustomer = {};
            }
            // self.customer = {};
        }
        // setTimeout(function() {console.log(self.jv_types);
        //     if (self.jv_types != null) {
        //         if (self.jv_types[1].value != null && self.jv_types[1].value == 1440) {
        //             //SEARCH CUSTOMER
        //             self.searchCustomer = function(query) {
        //                 if (query) {
        //                     return new Promise(function(resolve, reject) {
        //                         $http
        //                             .post(
        //                                 // search_customer_url, {
        //                                 laravel_routes['searchCustomer'], {
        //                                     key: query,
        //                                 }
        //                             )
        //                             .then(function(response) {
        //                                 resolve(response.data);
        //                             });
        //                         //reject(response);
        //                     });
        //                 } else {
        //                     return [];
        //                 }
        //             }
        //             //GET CUSTOMER DETAILS
        //             self.getCustomerDetails = function() {
        //                 if (self.journal_voucher.customer == null) {
        //                     return
        //                 }
        //                 $http.post(
        //                     // get_customer_info_url, {
        //                     laravel_routes['getCustomerDetails'], {
        //                         customer_id: self.journal_voucher.customer.id,
        //                     }
        //                 ).then(function(response) {
        //                     console.log(response.data);
        //                     if (response.data.success) {
        //                         self.customer = response.data.customer;
        //                     } else {
        //                         custom_noty('error', response.data.error);
        //                     }
        //                 });
        //             }

        //             self.customerChanged = function() {
        //                 self.customer = {};
        //                 // self.service_invoice.service_invoice_items = [];
        //                 //SERVICE INVOICE ITEMS TABLE CALC
        //                 // $timeout(function() {
        //                 //     $scope.serviceInvoiceItemCalc();
        //                 // }, 1000);
        //             }
        //         } else if(self.jv_types[1].value != null && self.jv_types[1].value == 1441) {

        //         } else if(self.jv_types[1].value != null && self.jv_types[1].value == 1442) {

        //         } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1440) {
        //             //SEARCH CUSTOMER
        //             self.searchCustomer = function(query) {
        //                 if (query) {
        //                     return new Promise(function(resolve, reject) {
        //                         $http
        //                             .post(
        //                                 // search_customer_url, {
        //                                 laravel_routes['searchCustomer'], {
        //                                     key: query,
        //                                 }
        //                             )
        //                             .then(function(response) {
        //                                 resolve(response.data);
        //                             });
        //                         //reject(response);
        //                     });
        //                 } else {
        //                     return [];
        //                 }
        //             }
        //             //GET CUSTOMER DETAILS
        //             self.getCustomerDetails = function() {
        //                 if (self.journal_voucher.customer == null) {
        //                     return
        //                 }
        //                 $http.post(
        //                     // get_customer_info_url, {
        //                     laravel_routes['getCustomerDetails'], {
        //                         customer_id: self.journal_voucher.customer.id,
        //                     }
        //                 ).then(function(response) {
        //                     console.log(response.data);
        //                     if (response.data.success) {
        //                         self.customer = response.data.customer;
        //                     } else {
        //                         custom_noty('error', response.data.error);
        //                     }
        //                 });
        //             }

        //             self.customerChanged = function() {
        //                 self.customer = {};
        //                 // self.service_invoice.service_invoice_items = [];
        //                 //SERVICE INVOICE ITEMS TABLE CALC
        //                 // $timeout(function() {
        //                 //     $scope.serviceInvoiceItemCalc();
        //                 // }, 1000);
        //             }
        //         } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1441) {

        //         } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1442) {

        //         }
        //     } else{
        //         $noty = new Noty({
        //             type: 'error',
        //             layout: 'topRight',
        //             text: 'Choose Transfer Type',
        //         }).show();
        //     }
        // }, 1000);

        $('#search_fromAcc').on('click', function() {
            
        });

        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            rules: {
                'type_id': {
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
                        setTimeout(function() {
                            $noty.close();
                        }, 3000);
                    });
            }
        });
    }
});
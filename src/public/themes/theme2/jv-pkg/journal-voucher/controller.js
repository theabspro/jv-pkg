app.component('journalVoucherList', {
    templateUrl: journal_voucher_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location, $mdSelect) {
        $scope.loading = true;
        $('#search_journal_voucher').focus();
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.add_permission = self.hasPermission('add-journal-voucher');
        if (!self.hasPermission('journal-vouchers')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        $http.get(
            laravel_routes['getVerificationFilter'],
        ).then(function(response) {
            console.log(response.data);
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
            // alert($id);
            $http.get(
                laravel_routes['deleteJournalVoucher'], {
                    params: {
                        id: $id,
                    }
                }
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
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $q) {
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('add-journal-voucher') || !self.hasPermission('edit-journal-voucher')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.angular_routes = angular_routes;
        var attachment_removal_ids = [];
        $("input:text:visible:first").focus();
        $http({
            url: laravel_routes['getJournalVoucherFormData'],
            method: "GET",
            params: {
                'id': typeof($routeParams.id) == 'undefined' ? null : $routeParams.id,
            }
        }).then(function(response) {
            self.jv = response.data.journal_voucher;
            self.jv_type_list = response.data.jv_type_list;
            self.journal_list = response.data.journal_list;
            self.account_type_list = response.data.account_type_list;
            self.action = response.data.action;
            $rootScope.loading = false;

            if (self.action == 'Edit') {
                //ISSUE : unwanted code
                // if (self.jv.deleted_at) {
                //     self.switch_value = 'Inactive';
                // } else {
                //     self.switch_value = 'Active';
                // }

                // $scope.onSelectedJVType(self.jv.type_id);
                // setTimeout(function() {
                //     $scope.onSelectedFromAcc(self.jv.from_account_type_id);
                //     $scope.onSelectedToAcc(self.jv.to_account_type_id);
                //     $scope.onSelectedJournal(self.jv.journal_id);
                // }, 2500);
                // if (self.jv.transfer_type == 1) {
                //     self.edit_addFromButton = true;
                //     self.from_receipts = false;
                //     self.to_receipts = true;

                //     $("input[name=transfer_type][value=invoice]").prop('checked', true).trigger('click'); //.attr('disabled', true);
                //     // $("input[name=transfer_type][value=receipt]").attr('disabled', true);
                // } else if (self.jv.transfer_type == 2) {
                //     self.edit_addFromButton = false;
                //     self.to_receipts = false;
                //     self.from_receipts = true;
                //     //RECEIPT COUNT AND NUMBER SHOW
                //     self.receipts = [];
                //     angular.forEach(self.jv.jv_receipt, function(value, key) {
                //         self.receipts.push(value.permanent_receipt_no);
                //     });
                //     self.receipt_nos = self.receipts.join(', ');
                //     $("input[name=transfer_type][value=receipt]").prop('checked', true).trigger('click'); //.attr('disabled', true);
                //     // $("input[name=transfer_type][value=invoice]").attr('disabled', true);
                // }

                // //ATTACHMENTS
                // if (self.jv.attachments.length) {
                //     $(self.jv.attachments).each(function(key, attachment) {
                //         var design = '<div class="imageuploadify-container" data-attachment_id="' + attachment.id + '" style="margin-left: 0px; margin-right: 0px;">' +
                //             '<div class="imageuploadify-btn-remove"><button type="button" class="btn btn-danger glyphicon glyphicon-remove"></button> ' +
                //             ' <div class="imageuploadify-details"><div class="imageuploadify-file-icon"></div><span class="imageuploadify-file-name"><a href="' + jv_attachements_url + '/' + attachment.name + '">' + attachment.name + '' +
                //             '</span><span class="imageuploadify-file-type">image/jpeg</span>' +
                //             '</a><span class="imageuploadify-file-size">369960</span></div>' +
                //             '</div></div>';
                //         $('.imageuploadify-images-list').append(design);
                //     });
                // }
            } else {
                // self.edit_addFromButton = false;
                // self.jv_receipts = [];
                // self.switch_value = 'Active';
                // $("input[name=transfer_type][value=invoice]").trigger('click').prop('checked', true);
            }
        });

        //SELECT JV TYPE GET JOURNAL && FROM ACC && TO ACC 
        $scope.jvTypeChanged = function($id) {
            $http.get(
                laravel_routes['getJVType'], {
                    params: {
                        id: $id,
                    }
                }
            ).then(function(response) {
                self.type = response.data.jv_type;

                //NEW CODE
                if (!self.type.journal_editable) {
                    self.jv.journal = self.type.journal;
                    self.jv.type.journal_editable = self.type.journal_editable;
                }
                if (!self.type.from_account_type_editable) {
                    self.jv.from_account_type = self.type.from_account_type;
                    self.jv.type.from_account_type_editable = self.type.from_account_type_editable;
                }
                if (!self.type.to_account_type_editable) {
                    self.jv.to_account_type = self.type.to_account_type;
                    self.jv.type.to_account_type_editable = self.type.to_account_type_editable;
                }

                //ISSUE: CODE NOT OPTIMIZED
                // if (self.jv_types != null) {
                //     if (self.jv_types[1].value != null && self.jv_types[1].value == 1440) {
                //         self.fromAcc_field = false;
                //         //console.log('from1 ' + self.fromAcc_field);
                //     } else if (self.jv_types[1].value == null) {
                //         self.fromAcc_field = true; //console.log('from1_empty ' + self.fromAcc_field);
                //     }
                //     if (self.jv_types[2].value != null && self.jv_types[2].value == 1440) {
                //         self.toAcc_field = false;
                //         //console.log('to2 ' +self.toAcc_field);
                //     } else if (self.jv_types[2].value == null) {
                //         self.toAcc_field = true; //console.log('to2_empty ' + self.toAcc_field);
                //     }
                // } else {
                //     self.fromAcc_field = true; //console.log('initial_fromValue ' + self.fromAcc_field);
                //     self.toAcc_field = true; //console.log('initial_toValue ' + self.toAcc_field);
                // }
                // // $scope.$apply();
            });
        }

        self.searchCustomer = $rootScope.searchCustomer;
        //ISSUE : THIS IS REUSABLE CODE SHOULD PLACED IN COMMON
        //SEARCH CUSTOMER
        // self.searchCustomer = function(query) {
        //     //ISSUE : UNWANTED AJAX CALLS
        //     // if (query) {
        //     if (query && query.length > 2) {
        //         promise = new Promise(function(resolve, reject) {
        //             $http
        //                 .post(
        //                     laravel_routes['searchCustomer'], {
        //                         key: query
        //                     },
        //                 )
        //                 .then(function(response) {
        //                     resolve(response.data);
        //                 });
        //         });
        //         return promise;
        //     } else {
        //         return [];
        //     }
        // }

        //ISSUE : Wrong variable name : value
        //GET CUSTOMER DETAILS
        $scope.customerSelected = function(type) {
            if (type == 'fromAcc') {
                var res = $rootScope.getCustomer(self.from_account.id).then(function(res) {
                    console.log(res.data);
                    if (!res.data.success) {
                        custom_noty('error', res.data.error);
                        return;
                    }
                    self.jv.from_account = res.data.customer
                });
            } else {
                var res = $rootScope.getCustomer(self.to_account.id).then(function(res) {
                    if (!res.data.success) {
                        custom_noty('error', res.data.error);
                        return;
                    }
                    self.jv.to_account = res.data.customer
                });
            }
        }

        // $scope.getCustomerDetails = function(value) {
        //     console.log(value);
        //     if (value == 'fromAcc' && self.jv.from_customer == null) {
        //         return
        //     } else if (value == 'fromAcc' && self.jv.from_customer != null) {
        //ISSUE : Wrong variable name : $transferType
        //         $transferType = self.jv.from_customer.id;
        //     }
        //     if (value == 'toAcc' && self.jv.to_customer == null) {
        //         return
        //     } else if (value == 'toAcc' && self.jv.to_customer != null) {
        //         $transferType = self.jv.to_customer.id;
        //     }
        //     //console.log($transferType);
        //     if ($transferType) {
        //         $http.post(
        //             laravel_routes['getJVCustomerDetails'], {
        //                 value: value,
        //                 customer_id: $transferType,
        //             }
        //         ).then(function(response) {
        //             //console.log(response.data);
        //             if (response.data.success) {
        //                 if (response.data.transfer_type == 'FromAccount') {
        //                     self.fromAccountCustomer = response.data.customer;
        //                 } else if (response.data.transfer_type == 'ToAccount') {
        //                     self.toAccountCustomer = response.data.customer;
        //                 }
        //             } else {
        //                 custom_noty('error', response.data.error);
        //             }
        //         });
        //     }
        // }

        // }

        //10258258
        //AL20ST0413865
        //AL20ST0467838

        self.getReceipt = function($for) {
            if ($for == 'from') {
                if (!self.from_receipt_no) {
                    custom_noty('error', 'Please enter receipt number');
                    $('#from_receipt_no').focus();
                    return;
                }
                if (!self.jv.from_account) {
                    custom_noty('error', 'Please select from account code');
                    return;
                }
                var account_code = self.jv.from_account.code;
                var receipt_number = self.from_receipt_no;
            } else {
                if (!self.to_receipt_no) {
                    custom_noty('error', 'Please enter receipt number');
                    $('#to_receipt_no').focus();
                    return;
                }
                if (!self.jv.to_account) {
                    custom_noty('error', 'Please select to account code');
                    return;
                }
                var account_code = self.jv.to_account.code;
                var receipt_number = self.to_receipt_no;
            }

            $http.get(
                laravel_routes['getReceipts'], {
                    params: {
                        account_code: account_code,
                        receipt_number: receipt_number,
                        limit: 1,
                    }
                }
            ).then(function(response) {
                if (!response.data.success) {
                    custom_noty('error', response.data.error);
                    return;
                }
                self.jv.receipts.push(response.data.receipt);
                self.jv.total_receipt_amount = parseFloat(self.jv.total_receipt_amount) + parseFloat(response.data.receipt.balance_amount);
                self.from_receipt_no = '';
                self.to_receipt_no = '';
            });
        }

        //REMOVE SERVICE INVOICE ITEM
        $scope.removeReceipt = function(index) {
            //ISSUE : Wrong logic
            // self.jv_receipt_removal_id = [];
            // if (buttonId == 'add_fromAcc') {
            //     $('#from_receipt_number').val('');
            // } else if (buttonId == 'add_toAcc') {
            //     $('#to_receipt_number').val('');
            // }
            // if (receipt_id) {
            //     self.jv_receipt_removal_id.push(receipt_id);
            //     $('#jv_receipt_removal_ids').val(JSON.stringify(self.jv_receipt_removal_id));
            // }
            self.jv.total_receipt_amount -= parseFloat(self.jv.receipts[index].balence_amount);

            self.jv.receipts.splice(index, 1);
        }

        //10258258
        //AL20ST0413865
        //AL20ST0467838

        $scope.getInvoices = function($for) {
            if ($for == 'from') {
                if (!self.jv.from_account) {
                    custom_noty('error', 'Please select from account code');
                    return;
                }
                var account_id = self.jv.from_account.id;
                var dataTable_id = '#from_invoices_table';
            } else {
                if (!self.jv.to_account) {
                    custom_noty('error', 'Please select to account code');
                    return;
                }
                var account_id = self.jv.to_account.id;
                var dataTable_id = '#to_invoices_table';
            }

            $http.get(
                laravel_routes['getInvoices'], {
                    params: {
                        account_id: account_id,
                    }
                }
            ).then(function(response) {
                if (!response.data.success) {
                    custom_noty('error', response.data.error);
                    return;
                }
                self.jv.invoices = response.data.invoices;
            });

            // var dataTable;
            // var table_scroll;
            // table_scroll = $('.page-main-content.list-page-content').height() - 37;
            // $(dataTable_id).DataTable().destroy();
            // dataTable = $(dataTable_id).DataTable({
            //     "language": {
            //         "paginate": {
            //             "next": '<i class="icon ion-ios-arrow-forward"></i>',
            //             "previous": '<i class="icon ion-ios-arrow-back"></i>'
            //         },
            //     },
            //     scrollX: true,
            //     scrollY: table_scroll + "px",
            //     scrollCollapse: true,
            //     stateSave: true,
            //     deferRender: true,
            //     stateSaveCallback: function(settings, data) {
            //         localStorage.setItem('SIDataTables_' + settings.sInstance, JSON.stringify(data));
            //     },
            //     stateLoadCallback: function(settings) {
            //         var state_save_val = JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
            //         if (state_save_val) {
            //             $('#search').val(state_save_val.search.search);
            //         }
            //         return JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
            //     },
            //     // processing: true,
            //     // serverSide: true,
            //     paging: true,
            //     // searching: false,
            //     // ordering: false,
            //     retrieve: true,
            //     ajax: {
            //         url: laravel_routes['getInvoices'],
            //         type: "GET",
            //         dataType: "json",
            //         data: function(d) {
            //             d.account_id = account_id;
            //         },
            //     },

            //     columns: [
            //         { data: 'child_checkbox', searchable: false },
            //         { data: 'invoice_number', searchable: true },
            //         { data: 'invoice_date', name: 'TRANSDATE', searchable: false },
            //         { data: 'invoice_amount', class: 'text-right' },
            //         { data: 'received_amount', class: 'text-right' },
            //         { data: 'balence_amount', class: 'text-right' },
            //         { data: 'outlet_name', name: 'outlets.code', searchable: true },
            //         { data: 'business_name', name: 'sbus.name', searchable: true },
            //         { data: 'remarks', name: 'remarks', searchable: true },
            //     ],
            //     "initComplete": function(settings, json) {
            //         // $('.dataTables_length select').select2();
            //     },
            //     rowCallback: function(row, data) {
            //         $(row).addClass('highlight-row');
            //     },
            //     infoCallback: function(settings, start, end, max, total, pre) {
            //         // $('#table_info').html(total)
            //         $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
            //     },
            // });
        }


        //ATTACHMENT REMOVE
        $(document).on('click', ".main-wrap .imageuploadify-container .imageuploadify-btn-remove button", function() {
            var attachment_id = $(this).parent().parent().data('attachment_id');
            attachment_removal_ids.push(attachment_id);
            $('#attachment_removal_ids').val(JSON.stringify(attachment_removal_ids));
            $(this).parent().parent().remove();
        });

        //ISSUE : Common script
        /* Tab Funtion */
        // $('.btn-nxt').on("click", function() {
        //     $('.cndn-tabs li.active').next().children('a').trigger("click");
        //     tabPaneFooter();
        // });
        // $('.btn-prev').on("click", function() {
        //     $('.cndn-tabs li.active').prev().children('a').trigger("click");
        //     tabPaneFooter();
        // });
        // $('.btn-pills').on("click", function() {
        //     tabPaneFooter();
        // });

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

        //ISSUE : wrong way of dev
        // $scope.onSelectedFromAcc = function($selected_fromValue) {
        //     if ($selected_fromValue == 1440) {
        //         self.jv.from_name = "Customer";
        //         self.jv.from_id = 1440;
        //     } else if ($selected_fromValue == 1441) {
        //         self.jv.from_name = 'Vendor';
        //         self.jv.from_id = 1441;
        //     } else if ($selected_fromValue == 1442) {
        //         self.jv.from_name = 'Ledger';
        //         self.jv.from_id = 1442;
        //     }
        //     var fromAccount_value = $selected_fromValue;
        //     // alert(fromAccount_value);
        //     if (fromAccount_value != '') {
        //         self.fromAcc_field = false;
        //     } else if (fromAccount_value == '') {
        //         self.fromAcc_field = true;
        //     }
        // }

        // $scope.onSelectedToAcc = function($selected_toValue) {
        //     if ($selected_toValue == 1440) {
        //         self.jv.to_name = 'Customer';
        //         self.jv.to_id = 1440;
        //     } else if ($selected_toValue == 1441) {
        //         self.jv.to_name = 'Vendor';
        //         self.jv.to_id = 1441;
        //     } else if ($selected_toValue == 1442) {
        //         self.jv.to_name = 'Ledger';
        //         self.jv.to_id = 1442;
        //     }
        //     var toAccount_value = $selected_toValue;
        //     // alert(toAccount_value);
        //     if (toAccount_value != '') {
        //         self.toAcc_field = false;
        //     } else if (toAccount_value == '') {
        //         self.toAcc_field = true;
        //     }
        // }

        //ISSUE : unwanted code
        // //JOURNAL 
        // $scope.onSelectedJournal = function($id) {
        //     console.log($id);
        //     if ($id) {
        //         angular.forEach(self.journals_list, function(value, key) {
        //             if (value.id = $id) {
        //                 self.jv.journal_name = value.name;
        //             }
        //         });
        //         // console.log(self.jv.journal_name);
        //     }
        // }

        // if (self.jv_types != null) {
        //     if (self.jv_types[1].value != null && self.jv_types[1].value == 1440) {
        //         self.fromAcc_field = false;
        //         // } else if(self.jv_types[1].value != null && self.jv_types[1].value == 1441) {

        //         // } else if(self.jv_types[1].value != null && self.jv_types[1].value == 1442) {

        //     } else if (self.jv_types[2].value != null && self.jv_types[2].value == 1440) {
        //         self.toAcc_field = false;
        //         // } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1441) {

        //         // } else if(self.jv_types[2].value != null && self.jv_types[2].value == 1442) {

        //     }
        // } else if (self.jv_types == null) {
        //     self.fromAcc_field = true;
        //     self.toAcc_field = true;
        // }

        // if ($("input[name='transfer_type']").is(":checked") == false) {
        //     //console.log('no-change');
        //     self.search_FromButton = false;
        //     self.search_ToButton = false;
        //     self.add_FromReceipt = false;
        //     self.add_ToReceipt = false;
        //     self.add_FromButton = false;
        //     self.add_ToButton = false;
        // }
        // $("input[name='transfer_type']:radio").change(function() {
        //     //alert('radio');
        //     if ($(this).val() == 'invoice') {
        //         self.search_FromButton = true;
        //         self.checkedFromAcc = true;
        //         self.search_ToButton = false;
        //         self.add_FromReceipt = false;
        //         self.add_FromButton = false;
        //         self.add_ToButton = true;
        //         self.add_ToReceipt = true;
        //     } else if ($(this).val() == 'receipt') {
        //         self.search_FromButton = false;
        //         self.checkedFromAcc = false;
        //         self.search_ToButton = true;
        //         self.add_FromReceipt = true;
        //         self.add_FromButton = true;
        //         self.add_ToButton = false;
        //         self.add_ToReceipt = false;
        //     }
        //     // $scope.$apply();
        // });


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
            } else { //console.log('uncheckParent');
                self.check_List = false;
                self.added_Title = '';
                self.checked_Count = $('.jv_Checkbox:checked').length;
                self.checked_List = '';
                $('.jv_Checkbox').each(function() {
                    this.checked = false;
                });
            }
            // $scope.$apply();
        });
        // $(documen).ready(function () {
        // ISSUE : NG not used
        // $(document).on("click", '.button', function(e) {



        //     // console.log(self.action);
        //     // // alert($(this).attr('id'));
        //     // var buttonId = $(this).attr('id');
        //     // // console.log(buttonId);
        //     // $(buttonId).button('loading');
        //     // $('#search_fromAcc').on('click', function() {
        //     // $('#search_fromAcc').button('loading');
        //     // if ($("input[name='transfer_type']").is(":checked") == false) {
        //     //     $(buttonId).button('reset');
        //     //     $noty = new Noty({
        //     //         type: 'error',
        //     //         layout: 'topRight',
        //     //         text: 'Choose Transfer Document Type',
        //     //     }).show();
        //     // }
        //     // if (buttonId == 'search_fromAcc') {
        //     //     if ($('.fromAcc').val() == '') {
        //     //         $(buttonId).button('reset');
        //     //         $noty = new Noty({
        //     //             type: 'error',
        //     //             layout: 'topRight',
        //     //             text: 'Please Enter From Account Code',
        //     //         }).show();
        //     //     }
        //     // } else if (buttonId == 'search_toAcc') {
        //     //     if ($('.toAcc').val() == '') {
        //     //         $(buttonId).button('reset');
        //     //         $noty = new Noty({
        //     //             type: 'error',
        //     //             layout: 'topRight',
        //     //             text: 'Please Enter To Account Code',
        //     //         }).show();
        //     //     }
        //     // } else if (buttonId == 'add_fromAcc') {
        //     //     if ($('.fromAcc').val() == '') {
        //     //         $(buttonId).button('reset');
        //     //         $noty = new Noty({
        //     //             type: 'error',
        //     //             layout: 'topRight',
        //     //             text: 'Please Enter From Account Code',
        //     //         }).show();
        //     //     }
        //     //     if ($('#from_receipt_number').val() == '') {
        //     //         $(buttonId).button('reset');
        //     //         $noty = new Noty({
        //     //             type: 'error',
        //     //             layout: 'topRight',
        //     //             text: 'Please Enter Receipt Number',
        //     //         }).show();
        //     //     }
        //     // } else if (buttonId == 'add_toAcc') {
        //     //     if ($('.toAcc').val() == '') {
        //     //         $(buttonId).button('reset');
        //     //         $noty = new Noty({
        //     //             type: 'error',
        //     //             layout: 'topRight',
        //     //             text: 'Please Enter To Account Code',
        //     //         }).show();
        //     //     }
        //     //     if ($('#to_receipt_number').val() == '') {
        //     //         $(buttonId).button('reset');
        //     //         $noty = new Noty({
        //     //             type: 'error',
        //     //             layout: 'topRight',
        //     //             text: 'Please Enter Receipt Number',
        //     //         }).show();
        //     //     }
        //     // }


        //     // $(buttonId).button('reset');
        //     if (($("input[name='transfer_type']").is(":checked") == true) && ($('.fromAcc').val() != '' || $('.toAcc').val() != '')) {
        //         if (buttonId == 'search_fromAcc' || buttonId == 'search_toAcc') {
        //             // console.log('searchButton');
        //             // if (buttonId == 'search_fromAcc') {
        //             //     self.checkedFromAcc = true;
        //             //     $('.fromAcc_Title').html('Invoices');
        //             //     var from_AccHeads = '<th><div class="table-checkbox"><input type="checkbox" id="parent_checkbox" /><label for="parent_checkbox"></label></div></th><th>Invoice No</th><th>Invoice Date</th><th>Description</th><th>Outlet</th><th>Business Unit</th><th>Invoiced Amount</th><th>Balance Amount</th>';
        //             //     $('#from_AccountList').html(from_AccHeads);
        //             // } else if (buttonId == 'search_toAcc') {
        //             //     self.checkedToAcc = true;
        //             //     $('.toAcc_Title').html('Invoices');
        //             //     var to_AccHeads = '<th><div class="table-checkbox"><input type="checkbox" id="parent_checkbox" /><label for="parent_checkbox"></label></div></th><th>Invoice No</th><th>Invoice Date</th><th>Description</th><th>Outlet</th><th>Business Unit</th><th>Invoiced Amount</th><th>Balance Amount</th>';
        //             //     console.log(to_AccHeads);
        //             //     $('#to_AccountList').html(to_AccHeads);
        //             // }
        //             // /*Uncheck the checkbox in list page*/
        //             // $('#parent_checkbox').prop('checked', false);
        //             // $('.jv_Checkbox').each(function() {
        //             //     this.checked = false;
        //             // });

        //             // if (buttonId == 'search_fromAcc') {
        //             //     var dataTable_id = '#jv_FromAccList';
        //             //     var customer_code = $('.fromAccCode').val();
        //             // } else if (buttonId == 'search_toAcc') {
        //             //     var dataTable_id = '#jv_ToAccList';
        //             //     var customer_code = $('.toAccCode').val();
        //             // }

        //             // $(dataTable_id).DataTable().ajax.reload(function(json) {});
        //             // setTimeout(function() {
        //             // e.preventDefault();
        //             // alert();
        //             // var dataTable;
        //             // var table_scroll;
        //             // table_scroll = $('.page-main-content.list-page-content').height() - 37;
        //             // dataTable = $(dataTable_id).DataTable({
        //             //     // "dom": cndn_dom_structure,
        //             //     "language": {
        //             //         // "search": "",
        //             //         // "searchPlaceholder": "Search",
        //             //         // "lengthMenu": "Rows _MENU_",
        //             //         "paginate": {
        //             //             "next": '<i class="icon ion-ios-arrow-forward"></i>',
        //             //             "previous": '<i class="icon ion-ios-arrow-back"></i>'
        //             //         },
        //             //     },
        //             //     scrollX: true,
        //             //     scrollY: table_scroll + "px",
        //             //     scrollCollapse: true,
        //             //     stateSave: true,
        //             //     stateSaveCallback: function(settings, data) {
        //             //         localStorage.setItem('SIDataTables_' + settings.sInstance, JSON.stringify(data));
        //             //     },
        //             //     stateLoadCallback: function(settings) {
        //             //         var state_save_val = JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
        //             //         if (state_save_val) {
        //             //             $('#search').val(state_save_val.search.search);
        //             //         }
        //             //         return JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
        //             //     },
        //             //     processing: true,
        //             //     serverSide: true,
        //             //     paging: true,
        //             //     searching: false,
        //             //     ordering: false,
        //             //     retrieve: true,
        //             //     ajax: {
        //             //         url: laravel_routes['getCustomerInvoice'],
        //             //         type: "GET",
        //             //         dataType: "json",
        //             //         data: function(d) {
        //             //             d.accountNumber = customer_code;
        //             //             d.customer_id = $('.fromAcc').val();
        //             //             // d.docType = $("input[name='transfer_type']:checked").val();
        //             //         },
        //             //     },

        //             //     columns: [
        //             //         { data: 'child_checkbox', searchable: false },
        //             //         { data: 'invoice_number', searchable: true },
        //             //         { data: 'invoice_date', name: 'TRANSDATE', searchable: false },
        //             //         { data: 'remarks', name: 'remarks', searchable: false },
        //             //         { data: 'outlet_name', name: 'outlets.code', searchable: true },
        //             //         { data: 'business_name', name: 'sbus.name', searchable: true },
        //             //         { data: 'invoice_amount', name: 'invoices.invoice_amount', searchable: true, class: 'text-right' },
        //             //         { data: 'balence_amount', name: 'Balance', searchable: false, class: 'text-right' },
        //             //     ],
        //             //     "initComplete": function(settings, json) {
        //             //         // $('.dataTables_length select').select2();
        //             //     },
        //             //     rowCallback: function(row, data) {
        //             //         $(row).addClass('highlight-row');
        //             //     },
        //             //     infoCallback: function(settings, start, end, max, total, pre) {
        //             //         // $('#table_info').html(total)
        //             //         $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
        //             //     },
        //             // });

        //             // $rootScope.loading = false;
        //             // $(document.body).on('click', '.jv_Checkbox', function() {
        //             //     if ($('.jv_Checkbox').is(':checked') == true) {
        //             //         console.log('sample 1');

        //             //         self.check_List = true; //console.log('jv_Checkbox ' + self.check_List);
        //             //         if ($('.jv_Checkbox:checked').length == $('.jv_Checkbox').length) {
        //             //             $('#parent_checkbox').prop('checked', true);
        //             //         } else {
        //             //             $('#parent_checkbox').prop('checked', false);
        //             //         }
        //             //         self.added_Title = 'Invoices added';
        //             //         self.checked_Count = $('.jv_Checkbox:checked').length;
        //             //         if ($('.jv_Checkbox:checked').length > 0) {
        //             //             var selected_List = []
        //             //             // var checked_invoices;
        //             //             $('input[name="child_boxes"]:checked').each(function() {
        //             //                 selected_List.push(this.value);
        //             //             });
        //             //             self.checked_List = selected_List.join(', ');
        //             //             console.log(self.checked_List);
        //             //         }
        //             //     } else {
        //             //         console.log('sample');
        //             //         self.check_List = false; //console.log('jv_Checkbox ' + self.check_List);
        //             //         self.added_Title = '';
        //             //         self.checked_Count = $('.jv_Checkbox:checked').length;
        //             //         self.checked_List = '';
        //             //     }
        //             //     $scope.$apply();
        //             // });
        //             // }, 3000);
        //         } else if ((buttonId == 'add_fromAcc' || buttonId == 'add_toAcc') && ($('#from_receipt_number').val() != '' || $('#to_receipt_number').val() != '')) {
        //             console.log('addButton');
        //             if (buttonId == 'add_fromAcc') {
        //                 self.checkedFromAcc = false;
        //                 self.add_FromButton = true;
        //                 // $('.fromAcc_Title').html('Receipts');
        //                 var customer_code = $('.fromAccCode').val();
        //                 var receipt_number = $('#from_receipt_number').val();
        //             } else if (buttonId == 'add_toAcc') {
        //                 self.checkedToAcc = false;
        //                 self.add_ToButton = true;
        //                 // $('.toAcc_Title').html('Receipts');
        //                 var customer_code = $('.toAccCode').val();
        //                 var receipt_number = $('#to_receipt_number').val();
        //             }

        //             $http.get(
        //                 laravel_routes['getCustomerReceipt'], {
        //                     params: {
        //                         accountNumber: customer_code,
        //                         receiptNumber: receipt_number,
        //                     }
        //                 }
        //             ).then(function(response) {
        //                 // console.log(response.data.receipts);
        //                 if (!response.data.errors) {
        //                     self.jv_receipts.push(response.data.receipts);
        //                     // console.log(self.jv_receipts);
        //                 } else {
        //                     custom_noty('error', response.data.errors);
        //                 }

        //                 if (buttonId == 'add_fromAcc') {
        //                     self.receipts = [];
        //                     angular.forEach(self.jv_receipts, function(value, key) {
        //                         self.receipts.push(value.receipt_no);
        //                     });
        //                     self.from_receipts = true;
        //                     self.to_receipts = false;
        //                     self.receipt_nos = self.receipts.join(', ');
        //                     // console.log(self.jv_receipts.length);
        //                 } else if (buttonId == 'add_toAcc') {
        //                     self.receipts = [];
        //                     angular.forEach(self.jv_receipts, function(value, key) {
        //                         self.receipts.push(value.receipt_no);
        //                     });
        //                     self.to_receipts = true;
        //                     self.from_receipts = false;
        //                     self.receipt_nos = self.receipts.join(', ');
        //                     // console.log(self.jv_receipts.length);
        //                 }
        //             });

        //         }
        //     } else { //console.log('else');
        //         self.checkedFromAcc = false;
        //         self.checkedToAcc = false;
        //     }
        //     // });
        // });
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
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('journalVoucherView', {
    templateUrl: journal_voucher_view_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $element, $mdSelect, $timeout) {
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        if (self.hasPermission('view-journal-voucher')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.angular_routes = angular_routes;
        self.level_id = $routeParams.level_id;
        self.ref_attachements_url_link = ref_attachements_url;
        $http({
            url: laravel_routes['viewJournalVoucher'],
            method: "GET",
            params: {
                id: $routeParams.id,
                // approval_level_id: $routeParams.level_id,
            }
        }).then(function(response) {
            console.log(response.data);
            self.jvs = response.data.journal_vouchers;
            self.reject_reason = response.data.reject_reason;
            self.from_account_type = response.data.from_account_type;
            self.to_account_type = response.data.to_account_type;
            self.from_customer_details = response.data.from_customer_details;
            self.to_customer_details = response.data.to_customer_details;
            self.receipt_count = response.data.receipt_count;
            self.invoice_count = response.data.invoice_count;
            self.invoice_details = response.data.invoice_details;
            self.receipt_details = response.data.receipt_details;
            self.attachment = response.data.attachment;
            self.activity_logs = response.data.activity_logs;
            self.final_approval_status = response.data.final_approval_status_id;
            // self.statuses = response.data.statuses;
            self.ref_attachements_url_link = jv_attachements_url;
            self.action = response.data.action;
            self.jv_date = self.jvs.date;
            self.invoice_numbers = [];
            angular.forEach(response.data.invoice_details, function(value, key) {
                self.invoice_numbers.push(value.invoice_number);
            });
            self.invoices = self.invoice_numbers.join(', ');

            self.receipt_numbers = [];
            angular.forEach(response.data.receipt_details, function(value, key) {
                self.receipt_numbers.push(value.temporary_receipt_no);
            });
            self.receipts = self.receipt_numbers.join(', ');
            $rootScope.loading = false;
        });

        $element.find('input').on('keydown', function(ev) {
            ev.stopPropagation();
        });
        $scope.clearSearchTerm = function() {
            $scope.searchTerm = '';
        };
        /* Modal Md Select Hide */
        $('.modal').bind('click', function(event) {
            if ($('.md-select-menu-container').hasClass('md-active')) {
                $mdSelect.hide();
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

        var from_approve = '#approve';
        var v = jQuery(from_approve).validate({
            submitHandler: function(form) {
                let formDataapprove = new FormData($(from_approve)[0]);
                $('.submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveJvVerification'],
                        method: "POST",
                        data: formDataapprove,
                        processData: false,
                        contentType: false,
                    })
                    .done(function(res) {
                        if (res.success == true) {
                            $('#approve-popup').modal('hide');
                            custom_noty('success', res.message);
                            $timeout(function() {
                                $location.path('/verification/7221/level/' + $routeParams.level_id + '/list');
                                $scope.$apply();
                            }, 1000);
                        } else {
                            if (!res.success == true) {
                                $('.submit').button('reset');
                                var errors = '';
                                for (var i in res.errors) {
                                    errors += '<li>' + res.errors[i] + '</li>';
                                }
                                custom_noty('error', errors);
                            } else {
                                $('.submit').button('reset');
                                $location.path('/verification/7221/level/' + $routeParams.level_id + '/list');
                                $scope.$apply();
                            }
                        }
                    })
                    .fail(function(xhr) {
                        $('.submit').button('reset');
                        custom_noty('error', 'Something went wrong at server');
                    });
            }
        });

        var form_reject = '#reject';
        var v = jQuery(form_reject).validate({
            ignore: '',
            rules: {
                'reject_reason': {
                    required: true,
                },
                'rejection_reason': {
                    required: true,
                    minlength: 3,
                    maxlength: 191,
                },
            },
            submitHandler: function(form) {
                let formDatareject = new FormData($(form_reject)[0]);
                $('.submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveJvVerification'],
                        method: "POST",
                        data: formDatareject,
                        processData: false,
                        contentType: false,
                    })
                    .done(function(res) {
                        if (res.success == true) {
                            $('#reject-popup').modal('hide');
                            custom_noty('success', res.message);
                            $timeout(function() {
                                $location.path('/verification/7221/level/' + $routeParams.level_id + '/list');
                                $scope.$apply();
                            }, 1000);
                        } else {
                            if (!res.success == true) {
                                $('.submit').button('reset');
                                var errors = '';
                                for (var i in res.errors) {
                                    errors += '<li>' + res.errors[i] + '</li>';
                                }
                                custom_noty('error', errors);
                            } else {
                                $('.submit').button('reset');
                                $location.path('/verification/7221/level/' + $routeParams.level_id + '/list');
                                $scope.$apply();
                            }
                        }
                    })
                    .fail(function(xhr) {
                        $('.submit').button('reset');
                        custom_noty('error', 'Something went wrong at server');
                    });
            }
        });
    }
});

app.component('jvFormHeader', {
    templateUrl: jv_form_header_template_url,
    bindings: {
        jv: '<',
    },
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
    }
});

app.component('jvReceiptsTable', {
    templateUrl: jv_receipts_table_template_url,
    bindings: {
        jv: '<',
    },
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
    }
});

app.component('jvInvoicesTable', {
    templateUrl: jv_invoices_table_template_url,
    bindings: {
        jv: '=',
    },
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
        $scope.invoiceUpdated = function() {
            self.jv.invoices_length = 0;
            self.jv.total_invoice_amount = 0;
            angular.forEach(self.jv.invoices, function(invoice, key) {
                if (invoice.selected) {
                    self.jv.invoices_length++;
                    self.jv.total_invoice_amount += parseFloat(invoice.balance_amount);
                }
            });
        }

    }
});
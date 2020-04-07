app.component('journalVoucherList', {
    templateUrl: journal_voucher_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $mdSelect, $timeout, $element) {
        $scope.loading = true;
        $('#search_journal_voucher').focus();
        $('li').removeClass('active');
        $('.jv_request_flink').addClass('active').trigger('click');
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('journal-vouchers')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.add_permission = self.hasPermission('add-journal-voucher');
        self.approve_permission = self.hasPermission('approve-journal-voucher');
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
                scrollX: true,
                scrollCollapse: true,
                ajax: {
                    url: laravel_routes['getJournalVoucherList'],
                    type: "GET",
                    dataType: "json",
                    data: function(d) {
                        d.voucher_number = $('#voucher_number').val();
                        d.jv_date = $('#jv_date').val();
                        d.type_id = $('#type_id').val();
                        d.outlet_id = $('#outlet_id').val();
                        d.state_id = $('#state_id').val();
                        d.from_account_type_id = $('#from_account_type_id').val();
                        d.to_account_type_id = $('#to_account_type_id').val();
                        d.region_id = $('#region_id').val();
                        d.status_id = $('#status_id').val();
                    },
                },

                columns: [
                    { data: 'child_checkbox', searchable: false },
                    { data: 'action', class: 'action', name: 'action', searchable: false },
                    { data: 'voucher_number', name: 'journal_vouchers.voucher_number', searchable: true },
                    { data: 'jv_status', name: 'es.name', searchable: true },
                    { data: 'jv_date', searchable: false },
                    { data: 'jv_type', name: 'journal_vouchers.type_id', searchable: false },
                    // { data: 'from_account_type', name: 'from_account_types.name', searchable: false },
                    // { data: 'from_ac_code', searchable: false },
                    // { data: 'to_account_type', name: 'to_account_types.name', searchable: false },
                    // { data: 'to_ac_code', searchable: false },
                    { data: 'created_by', name: 'created_by', searchable: false },
                    { data: 'outlet_code', name: 'outlets.code', searchable: true },
                    { data: 'region_code', name: 'regions.code', searchable: true },
                    { data: 'state_code', name: 'states.code', searchable: true },
                    { data: 'amount', name: 'journal_vouchers.amount', searchable: true, class: 'text-right' },
                ],
                "initComplete": function(settings, json) {
                    $('.dataTables_length select').select2();
                },
                "infoCallback": function(settings, start, end, max, total, pre) {
                    // $('#table_info').html(total)
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
                format: "DD-MM-YYYY",
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
        $scope.onSelectedOutlet = function(selected_outlet_id) {
            setTimeout(function() {
                $('#outlet_id').val(selected_outlet_id);
                dataTable.draw();
            }, 900);
        }
        $scope.onSelectedRegion = function(selected_region_id) {
            setTimeout(function() {
                $('#region_id').val(selected_region_id);
                dataTable.draw();
            }, 900);
        }
        $scope.getSelectedStatus = function(selected_status_id) {
            setTimeout(function() {
                $('#status_id').val(selected_status_id);
                dataTable.draw();
            }, 900);
        }
        $scope.onSelectedState = function(state_id) {
            self.extras.regions = [];
            if (state_id == '') {
                $('#region_id').val('');
            }
            $('#state_id').val(state_id);
            dataTable.draw();
            $http.post(
                laravel_routes['getRegions'], {
                    id: state_id,
                }
            ).then(function(response) {
                self.extras.regions = response.data.regions;
            });
        }
        $scope.reset_filter = function() {
            $('#voucher_number').val('');
            $('#jv_date').val('');
            $('#type_id').val('');
            $('#outlet_id').val('');
            $('#state_id').val('');
            $('#region_id').val('');
            $('#status_id').val('');
            $('#from_account_type_id').val('');
            $('#to_account_type_id').val('');
            self.extras.regions = [];
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

        //CLICK TO APPROVE
        $scope.deleteJournalVoucherApprove = function($id, $status_id) {
            console.log($id, $status_id);
            $('#journal_vouchers_id').val($id);
            $('#journal_voucher_status_id').val($status_id);
        }

        $scope.sendForApproval = function() {
            $rootScope.loading = true;
            $http({
                url: laravel_routes['updateJVStatus'],
                method: "POST",
                params: {
                    id: $('#journal_vouchers_id').val(),
                    status_id: $('#journal_voucher_status_id').val(),
                }
            }).then(function(response) {
                $('#approve-popup').modal('hide');
                // $rootScope.loading = false;
                if (!response.data.success) {
                    custom_noty('error', response.data.error);
                    return;
                }
                $('#journal_vouchers_list').DataTable().ajax.reload(function(json) {});
                $location.path('/jv-pkg/journal-voucher/list');
            });
        }

        $scope.submitForApproval = function() {
            if ($('.journal_voucher_checkbox:checked').length > 0) {
                // console.log(1);
                var send_for_approval = []
                $('input[name="child_boxes"]:checked').each(function() {
                    send_for_approval.push(this.value);
                });
                // console.log(send_for_approval);
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
                        $location.path('/jv-pkg/journal-voucher/list');

                        // $scope.$apply();
                        // $timeout(function() {
                        //     RefreshTable();
                        // }, 1000);
                    } else {
                        custom_noty('error', response.data.errors);
                    }
                });
            } else {
                // console.log(2);
                custom_noty('error', 'Please Select Checkbox');
            }
        }

        // $('#send_for_approval').on('click', function() { 
        // alert('dsf');
        //     if ($('.journal_voucher_checkbox:checked').length > 0) {
        //         var send_for_approval = []
        //         $('input[name="child_boxes"]:checked').each(function() {
        //             send_for_approval.push(this.value);
        //         });
        //         // console.log(send_for_approval);
        //         // return false;
        //         $http.post(
        //             laravel_routes['journalVoucherMultipleApproval'], {
        //                 send_for_approval: send_for_approval,
        //                 // approval_level_id: $routeParams.level_id,
        //             }
        //         ).then(function(response) {
        //             if (response.data.success == true) {
        //                 custom_noty('success', response.data.message);
        //                 $('#journal_vouchers_list').DataTable().ajax.reload();
        //                 $scope.$apply();
        //                 // $timeout(function() {
        //                 //     RefreshTable();
        //                 // }, 1000);
        //             } else {
        //                 custom_noty('error', response.data.errors);
        //             }
        //         });
        //     } else {
        //         custom_noty('error', 'Please Select Checkbox');
        //     }
        // })

        $(document).on('click', '#parent', function() {
            // alert('sd');
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
        // var transfer_amount = [];
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('add-journal-voucher') || !self.hasPermission('edit-journal-voucher')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.angular_routes = angular_routes;
        var attachment_removal_ids = [];
        // var permanent_number = [];
        $("input:text:visible:first").focus();
        $http({
            url: laravel_routes['getJournalVoucherFormData'],
            method: "GET",
            params: {
                'id': typeof($routeParams.id) == 'undefined' ? null : $routeParams.id,
            }
        }).then(function(response) {
            console.log(response.data);
            self.jv = response.data.journal_voucher;
            self.jv.invoices = response.data.invoices;
            self.from_account = self.jv.from_account;
            self.to_account = self.jv.to_account;
            self.jv_type_list = response.data.jv_type_list;
            self.journal_list = response.data.journal_list;
            self.account_type_list = response.data.account_type_list;
            permanent_number = response.data.permanent_number;
            $rootScope.loading = false;

            if (self.jv.action == 'Edit') {
                //ATTACHMENTS
                if (self.jv.attachments.length) {
                    $(self.jv.attachments).each(function(key, attachment) {
                        var design = '<div class="imageuploadify-container" data-attachment_id="' + attachment.id + '" style="margin-left: 0px; margin-right: 0px;">' +
                            '<div class="imageuploadify-btn-remove"><button type="button" class="btn btn-danger glyphicon glyphicon-remove"></button> ' +
                            ' <div class="imageuploadify-details"><div class="imageuploadify-file-icon"></div><span class="imageuploadify-file-name"><a href="' + jv_attachements_url + '/' + attachment.name + '">' + attachment.name + '' +
                            '</span><span class="imageuploadify-file-type">image/jpeg</span>' +
                            '</a><span class="imageuploadify-file-size">369960</span></div>' +
                            '</div></div>';
                        $('.imageuploadify-images-list').append(design);
                    });
                }
            }
        });

        //SELECT JV TYPE GET JOURNAL && FROM ACC && TO ACC 
        $scope.jvTypeChanged = function($id) {
            // alert($id);
            $http.get(
                laravel_routes['getJVType'], {
                    params: {
                        id: $id,
                    }
                }
            ).then(function(response) {
                self.jv.type = response.data.jv_type;
                if (!self.jv.type.journal_editable) {
                    // console.log('journal');
                    self.jv.journal = self.jv.type.journal;
                } else {
                    // console.log('journal list');
                    self.jv.type.journal_editable = self.jv.type.journal_editable;
                    // self.jv.journal = '';
                }
                if (!self.jv.type.from_account_type_editable) {
                    // console.log('from');
                    self.jv.from_account_type = self.jv.type.from_account_type;
                    // $scope.onSelectedFromAcc(self.jv.from_account_type.id);
                } else {
                    // console.log('from List');
                    self.jv.type.from_account_type_editable = self.jv.type.from_account_type_editable;
                    // self.jv.from_account_type = '';
                }
                if (!self.jv.type.to_account_type_editable) {
                    // console.log('to');
                    self.jv.to_account_type = self.jv.type.to_account_type;
                    // $scope.onSelectedToAcc(self.jv.to_account_type.id);
                } else {
                    // console.log('to list');
                    self.jv.type.to_account_type_editable = self.jv.type.to_account_type_editable;
                    // self.jv.to_account_type = '';
                }
            });
        }

        // $scope.onSelectedFromAcc = function($id){
        //     console.log($id);
        // }

        // $scope.onSelectedToAcc = function($id){
        //     console.log($id);
        // }

        self.searchCustomer = $rootScope.searchCustomer;

        //GET CUSTOMER DETAILS
        $scope.customerSelected = function(type) {
            if (type == 'fromAcc') {
                // console.log(self.from_account);
                if (self.from_account || self.from_account != null) {
                    var res = $rootScope.getCustomer(self.from_account.id).then(function(res) {
                        console.log(res.data);
                        if (!res.data.success) {
                            custom_noty('error', res.data.error);
                            return;
                        }
                        self.jv.from_account = res.data.customer
                    });
                } else {
                    self.jv.from_account = '';
                }
            } else {
                if (self.to_account || self.to_account != null) {
                    var res = $rootScope.getCustomer(self.to_account.id).then(function(res) {
                        if (!res.data.success) {
                            custom_noty('error', res.data.error);
                            return;
                        }
                        self.jv.to_account = res.data.customer
                    });
                } else {
                    self.jv.to_account = '';
                }
            }
        }

        self.searchVendor = $rootScope.searchVendor;

        //GET VENDOR DETAILS
        $scope.vendorSelected = function(type) {
            if (type == 'fromAcc') {
                // console.log(self.from_account);
                if (self.from_account || self.from_account != null) {
                    var res = $rootScope.getVendor(self.from_account.id).then(function(res) {
                        console.log(res.data);
                        if (!res.data.success) {
                            custom_noty('error', res.data.error);
                            return;
                        }
                        self.jv.from_account = res.data.vendor
                    });
                } else {
                    self.jv.from_account = '';
                }
            } else {
                if (self.to_account || self.to_account != null) {
                    var res = $rootScope.getVendor(self.to_account.id).then(function(res) {
                        if (!res.data.success) {
                            custom_noty('error', res.data.error);
                            return;
                        }
                        self.jv.to_account = res.data.vendor
                    });
                } else {
                    self.jv.to_account = '';
                }
            }
        }


        self.searchLedger = $rootScope.searchLedger;

        //GET VENDOR DETAILS
        $scope.ledgerSelected = function(type) {
            if (type == 'fromAcc') {
                // console.log(self.from_account);
                if (self.from_account || self.from_account != null) {
                    var res = $rootScope.getLedger(self.from_account.id).then(function(res) {
                        console.log(res.data);
                        if (!res.data.success) {
                            custom_noty('error', res.data.error);
                            return;
                        }
                        self.jv.from_account = res.data.ledger
                    });
                } else {
                    self.jv.from_account = '';
                }
            } else {
                if (self.to_account || self.to_account != null) {
                    var res = $rootScope.getLedger(self.to_account.id).then(function(res) {
                        if (!res.data.success) {
                            custom_noty('error', res.data.error);
                            return;
                        }
                        self.jv.to_account = res.data.ledger
                    });
                } else {
                    self.jv.to_account = '';
                }
            }
        }

        //GET MAX AMOUTN FROM INVOICES AND RECEIPTS
        $scope.onChangeTransferType = function(type) {
            self.jv.transfer_type = type;
        }

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

            if (permanent_number.includes(receipt_number)) {
                custom_noty('error', 'Recepit Number Already taken!');
                return;
            } else {
                $http.get(
                    laravel_routes['getReceipts'], {
                        params: {
                            account_code: account_code,
                            receipt_number: receipt_number,
                            limit: 1,
                        }
                    }
                ).then(function(response) {
                    // console.log(response.data);
                    if (!response.data.success) {
                        custom_noty('error', response.data.error);
                        return;
                    }
                    self.jv.receipts.push(response.data.receipt);
                    permanent_number.push(response.data.receipt.permanent_receipt_no);

                    self.jv.total_receipt_amount = parseFloat(self.jv.total_receipt_amount) + parseFloat(response.data.receipt.balance_amount);
                    // console.log(self.jv.total_receipt_amount);
                    // if (self.jv.transfer_type == 'receipt') {
                    // $("#total_receipt_amount").val(self.jv.total_receipt_amount.toFixed(2));
                    self.jv.total_receipt_amount = self.jv.total_receipt_amount;
                    // $('#transfer_amount').prop('readonly', true);
                    // }
                    // console.log(self.jv.transfer_amount);

                    self.from_receipt_no = '';
                    self.to_receipt_no = '';
                });

            }

        }

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
                console.log(response.data);
                if (!response.data.success) {
                    custom_noty('error', response.data.error);
                    return;
                }
                self.jv.invoices = response.data.invoices;
            });
        }

        //ATTACHMENT REMOVE
        $(document).on('click', ".main-wrap .imageuploadify-container .imageuploadify-btn-remove button", function() {
            var attachment_id = $(this).parent().parent().data('attachment_id');
            attachment_removal_ids.push(attachment_id);
            $('#attachment_removal_ids').val(JSON.stringify(attachment_removal_ids));
            $(this).parent().parent().remove();
        });

        /* Image Uploadify Funtion */
        $('.image_uploadify').imageuploadify();

        /* JV DatePicker*/
        $('.jvDatePicker').bootstrapDP({
            format: "dd-mm-yyyy",
            autoclose: true,
            todayHighlight: true,
            // startDate: min_offset,
            // endDate: max_offset
        });

        $('#parent_checkbox').on('click', function() {
            if (this.checked) {
                self.check_List = true;
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
        });

        //GET MINIMUM SELECTED AMOUNT TO APPEND ON TRANSFER AMOUNT IN AMOUNT TAB
        $(document).on('click', '.compare_amount', function() {
            var total_invoice_amount = parseInt(self.jv.total_invoice_amount).toFixed(2);
            var total_receipt_amount = parseInt(self.jv.total_receipt_amount).toFixed(2);
            self.transfer_amount = Math.min(total_receipt_amount, total_invoice_amount);
            $("#transfer_amount").val(self.transfer_amount.toFixed(2));
        });

        $("#transfer_amount").on('change', function() {
            if ($(this).val() > self.transfer_amount) {
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'Transfer Amount Not More then ' + self.transfer_amount + '!',
                }).show();
                $('.submit').button('loading');
                return;
            } else {
                $('.submit').button('reset');
            }
        });

        //BASED ON TRANSFER OF TYPE CHOOSE
        // $("#transfer_amount").on('change', function() {
        //INVOICE
        //     if (self.jv.transfer_type == 'invoice') {
        //         if ($(this).val() > self.jv.total_invoice_amount) {
        //             $noty = new Noty({
        //                 type: 'error',
        //                 layout: 'topRight',
        //                 text: 'Transfer Amount Not More then Invoice Total Amount!',
        //             }).show();
        //             $('.submit').button('loading');
        //             return;
        //         } else {
        //             $('.submit').button('reset');
        //         }
        //     }
        //RECEIPT
        //     if (self.jv.transfer_type == 'receipt') {
        //         if ($(this).val() > self.jv.total_receipt_amount) {
        //             $noty = new Noty({
        //                 type: 'error',
        //                 layout: 'topRight',
        //                 text: 'Transfer Amount Not More then Recepit Total Amount!',
        //             }).show();
        //             $('.submit').button('loading');
        //             return;
        //         } else {
        //             $('.submit').button('reset');
        //         }
        //     }
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

                console.log(validator.errorList);
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
        if (!self.hasPermission('view-journal-voucher')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.angular_routes = angular_routes;
        self.ref_attachements_url_link = ref_attachements_url;
        $http({
            url: laravel_routes['viewJournalVoucher'],
            method: "GET",
            params: {
                id: $routeParams.id,
            }
        }).then(function(response) {
            console.log(response.data);
            self.jv = response.data.journal_voucher;
            self.reject_reasons = response.data.reject_reasons;
            self.jv.activity_logs = response.data.activity_logs;
            self.status_id = response.data.status_id;
            //ATTACHMENTS
            if (self.jv.attachments.length) {
                $(self.jv.attachments).each(function(key, attachment) {
                    var design = '<div class="imageuploadify-container" data-attachment_id="' + attachment.id + '" style="margin-left: 0px; margin-right: 0px;">' +
                        ' <div class="imageuploadify-details"><div class="imageuploadify-file-icon"></div><span class="imageuploadify-file-name"><a href="' + jv_attachements_url + '/' + attachment.name + '">' + attachment.name + '' +
                        '</span><span class="imageuploadify-file-type">image/jpeg</span>' +
                        '</a><span class="imageuploadify-file-size">369960</span></div>' +
                        '</div></div>';
                    $('.imageuploadify-images-list').append(design);
                });
            }
            // self.ref_attachements_url_link = jv_attachements_url;
            $rootScope.loading = false;
        });

        $scope.sendForApproval = function() {
            $rootScope.loading = true;
            $http({
                url: laravel_routes['updateJVStatus'],
                method: "POST",
                params: {
                    id: self.jv.id,
                    status_id: self.status_id,
                }
            }).then(function(response) {
                $('#approve-popup').modal('hide');
                // $rootScope.loading = false;
                if (!response.data.success) {
                    custom_noty('error', response.data.error);
                    return;
                }
                $timeout(function() {
                    custom_noty('success', response.data.message);
                    $location.path('/jv-pkg/journal-voucher/list');
                    $scope.$apply();
                }, 1000);
            });
        }
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
        $scope.removeReceipt = function(index, balence_amount, total_receipt_amount) {
            self.jv.total_receipt_amount = total_receipt_amount;
            self.jv.total_receipt_amount -= parseFloat(balence_amount);
            self.jv.receipts.splice(index, 1);
            permanent_number.splice(index, 1);
        }
        // console.log(self.jv.total_receipt_amount);
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
                // console.log(invoice, key);
                // console.log(invoice.received_amount);
                invoice.balance_amount = invoice.invoice_amount - invoice.received_amount;
                // console.log(invoice.balance_amount);
                if (invoice.selected) {
                    self.jv.invoices_length++;
                    self.jv.total_invoice_amount += parseFloat(invoice.balance_amount);
                }
                // if (self.jv.transfer_type == 'invoice') {
                // $("#total_invice_amount").val(self.jv.total_invoice_amount.toFixed(2));
                self.jv.total_invoice_amount = self.jv.total_invoice_amount;
                // $('#transfer_amount').prop('readonly', true);
                // }
            });
            // console.log(self.jv.transfer_amount);
        }

    }
});

app.component('jvAmountDetailsView', {
    templateUrl: jv_amount_details_view_template_url,
    bindings: {
        jv: '<',
    },
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
    }
});

app.component('jvActivityLogs', {
    templateUrl: jv_activity_logs_template_url,
    bindings: {
        jv: '<',
    },
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
    }
});
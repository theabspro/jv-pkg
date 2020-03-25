app.component('jvVerificationList', {
    templateUrl: jv_verification_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $window) {
        $scope.loading = true;
        // $route.reload();
        // console.log(base_path);
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.level_id = $routeParams.level_id;
        // setTimeout(function(){
        //     window.location.href = ('#!/verification/7221/level/'+ $routeParams.level_id +'/list');
        // },900);
        // $scope.reloadRoute = function(){
        //     $window.location.reload();
        // }
        var table_scroll;
        table_scroll = $('.page-main-content.list-page-content').height() - 37;
        var dataTable = $('#jv_verification_list').DataTable({
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
                    $('#search_jv_verification').val(state_save_val.search.search);
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
            retrieve: true,
            ajax: {
                url: laravel_routes['getJvVerificationList'],
                type: "POST",
                dataType: "json",
                data: function(d) {
                    d.approval_level_id = $routeParams.level_id;
                    // d.mobile_no = $('#mobile_no').val();
                    // d.journal_voucher_code = $('#journal_voucher_code').val();
                    // d.journal_voucher_name = $('#journal_voucher_name').val();
                    // d.email = $('#email').val();
                },
            },

            columns: [
                { data: 'child_checkbox', searchable: false },
                { data: 'action', class: 'action', name: 'action', searchable: false },
                { data: 'number', name: 'journal_vouchers.number', searchable: true },
                { data: 'jv_status', name: 'approval_type_statuses.status', searchable: false },
                { data: 'jv_date', searchable: false },
                { data: 'jv_type', name: 'journal_vouchers.type_id', searchable: false },
                { data: 'from_account_type', name: 'from_account_types.name', searchable: false },
                { data: 'from_ac_code', searchable: false },
                { data: 'to_account_type', name: 'to_account_types.name', searchable: false },
                { data: 'to_ac_code', searchable: false },
                { data: 'amount', name: 'journal_vouchers.amount', searchable: false },
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
            $('#jv_verification_list').DataTable().search('').draw();
        }

        var dataTables = $('#jv_verification_list').dataTable();
        $("#search_journal_voucher").keyup(function() {
            dataTables.fnFilter(this.value);
        });

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

        $('#send_for_approval').on('click', function() { //alert('dsf');
            if ($('.jv_verfication_checkbox:checked').length > 0) {
                var send_for_approval = []
                $('input[name="child_boxes"]:checked').each(function() {
                    send_for_approval.push(this.value);
                });
                console.log(send_for_approval);
                // return false;
                $http.post(
                    laravel_routes['jvMultipleApproval'], {
                        send_for_approval: send_for_approval,
                        approval_level_id: $routeParams.level_id,
                    }
                ).then(function(response) {
                    if (response.data.success == true) {
                        custom_noty('success', response.data.message);
                            $('#jv_verification_list').DataTable().ajax.reload();
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
                $('.jv_verfication_checkbox').each(function() {
                    this.checked = true;
                });
            } else {
                $('.jv_verfication_checkbox').each(function() {
                    this.checked = false;
                });
            }
        });
        $(document.body).on('click', '.jv_verfication_checkbox', function() {
            if ($('.jv_verfication_checkbox:checked').length == $('.jv_verfication_checkbox').length) {
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
app.component('jvVerificationView', {
    templateUrl: jv_verification_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $element, $mdSelect, $timeout) {
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.angular_routes = angular_routes;
        self.level_id = $routeParams.level_id;
        $http({
            url: laravel_routes['viewJvVerification'],
            method: "GET",
            params: {
                id: $routeParams.id,
                approval_level_id: $routeParams.level_id,
            }
        }).then(function(response) {
            console.log(response.data);
            self.journal_vouchers = response.data.journal_vouchers;
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
            self.ref_attachements_url_link = jv_attachements_url;
            self.action = response.data.action;
            self.jv_date = self.journal_vouchers.date;
            self.invoice_numbers = [];
            angular.forEach(response.data.invoice_details, function(value,key){
                self.invoice_numbers.push(value.invoice_number);                
            });
            self.invoices = self.invoice_numbers.join(', ');

            self.receipt_numbers = [];
            angular.forEach(response.data.receipt_details, function(value,key){
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
                            custom_noty('success',res.message);
                            $timeout(function() {
                                $location.path('/verification/7221/level/'+ $routeParams.level_id +'/list');
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
                                $location.path('/verification/7221/level/'+ $routeParams.level_id +'/list');
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
                            custom_noty('success',res.message);
                            $timeout(function() {
                                $location.path('/verification/7221/level/'+ $routeParams.level_id +'/list');
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
                                $location.path('/verification/7221/level/'+ $routeParams.level_id +'/list');
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
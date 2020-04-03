app.component('jvVerificationList', {
    templateUrl: jv_verification_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $window, $mdSelect,$element) {
        $scope.loading = true;
        $('#search_jv_verification').focus();
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.level_id = $routeParams.level_id;
        // if (!self.hasPermission('add-lob') || !self.hasPermission('edit-lob')) {
        //     window.location = "#!/page-permission-denied";
        //     return false;
        // }
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
            dataTable = $('#jv_verification_list').DataTable({
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
                searching: true,
                ordering: false,
                scrollY: table_scroll + "px",
                scrollX: true,
                scrollCollapse: true,
                // retrieve: true,
                ajax: {
                    url: laravel_routes['getJvVerificationList'],
                    type: "POST",
                    dataType: "json",
                    data: function(d) {
                        d.approval_level_id = $routeParams.level_id;
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
                    { data: 'number', name: 'journal_vouchers.voucher_number', searchable: true },
                    { data: 'jv_status', name: 'approval_type_statuses.status', searchable: false },
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
            $('#jv_verification_list').DataTable().ajax.reload();
        });
        $("#search_jv_verification").on('keyup', function() {
            dataTable
                .search(this.value)
                .draw();
        });
        $scope.clear_search = function() {
            $('#search_jv_verification').val('');
            $('#jv_verification_list').DataTable().search('').draw();
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
            $('#from_account_type_id').val('');
            $('#to_account_type_id').val('');
            $('#status_id').val('');
            self.extras.regions = [];
            dataTable.draw();
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
        // if (!self.hasPermission('add-lob') || !self.hasPermission('edit-lob')) {
        //     window.location = "#!/page-permission-denied";
        //     return false;
        // }
        self.angular_routes = angular_routes;
        self.level_id = $routeParams.level_id;
        self.ref_attachements_url_link = ref_attachements_url;
        $http({
            url: laravel_routes['viewJvVerification'],
            method: "GET",
            params: {
                id: $routeParams.id,
                approval_level_id: $routeParams.level_id,
            }
        }).then(function(response) {
            console.log(response.data.activity_logs);
            self.jv = response.data.journal_voucher;
            self.rejection_reasons = response.data.rejection_reasons;
            self.jv.activity_logs = response.data.activity_logs;
            self.approval_level = response.data.approval_level;
            self.ref_attachements_url_link = jv_attachements_url;
            $rootScope.loading = false;

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
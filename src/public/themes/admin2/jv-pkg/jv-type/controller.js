app.component('jvTypeList', {
    templateUrl: jv_type_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        var table_scroll;
        table_scroll = $('.page-main-content').height() - 37;
        var dataTable = $('#jv_types_list').DataTable({
            "dom": dom_structure,
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
                    $('#search_jv_type').val(state_save_val.search.search);
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
                url: url(laravel_routes['getJvTypeList']),
                type: "GET",
                dataType: "json",
                data: function(d) {
                    d.jv_type_code = $('#jv_type_code').val();
                    d.jv_type_name = $('#jv_type_name').val();
                    d.mobile_no = $('#mobile_no').val();
                    d.email = $('#email').val();
                },
            },

            columns: [
                { data: 'action', class: 'action', name: 'action', searchable: false },
                { data: 'code', name: 'jv_types.code' },
                { data: 'name', name: 'jv_types.name' },
                { data: 'mobile_no', name: 'jv_types.mobile_no' },
                { data: 'email', name: 'jv_types.email' },
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
            $('#search_jv_type').val('');
            $('#jv_types_list').DataTable().search('').draw();
        }

        var dataTables = $('#jv_types_list').dataTable();
        $("#search_jv_type").keyup(function() {
            dataTables.fnFilter(this.value);
        });

        //DELETE
        $scope.deleteJvType = function($id) {
            $('#jv_type_id').val($id);
        }
        $scope.deleteConfirm = function() {
            $id = $('#jv_type_id').val();
            $http.get(
                jv_type_delete_data_url + '/' + $id,
            ).then(function(response) {
                if (response.data.success) {
                    $noty = new Noty({
                        type: 'success',
                        layout: 'topRight',
                        text: 'JV Type Deleted Successfully',
                    }).show();
                    setTimeout(function() {
                        $noty.close();
                    }, 3000);
                    $('#jv_types_list').DataTable().ajax.reload(function(json) {});
                    $location.path('/jv-pkg/jv-type/list');
                }
            });
        }

        //FOR FILTER
        $('#jv_type_code').on('keyup', function() {
            dataTables.fnFilter();
        });
        $('#jv_type_name').on('keyup', function() {
            dataTables.fnFilter();
        });
        $('#mobile_no').on('keyup', function() {
            dataTables.fnFilter();
        });
        $('#email').on('keyup', function() {
            dataTables.fnFilter();
        });
        $scope.reset_filter = function() {
            $("#jv_type_name").val('');
            $("#jv_type_code").val('');
            $("#mobile_no").val('');
            $("#email").val('');
            dataTables.fnFilter();
        }

        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('jvTypeForm', {
    templateUrl: jv_type_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        get_form_data_url = typeof($routeParams.id) == 'undefined' ? jv_type_get_form_data_url : jv_type_get_form_data_url + '/' + $routeParams.id;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.angular_routes = angular_routes;
        $http.get(
            get_form_data_url
        ).then(function(response) {
            // console.log(response);
            self.jv_type = response.data.jv_type;
            self.address = response.data.address;
            self.country_list = response.data.country_list;
            self.action = response.data.action;
            $rootScope.loading = false;
            if (self.action == 'Edit') {
                $scope.onSelectedCountry(self.address.country_id);
                $scope.onSelectedState(self.address.state_id);
                if (self.jv_type.deleted_at) {
                    self.switch_value = 'Inactive';
                } else {
                    self.switch_value = 'Active';
                }
            } else {
                self.switch_value = 'Active';
                self.state_list = [{ 'id': '', 'name': 'Select State' }];
                self.city_list = [{ 'id': '', 'name': 'Select City' }];
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
        $scope.btnNxt = function() {}
        $scope.prev = function() {}

        //SELECT STATE BASED COUNTRY
        $scope.onSelectedCountry = function(id) {
            jv_type_get_state_by_country = vendor_get_state_by_country;
            $http.post(
                jv_type_get_state_by_country, { 'country_id': id }
            ).then(function(response) {
                // console.log(response);
                self.state_list = response.data.state_list;
            });
        }

        //SELECT CITY BASED STATE
        $scope.onSelectedState = function(id) {
            jv_type_get_city_by_state = vendor_get_city_by_state
            $http.post(
                jv_type_get_city_by_state, { 'state_id': id }
            ).then(function(response) {
                // console.log(response);
                self.city_list = response.data.city_list;
            });
        }

        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            rules: {
                'code': {
                    required: true,
                    minlength: 3,
                    maxlength: 255,
                },
                'name': {
                    required: true,
                    minlength: 3,
                    maxlength: 255,
                },
                'cust_group': {
                    maxlength: 100,
                },
                'gst_number': {
                    required: true,
                    maxlength: 100,
                },
                'dimension': {
                    maxlength: 50,
                },
                'address': {
                    required: true,
                    minlength: 5,
                    maxlength: 250,
                },
                'address_line1': {
                    minlength: 3,
                    maxlength: 255,
                },
                'address_line2': {
                    minlength: 3,
                    maxlength: 255,
                },
                // 'pincode': {
                //     required: true,
                //     minlength: 6,
                //     maxlength: 6,
                // },
            },
            messages: {
                'code': {
                    maxlength: 'Maximum of 255 charaters',
                },
                'name': {
                    maxlength: 'Maximum of 255 charaters',
                },
                'cust_group': {
                    maxlength: 'Maximum of 100 charaters',
                },
                'dimension': {
                    maxlength: 'Maximum of 50 charaters',
                },
                'gst_number': {
                    maxlength: 'Maximum of 25 charaters',
                },
                'email': {
                    maxlength: 'Maximum of 100 charaters',
                },
                'address_line1': {
                    maxlength: 'Maximum of 255 charaters',
                },
                'address_line2': {
                    maxlength: 'Maximum of 255 charaters',
                },
                // 'pincode': {
                //     maxlength: 'Maximum of 6 charaters',
                // },
            },
            invalidHandler: function(event, validator) {
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'You have errors,Please check all tabs'
                }).show();
                setTimeout(function() {
                    $noty.close();
                }, 3000)
            },
            submitHandler: function(form) {
                let formData = new FormData($(form_id)[0]);
                $('#submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveJvType'],
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
                            $location.path('/jv-pkg/jv-type/list');
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
                                $location.path('/jv-pkg/jv-type/list');
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
app.component('jvTypeList', {
    templateUrl: jv_type_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        var dataTable = $('#jv_types_list').DataTable({
            "dom": dom_structure,
            "language": {
                "search": "",
                "searchPlaceholder": "Search",
                "lengthMenu": "Rows Per Page _MENU_",
                "paginate": {
                    "next": '<i class="icon ion-ios-arrow-forward"></i>',
                    "previous": '<i class="icon ion-ios-arrow-back"></i>'
                },
            },
            stateSave: true,
            pageLength: 10,
            processing: true,
            serverSide: true,
            paging: true,
            ordering: false,
            ajax: {
                url: laravel_routes['getJvTypeList'],
                data: function(d) {}
            },
            columns: [
                { data: 'action', searchable: false, class: 'action' },
                { data: 'name', name: 'jv_types.name', searchable: true },
                { data: 'delivery_time', name: 'jv_types.delivery_time', searchable: true },
                { data: 'charge', name: 'jv_types.charge', searchable: false },
            ],
            "infoCallback": function(settings, start, end, max, total, pre) {
                $('#table_info').html(total + '/' + max)
            },
            rowCallback: function(row, data) {
                $(row).addClass('highlight-row');
            },
            initComplete: function() {
                $('.search label input').focus();
            },
        });
        $('.dataTables_length select').select2();
        $('.page-header-content .display-inline-block .data-table-title').html('Journal Vouchers <span class="badge badge-secondary" id="table_info">0</span>');
        $('.page-header-content .search.display-inline-block .add_close_button').html('<button type="button" class="btn btn-img btn-add-close"><img src="' + image_scr2 + '" class="img-responsive"></button>');
        $('.page-header-content .refresh.display-inline-block').html('<button type="button" class="btn btn-refresh"><img src="' + image_scr3 + '" class="img-responsive"></button>');
        $('.add_new_button').html(
            '<a href="#!/jv-pkg/jv-type/add" type="button" class="btn btn-secondary" dusk="add-btn">' +
            'Add Journal Voucher' +
            '</a>'
        );

        $('.btn-add-close').on("click", function() {
            $('#jv_types_list').DataTable().search('').draw();
        });

        $('.btn-refresh').on("click", function() {
            $('#jv_types_list').DataTable().ajax.reload();
        });

        //DELETE
        $scope.deleteJvType = function($id) {
            $('#jv_type_id').val($id);
        }
        $scope.deleteConfirm = function() {
            $id = $('#jv_type_id').val();
            $http.get(
                laravel_routes['deleteJvType'], {
                    params: {
                        id: $id,
                    }
                }
            ).then(function(response) {
                if (response.data.success) {
                    custom_noty('success', response.data.message);
                    $('#jv_types_list').DataTable().ajax.reload();
                    $scope.$apply();
                } else {
                    custom_noty('error', response.data.errors);
                }
            });
        }

        //FOR FILTER
        /*$('#jv_type_code').on('keyup', function() {
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
        }*/

        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('jvTypeForm', {
    templateUrl: jv_type_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.angular_routes = angular_routes;
        fileUpload();
        $http({
            url: laravel_routes['getJvTypeFormData'],
            method: 'GET',
            params: {
                'id': typeof($routeParams.id) == 'undefined' ? null : $routeParams.id,
            }
        }).then(function(response) {
            self.jv_type = response.data.jv_type;
            self.attachment = response.data.attachment;
            self.action = response.data.action;
            self.theme = response.data.theme;
            $rootScope.loading = false;
            if (self.action == 'Edit') {
                if (self.jv_type.deleted_at) {
                    self.switch_value = 'Inactive';
                } else {
                    self.switch_value = 'Active';
                }
                if (self.attachment) {
                    $scope.PreviewImage = 'public/themes/' + self.theme + '/img/jv_type_logo/' + self.attachment.name;
                    $('#edited_file_name').val(self.attachment.name);
                } else {
                    $('#edited_file_name').val('');
                }
            } else {
                self.switch_value = 'Active';
            }
        });

        $scope.SelectFile = function(e) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.PreviewImage = e.target.result;
                $scope.$apply();
            };
            reader.readAsDataURL(e.target.files[0]);
        };

        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            errorPlacement: function(error, element) {
                if (element.attr("name") == "logo_id") {
                    error.insertAfter("#attachment_error");
                } else {
                    error.insertAfter(element);
                }
            },
            rules: {
                'name': {
                    required: true,
                    minlength: 3,
                    maxlength: 191,
                },
                'delivery_time': {
                    required: true,
                    minlength: 3,
                    maxlength: 255,
                },
                'logo_id': {
                    extension: "jpg|jpeg|png|ico|bmp|svg|gif",
                },
                'charge': {
                    required: true,
                    number: true,
                },
            },
            messages: {
                'logo_id': {
                    extension: "Accept Image Files Only. Eg: jpg,jpeg,png,ico,bmp,svg,gif"
                }
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
                            custom_noty('success', res.message)
                            $location.path('/jv-pkg/jv-type/list');
                            $scope.$apply();
                        } else {
                            if (!res.success == true) {
                                $('#submit').button('reset');
                                var errors = '';
                                for (var i in res.errors) {
                                    errors += '<li>' + res.errors[i] + '</li>';
                                }
                                custom_noty('error', errors);
                            } else {
                                $('#submit').button('reset');
                                $location.path('/jv-pkg/jv-type/list');
                                $scope.$apply();
                            }
                        }
                    })
                    .fail(function(xhr) {
                        $('#submit').button('reset');
                        custom_noty('error', 'Something went wrong at server');
                    });
            }
        });
    }
});
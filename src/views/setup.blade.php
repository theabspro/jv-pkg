@if(config('jv-pkg.DEV'))
    <?php $jv_pkg_prefix = '/packages/abs/jv-pkg/src';?>
@else
    <?php $jv_pkg_prefix = '';?>
@endif

<script type="text/javascript">
	app.config(['$routeProvider', function($routeProvider) {

	    $routeProvider.
	    when('/jv-pkg/journal-voucher/list', {
	        template: '<journal-voucher-list></journal-voucher-list>',
	        title: 'Journal Vouchers',
	    }).
	    when('/jv-pkg/journal-voucher/add', {
	        template: '<journal-voucher-form></journal-voucher-form>',
	        title: 'Add Journal Voucher',
	    }).
	    when('/jv-pkg/journal-voucher/edit/:id', {
	        template: '<journal-voucher-form></journal-voucher-form>',
	        title: 'Edit Journal Voucher',
	    });
	}]);


    var journal_voucher_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/list.html')}}";
    var journal_voucher_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/form.html')}}";
</script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/controller.js')}}"></script>

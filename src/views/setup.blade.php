@if(config('jv-pkg.DEV'))
    <?php $jv_pkg_prefix = '/packages/abs/jv-pkg/src';?>
@else
    <?php $jv_pkg_prefix = '';?>
@endif

<script type="text/javascript">
	app.config(['$routeProvider', function($routeProvider) {

	    $routeProvider.
	    when('/jv-pkg/journal/list', {
	        template: '<journal-list></journal-list>',
	        title: 'Journals',
	    }).
	    when('/jv-pkg/journal/add', {
	        template: '<journal-form></journal-form>',
	        title: 'Add Journal',
	    }).
	    when('/jv-pkg/journal/edit/:id', {
	        template: '<journal-form></journal-form>',
	        title: 'Edit Journal',
	    }).

	    when('/jv-pkg/jv-type/list', {
	        template: '<jv-type-list></jv-type-list>',
	        title: 'JV Types',
	    }).
	    when('/jv-pkg/jv-type/add', {
	        template: '<jv-type-form></jv-type-form>',
	        title: 'Add JV Type',
	    }).
	    when('/jv-pkg/jv-type/edit/:id', {
	        template: '<jv-type-form></jv-type-form>',
	        title: 'Edit JV Type',
	    }).

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


    var journal_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal/list.html')}}";
    var journal_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal/form.html')}}";

    var jv_type_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-type/list.html')}}";
    var jv_type_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-type/form.html')}}";

    var journal_voucher_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/list.html')}}";
    var journal_voucher_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/form.html')}}";
</script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal/controller.js')}}"></script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-type/controller.js')}}"></script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/controller.js')}}"></script>

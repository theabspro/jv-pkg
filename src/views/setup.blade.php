@if(config('jv-pkg.DEV'))
    <?php $jv_pkg_prefix = '/packages/abs/jv-pkg/src';?>
@else
    <?php $jv_pkg_prefix = '';?>
@endif

<script type="text/javascript">
	app.config(['$routeProvider', function($routeProvider) {

	    $routeProvider.
	    //JOURNAL
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

	    //JV TYPES
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
	    when('/jv-pkg/jv-type/view/:id', {
	        template: '<jv-type-view></jv-type-view>',
	        title: 'View JV Type',
	    }).

	    //JOURNAL VOUCHER
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
	    }).
	    when('/jv-pkg/journal-voucher/view/:id', {
	        template: '<journal-voucher-view></journal-voucher-view>',
	        title: 'View Journal Voucher',
	    }).

	    //JOURNAL VOUCHER VERIFICATION
	    when('/verification/7221/level/:level_id/list', {
	        template: '<jv-verification-list></jv-verification-list>',
	        title: 'JV Verification',
	    }).
	    when('/verification/7221/level/:level_id/view/:id', {
	        template: '<jv-verification-view></jv-verification-view>',
	        title: 'JV Verification View',
	    }).

	     //LEDGER
	    when('/jv-pkg/ledger/list', {
	        template: '<ledger-list></ledger-list>',
	        title: 'Ledgers',
	    }).
	    when('/jv-pkg/ledger/add', {
	        template: '<ledger-form></ledger-form>',
	        title: 'Add Ledger',
	    }).
	    when('/jv-pkg/ledger/edit/:id', {
	        template: '<ledger-form></ledger-form>',
	        title: 'Edit Ledger',
	    });
	}]);

	//JOURNALS
    var journal_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal/list.html')}}";
    var journal_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal/form.html')}}";

	//JV TYPES
    var jv_type_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-type/list.html')}}";
    var jv_type_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-type/form.html')}}";
    var jv_type_view_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-type/view.html')}}";

    //JOURNAL VOUCHER
    var journal_voucher_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/list.html')}}";
    var journal_voucher_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/form.html')}}";
    var journal_voucher_view_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/view.html')}}";
	var jv_form_header_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/partials/jv-form-header.html')}}";
	var jv_receipts_table_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/partials/jv-receipts-table.html')}}";
	var jv_invoices_table_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/partials/jv-invoices-table.html')}}";


    //JOURNAL VOUCHER VERIFICATION
    var jv_verification_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-verification/list.html')}}";
    var jv_verification_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-verification/view.html')}}";
    // var get_from_list_based_level_id = "{{url('verification/get-list')}}";
    var jv_attachements_url = "{{URL::to('/storage/app/public/journal-vouchers/attachments')}}";
    // var base_path = "{{base_path()}}";
    var ref_attachements_url = "{{URL::to('/storage/app/public/journal-vouchers/attachments')}}";


    //LEDGER
    var ledger_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/ledger/list.html')}}";
    var ledger_form_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/ledger/form.html')}}";
</script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal/controller.js')}}"></script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-type/controller.js')}}"></script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/controller.js')}}"></script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/ledger/controller.js')}}"></script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/jv-verification/controller.js')}}"></script>

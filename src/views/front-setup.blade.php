@if(config('jv-pkg.DEV'))
    <?php $jv_pkg_prefix = '/packages/abs/jv-pkg/src';?>
@else
    <?php $jv_pkg_prefix = '';?>
@endif

<script type="text/javascript">
    var journal_voucher_list_template_url = "{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/journal-vouchers.html')}}";
</script>
<script type="text/javascript" src="{{asset($jv_pkg_prefix.'/public/themes/'.$theme.'/jv-pkg/journal-voucher/controller.js')}}"></script>

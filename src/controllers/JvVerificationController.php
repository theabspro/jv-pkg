<?php

namespace Abs\JVPkg;
use Abs\ApprovalPkg\ApprovalLevel;
use Abs\CustomerPkg\Customer;
use Abs\JVPkg\JournalVoucher;
use App\Http\Controllers\Controller;
use Auth;
use DB;
use Illuminate\Http\Request;
use Yajra\Datatables\Datatables;

class JvVerificationController extends Controller {

	public function __construct() {
		$this->data['theme'] = config('custom.admin_theme');
	}

	public function getJvVerificationList(Request $request) {
		$approval_level = ApprovalLevel::where('id', $request->approval_level_id)
			->leftJoin('approval_type_approval_level as atal', 'atal.approval_level_id', 'approval_levels.id')
			->where('atal.approval_type_id', 2)
			->first();
		// dd($approval_level->current_status_id);
		$jv_verification = JournalVoucher::withTrashed()
			->select([
				'journal_vouchers.*',
				'jv_types.short_name as jv_type',
				'from_account_types.name as from_account_type',
				'to_account_types.name as to_account_type',
				'approval_type_statuses.status as jv_status',
				DB::raw('DATE_FORMAT(journal_vouchers.date,"%d/%m/%Y") as jv_date'),
				DB::raw('IF(journal_vouchers.deleted_at IS NULL, "Active","Inactive") as status'),
			])

			->leftJoin('jv_types', 'jv_types.id', 'journal_vouchers.type_id')
			->leftJoin('approval_type_statuses', 'approval_type_statuses.id', 'journal_vouchers.status_id')
			->leftJoin('configs as from_account_types', 'from_account_types.id', 'journal_vouchers.from_account_type_id')
			->leftJoin('configs as to_account_types', 'to_account_types.id', 'journal_vouchers.to_account_type_id')
			->where('journal_vouchers.company_id', Auth::user()->company_id)
			->where('journal_vouchers.status_id', $approval_level->current_status_id)
		/*->where(function ($query) use ($request) {
				if (!empty($request->question)) {
					$query->where('journal_vouchers.question', 'LIKE', '%' . $request->question . '%');
				}
			})*/
		// ->orderby('journal_vouchers.id', 'desc')
		// ->get()
		;

		// dd($jv_verification);
		return Datatables::of($jv_verification)
			->addColumn('number', function ($jv_verification) {
				$status = $jv_verification->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $jv_verification->voucher_number;
			})
			->addColumn('from_ac_code', function ($jv_verification) {
				if ($jv_verification->from_account_type_id == 1440) {
					$from_ac_code = Customer::where('id', $jv_verification->from_account_id)->pluck('code')->first();
				} elseif ($jv_verification->from_account_type_id == 1441) {
					$from_ac_code = Vendor::where('id', $jv_verification->from_account_id)->pluck('code')->first();
				} elseif ($jv_verification->from_account_type_id == 1442) {
					$from_ac_code = Ledger::where('id', $jv_verification->from_account_id)->pluck('code')->first();
				}
				return $from_ac_code;
			})
			->addColumn('to_ac_code', function ($jv_verification) {
				if ($jv_verification->to_account_type_id == 1440) {
					$to_ac_code = Customer::where('id', $jv_verification->to_account_id)->pluck('code')->first();
				} elseif ($jv_verification->to_account_type_id == 1441) {
					$to_ac_code = Vendor::where('id', $jv_verification->to_account_id)->pluck('code')->first();
				} elseif ($jv_verification->to_account_type_id == 1442) {
					$to_ac_code = Ledger::where('id', $jv_verification->from_account_id)->pluck('code')->first();
				}
				return $to_ac_code;
			})
			->addColumn('action', function ($jv_verification) use ($request) {
				$img_view = asset('public/themes/' . $this->data['theme'] . '/img/content/table/eye.svg');
				$img_view_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/eye-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');
				$output = '';
				$output .= '<a href="#!/verification/7221/level/' . $request->approval_level_id . '/view/' . $jv_verification->id . '" id = "" ><img src="' . $img_view . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img_view_active . '" onmouseout=this.src="' . $img_view . '"></a>';

				// $output .= '<a href="javascript:;" data-toggle="modal" data-target="#journal-voucher-delete-modal" onclick="angular.element(this).scope().deleteJournalVoucher(' . $journal_vouchers->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>';

				return $output;
			})
			->make(true);
	}

	public function viewJvVerification(Request $request) {
		$id = $request->id;
		$approval_type_id = $request->approval_type_id;
		$journal_voucher = JournalVoucher::find($id);
		$journal_vouchers = JournalVoucher::join('journals', 'journals.id', 'journal_vouchers.journal_id')
			->join('jv_types', 'jv_types.id', 'journal_vouchers.type_id')
			->join('configs as fati', 'fati.id', 'journal_vouchers.from_account_type_id')
			->join('configs as tati', 'tati.id', 'journal_vouchers.to_account_type_id')
			->join('approval_type_statuses as ats', 'ats.id', 'journal_vouchers.status_id')
			->leftJoin('jv_invoices', 'jv_invoices.jv_id', 'journal_vouchers.id')
			->leftJoin('jv_receipts', 'jv_receipts.jv_id', 'journal_vouchers.id')
		// with([
		// 	'jvType',
		// 	'journal',
		// ])
		// ->find($id)
		;
		// dd($journal_vouchers);

		if ($journal_voucher->from_account_type_id == 1440) {
			//CUSTOMER
			$journal_vouchers = $journal_vouchers->leftJoin('customers as from_account', 'from_account.id', 'journal_vouchers.from_account_id');
		}
		// elseif ($journal_voucher->from_account_type_id == 1441) {
		// 	//VENDOR
		// 	$journal_vouchers = $journal_vouchers->leftJoin('vendors as from_account', 'from_account.id', 'journal_vouchers.from_account_id');
		// } elseif ($journal_voucher->from_account_type_id == 1442) {
		// 	//LEDGER
		// 	$journal_vouchers = $journal_vouchers->leftJoin('ledgers as from_account', 'from_account.id', 'journal_vouchers.from_account_id');
		// }

		if ($journal_voucher->to_account_type_id == 1440) {
			//CUSTOMER
			$journal_vouchers = $journal_vouchers->leftJoin('customers as to_account', 'to_account.id', 'journal_vouchers.from_account_id');
		}
		// elseif ($journal_voucher->to_account_type_id == 1441) {
		// 	//VENDOR
		// 	$journal_vouchers = $journal_vouchers->leftJoin('vendors as to_account', 'to_account.id', 'journal_vouchers.from_account_id');
		// } elseif ($journal_voucher->to_account_type_id == 1442) {
		// 	//LEDGER
		// 	$journal_vouchers = $journal_vouchers->leftJoin('ledgers as to_account', 'to_account.id', 'journal_vouchers.from_account_id');
		// }
		// dd($journal_vouchers);

		$this->data['journal_vouchers'] = $journal_vouchers->select(
			'journal_vouchers.*',
			// DB::raw('DATEFORMAT(journal_vouchers.date,"%d/%m/%Y") as journal_voucher_date'),
			'jv_types.name as jv_type',
			'journals.name as journal_name',
			DB::raw('COUNT(jv_invoices.jv_id) as invoice_count'),
			DB::raw('COUNT(jv_receipts.jv_id) as receipt_count'),
			'fati.name as from_account_type',
			'tati.name as to_account_type',
			'from_account.name as from_account_name',
			'from_account.code as from_account_code',
			'from_account.address as from_account_address',
			'from_account.mobile_no as from_account_mobile_no',
			'from_account.email as from_account_email',
			'to_account.name as to_account_name',
			'to_account.code as to_account_code',
			'to_account.address as to_account_address',
			'to_account.mobile_no as to_account_mobile_no',
			'to_account.email as to_account_email',
			'ats.status as status'
		)
			->groupBy('journal_vouchers.id')
			->find($id)
		;
		$this->data['action'] = 'View';

		return response()->json($this->data);
	}
}

<?php

namespace Abs\JVPkg;
use Abs\BasicPkg\Attachment;
use Abs\BasicPkg\Config;
use Abs\CustomerPkg\Customer;
use Abs\InvoicePkg\Invoice;
use Abs\JVPkg\JournalVoucher;
use Abs\JVPkg\JVType;
use Abs\ReceiptPkg\Receipt;
use App\ActivityLog;
use App\Http\Controllers\Controller;
use Artisaninweb\SoapWrapper\SoapWrapper;
use Auth;
use Carbon\Carbon;
use DB;
use Entrust;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Validator;
use Yajra\Datatables\Datatables;

class JournalVoucherController extends Controller {

	private $company_id;
	public function __construct(SoapWrapper $soapWrapper) {
		$this->data['theme'] = config('custom.admin_theme');
		$this->company_id = config('custom.company_id');
		$this->soapWrapper = $soapWrapper;
	}

	public function getJournalVoucherList(Request $request) {
		//dd('sdfad');
		if (!empty($request->jv_date)) {
			$jv_date = explode('to', $request->jv_date);
			$first_date_this_month = date('Y-m-d', strtotime($jv_date[0]));
			$last_date_this_month = date('Y-m-d', strtotime($jv_date[1]));
		} else {
			$first_date_this_month = '';
			$last_date_this_month = '';
		}
		$voucher_number_filter = $request->voucher_number;

		$journal_vouchers = JournalVoucher::withTrashed()
			->leftJoin('jv_types', 'jv_types.id', 'journal_vouchers.type_id')
			->leftJoin('entity_statuses as es', 'es.id', 'journal_vouchers.status_id')
			->leftJoin('configs as from_account_types', 'from_account_types.id', 'journal_vouchers.from_account_type_id')
			->leftJoin('configs as to_account_types', 'to_account_types.id', 'journal_vouchers.to_account_type_id')
			->join('users', 'users.id', 'journal_vouchers.created_by_id')
			->join('employees', 'employees.id', 'users.entity_id')
			->join('outlets', 'outlets.id', 'employees.outlet_id')
			->leftJoin('regions', 'regions.id', 'outlets.region_id')
			->join('states', 'states.id', 'outlets.state_id')
			->select([
				'journal_vouchers.*',
				'jv_types.short_name as jv_type',
				'jv_types.initial_status_id',
				'from_account_types.name as from_account_type',
				'to_account_types.name as to_account_type',
				'es.name as jv_status',
				'outlets.code as outlet_code',
				'states.code as state_code',
				DB::raw('DATE_FORMAT(journal_vouchers.date,"%d-%m-%Y") as jv_date'),
				DB::raw('IF(regions.code IS NULL,"--",regions.code) as region_code'),
				DB::raw('CONCAT(users.ecode," / ",users.name) as created_by'),
				DB::raw('IF(journal_vouchers.deleted_at IS NULL, "Active","Inactive") as status'),
			])
		//HIDE NOW WE WILL ENABLE LATER
		// ->where('journal_vouchers.created_at', '>=', Carbon::now()->subDays(3)) //SHOW ONLY LAST 3 DAYS FROM NOW
		// ->where('journal_vouchers.company_id', Auth::user()->company_id)
			->where('users.user_type_id', 1) //FOR EMPLOYEE
			->where(function ($query) use ($first_date_this_month, $last_date_this_month) {
				if (!empty($first_date_this_month) && !empty($last_date_this_month)) {
					$query->whereRaw("DATE(journal_vouchers.date) BETWEEN '" . $first_date_this_month . "' AND '" . $last_date_this_month . "'");
				}
			})
			->where(function ($query) use ($voucher_number_filter) {
				if ($voucher_number_filter != null) {
					$query->where('journal_vouchers.voucher_number', 'like', "%" . $voucher_number_filter . "%");
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->type_id)) {
					$query->where('journal_vouchers.type_id', $request->type_id);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->outlet_id)) {
					$query->where('employees.outlet_id', $request->outlet_id);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->state_id)) {
					$query->where('outlets.state_id', $request->state_id);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->region_id)) {
					$query->where('outlets.region_id', $request->region_id);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->status_id)) {
					$query->where('journal_vouchers.status_id', $request->status_id);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->from_account_type_id)) {
					$query->where('journal_vouchers.from_account_type_id', $request->from_account_type_id);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->to_account_type_id)) {
					$query->where('journal_vouchers.to_account_type_id', $request->to_account_type_id);
				}
			})

		// ->get()
			->orderby('journal_vouchers.id', 'desc')
		;

		if (Entrust::can('view-all-jv')) {
			$journal_vouchers = $journal_vouchers->where('journal_vouchers.company_id', Auth::user()->company_id);
		} elseif (Entrust::can('view-own-jv')) {
			$journal_vouchers = $journal_vouchers->where('journal_vouchers.created_by_id', Auth::user()->id);
		} else {
			$journal_vouchers = [];
		}
		// dd($journal_vouchers);
		return Datatables::of($journal_vouchers)
			->addColumn('child_checkbox', function ($journal_vouchers) {
				// dd($journal_vouchers->status_id, $journal_vouchers->initial_status_id);
				$checkbox = "<td><div class='table-checkbox'><input type='checkbox' id='child_" . $journal_vouchers->id . "' name='child_boxes' value='" . $journal_vouchers->id . "' class='journal_voucher_checkbox'/><label for='child_" . $journal_vouchers->id . "'></label></div></td>";

				return $checkbox;
			})
			->addColumn('voucher_number', function ($journal_vouchers) {
				$status = $journal_vouchers->status == 'Active' ? 'green' : 'red';
				// return '<span class="status-indicator ' . $status . '"></span>' . $journal_vouchers->voucher_number;
				return $journal_vouchers->voucher_number;
			})
			->addColumn('amount', function ($jv_verification) {
				$amount = '₹ ' . $jv_verification->amount;
				return $amount;
			})
		// ->addColumn('from_ac_code', function ($journal_vouchers) {
		// 	if ($journal_vouchers->from_account_type_id == 1440) {
		// 		$from_ac_code = Customer::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
		// 	} elseif ($journal_vouchers->from_account_type_id == 1441) {
		// 		$from_ac_code = Vendor::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
		// 	} elseif ($journal_vouchers->from_account_type_id == 1442) {
		// 		$from_ac_code = Ledger::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
		// 	}
		// 	return $from_ac_code;
		// })
		// ->addColumn('to_ac_code', function ($journal_vouchers) {
		// 	if ($journal_vouchers->to_account_type_id == 1440) {
		// 		$to_ac_code = Customer::where('id', $journal_vouchers->to_account_id)->pluck('code')->first();
		// 	} elseif ($journal_vouchers->to_account_type_id == 1441) {
		// 		$to_ac_code = Vendor::where('id', $journal_vouchers->to_account_id)->pluck('code')->first();
		// 	} elseif ($journal_vouchers->to_account_type_id == 1442) {
		// 		$to_ac_code = Ledger::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
		// 	}
		// 	return $to_ac_code;
		// })
			->addColumn('action', function ($journal_vouchers) {
				//GET NEXT LEVEL OF STATUS FOR APPROVAL
				$journal_voucher_status = JournalVoucher::with(['type'])->find($journal_vouchers->id);
				$next_status = $journal_voucher_status->type->verificationFlow->approvalLevels()->orderBy('approval_order')->first()->current_status_id;
				$reject_status = $journal_voucher_status->type->verificationFlow->approvalLevels()->orderBy('approval_order')->first()->reject_status_id;
				// dd($reject_status);

				$img1 = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow.svg');
				$img1_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow-active.svg');
				$img_view = asset('public/themes/' . $this->data['theme'] . '/img/content/table/eye.svg');
				$img_view_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/eye-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');

				$img_tick = asset('public/themes/' . $this->data['theme'] . '/img/content/table/tick.svg');
				$img_tick_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/tick.svg');

				$output = '';
				if (Entrust::can('edit-journal-voucher') && ($journal_vouchers->status_id == $journal_vouchers->initial_status_id || $journal_vouchers->status_id == $reject_status)) {
					$output .= '<a href="#!/jv-pkg/journal-voucher/edit/' . $journal_vouchers->id . '" id = "" title="Edit"><img src="' . $img1 . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img1_active . '" onmouseout=this.src="' . $img1 . '"></a>';
				}
				if (Entrust::can('view-journal-voucher')) {
					$output .= '<a href="#!/jv-pkg/journal-voucher/view/' . $journal_vouchers->id . '" id = "" title="View"><img src="' . $img_view . '" alt="View" class="img-responsive" onmouseover=this.src="' . $img_view_active . '" onmouseout=this.src="' . $img_view . '"></a>';
				}
				if (Entrust::can('delete-journal-voucher') && ($journal_vouchers->status_id == $journal_vouchers->initial_status_id || $journal_vouchers->status_id == $reject_status)) {
					$output .= '<a href="javascript:;" data-toggle="modal" data-target="#journal-voucher-delete-modal" onclick="angular.element(this).scope().deleteJournalVoucher(' . $journal_vouchers->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>
					';
				}
				if (Entrust::can('approve-journal-voucher') && ($journal_vouchers->status_id == $journal_vouchers->initial_status_id || $journal_vouchers->status_id == $reject_status)) {
					$output .= '<a href="javascript:;" data-toggle="modal" data-target="#approve-popup" onclick="angular.element(this).scope().deleteJournalVoucherApprove(' . $journal_vouchers->id . ',' . $next_status . ')" title="Approve"><img src="' . $img_tick . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_tick_active . '" onmouseout=this.src="' . $img_tick . '"></a>
					';
				}

				return $output;
			})
			->rawColumns(['child_checkbox', 'action'])
			->make(true);
	}

	public function getJournalVoucherFormData(Request $r) {
		// dd($r->all());
		if (!$r->id) {
			$journal_voucher = new JournalVoucher;
			$journal_voucher->receipts = [];
			$journal_voucher->invoices = [];
			$journal_voucher->total_receipt_amount = 0;
			$journal_voucher->total_invoice_amount = 0;
			$journal_voucher->from_account = null;
			$journal_voucher->to_account = null;
			$permanent_number = [];
			$invoices_length = '';

			//For Testing only
			$journal_voucher->from_account = $journal_voucher->to_account = Customer::where('code', '1000162')->first();
			// $journal_voucher->transfer_type = 'receipt';
			// $journal_voucher->amount = '100.40';
			// $journal_voucher->remarks = 'some remarks';
			// $journal_voucher->reason = 'some reason';

			$this->data['invoices'] = [];
			$journal_voucher->date = date('d-m-Y');
			$journal_voucher->action = 'Initiate';
		} else {
			$journal_voucher = JournalVoucher::withTrashed()->with([
				'attachments',
				'type',
				'journal',
				'fromAccountType',
				'toAccountType',
				'invoices',
				'invoices.outlet',
				'invoices.sbu',
				'receipts',
				'receipts.outlet',
				'receipts.sbu',
			])->find($r->id);

			$permanent_number = $journal_voucher->receipts->pluck('permanent_receipt_no')->toArray();
			$journal_voucher->fromAccount;
			$journal_voucher->toAccount;
			$selected_invoice_ids = $journal_voucher->invoices()->pluck('id')->toArray();
			// dd($selected_invoice_ids);
			$this->data['invoices'] = $journal_voucher->toAccount->invoices;
			foreach ($journal_voucher->toAccount->invoices as $invoice) {
				if (in_array($invoice->id, $selected_invoice_ids)) {
					$invoice->selected = true;
					$total_invoice_amount[] = $invoice->invoice_amount;
				} else {
					$invoice->selected = false;
					$total_invoice_amount[] = '';
				}
				//DONT REVORT -> FOR GETTING OUTLET AND SBU
				$invoice->outlet;
				$invoice->sbu;
			}
			foreach ($journal_voucher->receipts as $receipt) {
				$balance_amount[] = $receipt->balance_amount;
			}
			$journal_voucher->invoices_length = count($selected_invoice_ids);
			$journal_voucher->total_invoice_amount = array_sum($total_invoice_amount);
			$journal_voucher->total_receipt_amount = array_sum($balance_amount);

			if ($journal_voucher->transfer_type == 1) {
				$journal_voucher->transfer_type = 'receipt';
			} else {
				$journal_voucher->transfer_type = 'invoice';
			}
			$journal_voucher->action = 'Edit';
			$journal_voucher->date = date('d-m-Y', strtotime($journal_voucher->date));
		}
		$this->data['journal_voucher'] = $journal_voucher;
		$this->data['permanent_number'] = $permanent_number;
		$this->data['jv_type_list'] = collect(JVType::where('company_id', Auth::user()->company_id)->select('id', 'short_name', 'name')->get())->prepend(['id' => '', 'name' => 'Select JV Type']);
		$this->data['journal_list'] = collect(Journal::where('company_id', Auth::user()->company_id)->select('id', 'name')->get())->prepend(['id' => '', 'name' => 'Select Journal']);
		$this->data['account_type_list'] = collect(Config::select('id', 'name')->where('config_type_id', 27)->get())->prepend(['id' => '', 'name' => 'Select Account Type']);

		// $this->data['action'] = $action;
		$this->data['theme'];
		$this->data['jv_types'] = NULL;
		$this->data['fromAcc_field'] = true;
		$this->data['toAcc_field'] = true;

		return response()->json($this->data);
	}

	public function saveJournalVoucher(Request $request) {
		// dd($request->all());
		try {
			$error_messages = [
				'type_id.required' => 'JV Type is required',
				'date.required' => 'Date is required',
				'journal_id.required' => 'Journal is required',
				'from_account_type_id.required' => 'From Account Type is required',
				'to_account_type_id.required' => 'To Account Type is required',
				'from_account_id.required' => 'From Account is required',
				'to_account_id.required' => 'To Account is required',
				'amount.required' => 'Amount is required',
				'reason.required' => 'Reason is required',
				'remarks.required' => 'Remarks is required',
			];

			$validator = Validator::make($request->all(), [
				'type_id' => [
					'required:true',
					'exists:jv_types,id',
					'integer',
				],
				'date' => [
					'required:true',
					'date_format:"d-m-Y',
					'before_or_equal:' . date('Y-m-d'),
				],
				'journal_id' => [
					'required:true',
					'exists:journals,id',
					'integer',
				],
				'from_account_type_id' => [
					'required:true',
					'exists:configs,id',
					'integer',
				],
				'to_account_type_id' => [
					'required:true',
					'exists:configs,id',
					'integer',
				],
				'from_account_id' => [
					'required:true',
					'integer',
				],
				'to_account_id' => [
					'required:true',
					'integer',
				],
				'transfer_type' => [
					'required:true',
					'string',
				],
				'receipts' => [
					'required:true',
					'array',
				],
				'receipts.*.id' => [
					'integer',
					'exists:receipts,id',
					'distinct',
				],
				'invoices' => [
					'required:true',
					'array',
				],
				'invoices.*.id' => [
					'integer',
					'exists:invoices,id',
					'distinct',
				],
				'amount' => [
					'required:true',
					'numeric',
				],
				'reason' => [
					'required:true',
					'string',
				],
			], $error_messages);

			if ($validator->fails()) {
				return response()->json(['success' => false, 'errors' => $validator->errors()->all()]);
			}
			$jv_type = JVType::find($request->type_id);

			$total_invoice_balance_amount = 0;
			$invoice_ids = [];
			foreach ($request->invoices as $req_invoice) {
				$invoice = Invoice::find($req_invoice['id']);
				$total_invoice_balance_amount += ($invoice->invoice_amount - $invoice->received_amount);
				$invoice_ids[] = $invoice->id;
			}

			$total_receipt_available_amount = 0;
			$receipt_ids = [];
			foreach ($request->receipts as $req_receipt) {
				$receipt = Receipt::find($req_receipt['id']);
				$total_receipt_available_amount += $receipt->balance_amount;
				$receipt_ids[] = $receipt->id;
			}

			$maximum_value = $total_receipt_available_amount > $total_invoice_balance_amount ? $total_receipt_available_amount : $total_invoice_balance_amount;

			if ($request->amount > $maximum_value) {
				return response()->json(['success' => false, 'errors' => ['Transfer amount exceeds from maximum value!']]);
			}

			DB::beginTransaction();
			if (!$request->id) {
				$journal_voucher = new JournalVoucher;
				$journal_voucher->created_by_id = Auth::user()->id;
			} else {
				$journal_voucher = JournalVoucher::withTrashed()->find($request->id);
				$journal_voucher->updated_by_id = Auth::user()->id;
			}

			$journal_voucher->fill($request->all());
			$journal_voucher->company_id = Auth::user()->company_id;
			$journal_voucher->date = date('Y-m-d', strtotime($request->date));
			$journal_voucher->status_id = $jv_type->initial_status_id;
			// dd($jv_type);

			if ($request->transfer_type == 'receipt') {
				$journal_voucher->transfer_type = 1;
			} elseif ($request->transfer_type == 'invoice') {
				$journal_voucher->transfer_type = 2;
			}
			$journal_voucher->save();
			$journal_voucher->voucher_number = 'JV' . $journal_voucher->id;
			$journal_voucher->save();

			$journal_voucher->invoices()->sync($invoice_ids);
			$journal_voucher->receipts()->sync($receipt_ids);

			//ATTACHMENT REMOVAL
			$attachment_removal_ids = json_decode($request->attachment_removal_ids);
			if (!empty($attachment_removal_ids)) {
				Attachment::whereIn('id', $attachment_removal_ids)->forceDelete();
			}

			//SAVE ATTACHMENTS
			$attachement_path = storage_path('app/public/journal-vouchers/attachments/');
			Storage::makeDirectory($attachement_path, 0777);
			if (!empty($request->journal_attachments)) {
				foreach ($request->journal_attachments as $key => $journal_attachment) {
					$value = rand(1, 100);
					$image = $journal_attachment;

					$file_name_with_extension = $image->getClientOriginalName();
					$file_name = pathinfo($file_name_with_extension, PATHINFO_FILENAME);
					$extension = $image->getClientOriginalExtension();
					// dd($file_name, $extension);
					//ISSUE : file name should be stored
					$name = $journal_voucher->id . '_' . $file_name . '.' . $extension;

					$journal_attachment->move(storage_path('app/public/journal-vouchers/attachments/'), $name);
					$attachement = new Attachment;
					$attachement->attachment_of_id = 223;
					$attachement->attachment_type_id = 244;
					$attachement->entity_id = $journal_voucher->id;
					$attachement->name = $name;
					$attachement->save();
				}
			}

			$activity = new ActivityLog;
			$activity->date_time = Carbon::now();
			$activity->user_id = Auth::user()->id;
			$activity->module = 'Journal Voucher';
			$activity->entity_id = $journal_voucher->id;
			$activity->entity_type_id = 384;
			$activity->activity_id = $request->id == NULL ? 280 : 281; //ADD : UPDATE
			$activity->activity = $request->id == NULL ? 280 : 281;
			$activity->details = json_encode($journal_voucher);
			$activity->save();

			DB::commit();
			if (!($request->id)) {
				return response()->json([
					'success' => true,
					'message' => 'JV Request Initiated Successfully',
				]);
			} else {
				return response()->json([
					'success' => true,
					'message' => 'JV Request Updated Successfully',
				]);
			}
		} catch (Exceprion $e) {
			DB::rollBack();
			return response()->json([
				'success' => false,
				'error' => $e->getMessage(),
			]);
		}
	}

	public function viewJournalVoucher(Request $request) {
		$this->data = JournalVoucher::getJvViewData($request);

		$this->data['status_id'] = $this->data['journal_voucher']->type->verificationFlow->approvalLevels()->orderBy('approval_order')->first()->current_status_id;
		$this->data['success'] = true;

		return response()->json($this->data);
	}

	public function deleteJournalVoucher(Request $request) {
		DB::beginTransaction();
		try {
			$jornal_voucher = JournalVoucher::withTrashed()->where('id', $request->id)->forceDelete();
			if ($jornal_voucher) {
				$attachement = Attachment::where([
					'entity_id' => $request->id,
					'attachment_type_id' => 244, //JV ATTACHMENT
					'attachment_of_id' => 223,
				])->forceDelete();
				$activity = new ActivityLog;
				$activity->date_time = Carbon::now();
				$activity->user_id = Auth::user()->id;
				$activity->module = 'Journal Voucher';
				$activity->entity_id = $request->id;
				$activity->entity_type_id = 384;
				$activity->activity_id = 282; //DELETE
				$activity->activity = 282;
				$activity->details = json_encode($activity);
				$activity->save();
				$journal_voucher = JournalVoucher::withTrashed()->where('id', $request->id)->first();
				DB::commit();
				return response()->json(['success' => true, 'message' => 'JV Request Deleted Successfully']);
			}
		} catch (Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => ['Exception Error' => $e->getMessage()]]);
		}
	}

	public function updateJVStatus(Request $r) {
		$jv = JournalVoucher::find($r->id);
		if (!$jv) {
			return response()->json([
				'success' => false,
				'error' => 'JV not found',
			]);
		}
		$jv->status_id = $r->status_id;
		$jv->save();

		$activity = new ActivityLog;
		$activity->date_time = Carbon::now();
		$activity->user_id = Auth::user()->id;
		$activity->module = 'Journal Voucher';
		$activity->entity_id = $jv->id;
		$activity->entity_type_id = 384;
		$activity->activity_id = 281; //UPDATE
		$activity->activity = 281;
		$activity->details = json_encode($jv);
		$activity->save();

		return response()->json([
			'success' => true,
			'message' => 'JV status updated successfully',
		]);
	}

	public function journalVoucherMultipleApproval(Request $request) {
		// dd($request->all());
		$send_for_approvals = JournalVoucher::withTrashed()->whereIn('id', $request->send_for_approval)->where('status_id', 1)->pluck('id')->toArray();
		// dd($send_for_approvals);
		// $approval_level = ApprovalLevel::where('id', 7)
		// 	->leftJoin('approval_type_approval_level as atal', 'atal.approval_level_id', 'approval_levels.id')
		// 	->where('atal.approval_type_id', 2)
		// 	->first();
		if (count($send_for_approvals) == 0) {
			return response()->json(['success' => false, 'errors' => ['No New Status in the list!']]);
		} else {
			DB::beginTransaction();
			try {
				foreach ($send_for_approvals as $key => $value) {
					$journal_voucher = JournalVoucher::withTrashed()->with(['type'])->find($value);
					// dd($journal_voucher);
					$next_status_id = $journal_voucher->type->verificationFlow->approvalLevels()->orderBy('approval_order')->first()->current_status_id;
					// $journal_voucher->status_id = $approval_level->next_status_id;
					$journal_voucher->status_id = $next_status_id;
					$journal_voucher->updated_by_id = Auth()->user()->id;
					$journal_voucher->updated_at = date("Y-m-d H:i:s");
					$journal_voucher->save();

					$status_id = $next_status_id;
					$activity = new ActivityLog;
					$activity->date_time = Carbon::now();
					$activity->user_id = Auth::user()->id;
					$activity->module = 'JV Verification';
					$activity->entity_id = $value;
					$activity->entity_type_id = 384;
					$activity->activity_id = 7221;
					$activity->activity = 7221;
					$activity->details = json_encode($journal_voucher);
					$activity->save();
				}
				DB::commit();
				return response()->json(['success' => true, 'message' => 'Approved successfully']);
			} catch (Exception $e) {
				DB::rollBack();
				return response()->json(['success' => false, 'errors' => ['Exception Error' => $e->getMessage()]]);
			}
		}
	}
}

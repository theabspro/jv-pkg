<?php

namespace Abs\JVPkg;
use Abs\ApprovalPkg\ApprovalTypeStatus;
use Abs\BasicPkg\Config;
use Abs\BusinessPkg\Sbu;
use Abs\CustomerPkg\Customer;
use Abs\InvoicePkg\Invoice;
use Abs\JVPkg\JournalVoucher;
use Abs\JVPkg\Ledger;
use Abs\ReceiptPkg\Receipt;
use App\ActivityLog;
use App\Http\Controllers\Controller;
use App\Outlet;
use App\Vendor;
use Artisaninweb\SoapWrapper\SoapWrapper;
use Auth;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Yajra\Datatables\Datatables;

class JournalVoucherController extends Controller {

	private $company_id;
	public function __construct(SoapWrapper $soapWrapper) {
		$this->data['theme'] = config('custom.admin_theme');
		$this->company_id = config('custom.company_id');
		$this->soapWrapper = $soapWrapper;
	}

	public function getJournalVouchers(Request $request) {
		$this->data['journal_vouchers'] = JournalVoucher::
			select([
			'journal_vouchers.question',
			'journal_vouchers.answer',
		])
			->where('journal_vouchers.company_id', $this->company_id)
			->orderby('journal_vouchers.display_order', 'asc')
			->get()
		;
		$this->data['success'] = true;

		return response()->json($this->data);

	}

	public function getJournalVoucherList(Request $request) {
		//dd('sdfad');
		$journal_vouchers = JournalVoucher::withTrashed()
			->leftJoin('jv_types', 'jv_types.id', 'journal_vouchers.type_id')
			->leftJoin('approval_type_statuses', 'approval_type_statuses.id', 'journal_vouchers.status_id')
			->leftJoin('configs as from_account_types', 'from_account_types.id', 'journal_vouchers.from_account_type_id')
			->leftJoin('configs as to_account_types', 'to_account_types.id', 'journal_vouchers.to_account_type_id')
			->select([
				'journal_vouchers.*',
				'jv_types.short_name as jv_type',
				'from_account_types.name as from_account_type',
				'to_account_types.name as to_account_type',
				'approval_type_statuses.status as jv_status',
				DB::raw('DATE_FORMAT(journal_vouchers.date,"%d/%m/%Y") as jv_date'),
				DB::raw('IF(journal_vouchers.deleted_at IS NULL, "Active","Inactive") as status'),
			])
			->where('journal_vouchers.company_id', Auth::user()->company_id)
		/*->where(function ($query) use ($request) {
				if (!empty($request->question)) {
					$query->where('journal_vouchers.question', 'LIKE', '%' . $request->question . '%');
				}
			})*/
			->orderby('journal_vouchers.id', 'desc');
		// dd($journal_vouchers);
		return Datatables::of($journal_vouchers)
			->addColumn('voucher_number', function ($journal_vouchers) {
				$status = $journal_vouchers->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $journal_vouchers->voucher_number;
			})
			->addColumn('from_ac_code', function ($journal_vouchers) {
				if ($journal_vouchers->from_account_type_id == 1440) {
					$from_ac_code = Customer::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
				} elseif ($journal_vouchers->from_account_type_id == 1441) {
					$from_ac_code = Vendor::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
				} elseif ($journal_vouchers->from_account_type_id == 1442) {
					$from_ac_code = Ledger::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
				}
				return $from_ac_code;
			})
			->addColumn('to_ac_code', function ($journal_vouchers) {
				if ($journal_vouchers->to_account_type_id == 1440) {
					$to_ac_code = Customer::where('id', $journal_vouchers->to_account_id)->pluck('code')->first();
				} elseif ($journal_vouchers->to_account_type_id == 1441) {
					$to_ac_code = Vendor::where('id', $journal_vouchers->to_account_id)->pluck('code')->first();
				} elseif ($journal_vouchers->to_account_type_id == 1442) {
					$to_ac_code = Ledger::where('id', $journal_vouchers->from_account_id)->pluck('code')->first();
				}
				return $to_ac_code;
			})
			->addColumn('action', function ($journal_vouchers) {
				$img1 = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow.svg');
				$img1_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');
				$output = '';
				$output .= '<a href="#!/jv-pkg/journal-voucher/edit/' . $journal_vouchers->id . '" id = "" ><img src="' . $img1 . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img1_active . '" onmouseout=this.src="' . $img1 . '"></a>
					<a href="javascript:;" data-toggle="modal" data-target="#journal-voucher-delete-modal" onclick="angular.element(this).scope().deleteJournalVoucher(' . $journal_vouchers->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>
					';
				return $output;
			})
			->make(true);
	}

	public function getJournalVoucherFormData(Request $r) {
		$id = $r->id;
		if (!$id) {
			$journal_voucher = new JournalVoucher;
			$journal_voucher->date = date('d-m-Y');
			// $attachment = new Attachment;
			$action = 'Add';
		} else {
			$journal_voucher = JournalVoucher::withTrashed()->find($id);
			// $attachment = Attachment::where('id', $journal_voucher->logo_id)->first();
			$action = 'Edit';
		}
		$this->data['journal_voucher'] = $journal_voucher;
		$this->data['jv_type_list'] = collect(JVType::where('company_id', Auth::user()->company_id)->select('id', 'short_name')->get())->prepend(['id' => '', 'short_name' => 'Select JV Type']);
		// $this->data['attachment'] = $attachment;
		$this->data['action'] = $action;
		$this->data['theme'];
		$this->data['jv_types'] = NULL;
		$this->data['fromAcc_field'] = true;
		$this->data['toAcc_field'] = true;

		return response()->json($this->data);
	}

	public function jvTypes(Request $request) {
		if (!empty($request->id)) {
			$this->data['jv_types'] = $jv_types = JVType::Join('jv_type_field', 'jv_type_field.jv_type_id', 'jv_types.id')
				->leftJoin('configs as c1', 'c1.id', 'jv_type_field.field_id')
				->leftJoin('configs as c2', 'c2.id', 'jv_type_field.value')
				->whereIn('jv_type_field.field_id', [1420, 1421, 1422]) //From Acc & To Acc
				->where('jv_types.id', $request->id)
				->select('jv_type_field.field_id', 'c1.name as field_name', 'jv_type_field.value', 'c2.name as value_name', 'jv_type_field.is_open', 'jv_type_field.is_editable', 'jv_types.short_name')
				->get();

			foreach ($jv_types as $key => $jv_type) {
				if ($jv_type->is_open == 0 && $jv_type->is_editable == 0) {
					if ($jv_type->field_id == 1420 && $jv_type->value != NULL) {
						$this->data['journal'] = Journal::Join('jv_type_field', 'jv_type_field.value', 'journals.id')
							->select('journals.id', 'journals.name')
							->first();
						$this->data['journals_list'] = null;
					} elseif ($jv_type->field_id == 1421 && $jv_type->value != NULL) {
						$this->data['jv_account_type_list'] = null;
					} elseif ($jv_type->field_id == 1422 && $jv_type->value != NULL) {
						$this->data['jv_account_type_list'] = null;
					}
				} elseif ($jv_type->is_open == 1 && $jv_type->is_editable == 1) {
					if ($jv_type->field_id == 1420 && $jv_type->value == NULL) {
						$this->data['journals_list'] = collect(Journal::where('company_id', Auth::user()->company_id)->select('id', 'name')->get());
						$this->data['journal'] = null;
					} elseif ($jv_type->field_id == 1421 && $jv_type->value == NULL) {
						$this->data['jv_account_type_list'] = $jv_account_type_list = collect(Config::select('id', 'name')->where('config_type_id', 27)->get());
					} elseif ($jv_type->field_id == 1422 && $jv_type->value == NULL) {
						$this->data['jv_account_type_list'] = $jv_account_type_list = collect(Config::select('id', 'name')->where('config_type_id', 27)->get());
					}
				}
			}
		} else {
			$this->data['journal'] = null;
			$this->data['journals_list'] = null;
			$this->data['jv_types'] = null;
			$this->data['jv_account_type_list'] = null;
		}

		return response()->json($this->data);
	}

	public function searchJVCustomer(Request $r) {
		return Customer::searchCustomer($r);
	}

	public function getJVCustomerDetails(Request $request) {
		return Customer::getDetails($request);
	}

	public function saveJournalVoucher(Request $request) {
		dd($request->all());
		try {
			// $error_messages = [
			// 	'name.required' => 'Name is Required',
			// 	'name.unique' => 'Name is already taken',
			// 	'delivery_time.required' => 'Delivery Time is Required',
			// 	'charge.required' => 'Charge is Required',
			// ];
			// $validator = Validator::make($request->all(), [
			// 	'name' => [
			// 		'required:true',
			// 		'unique:journal_vouchers,name,' . $request->id . ',id,company_id,' . Auth::user()->company_id,
			// 	],
			// 	'delivery_time' => 'required',
			// 	'charge' => 'required',
			// 	'logo_id' => 'mimes:jpeg,jpg,png,gif,ico,bmp,svg|nullable|max:10000',
			// ], $error_messages);
			// if ($validator->fails()) {
			// 	return response()->json(['success' => false, 'errors' => $validator->errors()->all()]);
			// }
			$approval_level = ApprovalTypeStatus::where('approval_type_id', 2)
				->where('status', 'New')
				->first()
			;

			// dd($approval_level);

			if (!empty($jv_receipts)) {
				$jv_receipts = array_column($request->jv_receipts, 'receipt_no');
				$jv_receipt_count = count($jv_receipts);
				$jv_receipt_count_unique = count(array_unique($jv_receipts));
				if ($jv_receipt_count != $jv_receipt_count_unique) {
					return response()->json(['success' => true, 'error' => ['Receipt number should be uniqe!']]);
				}
			}

			if (empty($request->selected_invoices)) {
				return response()->json(['success' => true, 'error' => ['Select Invoice!']]);
			}
			$selected_invoices = explode(', ', $request->selected_invoices);
			foreach ($selected_invoices as $selected_invoice) {
				$invoice_ids[] = Invoice::where('invoice_number', $selected_invoice)->pluck('id');
			}

			$receipt_ids = array_column($request->jv_receipts, 'id');

			DB::beginTransaction();
			if (!$request->id) {
				$journal_voucher = new JournalVoucher;
				$journal_voucher->created_by_id = Auth::user()->id;
				$journal_voucher->created_at = Carbon::now();
				$journal_voucher->updated_at = NULL;
			} else {
				$journal_voucher = JournalVoucher::withTrashed()->find($request->id);
				$journal_voucher->updated_by_id = Auth::user()->id;
				$journal_voucher->updated_at = Carbon::now();
			}

			$journal_voucher->date = date('Y-m-d', strtotime($request->date));
			$journal_voucher->status_id = $approval_level->id;
			$journal_voucher->fill($request->all());
			$journal_voucher->company_id = Auth::user()->company_id;
			if ($request->status == 'Inactive') {
				$journal_voucher->deleted_at = Carbon::now();
				$journal_voucher->deleted_by_id = Auth::user()->id;
			} else {
				$journal_voucher->deleted_by_id = NULL;
				$journal_voucher->deleted_at = NULL;
			}
			$journal_voucher->save();

			$journal_voucher->voucher_number = 'JVA-' . $journal_voucher->id;

			$journal_voucher->save();

			$journal_voucher->jvInvoice()->sync([]);
			foreach ($invoice_ids as $invoice_id) {
				$journal_voucher->jvInvoice()->attach($invoice_id);
			}

			$journal_voucher->jvReceipt()->sync([]);
			foreach ($receipt_ids as $receipt_id) {
				$journal_voucher->jvReceipt()->attach($receipt_id);
			}

			$activity = new ActivityLog;
			$activity->date_time = Carbon::now();
			$activity->user_id = Auth::user()->id;
			$activity->module = 'Journal Voucher';
			$activity->entity_id = $request->id;
			$activity->entity_type_id = 384;
			$activity->activity_id = $request->id == NULL ? 280 : 281;
			$activity->activity = $request->id == NULL ? 280 : 281;
			$activity->details = json_encode($activity);
			$activity->save();

			DB::commit();
			if (!($request->id)) {
				return response()->json([
					'success' => true,
					'message' => 'Journal Voucher Added Successfully',
				]);
			} else {
				return response()->json([
					'success' => true,
					'message' => 'Journal Voucher Updated Successfully',
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

	public function getCustomerInvoice(Request $request) {
		// dd($request->all());
		$this->soapWrapper->add('Invoice', function ($service) {
			$service
				->wsdl('http://tvsapp.tvs.in/MobileAPi/WebService1.asmx?wsdl')
				->trace(true);
		});
		//$request->docType;
		$params = ['ACCOUNTNUM' => $request->accountNumber];
		$getResult = $this->soapWrapper->call('Invoice.GetCustomerinvoice', [$params]);
		$customer_invoice = json_decode($getResult->GetCustomerinvoiceResult, true);

		if (!empty($customer_invoice)) {
			$datas = $customer_invoice['Table'];
			if (!empty($datas)) {
				// dd($datas);
				foreach ($datas as $data) {
					// dd($data);

					$outlet = Outlet::select('id')->where('code', $data['OUTLET'])->first();
					$business = Sbu::select('id')->where('name', $data['BUSINESSUNIT'])->first();
					// dd(Auth::user()->company_id, $request->accountNumber);
					// dd($data['INVOICE']);
					$invoice = Invoice::firstOrNew([
						'invoice_number' => $data['INVOICE'],
					]);
					$invoice->customer_id = $request->customer_id;
					$invoice->company_id = Auth::user()->company_id;
					$invoice->invoice_number = $data['INVOICE'];
					$invoice->invoice_date = $data['TRANSDATE'];
					$invoice->invoice_amount = $data['AMOUNTCUR'];
					$invoice->received_amount = $data['SETTLEAMOUNTCUR'];
					$invoice->remarks = $data['TXT'];
					$invoice->outlet_id = $outlet->id;
					$invoice->sbu_id = $business->id;
					$invoice->created_at = Carbon::now();
					$invoice->updated_at = NULL;

					$invoice->save();
				}
			}
		}

		$invoices_lists = Invoice::select(
			'invoices.id',
			'invoices.invoice_number',
			DB::raw('DATE_FORMAT(invoices.invoice_date,"%d/%m/%Y") as invoice_date'),
			'outlets.code as outlet_name',
			'sbus.name as business_name',
			DB::raw('format((invoices.invoice_amount),0,"en_IN") as invoice_amount'),
			DB::raw('format((invoices.received_amount),0,"en_IN") as received_amount'),
			DB::raw('COALESCE(invoices.remarks, "--") as remarks'),
			DB::raw('format((invoices.invoice_amount - invoices.received_amount),0,"en_IN") as balence_amount')
		)
			->leftjoin('outlets', 'outlets.id', 'invoices.outlet_id')
			->leftjoin('sbus', 'sbus.id', 'invoices.sbu_id')
			->where('customer_id', $request->customer_id)
			->get()
		;

		return response()->json(['invoices' => $invoices_lists]);

		// dd($invoices_lists);
		// return Datatables::of($invoices_lists)
		// 	->addColumn('child_checkbox', function ($invoices_list) {
		// 		// dd($data['INVOICE']);
		// 		$checkbox = "<td><div class='table-checkbox'><input type='checkbox' id='child_" . $invoices_list->id . "' name='child_boxes' value='" . $invoices_list->invoice_number . "' class='jv_Checkbox'/><label for='child_" . $invoices_list->id . "'></label></div></td>";

		// 		return $checkbox;
		// 	})
		// 	->rawColumns(['child_checkbox'])
		// 	->make(true);
	}

	public function getCustomerReceipt(Request $request) {
		$this->soapWrapper->add('Receipt', function ($service) {
			$service
				->wsdl('http://tvsapp.tvs.in/MobileAPi/WebService1.asmx?wsdl')
				->trace(true);
		});
		//$request->docType;
		$params = ['ACCOUNTNUM' => $request->accountNumber, 'VOUCHER' => $request->receiptNumber];
		$getResult = $this->soapWrapper->call('Receipt.GetCustomerReceipt', [$params]);
		$customer_receipt = json_decode($getResult->GetCustomerReceiptResult, true);

		if (!empty($customer_receipt)) {
			$datas = $customer_receipt['Table'];
			if (!empty($datas)) {
				foreach ($datas as $data) {
					$outlet = Outlet::select('id')->where('code', $data['OUTLET'])->first();
					$business = Sbu::select('id')->where('name', $data['BUSINESSUNIT'])->first();
					// dd(Auth::user()->company_id, $request->accountNumber);
					$receipt = Receipt::firstOrNew([
						'permanent_receipt_no' => $data['VOUCHER'],
					]);
					$receipt->company_id = Auth::user()->company_id;
					$receipt->date = $data['DOCUMENTDATE'];
					$receipt->outlet_id = $outlet->id;
					$receipt->sbu_id = $business->id;
					$receipt->description = $data['TXT'];
					$receipt->permanent_receipt_no = $data['VOUCHER'];
					$receipt->temporary_receipt_no = $data['VOUCHER'];
					$receipt->amount = $data['AMOUNTMST'];
					$receipt->settled_amount = $data['SETTLEAMOUNTMST'];
					$receipt->balance_amount = $data['BALANCE'];
					$receipt->save();
				}
				$receipts = Receipt::select(
					'receipts.id',
					'receipts.permanent_receipt_no as receipt_no',
					'receipts.description',
					'outlets.code as outlet_name',
					'sbus.name as business_name',
					'receipts.amount as available_amt',
					'receipts.balance_amount as balance_amount',
					DB::raw('DATE_FORMAT(receipts.date,"%d/%m/%Y") as receipt_date')
				)
					->leftjoin('outlets', 'outlets.id', 'receipts.outlet_id')
					->leftjoin('sbus', 'sbus.id', 'receipts.sbu_id')
					->where('permanent_receipt_no', $request->receiptNumber)
					->first()
				;

				return response()->json(['receipts' => $receipts]);
			}
		} else {
			return response()->json(['success' => false, 'errors' => ['No Receipts For this Customers!.']]);
		}
	}

	public function deleteJournalVoucher(Request $request) {
		dd($request->all());
		DB::beginTransaction();
		try {

			$activity = new ActivityLog;
			$activity->date_time = Carbon::now();
			$activity->user_id = Auth::user()->id;
			$activity->module = 'Journal Voucher';
			$activity->entity_id = $request->id;
			$activity->entity_type_id = 384;
			$activity->activity_id = 282;
			$activity->activity = 282;
			$activity->details = json_encode($activity);
			$activity->save();
			$journal_voucher = JournalVoucher::withTrashed()->where('id', $request->id)->first();
			// if (!is_null($journal_voucher->logo_id)) {
			// 	Attachment::where('company_id', Auth::user()->company_id)->where('attachment_of_id', 20)->where('entity_id', $request->id)->forceDelete();
			// }
			JournalVoucher::withTrashed()->where('id', $request->id)->forceDelete();

			DB::commit();
			return response()->json(['success' => true, 'message' => 'Journal Voucher Deleted Successfully']);
		} catch (Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => ['Exception Error' => $e->getMessage()]]);
		}
	}
}

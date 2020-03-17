<?php

namespace Abs\JVPkg;
use Abs\BasicPkg\Config;
use Abs\CustomerPkg\Customer;
use Abs\JVPkg\JournalVoucher;
use Abs\JVPkg\Ledger;
use App\Http\Controllers\Controller;
use App\Vendor;
use Auth;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Validator;
use Yajra\Datatables\Datatables;

class JournalVoucherController extends Controller {

	private $company_id;
	public function __construct() {
		$this->data['theme'] = config('custom.admin_theme');
		$this->company_id = config('custom.company_id');
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
			->addColumn('number', function ($journal_vouchers) {
				$status = $journal_vouchers->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $journal_vouchers->number;
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
		//dd($request->all());
		try {
			$error_messages = [
				'name.required' => 'Name is Required',
				'name.unique' => 'Name is already taken',
				'delivery_time.required' => 'Delivery Time is Required',
				'charge.required' => 'Charge is Required',
			];
			$validator = Validator::make($request->all(), [
				'name' => [
					'required:true',
					'unique:journal_vouchers,name,' . $request->id . ',id,company_id,' . Auth::user()->company_id,
				],
				'delivery_time' => 'required',
				'charge' => 'required',
				'logo_id' => 'mimes:jpeg,jpg,png,gif,ico,bmp,svg|nullable|max:10000',
			], $error_messages);
			if ($validator->fails()) {
				return response()->json(['success' => false, 'errors' => $validator->errors()->all()]);
			}

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

			// if (!empty($request->logo_id)) {
			// 	if (!File::exists(public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo')) {
			// 		File::makeDirectory(public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo', 0777, true);
			// 	}

			// 	$attacement = $request->logo_id;
			// 	$remove_previous_attachment = Attachment::where([
			// 		'entity_id' => $request->id,
			// 		'attachment_of_id' => 20,
			// 	])->first();
			// 	if (!empty($remove_previous_attachment)) {
			// 		$remove = $remove_previous_attachment->forceDelete();
			// 		$img_path = public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo/' . $remove_previous_attachment->name;
			// 		if (File::exists($img_path)) {
			// 			File::delete($img_path);
			// 		}
			// 	}
			// 	$random_file_name = $journal_voucher->id . '_journal_voucher_file_' . rand(0, 1000) . '.';
			// 	$extension = $attacement->getClientOriginalExtension();
			// 	$attacement->move(public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo', $random_file_name . $extension);

			// 	$attachment = new Attachment;
			// 	$attachment->company_id = Auth::user()->company_id;
			// 	$attachment->attachment_of_id = 20; //User
			// 	$attachment->attachment_type_id = 40; //Primary
			// 	$attachment->entity_id = $journal_voucher->id;
			// 	$attachment->name = $random_file_name . $extension;
			// 	$attachment->save();
			// 	$journal_voucher->logo_id = $attachment->id;
			// 	$journal_voucher->save();
			// }

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

	public function deleteJournalVoucher(Request $request) {
		DB::beginTransaction();
		try {
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

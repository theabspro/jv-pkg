<?php

namespace Abs\JVPkg;
use Abs\ApprovalPkg\ApprovalType;
use Abs\ApprovalPkg\ApprovalTypeStatus;
use Abs\Basic\Attachment;
use Abs\JVPkg\Journal;
use Abs\JVPkg\JournalVoucher;
use Abs\JVPkg\JVType;
use App\Config;
use App\Http\Controllers\Controller;
use Auth;
use Carbon\Carbon;
use DB;
use File;
use Illuminate\Http\Request;
use Validator;
use Yajra\Datatables\Datatables;

class JVTypeController extends Controller {

	public function __construct() {
		$this->data['theme'] = config('custom.admin_theme');
	}

	public function getJvTypeList(Request $request) {
		$jv_types = JVType::withTrashed()
			->select([
				'jv_types.*',
				DB::raw('IF(jv_types.deleted_at IS NULL, "Active","Inactive") as status'),
			])
			->where('jv_types.company_id', Auth::user()->company_id)
		/*->where(function ($query) use ($request) {
				if (!empty($request->question)) {
					$query->where('jv_types.question', 'LIKE', '%' . $request->question . '%');
				}
			})*/
			->orderby('jv_types.id', 'desc');

		return Datatables::of($jv_types)
			->addColumn('name', function ($jv_types) {
				$status = $jv_types->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $jv_types->name;
			})
			->addColumn('action', function ($jv_types) {
				$img1 = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow.svg');
				$img1_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');
				$output = '';
				$output .= '<a href="#!/jv-pkg/journal-voucher/edit/' . $jv_types->id . '" id = "" ><img src="' . $img1 . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img1_active . '" onmouseout=this.src="' . $img1 . '"></a>
					<a href="javascript:;" data-toggle="modal" data-target="#journal-voucher-delete-modal" onclick="angular.element(this).scope().deleteJournalVoucher(' . $journal_vouchers->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>
					';
				return $output;
			})
			->make(true);
	}

	public function getJVTypeFormData(Request $request) {
		$id = $request->id;
		if (!$id) {
			$jv_type = new JVType;
			$jv_field = [
				['is_open' => 'No', 'is_editable' => 'No'],
				['is_open' => 'No', 'is_editable' => 'No'],
				['is_open' => 'No', 'is_editable' => 'No'],
			];
			$action = 'Add';
		} else {
			$jv_type = JVType::withTrashed()->find($id);
			$action = 'Edit';
		}
		$this->data['jv_type'] = $jv_type;
		$this->data['action'] = $action;
		$this->data['theme'];
		$this->data['extras'] = [
			'approval_type_status_list' => ApprovalTypeStatus::select('id', 'status')->get(),
			'approval_type_list' => ApprovalType::select('id', 'name')->get(),
			'journal_list' => Journal::select('id', 'name')->get(),
			'jv_account_type_list' => Config::select('id', 'name')->where('config_type_id', 27)->get(),
		];

		$this->data['jv_field'] = $jv_field;
		return response()->json($this->data);
	}

	public function saveJvType(Request $request) {
		dd($request->all());
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
				$journal_voucher = new JVType;
				$journal_voucher->created_by_id = Auth::user()->id;
				$journal_voucher->created_at = Carbon::now();
				$journal_voucher->updated_at = NULL;
			} else {
				$journal_voucher = JVType::withTrashed()->find($request->id);
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

			if (!empty($request->logo_id)) {
				if (!File::exists(public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo')) {
					File::makeDirectory(public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo', 0777, true);
				}

				$attacement = $request->logo_id;
				$remove_previous_attachment = Attachment::where([
					'entity_id' => $request->id,
					'attachment_of_id' => 20,
				])->first();
				if (!empty($remove_previous_attachment)) {
					$remove = $remove_previous_attachment->forceDelete();
					$img_path = public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo/' . $remove_previous_attachment->name;
					if (File::exists($img_path)) {
						File::delete($img_path);
					}
				}
				$random_file_name = $journal_voucher->id . '_journal_voucher_file_' . rand(0, 1000) . '.';
				$extension = $attacement->getClientOriginalExtension();
				$attacement->move(public_path() . '/themes/' . config('custom.admin_theme') . '/img/journal_voucher_logo', $random_file_name . $extension);

				$attachment = new Attachment;
				$attachment->company_id = Auth::user()->company_id;
				$attachment->attachment_of_id = 20; //User
				$attachment->attachment_type_id = 40; //Primary
				$attachment->entity_id = $journal_voucher->id;
				$attachment->name = $random_file_name . $extension;
				$attachment->save();
				$journal_voucher->logo_id = $attachment->id;
				$journal_voucher->save();
			}

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
			if (!is_null($journal_voucher->logo_id)) {
				Attachment::where('company_id', Auth::user()->company_id)->where('attachment_of_id', 20)->where('entity_id', $request->id)->forceDelete();
			}
			JournalVoucher::withTrashed()->where('id', $request->id)->forceDelete();

			DB::commit();
			return response()->json(['success' => true, 'message' => 'Journal Voucher Deleted Successfully']);
		} catch (Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => ['Exception Error' => $e->getMessage()]]);
		}
	}
}

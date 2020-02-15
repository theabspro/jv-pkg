<?php

namespace Abs\JVPkg;
use Abs\Basic\Attachment;
use Abs\JVPkg\JournalVoucher;
use App\Http\Controllers\Controller;
use Auth;
use Carbon\Carbon;
use DB;
use File;
use Illuminate\Http\Request;
use Validator;
use Yajra\Datatables\Datatables;

class JournalController extends Controller {

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
		$journal_vouchers = JournalVoucher::withTrashed()
			->select([
				'journal_vouchers.*',
				DB::raw('IF(journal_vouchers.deleted_at IS NULL, "Active","Inactive") as status'),
			])
			->where('journal_vouchers.company_id', $this->company_id)
		/*->where(function ($query) use ($request) {
				if (!empty($request->question)) {
					$query->where('journal_vouchers.question', 'LIKE', '%' . $request->question . '%');
				}
			})*/
			->orderby('journal_vouchers.id', 'desc');

		return Datatables::of($journal_vouchers)
			->addColumn('name', function ($journal_vouchers) {
				$status = $journal_vouchers->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $journal_vouchers->name;
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
			$attachment = new Attachment;
			$action = 'Add';
		} else {
			$journal_voucher = JournalVoucher::withTrashed()->find($id);
			$attachment = Attachment::where('id', $journal_voucher->logo_id)->first();
			$action = 'Edit';
		}
		$this->data['journal_voucher'] = $journal_voucher;
		$this->data['attachment'] = $attachment;
		$this->data['action'] = $action;
		$this->data['theme'];

		return response()->json($this->data);
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

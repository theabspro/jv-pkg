<?php

namespace Abs\JVPkg;
use Abs\JVPkg\Ledger;
use App\ActivityLog;
use App\Http\Controllers\Controller;
use Auth;
use Carbon\Carbon;
use DB;
use Entrust;
use Illuminate\Http\Request;
use Validator;
use Yajra\Datatables\Datatables;

class LedgerController extends Controller {

	public function __construct() {
		$this->data['theme'] = config('custom.admin_theme');
	}

	public function getLedgerList(Request $request) {
		$ledgers = Ledger::withTrashed()
			->select([
				'ledgers.id',
				'ledgers.name',
				'ledgers.code',
				DB::raw('COALESCE(ledgers.description,"--") as description'),
				DB::raw('IF(ledgers.deleted_at IS NULL, "Active","Inactive") as status'),
			])
			->where('ledgers.company_id', Auth::user()->company_id)
			->where(function ($query) use ($request) {
				if (!empty($request->name)) {
					$query->where('ledgers.name', 'LIKE', '%' . $request->name . '%');
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->code)) {
					$query->where('ledgers.code', 'LIKE', '%' . $request->code . '%');
				}
			})
			->where(function ($query) use ($request) {
				if ($request->status == '1') {
					$query->whereNull('ledgers.deleted_at');
				} else if ($request->status == '0') {
					$query->whereNotNull('ledgers.deleted_at');
				}
			})
		// ->orderby('ledgers.id', 'Desc')
		;

		return Datatables::of($ledgers)
			->addColumn('name', function ($ledger) {
				$status = $ledger->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $ledger->name;
			})
			->addColumn('action', function ($ledger) {
				$img1 = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow.svg');
				$img1_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');
				$output = '';
				if (Entrust::can('edit-ledger')) {
					$output .= '<a href="#!/jv-pkg/ledger/edit/' . $ledger->id . '" id = "" title="Edit"><img src="' . $img1 . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img1_active . '" onmouseout=this.src="' . $img1 . '"></a>';
				}
				if (Entrust::can('delete-ledger')) {
					$output .= '<a href="javascript:;" data-toggle="modal" data-target="#ledger-delete-modal" onclick="angular.element(this).scope().deleteLedger(' . $ledger->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>';
				}
				return $output;
			})
			->make(true);
	}

	public function getLedgerFormData(Request $request) {
		$id = $request->id;
		if (!$id) {
			$ledger = new Ledger;
			$action = 'Add';
		} else {
			$ledger = Ledger::withTrashed()->find($id);
			$action = 'Edit';
		}
		$this->data['ledger'] = $ledger;
		$this->data['action'] = $action;
		$this->data['theme'];

		return response()->json($this->data);
	}

	public function saveLedger(Request $request) {
		// dd($request->all());
		try {
			$error_messages = [
				'name.required' => 'Name is Required',
				'name.unique' => 'Name is already taken',
				'name.min' => 'Name is Minimum 3 Charachers',
				'name.max' => 'Name is Maximum 191 Charachers',
				'code.required' => 'Code is Required',
				'code.unique' => 'Code is already taken',
				'code.min' => 'Code is Minimum 2 Charachers',
				'code.max' => 'Code is Maximum 64 Charachers',
				'description.max' => 'Description is Maximum 255 Charachers',
			];
			$validator = Validator::make($request->all(), [
				'name' => [
					'required:true',
					'min:3',
					'max:191',
					'unique:ledgers,name,' . $request->id . ',id,company_id,' . Auth::user()->company_id,
				],
				'code' => [
					'required:true',
					'min:2',
					'max:64',
					'unique:ledgers,code,' . $request->id . ',id,company_id,' . Auth::user()->company_id,
				],
				'description' => 'nullable|max:255',
			], $error_messages);
			if ($validator->fails()) {
				return response()->json(['success' => false, 'errors' => $validator->errors()->all()]);
			}

			DB::beginTransaction();
			if (!$request->id) {
				$ledger = new Ledger;
				$ledger->created_by_id = Auth::user()->id;
				$ledger->created_at = Carbon::now();
				$ledger->updated_at = NULL;
			} else {
				$ledger = Ledger::withTrashed()->find($request->id);
				$ledger->updated_by_id = Auth::user()->id;
				$ledger->updated_at = Carbon::now();
			}
			$ledger->fill($request->all());
			$ledger->company_id = Auth::user()->company_id;
			if ($request->status == 'Inactive') {
				$ledger->deleted_at = Carbon::now();
				$ledger->deleted_by_id = Auth::user()->id;
			} else {
				$ledger->deleted_by_id = NULL;
				$ledger->deleted_at = NULL;
			}
			$ledger->save();

			$activity = new ActivityLog;
			$activity->date_time = Carbon::now();
			$activity->user_id = Auth::user()->id;
			$activity->module = 'Ledger';
			$activity->entity_id = $ledger->id;
			$activity->entity_type_id = 1442;
			$activity->activity_id = $request->id == NULL ? 280 : 281;
			$activity->activity = $request->id == NULL ? 280 : 281;
			$activity->details = json_encode($activity);
			$activity->save();

			DB::commit();
			if (!($request->id)) {
				return response()->json([
					'success' => true,
					'message' => 'Ledger Added Successfully',
				]);
			} else {
				return response()->json([
					'success' => true,
					'message' => 'Ledger Updated Successfully',
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

	public function deleteLedger(Request $request) {
		DB::beginTransaction();
		try {
			$ledger = Ledger::withTrashed()->where('id', $request->id)->forceDelete();
			if ($ledger) {

				$activity = new ActivityLog;
				$activity->date_time = Carbon::now();
				$activity->user_id = Auth::user()->id;
				$activity->module = 'Ledger';
				$activity->entity_id = $request->id;
				$activity->entity_type_id = 1420;
				$activity->activity_id = 282;
				$activity->activity = 282;
				$activity->details = json_encode($activity);
				$activity->save();

				DB::commit();
				return response()->json(['success' => true, 'message' => 'Ledger Deleted Successfully']);
			}
		} catch (Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => ['Exception Error' => $e->getMessage()]]);
		}
	}
}

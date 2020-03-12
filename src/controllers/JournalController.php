<?php

namespace Abs\JVPkg;
use Abs\JVPkg\Journal;
use App\ActivityLog;
use App\Http\Controllers\Controller;
use Auth;
use Carbon\Carbon;
use DB;
use Entrust;
use Illuminate\Http\Request;
use Validator;
use Yajra\Datatables\Datatables;

class JournalController extends Controller {

	public function __construct() {
		$this->data['theme'] = config('custom.admin_theme');
	}

	public function getJournalList(Request $request) {
		$journals = Journal::withTrashed()
			->select([
				'journals.id',
				'journals.name',
				DB::raw('COALESCE(journals.description,"--") as description'),
				DB::raw('IF(journals.deleted_at IS NULL, "Active","Inactive") as status'),
			])
			->where('journals.company_id', Auth::user()->company_id)
			->where(function ($query) use ($request) {
				if (!empty($request->name)) {
					$query->where('journals.name', 'LIKE', '%' . $request->name . '%');
				}
			})
			->where(function ($query) use ($request) {
				if ($request->status == '1') {
					$query->whereNull('journals.deleted_at');
				} else if ($request->status == '0') {
					$query->whereNotNull('journals.deleted_at');
				}
			})
		// ->orderby('journals.id', 'Desc')
		;

		return Datatables::of($journals)
			->addColumn('name', function ($journal) {
				$status = $journal->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $journal->name;
			})
			->addColumn('action', function ($journal) {
				$img1 = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow.svg');
				$img1_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');
				$output = '';
				if (Entrust::can('edit-journal')) {
					$output .= '<a href="#!/jv-pkg/journal/edit/' . $journal->id . '" id = "" title="Edit"><img src="' . $img1 . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img1_active . '" onmouseout=this.src="' . $img1 . '"></a>';
				}
				if (Entrust::can('delete-journal')) {
					$output .= '<a href="javascript:;" data-toggle="modal" data-target="#journal-delete-modal" onclick="angular.element(this).scope().deleteJournal(' . $journal->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>';
				}
				return $output;
			})
			->make(true);
	}

	public function getJournalFormData(Request $request) {
		$id = $request->id;
		if (!$id) {
			$journal = new Journal;
			$action = 'Add';
		} else {
			$journal = Journal::withTrashed()->find($id);
			$action = 'Edit';
		}
		$this->data['journal'] = $journal;
		$this->data['action'] = $action;
		$this->data['theme'];

		return response()->json($this->data);
	}

	public function saveJournal(Request $request) {
		// dd($request->all());
		try {
			$error_messages = [
				'name.required' => 'Name is Required',
				'name.unique' => 'Name is already taken',
				'name.min' => 'Name is Minimum 3 Charachers',
				'name.max' => 'Name is Maximum 64 Charachers',
				'description.max' => 'Description is Maximum 255 Charachers',
			];
			$validator = Validator::make($request->all(), [
				'name' => [
					'required:true',
					'min:3',
					'max:64',
					'unique:journals,name,' . $request->id . ',id,company_id,' . Auth::user()->company_id,
				],
				'description' => 'nullable|max:255',
			], $error_messages);
			if ($validator->fails()) {
				return response()->json(['success' => false, 'errors' => $validator->errors()->all()]);
			}

			DB::beginTransaction();
			if (!$request->id) {
				$journal = new Journal;
				$journal->created_by_id = Auth::user()->id;
				$journal->created_at = Carbon::now();
				$journal->updated_at = NULL;
			} else {
				$journal = Journal::withTrashed()->find($request->id);
				$journal->updated_by_id = Auth::user()->id;
				$journal->updated_at = Carbon::now();
			}
			$journal->fill($request->all());
			$journal->company_id = Auth::user()->company_id;
			if ($request->status == 'Inactive') {
				$journal->deleted_at = Carbon::now();
				$journal->deleted_by_id = Auth::user()->id;
			} else {
				$journal->deleted_by_id = NULL;
				$journal->deleted_at = NULL;
			}
			$journal->save();

			$activity = new ActivityLog;
			$activity->date_time = Carbon::now();
			$activity->user_id = Auth::user()->id;
			$activity->module = 'Journals';
			$activity->entity_id = $journal->id;
			$activity->entity_type_id = 1420;
			$activity->activity_id = $request->id == NULL ? 280 : 281;
			$activity->activity = $request->id == NULL ? 280 : 281;
			$activity->details = json_encode($activity);
			$activity->save();

			DB::commit();
			if (!($request->id)) {
				return response()->json([
					'success' => true,
					'message' => 'Journal Added Successfully',
				]);
			} else {
				return response()->json([
					'success' => true,
					'message' => 'Journal Updated Successfully',
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

	public function deleteJournal(Request $request) {
		DB::beginTransaction();
		try {
			$journal = Journal::withTrashed()->where('id', $request->id)->forceDelete();
			if ($journal) {

				$activity = new ActivityLog;
				$activity->date_time = Carbon::now();
				$activity->user_id = Auth::user()->id;
				$activity->module = 'Journals';
				$activity->entity_id = $request->id;
				$activity->entity_type_id = 1420;
				$activity->activity_id = 282;
				$activity->activity = 282;
				$activity->details = json_encode($activity);
				$activity->save();

				DB::commit();
				return response()->json(['success' => true, 'message' => 'Journal Deleted Successfully']);
			}
		} catch (Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => ['Exception Error' => $e->getMessage()]]);
		}
	}
}

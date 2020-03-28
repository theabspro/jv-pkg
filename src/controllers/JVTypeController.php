<?php

namespace Abs\JVPkg;
use Abs\ApprovalPkg\ApprovalType;
use Abs\JVPkg\Journal;
use Abs\JVPkg\JVType;
use App\ActivityLog;
use App\Config;
use App\Http\Controllers\Controller;
use Auth;
use Carbon\Carbon;
use DB;
use Entrust;
use Illuminate\Http\Request;
use Validator;
use Yajra\Datatables\Datatables;

class JVTypeController extends Controller {

	public function __construct() {
		$this->data['theme'] = config('custom.admin_theme');
	}

	public function getJvFilterData() {
		$this->data['extras'] = [
			'status' => [
				['id' => '', 'name' => 'Select Status'],
				['id' => '1', 'name' => 'Active'],
				['id' => '0', 'name' => 'Inactive'],
			],
			'journal_list' => Journal::select('id', 'name')->get(),
			'jv_account_type_list' => Config::select('id', 'name')->where('config_type_id', 27)->get(),
		];

		return response()->json($this->data);
	}

	public function getJvTypeList(Request $request) {
		$jv_types = JVType::withTrashed()
			->select([
				'jv_types.id',
				'jv_types.name',
				'jv_types.short_name',
				DB::raw('COALESCE(journals.name,"--") as journal'),
				DB::raw('COALESCE(from_ac.name,"--") as from_account'),
				DB::raw('COALESCE(to_ac.name,"--") as to_account'),
				DB::raw('IF(jv_types.deleted_at IS NULL, "Active","Inactive") as status'),
			])
			->leftJoin('jv_type_field as journal', function ($join) {
				$join->on('journal.jv_type_id', 'jv_types.id')
					->where('journal.field_id', 1420);
			})
			->leftJoin('journals', 'journals.id', 'journal.value')
			->leftJoin('jv_type_field as from_account', function ($join) {
				$join->on('from_account.jv_type_id', 'jv_types.id')
					->where('from_account.field_id', 1421);
			})
			->leftJoin('configs as from_ac', 'from_ac.id', 'from_account.value')
			->leftJoin('jv_type_field as to_account', function ($join) {
				$join->on('to_account.jv_type_id', 'jv_types.id')
					->where('to_account.field_id', 1422);
			})
			->leftJoin('configs as to_ac', 'to_ac.id', 'to_account.value')
			->where(function ($query) use ($request) {
				if (!empty($request->name)) {
					$query->where('jv_types.name', 'LIKE', '%' . $request->name . '%');
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->short_name)) {
					$query->where('jv_types.short_name', 'LIKE', '%' . $request->short_name . '%');
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->journal_name)) {
					$query->where('journals.id', $request->journal_name);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->from_account)) {
					$query->where('from_ac.id', $request->from_account);
				}
			})
			->where(function ($query) use ($request) {
				if (!empty($request->to_account)) {
					$query->where('to_ac.id', $request->to_account);
				}
			})
			->where(function ($query) use ($request) {
				if ($request->status == '1') {
					$query->whereNull('jv_types.deleted_at');
				} else if ($request->status == '0') {
					$query->whereNotNull('jv_types.deleted_at');
				}
			})
			->where('jv_types.company_id', Auth::user()->company_id)
		// ->orderby('jv_types.id', 'desc')
		;

		return Datatables::of($jv_types)
			->addColumn('name', function ($jv_type) {
				$status = $jv_type->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $jv_type->name;
			})
			->addColumn('action', function ($jv_type) {
				$img_edit = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow.svg');
				$img_edit_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow-active.svg');
				$img_view = asset('public/themes/' . $this->data['theme'] . '/img/content/table/eye.svg');
				$img_view_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/eye-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');

				$output = '';
				if (Entrust::can('edit-journal-voucher-type')) {
					$output .= '<a href="#!/jv-pkg/jv-type/edit/' . $jv_type->id . '" id = "" title="Edit"><img src="' . $img_edit . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img_edit_active . '" onmouseout=this.src="' . $img_edit . '"></a>';
				}
				// if (Entrust::can('view-journal-voucher-type')) {
				// 	$output .= '<a href="#!/jv-pkg/jv-type/view/' . $jv_type->id . '" id = "" title="View"><img src="' . $img_view . '" alt="View" class="img-responsive" onmouseover=this.src="' . $img_view_active . '" onmouseout=this.src="' . $img_view . '"></a>';
				// }
				if (Entrust::can('delete-journal-voucher-type')) {
					$output .= '<a href="javascript:;" data-toggle="modal" data-target="#delete_jv_type" onclick="angular.element(this).scope().deleteJvType(' . $jv_type->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>
					';
				}
				return $output;
			})
			->make(true);
	}

	public function getJVTypeFormData(Request $request) {
		$id = $request->id;
		if (!$id) {
			$jv_type = new JVType;
			// $jv_field = [
			// 	['is_open' => 'Yes', 'is_editable' => 'Yes'],
			// 	['is_open' => 'Yes', 'is_editable' => 'Yes'],
			// 	['is_open' => 'Yes', 'is_editable' => 'Yes'],
			// ];
			$jv_field = [
				['is_editable' => 'Yes'],
				['is_editable' => 'Yes'],
				['is_editable' => 'Yes'],
			];
			$action = 'Add';
		} else {
			$jv_type = JVType::withTrashed()->find($id);
			$action = 'Edit';
			$jv_field = DB::table('jv_type_field')
				->where('jv_type_id', $id)
				->get();
		}
		$this->data['jv_type'] = $jv_type;
		$this->data['action'] = $action;
		$this->data['theme'];
		$this->data['extras'] = [
			// 'approval_type_status_list' => ApprovalTypeStatus::select('id', 'status')->get(),
			'approval_type_list' => ApprovalType::where('entity_id', 7221)->select('id', 'name')->get(),
			'journal_list' => Journal::select('id', 'name')->get(),
			'jv_account_type_list' => Config::select('id', 'name')->where('config_type_id', 27)->get(),
		];

		$this->data['jv_field'] = $jv_field;
		return response()->json($this->data);
	}

	public function getJVTypeView(Request $request) {
		$id = $request->id;
		$this->data['jv_type'] = $jv_type = JVType::withTrashed()->with([
			'approvalType',
			'approvalTypeInitialStatus',
			'approvalTypeFinalStatus',
		])->find($id);
		$this->data['action'] = 'View';

		$this->data['jv_fields'] = $jv_fields = DB::table('jv_type_field')->select(
			'jv_type_field.*',
			'journals.name as journals',
			// 'from_account.name as value',
			'title.name as title',
			DB::raw('(CASE WHEN jv_type_field.field_id= 1420
			 THEN journals.name WHEN jv_type_field.field_id= 1421
			 THEN from_account.name WHEN jv_type_field.field_id= 1422
			 THEN from_account.name
			 ELSE "--" END) as value')
		)
			->leftJoin('journals', 'journals.id', 'jv_type_field.value')
			->leftJoin('configs as from_account', 'from_account.id', 'jv_type_field.value')
			->leftJoin('configs as title', 'title.id', 'jv_type_field.field_id')
			->where('jv_type_field.jv_type_id', $id)->get();

		return response()->json($this->data);
	}

	public function saveJvType(Request $request) {
		// dd($request->all());
		try {
			$error_messages = [
				'name.required' => 'Name is Required',
				'name.unique' => 'Name is already taken',
				'name.min' => 'Name is Minimum 3 Charachers',
				'name.max' => 'Name is Maximum 64 Charachers',
				'short_name.required' => 'Name is Required',
				'short_name.unique' => 'Name is already taken',
				'short_name.min' => 'Name is Minimum 3 Charachers',
				'short_name.max' => 'Name is Maximum 24 Charachers',
				'approval_type_id.required' => 'Approval Flow Type is Required',
				'initial_status_id.required' => 'Initial Status is Required',
				'final_approved_status_id.required' => 'Final Approved Status is Required',
			];
			$validator = Validator::make($request->all(), [
				'name' => [
					'required:true',
					'min:3',
					'max:64',
					'unique:jv_types,name,' . $request->id . ',id,company_id,' . Auth::user()->company_id,
				],
				'short_name' => [
					'required:true',
					'min:2',
					'max:24',
					'unique:jv_types,short_name,' . $request->id . ',id,company_id,' . Auth::user()->company_id,
				],
				'approval_type_id' => 'required',
				'initial_status_id' => 'required',
				'final_approved_status_id' => 'required',
			], $error_messages);
			if ($validator->fails()) {
				return response()->json(['success' => false, 'errors' => $validator->errors()->all()]);
			}

			DB::beginTransaction();
			if (!$request->id) {
				$jv_type = new JVType;
				$jv_type->created_by_id = Auth::user()->id;
				$jv_type->created_at = Carbon::now();
				$jv_type->updated_at = NULL;
			} else {
				$jv_type = JVType::withTrashed()->find($request->id);
				$jv_type->updated_by_id = Auth::user()->id;
				$jv_type->updated_at = Carbon::now();
			}
			$jv_type->fill($request->all());
			$jv_type->company_id = Auth::user()->company_id;
			if ($request->status == 'Inactive') {
				$jv_type->deleted_at = Carbon::now();
				$jv_type->deleted_by_id = Auth::user()->id;
			} else {
				$jv_type->deleted_by_id = NULL;
				$jv_type->deleted_at = NULL;
			}
			$jv_type->save();
			// dd($request->jv_fields);
			if (!empty($request->jv_fields)) {
				foreach ($request->jv_fields as $jv_field) {
					// dd($jv_field);
					// if ($jv_field['is_open'] == 'Yes') {
					// 	$is_open = 1;
					// 	$is_editable = 1;
					// 	$jv_field['value'] = NULL;
					// } else {
					// $is_open = 0;
					if ($jv_field['is_editable'] == 'Yes' || empty($jv_field['is_editable'])) {
						$is_editable = 1;
						$is_open = 1;
						$jv_field['value'] = NULL;
					} else {
						$is_editable = 0;
						$is_open = 0;
					}
					// }

					if (!$request->id) {
						$jv_field_types = DB::table('jv_type_field')->insert([
							'jv_type_id' => $jv_type->id,
							'field_id' => $jv_field['field_id'],
							'is_open' => $is_open,
							'is_editable' => $is_editable,
							'value' => $jv_field['value'],
						]);
					} else {
						$jv_field_types = DB::table('jv_type_field')
							->where([
								'jv_type_id' => $request->id,
								'field_id' => $jv_field['field_id'],
							])
							->update([
								'is_open' => $is_open,
								'is_editable' => $is_editable,
								'value' => $jv_field['value'],
							]);
					}
				}
			}

			$activity = new ActivityLog;
			$activity->date_time = Carbon::now();
			$activity->user_id = Auth::user()->id;
			$activity->module = 'JV Types';
			$activity->entity_id = $jv_type->id;
			$activity->entity_type_id = 1420;
			$activity->activity_id = $request->id == NULL ? 280 : 281;
			$activity->activity = $request->id == NULL ? 280 : 281;
			$activity->details = json_encode($activity);
			$activity->save();

			DB::commit();
			if (!($request->id)) {
				return response()->json([
					'success' => true,
					'message' => 'JV Type Added Successfully',
				]);
			} else {
				return response()->json([
					'success' => true,
					'message' => 'JV Type Updated Successfully',
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

	public function deleteJvType(Request $request) {
		DB::beginTransaction();
		try {
			$jv_type = JVType::withTrashed()->where('id', $request->id)->forceDelete();
			if ($jv_type) {

				$activity = new ActivityLog;
				$activity->date_time = Carbon::now();
				$activity->user_id = Auth::user()->id;
				$activity->module = 'JV Types';
				$activity->entity_id = $request->id;
				$activity->entity_type_id = 1420;
				$activity->activity_id = 282;
				$activity->activity = 282;
				$activity->details = json_encode($activity);
				$activity->save();

				$jv_field_types = DB::table('jv_type_field')->where('jv_type_id', $request->id)->delete();
				DB::commit();
				return response()->json(['success' => true, 'message' => 'JV Type Deleted Successfully']);
			}
		} catch (Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => ['Exception Error' => $e->getMessage()]]);
		}
	}

	public function getJVType(Request $request) {
		$error_messages = [
			'id.required' => 'ID is required',
		];

		$validator = Validator::make($request->all(), [
			'id' => [
				'required:true',
			],
		], $error_messages);

		if ($validator->fails()) {
			return response()->json(['success' => false, 'errors' => $validator->errors()->all()]);
		}

		//NEW CODE
		$this->data['jv_type'] = $jv_type = JVType::with([
			'fields',
		])->find($request->id);

		foreach ($jv_type->fields as $field) {
			if (!$field->pivot->is_editable) {
				if ($field->pivot->field_id == 1420) {
					//JOURNAL
					$jv_type->journal_editable = false;
					$jv_type->journal = Journal::select([
						'journals.id',
						'journals.name',
					])->find($field->pivot->value);
				} elseif ($field->pivot->field_id == 1421) {
					//FROM ACCOUNT TYPE
					$jv_type->from_account_type_editable = false;
					$jv_type->from_account_type = Config::find($field->pivot->value);
				} else {
					//TO ACCOUNT TYPE
					$jv_type->to_account_type_editable = false;
					$jv_type->to_account_type = Config::find($field->pivot->value);
				}
			} else {
				if ($field->pivot->field_id == 1420) {
					//JOURNAL
					$jv_type->journal_editable = true;
				} elseif ($field->pivot->field_id == 1421) {
					//FROM ACCOUNT TYPE
					$jv_type->from_account_type_editable = true;
				} else {
					//TO ACCOUNT TYPE
					$jv_type->to_account_type_editable = true;
				}
			}
		}
		return response()->json($this->data);
	}
}

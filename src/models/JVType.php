<?php

namespace Abs\JVPkg;

use Abs\HelperPkg\Traits\SeederTrait;
use App\Company;
use App\Config;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JVType extends Model {
	use SeederTrait;
	use SoftDeletes;
	protected $table = 'jv_types';
	public $timestamps = true;
	protected $fillable = [
		'name',
		'short_name',
		'initial_status_id',
		'final_approved_status_id',
		'approval_type_id',
		'company_id',
	];

	public function approvalType() {
		return $this->belongsTo('Abs\ApprovalPkg\ApprovalType', 'approval_type_id');
	}

	public function verificationFlow() {
		return $this->belongsTo('Abs\ApprovalPkg\ApprovalType', 'approval_type_id');
	}

	public function approvalTypeInitialStatus() {
		return $this->belongsTo('Abs\ApprovalPkg\ApprovalTypeStatus', 'initial_status_id');
	}
	public function approvalTypeFinalStatus() {
		return $this->belongsTo('Abs\ApprovalPkg\ApprovalTypeStatus', 'final_approved_status_id');
	}
	//ISUUE : NAMING
	public function jvTypeField() {
		return $this->belongsToMany('App\Config', 'jv_type_id', 'field_id')->withPivot(['is_open', 'is_editable', 'value']);
	}

	public function fields() {
		return $this->belongsToMany('App\Config', 'jv_type_field', 'jv_type_id', 'field_id')->withPivot(['is_open', 'is_editable', 'value']);
	}

	public static function createFromObject($record_data) {

		$errors = [];
		$company = Company::where('code', $record_data->company)->first();
		if (!$company) {
			dump('Invalid Company : ' . $record_data->company);
			return;
		}

		$admin = $company->admin();
		if (!$admin) {
			dump('Default Admin user not found');
			return;
		}

		$type = Config::where('name', $record_data->type)->where('config_type_id', 89)->first();
		if (!$type) {
			$errors[] = 'Invalid Tax Type : ' . $record_data->type;
		}

		if (count($errors) > 0) {
			dump($errors);
			return;
		}

		$record = self::firstOrNew([
			'company_id' => $company->id,
			'name' => $record_data->tax_name,
		]);
		$record->type_id = $type->id;
		$record->created_by_id = $admin->id;
		$record->save();
		return $record;
	}

}

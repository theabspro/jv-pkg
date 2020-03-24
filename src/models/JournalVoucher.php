<?php

namespace Abs\JVPkg;

use Abs\HelperPkg\Traits\SeederTrait;
use App\Company;
use App\Config;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalVoucher extends Model {
	use SeederTrait;
	use SoftDeletes;
	protected $table = 'journal_vouchers';
	public $timestamps = true;
	protected $fillable = [
		'type_id',
		'date',
		'journal_id',
		'voucher_number',
		'from_account_type_id',
		'from_account_id',
		'to_account_type_id',
		'to_account_id',
		'receipt_id',
		'invoice_id',
		'amount',
		'reason',
		'remarks',
		'status_id',
	];

	public function jvType() {
		return $this->belongsTo('Abs\JVPkg\JVType', 'type_id');
	}

	public function journal() {
		return $this->belongsTo('Abs\JVPkg\Journal', 'journal_id');
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

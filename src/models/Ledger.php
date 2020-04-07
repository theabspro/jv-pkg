<?php

namespace Abs\JVPkg;

use Abs\HelperPkg\Traits\SeederTrait;
use App\Company;
use App\Config;
use Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ledger extends Model {
	use SeederTrait;
	use SoftDeletes;
	protected $table = 'ledgers';
	public $timestamps = true;
	protected $fillable = [
		'name',
		'code',
		'description',
		'company_id',
	];

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

	public static function searchLedger($request) {
		$key = $request->key;
		$list = self::where('company_id', Auth::user()->company_id)
			->select(
				'id',
				'name',
				'code'
			)
			->where(function ($q) use ($key) {
				$q->where('name', 'like', $key . '%')
					->orWhere('code', 'like', $key . '%')
				;
			})
			->get();
		return response()->json($list);
	}

	public static function getLedger($request) {
		$ledger = self::find($request->id);

		if (!$ledger) {
			return response()->json(['success' => false, 'error' => 'Ledger not found']);
		}
		return response()->json([
			'success' => true,
			'ledger' => $ledger,
		]);
	}

}

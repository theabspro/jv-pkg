<?php

namespace Abs\JVPkg;

use Abs\ApprovalPkg\EntityStatus;
use Abs\HelperPkg\Traits\SeederTrait;
use App\ActivityLog;
use App\Company;
use App\Config;
use DB;
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
		'transfer_type',
		'from_account_type_id',
		'from_account_id',
		'to_account_type_id',
		'to_account_id',
		'receipt_id',
		'invoice_id',
		'amount',
		'reason',
		'remarks',
		'rejection_id',
		'status_id',
	];

	//ISSUE : wrong relationship name
	// public function jvType() {
	// 	return $this->belongsTo('Abs\JVPkg\JVType', 'type_id');
	// }

	public function type() {
		return $this->belongsTo('Abs\JVPkg\JVType', 'type_id');
	}

	public function rejectionReasonDetails() {
		return $this->belongsTo('App\Entity', 'rejection_id');
	}

	public function fromAccountType() {
		return $this->belongsTo('App\Config', 'from_account_type_id');
	}

	public function toAccountType() {
		return $this->belongsTo('App\Config', 'to_account_type_id');
	}

	public function journal() {
		return $this->belongsTo('Abs\JVPkg\Journal', 'journal_id');
	}

	public function invoices() {
		//ISSUE : wrong table name
		return $this->belongsToMany('Abs\InvoicePkg\Invoice', 'jv_invoices', 'jv_id', 'invoice_id');
	}

	public function receipts() {
		//ISSUE : wrong table name
		return $this->belongsToMany('Abs\ReceiptPkg\Receipt', 'jv_receipts', 'jv_id', 'receipt_id');
	}

	public function attachments() {
		return $this->hasMany('Abs\BasicPkg\Attachment', 'entity_id', 'id')->where('attachment_of_id', 223);
	}

	public function logs() {
		return $this->hasMany('App\ActivityLog', 'entity_id', 'id')->where('entity_type_id', 384);
	}

	public function status() {
		return $this->belongsTo('Abs\ApprovalPkg\EntityStatus', 'status_id');
	}

	public function fromAccount() {
		if ($this->from_account_type_id == 1440) {
			//customer
			return $this->belongsTo('Abs\CustomerPkg\Customer', 'from_account_id');
		} elseif ($this->from_account_type_id == 1441) {
			//vendor
			return $this->belongsTo('App\Vendor', 'from_account_id');
		} elseif ($this->from_account_type_id == 1442) {
			//ledger
			return $this->belongsTo('Abs\JVPkg\Ledger', 'from_account_id');
		}
	}

	public function toAccount() {
		if ($this->to_account_type_id == 1440) {
			//customer
			return $this->belongsTo('Abs\CustomerPkg\Customer', 'to_account_id');
		} elseif ($this->to_account_type_id == 1441) {
			//vendor
			return $this->belongsTo('App\Vendor', 'to_account_id');
		} elseif ($this->to_account_type_id == 1442) {
			//ledger
			return $this->belongsTo('Abs\JVPkg\Ledger', 'to_account_id');
		}
	}

	public function getDateAttribute() {
		return date('d-m-Y', strtotime($this->attributes['date']));
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

	public static function getJVViewData($request) {
		$data = [];
		$data['journal_voucher'] = $journal_voucher = JournalVoucher::with([
			'attachments',
			'type',
			'type.verificationFlow',
			'type.verificationFlow.approvalLevels',
			'journal',
			'fromAccountType',
			'toAccountType',
			'invoices',
			'invoices.outlet',
			'invoices.sbu',
			'receipts',
			'receipts.outlet',
			'receipts.sbu',
			'status',
			'rejectionReasonDetails',
		])
			->find($request->id);
		if (!$journal_voucher) {
			return response()->json([
				'success' => false,
				'error' => 'JV not found',
			]);
		}

		$journal_voucher->fromAccount;
		$journal_voucher->toAccount;
		$journal_voucher->action = 'View';

		$selected_invoice_ids = $journal_voucher->invoices()->pluck('id')->toArray();
		// dd($selected_invoice_ids);
		$total_invoice_amount = [];
		$data['invoices'] = $journal_voucher->toAccount->invoices;
		foreach ($journal_voucher->toAccount->invoices as $invoice) {
			// dd($invoice);
			if (in_array($invoice->id, $selected_invoice_ids)) {
				$invoice->selected = true;
				$total_invoice_amount[] = $invoice->invoice_amount - $invoice->received_amount;
			} else {
				$invoice->selected = false;
				$total_invoice_amount[] = '';
			}
		}
		foreach ($journal_voucher->receipts as $receipt) {
			$balance_amount[] = $receipt->balance_amount;
		}
		$journal_voucher->invoices_length = count($selected_invoice_ids);
		$journal_voucher->total_invoice_amount = array_sum($total_invoice_amount);
		$journal_voucher->total_receipt_amount = array_sum($balance_amount);

		$data['activity_logs'] = $activity_logs = ActivityLog::select([
			'activity_logs.user_id',
			DB::raw('DATE_FORMAT(activity_logs.date_time,"%d %b %Y") as activity_date'),
			DB::raw('DATE_FORMAT(activity_logs.date_time,"%h:%i %p") as activity_time'),
			'users.ecode as created_user',
			'users.name as created_user_name',
			'roles.name as user_role',
			'activity_logs.details',
		])
			->leftJoin('users', 'users.id', 'activity_logs.user_id')
			->leftJoin('roles', 'roles.id', 'users.role_id')
			->where('activity_logs.entity_type_id', 384)
			->where('activity_logs.entity_id', $journal_voucher->id)
			->get();
		foreach ($activity_logs as $activity_log) {
			$jv = json_decode($activity_log->details);
			if (isset($jv->status_id)) {
				$activity_log->status = EntityStatus::find($jv->status_id);
			}
		}
		return $data;
	}
}

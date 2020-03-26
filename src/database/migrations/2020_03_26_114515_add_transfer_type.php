<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTransferType extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::table('journal_vouchers', function (Blueprint $table) {
			$table->tinyInteger('transfer_type')->after('voucher_number')->nullable();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::table('journal_vouchers', function (Blueprint $table) {
			$table->dropColumn('transfer_type');
		});
	}
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTempInvoiceTable extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		if (!Schema::hasTable('invoice_temp')) {
			Schema::create('invoice_temp', function (Blueprint $table) {
				$table->increments('id');
				$table->string('invoice_no', 191)->nullable();
				$table->string('account_no', 191);
				$table->string('trans_date', 191)->nullable();
				$table->unsignedDecimal('amount_cur', 12, 2);
				$table->unsignedDecimal('amount_mst', 12, 2);
				$table->unsignedDecimal('settle_amount', 12, 2)->nullable();
				$table->unsignedDecimal('balence', 12, 2)->nullable();
				$table->string('outlet', 191)->nullable();
				$table->string('business_unit', 191)->nullable();
			});
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::dropIfExists('invoice_temp');
	}
}

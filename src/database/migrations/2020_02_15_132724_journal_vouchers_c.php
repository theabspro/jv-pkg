<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class JournalVouchersC extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		if (!Schema::hasTable('journal_vouchers')) {
			Schema::create('journal_vouchers', function (Blueprint $table) {
				$table->increments('id');
				$table->unsignedInteger('company_id');
				$table->string('number', 191);
				$table->unsignedInteger('type_id');
				$table->datetime('date');
				$table->string('voucher_number', 191)->nullable();
				$table->unsignedInteger('from_account_type_id')->nullable();
				$table->unsignedInteger('from_account_id')->nullable();
				$table->unsignedInteger('to_account_type_id')->nullable();
				$table->unsignedInteger('to_account_id')->nullable();
				$table->unsignedInteger('receipt_id')->nullable();
				$table->unsignedInteger('invoice_id')->nullable();
				$table->unsignedInteger('from_outlet_id')->nullable();
				$table->unsignedInteger('from_sbu_id')->nullable();
				$table->unsignedInteger('to_outlet_id')->nullable();
				$table->unsignedInteger('to_sbu_id')->nullable();
				$table->unsignedDecimal('amount', 18, 2);
				$table->unsignedInteger('status_id');
				$table->unsignedInteger('created_by_id')->nullable();
				$table->unsignedInteger('updated_by_id')->nullable();
				$table->unsignedInteger('deleted_by_id')->nullable();
				$table->timestamps();
				$table->softDeletes();

				$table->foreign('company_id')->references('id')->on('companies')->onDelete('CASCADE')->onUpdate('cascade');

				$table->foreign('type_id')->references('id')->on('jv_types')->onDelete('CASCADE')->onUpdate('cascade');

				$table->foreign('from_account_type_id')->references('id')->on('configs')->onDelete('SET NULL')->onUpdate('cascade');

				$table->foreign('to_account_type_id')->references('id')->on('configs')->onDelete('SET NULL')->onUpdate('cascade');

				$table->foreign('receipt_id')->references('id')->on('receipts')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('from_outlet_id')->references('id')->on('outlets')->onDelete('SET NULL')->onUpdate('cascade');
				// $table->foreign('from_sbu_id')->references('id')->on('sbus')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('to_outlet_id')->references('id')->on('outlets')->onDelete('SET NULL')->onUpdate('cascade');
				// $table->foreign('to_sbu_id')->references('id')->on('sbus')->onDelete('SET NULL')->onUpdate('cascade');

				$table->foreign('status_id')->references('id')->on('approval_type_statuses')->onDelete('CASCADE')->onUpdate('cascade');
				$table->foreign('created_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('updated_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('deleted_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');

				$table->unique(["company_id", "number"]);

				$table->unique(["company_id", "voucher_number"]);
			});
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::dropIfExists('journal_vouchers');
	}
}

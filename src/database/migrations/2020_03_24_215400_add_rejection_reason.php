<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRejectionReason extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::table('journal_vouchers', function (Blueprint $table) {
			$table->unsignedInteger('rejection_id')->after('status_id')->nullable();
			$table->string('rejection_reason', 255)->after('rejection_id')->nullable();

			$table->foreign('rejection_id')->references('id')->on('entities')->onDelete('SET NULL')->onUpdate('cascade');

		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::table('journal_vouchers', function (Blueprint $table) {
			$table->dropForeign('journal_vouchers_rejection_id_foreign');
			$table->dropColumn('rejection_id');
			$table->dropColumn('rejection_reason');
		});
	}
}

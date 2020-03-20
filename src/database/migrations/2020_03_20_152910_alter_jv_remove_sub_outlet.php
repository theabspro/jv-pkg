<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterJvRemoveSubOutlet extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::table('journal_vouchers', function (Blueprint $table) {

			$table->dropForeign('journal_vouchers_from_outlet_id_foreign');
			$table->dropForeign('journal_vouchers_to_outlet_id_foreign');

			$table->dropColumn('from_outlet_id');
			$table->dropColumn('from_sbu_id');
			$table->dropColumn('to_outlet_id');
			$table->dropColumn('to_sbu_id');
		});

	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::table('journal_vouchers', function (Blueprint $table) {
			$table->unsignedInteger('from_outlet_id')->nullable()->after('to_account_id');
			$table->unsignedInteger('from_sbu_id')->nullable()->after('from_outlet_id');
			$table->unsignedInteger('to_outlet_id')->nullable()->after('from_sbu_id');
			$table->unsignedInteger('to_sbu_id')->nullable()->after('to_outlet_id');

			$table->foreign('from_outlet_id')->references('id')->on('outlets')->onDelete('SET NULL')->onUpdate('cascade');
			$table->foreign('to_outlet_id')->references('id')->on('outlets')->onDelete('SET NULL')->onUpdate('cascade');
		});
	}
}

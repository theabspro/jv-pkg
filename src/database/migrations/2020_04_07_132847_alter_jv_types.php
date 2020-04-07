<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterJvTypes extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::table('jv_types', function (Blueprint $table) {
			$table->dropForeign('jv_types_initial_status_id_foreign');
			$table->dropForeign('jv_types_final_approved_status_id_foreign');

			$table->foreign('initial_status_id')->references('id')->on('entity_statuses')->onDelete('SET NULL')->onUpdate('cascade');
			$table->foreign('final_approved_status_id')->references('id')->on('entity_statuses')->onDelete('SET NULL')->onUpdate('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::table('jv_types', function (Blueprint $table) {
			$table->dropForeign('jv_types_initial_status_id_foreign');
			$table->dropForeign('jv_types_final_approved_status_id_foreign');

			$table->foreign('initial_status_id')->references('id')->on('approval_type_statuses')->onDelete('SET NULL')->onUpdate('cascade');
			$table->foreign('final_approved_status_id')->references('id')->on('approval_type_statuses')->onDelete('SET NULL')->onUpdate('cascade');
		});
	}
}

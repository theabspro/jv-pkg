<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class JvTypeFieldC extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		if (!Schema::hasTable('jv_type_field')) {
			Schema::create('jv_type_field', function (Blueprint $table) {
				$table->unsignedInteger('jv_type_id');
				$table->unsignedInteger('field_id');
				$table->boolean('is_open')->default(0);
				$table->boolean('is_editable')->default(0);
				$table->unsignedInteger('value')->nullable();

				$table->foreign('jv_type_id')->references('id')->on('jv_types')->onDelete('CASCADE')->onUpdate('cascade');
				$table->foreign('field_id')->references('id')->on('configs')->onDelete('CASCADE')->onUpdate('cascade');

				$table->unique(["jv_type_id", "field_id"]);
			});
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::dropIfExists('jv_type_field');
	}
}

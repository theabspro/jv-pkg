<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class JvTypesC extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		if (!Schema::hasTable('jv_types')) {
			Schema::create('jv_types', function (Blueprint $table) {
				$table->increments('id');
				$table->unsignedInteger('company_id');
				$table->string('name', 64);
				$table->string('short_name', 24);
				$table->unsignedInteger('initial_status_id')->nullable();
				$table->unsignedInteger('final_approved_status_id')->nullable();
				$table->unsignedInteger('approval_type_id')->nullable();
				$table->unsignedInteger('created_by_id')->nullable();
				$table->unsignedInteger('updated_by_id')->nullable();
				$table->unsignedInteger('deleted_by_id')->nullable();
				$table->timestamps();
				$table->softDeletes();

				$table->foreign('company_id')->references('id')->on('companies')->onDelete('CASCADE')->onUpdate('cascade');

				$table->foreign('initial_status_id')->references('id')->on('approval_type_statuses')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('final_approved_status_id')->references('id')->on('approval_type_statuses')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('approval_type_id')->references('id')->on('approval_types')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('created_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('updated_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');
				$table->foreign('deleted_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');

				$table->unique(["company_id", "name"]);
				$table->unique(["company_id", "short_name"]);
			});
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::dropIfExists('jv_types');
	}
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class JvAttachmentViewStatus extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		if (!Schema::hasTable('jv_attachment_view_status')) {
			Schema::create('jv_attachment_view_status', function (Blueprint $table) {
				$table->unsignedInteger('attachment_id');
				$table->unsignedInteger('journal_voucher_id');
				$table->unsignedInteger('viewed_by');
				$table->foreign('attachment_id')->references('id')->on('attachments')->onDelete('cascade')->onUpdate('cascade');
				$table->foreign('journal_voucher_id')->references('id')->on('journal_vouchers')->onDelete('cascade')->onUpdate('cascade');
				$table->foreign('viewed_by')->references('id')->on('users')->onDelete('cascade')->onUpdate('cascade');

			});
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::dropIfExists('jv_attachment_view_status');
	}
}

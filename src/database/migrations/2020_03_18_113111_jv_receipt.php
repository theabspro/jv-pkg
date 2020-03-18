<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class JvReceipt extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('jv_receipts')) {
            Schema::create('jv_receipts', function (Blueprint $table) {
                $table->unsignedInteger('jv_id');
                $table->unsignedInteger('receipt_id');

                $table->foreign('jv_id')->references('id')->on('journal_vouchers')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('receipt_id')->references('id')->on('receipts')->onDelete('cascade')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jv_receipts');
    }
}

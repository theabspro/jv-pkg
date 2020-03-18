<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class JvInvoice extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('jv_invoices')) {
            Schema::create('jv_invoices', function (Blueprint $table) {
                $table->unsignedInteger('jv_id');
                $table->unsignedInteger('invoice_id');

                $table->foreign('jv_id')->references('id')->on('journal_vouchers')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('jv_invoices');
    }
}

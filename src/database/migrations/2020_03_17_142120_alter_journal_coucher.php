<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterJournalCoucher extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('journal_vouchers', function (Blueprint $table) {

            $table->dropUnique('journal_vouchers_company_id_number_unique');
            $table->dropColumn('number');

            $table->dropForeign('journal_vouchers_receipt_id_foreign');
            $table->dropForeign('journal_vouchers_invoice_id_foreign');

            $table->dropColumn('receipt_id');
            $table->dropColumn('invoice_id');

            $table->unsignedInteger('journal_id')->after('type_id')->nullable();
            $table->string('reason',191)->after('amount')->nullable();
            $table->string('remarks',255)->after('reason')->nullable();

            $table->foreign('journal_id')->references('id')->on('journals')->onDelete('SET NULL')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('journal_vouchers', function (Blueprint $table) {
            $table->string('number',191)->after('company_id');


            $table->unsignedInteger('receipt_id')->nullable()->after('to_account_id');
            $table->unsignedInteger('invoice_id')->nullable()->after('receipt_id');

            $table->foreign('receipt_id')->references('id')->on('receipts')->onDelete('SET NULL')->onUpdate('cascade');
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('SET NULL')->onUpdate('cascade');
            $table->dropForeign('journal_vouchers_journal_id_foreign');

            $table->dropColumn('journal_id');
            $table->dropColumn('reason');
            $table->dropColumn('remarks');
            $table->unique(["company_id", "number"]);


        });
    }
}

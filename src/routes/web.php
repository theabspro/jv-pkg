<?php

Route::group(['namespace' => 'Abs\JVPkg', 'middleware' => ['web', 'auth'], 'prefix' => 'jv-pkg'], function () {
	//JOURNAL VOUCHER
	Route::get('/journal-vouchers/get-list', 'JournalVoucherController@getJournalVoucherList')->name('getJournalVoucherList');
	Route::get('/journal-voucher/get-form-data', 'JournalVoucherController@getJournalVoucherFormData')->name('getJournalVoucherFormData');
	Route::get('/journal-voucher/view', 'JournalVoucherController@viewJournalVoucher')->name('viewJournalVoucher');
	Route::post('/journal-voucher/save', 'JournalVoucherController@saveJournalVoucher')->name('saveJournalVoucher');
	Route::get('/journal-voucher/delete', 'JournalVoucherController@deleteJournalVoucher')->name('deleteJournalVoucher');
	//ISSUE : NON RESABLE CODE
	// Route::get('/journal-voucher/jv-type', 'JournalVoucherController@getJV')->name('getJV');
	// Route::post('/journal-voucher/customer/search', 'JournalVoucherController@searchJVCustomer')->name('searchJVCustomer');
	// Route::post('/journal-voucher/get-customer-details', 'JournalVoucherController@getJVCustomerDetails')->name('getJVCustomerDetails');
	// Route::get('/journal-voucher/get-customer-invoice', 'JournalVoucherController@getCustomerInvoice')->name('getCustomerInvoice');
	// Route::get('/journal-voucher/get-customer-receipt', 'JournalVoucherController@getCustomerReceipt')->name('getCustomerReceipt');
	Route::post('/journal-voucher/multiple-approvals', 'JournalVoucherController@journalVoucherMultipleApproval')->name('journalVoucherMultipleApproval');
	Route::post('/journal-voucher/update-status', 'JournalVoucherController@updateJVStatus')->name('updateJVStatus');

	//JOURNALS
	Route::get('/journal/get-list', 'JournalController@getJournalList')->name('getJournalList');
	Route::get('/journal/get-form-data', 'JournalController@getJournalFormData')->name('getJournalFormData');
	Route::post('/journal/save', 'JournalController@saveJournal')->name('saveJournal');
	Route::get('/journal/delete', 'JournalController@deleteJournal')->name('deleteJournal');

	//JV TYPES
	Route::get('/jv-types/get-list', 'JVTypeController@getJVTypeList')->name('getJvTypeList');
	Route::get('/jv-types/get-form-data', 'JVTypeController@getJVTypeFormData')->name('getJVTypeFormData');
	Route::post('/jv-types/save', 'JVTypeController@saveJvType')->name('saveJvType');
	Route::get('/jv-types/delete', 'JVTypeController@deleteJvType')->name('deleteJvType');
	Route::get('/jv-types/view', 'JVTypeController@getJVTypeView')->name('getJVTypeView');
	Route::get('/jv-types/get-filter', 'JVTypeController@getJvFilterData')->name('getJvFilterData');
	Route::get('/jv-type/get', 'JVTypeController@getJVType')->name('getJVType');

	//LEDGERS
	Route::get('/ledger/get-list', 'LedgerController@getLedgerList')->name('getLedgerList');
	Route::get('/ledger/get-form-data', 'LedgerController@getLedgerFormData')->name('getLedgerFormData');
	Route::post('/ledger/save', 'LedgerController@saveLedger')->name('saveLedger');
	Route::get('/ledger/delete', 'LedgerController@deleteLedger')->name('deleteLedger');

	//VERIFICATION
	Route::post('/verification/get-list/', 'JvVerificationController@getJvVerificationList')->name('getJvVerificationList');
	Route::get('/verification/view', 'JvVerificationController@viewJvVerification')->name('viewJvVerification');
	Route::get('/verification/filter', 'JvVerificationController@getVerificationFilter')->name('getVerificationFilter');
	Route::post('/verification/save', 'JvVerificationController@saveJvVerification')->name('saveJvVerification');
	Route::get('/verification/delete', 'JvVerificationController@deleteJvVerification')->name('deleteJvVerification');
	Route::post('/verification/jv-multiple-approvals', 'JvVerificationController@jvMultipleApproval')->name('jvMultipleApproval');
});
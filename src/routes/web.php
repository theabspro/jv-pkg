<?php

Route::group(['namespace' => 'Abs\JVPkg', 'middleware' => ['web', 'auth'], 'prefix' => 'jv-pkg'], function () {
	//FAQs
	Route::get('/journal-vouchers/get-list', 'JournalVoucherController@getJournalVoucherList')->name('getJournalVoucherList');
	Route::get('/journal-voucher/get-form-data', 'JournalVoucherController@getJournalVoucherFormData')->name('getJournalVoucherFormData');
	Route::post('/journal-voucher/save', 'JournalVoucherController@saveJournalVoucher')->name('saveJournalVoucher');
	Route::get('/journal-voucher/delete', 'JournalVoucherController@deleteJournalVoucher')->name('deleteJournalVoucher');

	//JOURNALS
	Route::get('/journal/get-list', 'JournalController@getJournalList')->name('getJournalList');
	Route::get('/journal/get-form-data', 'JournalController@getJournalFormData')->name('getJournalFormData');
	Route::post('/journal/save', 'JournalController@saveJournal')->name('saveJournal');
	Route::get('/journal/delete', 'JournalController@deleteJournal')->name('deleteJournal');
});
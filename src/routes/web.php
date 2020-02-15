<?php

Route::group(['namespace' => 'Abs\JVPkg', 'middleware' => ['web', 'auth'], 'prefix' => 'jv-pkg'], function () {
	//FAQs
	Route::get('/journal-vouchers/get-list', 'JournalVoucherController@getJournalVoucherList')->name('getJournalVoucherList');
	Route::get('/journal-voucher/get-form-data', 'JournalVoucherController@getJournalVoucherFormData')->name('getJournalVoucherFormData');
	Route::post('/journal-voucher/save', 'JournalVoucherController@saveJournalVoucher')->name('saveJournalVoucher');
	Route::get('/journal-voucher/delete', 'JournalVoucherController@deleteJournalVoucher')->name('deleteJournalVoucher');
});

Route::group(['namespace' => 'Abs\JVPkg', 'middleware' => ['web'], 'prefix' => 'jv-pkg'], function () {
	//FAQs
	Route::get('/journal-vouchers/get', 'JournalVoucherController@getJournalVouchers')->name('getJournalVouchers');
});

<?php

Route::group(['namespace' => 'Abs\JVPkg', 'middleware' => ['web', 'auth'], 'prefix' => 'jv-pkg'], function () {
	//JOURNAL VOUCHER
	Route::get('/journal-vouchers/get-list', 'JournalVoucherController@getJournalVoucherList')->name('getJournalVoucherList');
	Route::get('/journal-voucher/get-form-data', 'JournalVoucherController@getJournalVoucherFormData')->name('getJournalVoucherFormData');
	Route::post('/journal-voucher/save', 'JournalVoucherController@saveJournalVoucher')->name('saveJournalVoucher');
	Route::get('/journal-voucher/delete', 'JournalVoucherController@deleteJournalVoucher')->name('deleteJournalVoucher');
	Route::get('/journal-voucher/jv-type', 'JournalVoucherController@jvTypes')->name('jvTypes');

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
});
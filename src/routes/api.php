<?php
Route::group(['namespace' => 'Abs\JVPkg\Api', 'middleware' => ['api']], function () {
	Route::group(['prefix' => 'jv-pkg/api'], function () {
		Route::group(['middleware' => ['auth:api']], function () {
			// Route::get('taxes/get', 'TaxController@getTaxes');
		});
	});
});
<?php

namespace Abs\JVPkg;
use Abs\JVPkg\JournalVoucher;
use App\Http\Controllers\Controller;
use DB;
use Entrust;
use Illuminate\Http\Request;
use Yajra\Datatables\Datatables;

class JvVerificationController extends Controller {

	public function __construct() {
		$this->data['theme'] = config('custom.admin_theme');
	}

	public function getJvVerificationList(Request $request) {
		$jv_verification = JournalVoucher::select(
			'journals.id',
			'journals.name',
			DB::raw('COALESCE(journals.description,"--") as description'),
			DB::raw('IF(journals.deleted_at IS NULL, "Active","Inactive") as status')
		)
		// ->orderby('journals.id', 'Desc')
		;

		return Datatables::of($jv_verification)
			->addColumn('name', function ($jv_verification) {
				$status = $journal->status == 'Active' ? 'green' : 'red';
				return '<span class="status-indicator ' . $status . '"></span>' . $journal->name;
			})
			->addColumn('action', function ($journal) {
				$img1 = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow.svg');
				$img1_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/edit-yellow-active.svg');
				$img_delete = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-default.svg');
				$img_delete_active = asset('public/themes/' . $this->data['theme'] . '/img/content/table/delete-active.svg');
				$output = '';
				if (Entrust::can('edit-journal')) {
					$output .= '<a href="#!/jv-pkg/journal/edit/' . $journal->id . '" id = "" title="Edit"><img src="' . $img1 . '" alt="Edit" class="img-responsive" onmouseover=this.src="' . $img1_active . '" onmouseout=this.src="' . $img1 . '"></a>';
				}
				if (Entrust::can('delete-journal')) {
					$output .= '<a href="javascript:;" data-toggle="modal" data-target="#journal-delete-modal" onclick="angular.element(this).scope().deleteJournal(' . $journal->id . ')" title="Delete"><img src="' . $img_delete . '" alt="Delete" class="img-responsive delete" onmouseover=this.src="' . $img_delete_active . '" onmouseout=this.src="' . $img_delete . '"></a>';
				}
				return $output;
			})
			->make(true);
	}
}

<?php
namespace Abs\JVPkg\Database\Seeds;

use App\Permission;
use Illuminate\Database\Seeder;

class JVPkgPermissionSeeder extends Seeder {
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run() {
		$permissions = [
			//Journals
			[
				'display_order' => 99,
				'parent' => null,
				'name' => 'journals',
				'display_name' => 'Journals',
			],
			[
				'display_order' => 1,
				'parent' => 'journals',
				'name' => 'add-journal',
				'display_name' => 'Add',
			],
			[
				'display_order' => 2,
				'parent' => 'journals',
				'name' => 'edit-journal',
				'display_name' => 'Edit',
			],
			[
				'display_order' => 3,
				'parent' => 'journals',
				'name' => 'delete-journal',
				'display_name' => 'Delete',
			],

			//Journal Voucher Types
			[
				'display_order' => 99,
				'parent' => null,
				'name' => 'journal-voucher-types',
				'display_name' => 'Journal Voucher Types',
			],
			[
				'display_order' => 1,
				'parent' => 'journal-voucher-types',
				'name' => 'add-journal-voucher-type',
				'display_name' => 'Add',
			],
			[
				'display_order' => 2,
				'parent' => 'journal-voucher-types',
				'name' => 'edit-journal-voucher-type',
				'display_name' => 'Edit',
			],
			[
				'display_order' => 3,
				'parent' => 'journal-voucher-types',
				'name' => 'view-journal-voucher-type',
				'display_name' => 'View',
			],
			[
				'display_order' => 4,
				'parent' => 'journal-voucher-types',
				'name' => 'delete-journal-voucher-type',
				'display_name' => 'Delete',
			],

			//Journal Voucher
			[
				'display_order' => 99,
				'parent' => null,
				'name' => 'journal-vouchers',
				'display_name' => 'Journal Vouchers',
			],
			[
				'display_order' => 1,
				'parent' => 'journal-vouchers',
				'name' => 'add-journal-voucher',
				'display_name' => 'Add',
			],
			[
				'display_order' => 2,
				'parent' => 'journal-vouchers',
				'name' => 'edit-journal-voucher',
				'display_name' => 'Edit',
			],
			[
				'display_order' => 3,
				'parent' => 'journal-vouchers',
				'name' => 'view-journal-voucher',
				'display_name' => 'View',
			],
			[
				'display_order' => 4,
				'parent' => 'journal-vouchers',
				'name' => 'delete-journal-voucher',
				'display_name' => 'Delete',
			],
			[
				'display_order' => 5,
				'parent' => 'journal-vouchers',
				'name' => 'approve-journal-voucher',
				'display_name' => 'Approve',
			],
			[
				'display_order' => 6,
				'parent' => 'journal-vouchers',
				'name' => 'view-all-jv',
				'display_name' => 'View All',
			],
			[
				'display_order' => 7,
				'parent' => 'journal-vouchers',
				'name' => 'view-own-jv',
				'display_name' => 'View Own Only',
			],

			//Ledgers
			[
				'display_order' => 99,
				'parent' => null,
				'name' => 'ledgers',
				'display_name' => 'Ledgers',
			],
			[
				'display_order' => 1,
				'parent' => 'ledgers',
				'name' => 'add-ledger',
				'display_name' => 'Add',
			],
			[
				'display_order' => 2,
				'parent' => 'ledgers',
				'name' => 'edit-ledger',
				'display_name' => 'Edit',
			],
			[
				'display_order' => 3,
				'parent' => 'ledgers',
				'name' => 'delete-ledger',
				'display_name' => 'Delete',
			],

		];
		Permission::createFromArrays($permissions);
	}
}
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 6 — QuickBooks Online / CSV export integration tables.
 *
 * qbo_credentials  — Per-school OAuth2 tokens (encrypted at rest)
 * qbo_sync_logs    — Audit trail for every sync operation
 * qbo_entity_map   — Ikonex ID → QBO entity ID cross-reference
 */
class CreateQboIntegrationTables extends Migration
{
    public function up()
    {
        // ── OAuth2 credentials (one row per school) ──────────────────────────
        Schema::create('qbo_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();

            $table->text('access_token');               // encrypted
            $table->text('refresh_token');              // encrypted
            $table->string('realm_id');                 // QBO company ID
            $table->string('company_name')->nullable(); // human-readable
            $table->timestamp('token_expires_at');
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->unique('school_id');
        });

        // ── Sync activity log ─────────────────────────────────────────────────
        Schema::create('qbo_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();

            $table->enum('entity_type', [
                'fee_payment', 'expense', 'fund_transfer', 'invoice', 'batch'
            ])->default('batch');

            $table->unsignedBigInteger('entity_id')->nullable()
                  ->comment('FK to the local Ikonex record that was synced');

            $table->string('qbo_entity_id')->nullable()
                  ->comment('The QBO entity ID returned after successful creation');

            $table->enum('status', ['success', 'error', 'skipped', 'pending'])->default('pending');
            $table->string('description')->nullable();
            $table->text('details')->nullable()
                  ->comment('QBO response body or error message');

            $table->enum('direction', ['to_qbo', 'from_qbo', 'csv_export'])->default('to_qbo');
            $table->unsignedBigInteger('triggered_by')->nullable();
            $table->foreign('triggered_by')->references('id')->on('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['school_id', 'entity_type', 'status']);
            $table->index(['school_id', 'created_at']);
        });

        // ── Entity ID map — prevents duplicate pushes ─────────────────────────
        Schema::create('qbo_entity_map', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();

            $table->string('entity_type');                    // 'fee_payment' | 'expense' | ...
            $table->unsignedBigInteger('local_id');           // Ikonex PK
            $table->string('qbo_entity_id');                  // QBO DocNumber / TxnID
            $table->string('qbo_entity_type')->nullable();    // 'SalesReceipt' | 'Bill' | ...
            $table->timestamp('synced_at');

            $table->unique(['school_id', 'entity_type', 'local_id']);
            $table->index(['school_id', 'qbo_entity_id']);
        });

        // ── CSV export history ────────────────────────────────────────────────
        Schema::create('csv_exports', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();

            $table->enum('export_type', [
                'fee_payments', 'expenses', 'invoices', 'petty_cash',
                'fund_transfers', 'bank_statements', 'defaulters', 'annual_summary'
            ]);

            $table->json('parameters')->nullable()
                  ->comment('Date range, term, class, etc. used for this export');
            $table->string('file_path')->nullable();
            $table->unsignedInteger('row_count')->default(0);

            $table->unsignedBigInteger('exported_by');
            $table->foreign('exported_by')->references('id')->on('users')->restrictOnDelete();

            $table->timestamps();
            $table->index(['school_id', 'export_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('csv_exports');
        Schema::dropIfExists('qbo_entity_map');
        Schema::dropIfExists('qbo_sync_logs');
        Schema::dropIfExists('qbo_credentials');
    }
}

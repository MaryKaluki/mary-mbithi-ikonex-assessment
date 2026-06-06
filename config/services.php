<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | QuickBooks Online OAuth2 (Phase 6)
    |--------------------------------------------------------------------------
    | QBO_CLIENT_ID, QBO_CLIENT_SECRET, QBO_REDIRECT_URI must be set in .env.
    | QBO_ENVIRONMENT: 'sandbox' for testing, 'production' for live.
    */
    'qbo' => [
        'client_id'     => env('QBO_CLIENT_ID'),
        'client_secret' => env('QBO_CLIENT_SECRET'),
        'redirect_uri'  => env('QBO_REDIRECT_URI', env('APP_URL') . '/api/finance/quickbooks/callback'),
        'environment'   => env('QBO_ENVIRONMENT', 'sandbox'),
    ],

];

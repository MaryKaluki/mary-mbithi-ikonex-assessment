<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Safaricom Daraja M-Pesa Configuration
    |--------------------------------------------------------------------------
    |
    | env:              sandbox | production
    | consumer_key:     Daraja app consumer key
    | consumer_secret:  Daraja app consumer secret
    | passkey:          Lipa Na M-Pesa Online passkey (for STK Push)
    | shortcode:        Paybill/till number for STK Push (default)
    | c2b_shortcode:    Paybill number registered for C2B (may differ)
    | callback_url:     Public HTTPS URL for STK Push callbacks
    | validation_url:   Public HTTPS URL for C2B validation (Safaricom whitelists this)
    | confirmation_url: Public HTTPS URL for C2B confirmation
    |
    */

    'env'              => env('MPESA_ENV', 'sandbox'),
    'consumer_key'     => env('MPESA_CONSUMER_KEY', ''),
    'consumer_secret'  => env('MPESA_CONSUMER_SECRET', ''),
    'passkey'          => env('MPESA_PASSKEY', ''),
    'shortcode'        => env('MPESA_SHORTCODE', '174379'),         // Daraja sandbox default
    'c2b_shortcode'    => env('MPESA_C2B_SHORTCODE', '600000'),     // Daraja C2B sandbox default
    'callback_url'     => env('MPESA_CALLBACK_URL', ''),
    'validation_url'   => env('MPESA_VALIDATION_URL', ''),
    'confirmation_url' => env('MPESA_CONFIRMATION_URL', ''),

];

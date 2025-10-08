<?php

/**
 * Simple debug script to help identify 500 errors
 * Access via: https://livezen.tute.lk/debug.php
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>LiveZen Debug Information</h1>";
echo "<p>Generated: " . date('Y-m-d H:i:s') . "</p>";

// Check PHP version
echo "<h2>PHP Information</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Check if Laravel can be loaded
echo "<h2>Laravel Application Status</h2>";

try {
    // Check if composer autoload exists
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        echo "<p>✅ Composer autoload found</p>";
        require_once __DIR__ . '/vendor/autoload.php';
    } else {
        echo "<p>❌ Composer autoload not found</p>";
    }

    // Check if .env file exists
    if (file_exists(__DIR__ . '/.env')) {
        echo "<p>✅ .env file found</p>";
    } else {
        echo "<p>❌ .env file not found</p>";
    }

    // Check if public/index.php exists
    if (file_exists(__DIR__ . '/public/index.php')) {
        echo "<p>✅ public/index.php found</p>";
    } else {
        echo "<p>❌ public/index.php not found</p>";
    }

    // Check storage permissions
    if (is_writable(__DIR__ . '/storage')) {
        echo "<p>✅ Storage directory is writable</p>";
    } else {
        echo "<p>❌ Storage directory is not writable</p>";
    }

    // Check bootstrap/cache permissions
    if (is_writable(__DIR__ . '/bootstrap/cache')) {
        echo "<p>✅ Bootstrap cache directory is writable</p>";
    } else {
        echo "<p>❌ Bootstrap cache directory is not writable</p>";
    }

    echo "<h2>Environment Variables</h2>";
    if (file_exists(__DIR__ . '/.env')) {
        $envContent = file_get_contents(__DIR__ . '/.env');
        $envLines = explode("\n", $envContent);
        echo "<pre>";
        foreach ($envLines as $line) {
            if (strpos($line, 'PASSWORD') === false && strpos($line, 'KEY') === false) {
                echo htmlspecialchars($line) . "\n";
            }
        }
        echo "</pre>";
    }
} catch (Exception $e) {
    echo "<p>❌ Error loading Laravel: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "<h2>Server Information</h2>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Script Path: " . __FILE__ . "</p>";
echo "<p>Current Directory: " . getcwd() . "</p>";

echo "<h2>Directory Contents</h2>";
echo "<h3>Root Directory:</h3>";
echo "<pre>";
$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        $path = __DIR__ . '/' . $file;
        $perms = is_dir($path) ? 'd' : '-';
        $perms .= (is_readable($path) ? 'r' : '-');
        $perms .= (is_writable($path) ? 'w' : '-');
        $perms .= (is_executable($path) ? 'x' : '-');
        echo $perms . " " . $file . "\n";
    }
}
echo "</pre>";

if (is_dir(__DIR__ . '/public')) {
    echo "<h3>Public Directory:</h3>";
    echo "<pre>";
    $files = scandir(__DIR__ . '/public');
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            echo $file . "\n";
        }
    }
    echo "</pre>";
}

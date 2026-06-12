// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    // These are common plugins for a React Native Android project.
    // Versions might need to be adjusted based on your specific setup and React Native version.
    id("com.android.application") version "8.2.2" apply false
    id("com.android.library") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.20" apply false
    id("com.facebook.react") version "0.73.2" apply false // React Native Gradle Plugin

    // The plugin you requested to add
    id("com.google.gms.google-services") version "4.4.4" apply false
}

buildscript {
    repositories {
        google()
        mavenCentral()
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url("$rootDir/../node_modules/react-native/android") }
    }
}
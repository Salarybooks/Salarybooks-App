package com.salarybooks.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class PdfPickerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "PdfPicker"
    }

    @ReactMethod
    fun pickFile(promise: Promise) {
        // This is a stub to allow the app to run. 
        // You should implement the actual PDF picking logic here 
        // or use a library like react-native-document-picker.
        promise.reject("E_NOT_IMPLEMENTED", "PdfPicker is not yet implemented")
    }
}